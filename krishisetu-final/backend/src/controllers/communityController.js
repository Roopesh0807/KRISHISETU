const { queryDatabase } = require('../config/db');

// ✅ Create Community
// const { queryDatabase } = require('../config/db');

// ✅ Create Community
exports.createCommunity = async (req, res) => {
  try {
    const { name, password, consumerId } = req.body;

    // Validate input
    if (!name || !password || !consumerId) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Insert the new community into the database
    const query = `
      INSERT INTO Communities (community_name, password, admin_id, address, delivery_date, delivery_time)
      VALUES (?, ?, ?, '', CURDATE(), CURTIME())
    `;
    const result = await queryDatabase(query, [name, password, consumerId]);

    if (!result || !result.affectedRows) {
      return res.status(500).json({ error: "Failed to create community. No rows affected." });
    }

    // Fetch the newly generated community_id
    const fetchCommunityIdQuery = `
      SELECT community_id 
      FROM Communities 
      WHERE community_name = ? AND admin_id = ?
    `;
    const communityIdResult = await queryDatabase(fetchCommunityIdQuery, [name, consumerId]);

    if (communityIdResult.length === 0) {
      return res.status(500).json({ error: "Failed to fetch community ID." });
    }

    const communityId = communityIdResult[0].community_id;

    // Fetch the admin's details from consumerregistration
    const fetchAdminDetailsQuery = `
      SELECT first_name, last_name, email, phone_number 
      FROM consumerregistration 
      WHERE consumer_id = ?
    `;
    const adminDetails = await queryDatabase(fetchAdminDetailsQuery, [consumerId]);

    if (adminDetails.length === 0) {
      return res.status(404).json({ error: "Admin details not found." });
    }

    const { first_name, last_name, email, phone_number } = adminDetails[0];

    // Add the admin as a member of the community
    const addAdminAsMemberQuery = `
      INSERT INTO members (community_id, consumer_id, member_name, member_email, phone_number)
      VALUES (?, ?, ?, ?, ?)
    `;
    await queryDatabase(addAdminAsMemberQuery, [
      communityId,
      consumerId,
      `${first_name} ${last_name}`,
      email,
      phone_number,
    ]);

    res.status(201).json({ 
      message: "Community created successfully!", 
      id: communityId // Return the communityId
    });
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get Community Details
// In communityController.js - update getCommunityDetails
// Update getCommunityDetails in communityController.js
exports.getCommunityDetails = async (req, res) => {
  const { communityId } = req.params;

  try {
    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "Community ID is required",
        data: null
      });
    }

    const query = `
      SELECT 
        c.community_id as id,
        c.community_name,
        c.address,
        DATE_FORMAT(c.delivery_date, '%Y-%m-%d') as delivery_date,
        TIME_FORMAT(c.delivery_time, '%H:%i') as delivery_time,
        CONCAT(cr.first_name, ' ', cr.last_name) AS admin_name,
        c.admin_id
      FROM Communities c
      JOIN consumerregistration cr ON c.admin_id = cr.consumer_id
      WHERE c.community_id = ?
    `;

    const [community] = await queryDatabase(query, [communityId]);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: "Community details retrieved",
      data: {
        id: community.id,
        name: community.community_name,
        address: community.address || "Not specified",
        delivery_date: community.delivery_date || "Not set",
        delivery_time: community.delivery_time || "Not set",
        admin_name: community.admin_name,
        admin_id: community.admin_id
      }
    });

  } catch (error) {
    console.error("Error fetching community:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load community",
      error: error.message,
      data: null
    });
  }
};;
// ✅ Get Community Members
// ✅ Get Community Members
exports.getCommunityMembers = async (req, res) => {
  const { communityId } = req.params;

  try {
    console.log('Fetching members for community:', communityId); // Debug log
    
    // First get the admin ID
    const adminQuery = `SELECT admin_id FROM Communities WHERE community_id = ?`;
    const [community] = await queryDatabase(adminQuery, [communityId]);

    if (!community) {
      console.log('Community not found'); // Debug log
      return res.status(404).json({ error: "Community not found" });
    }

    const adminId = community.admin_id;
    console.log('Admin ID:', adminId); // Debug log

    // Get all members except admin
    const query = `
      SELECT 
        m.member_id as id,
        m.member_name as name,
        m.phone_number as phone,
        m.member_email,
        m.consumer_id
      FROM members m
      WHERE m.community_id = ? AND m.consumer_id != ?
    `;
    
    const result = await queryDatabase(query, [communityId, adminId]);
    console.log('Members found:', result); // Debug log
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching community members:", error);
    res.status(500).json({ error: "Error fetching community members" });
  }
};// In getCommunityMembers function:
// exports.getCommunityMembers = async (req, res) => {
//   const { communityId } = req.params;

//   try {
//     const query = `
//       SELECT 
//         members.member_id,
//         members.consumer_id,  -- Ensure this is included
//         members.member_name AS name,
//         members.member_email AS email,
//         members.phone_number AS phone
//       FROM members
//       WHERE members.community_id = ?
//     `;
//     const result = await queryDatabase(query, [communityId]);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error fetching community members:", error);
//     res.status(500).json({ error: "Error fetching community members" });
//   }
// };

// ✅ Add Member to Community
exports.addMember = async (req, res) => {
  const { communityId, name, email, phone } = req.body;

  if (!communityId || !name || !email || !phone) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Check if the member exists in the consumerregistration table by email and phone
    const consumerResult = await queryDatabase(
      "SELECT * FROM consumerregistration WHERE email = ? AND phone_number = ?",
      [email, phone]
    );

    if (consumerResult.length === 0) {
      return res.status(404).json({ error: "Member not found. Please register first." });
    }

    const consumer = consumerResult[0];

    // Check if the member is already part of the community
    const memberExistsResult = await queryDatabase(
      "SELECT * FROM Members WHERE community_id = ? AND consumer_id = ?",
      [communityId, consumer.consumer_id]
    );

    if (memberExistsResult.length > 0) {
      return res.status(400).json({ error: "Member is already part of this community." });
    }

    // Add member to the community
    const memberResult = await queryDatabase(
      "INSERT INTO Members (community_id, consumer_id, member_name, member_email, phone_number) VALUES (?, ?, ?, ?, ?)",
      [
        communityId,
        consumer.consumer_id,
        name,
        email,
        phone,
      ]
    );

    res.status(201).json({
      message: "Member added successfully",
      memberId: memberResult.insertId,
    });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Error adding member" });
  }
};

// ✅ Remove Member from Community
// ✅ Remove Member from Community
exports.removeMember = async (req, res) => {
  const { communityId, memberId } = req.params;

  console.log("Community ID:", communityId); // Debugging line
  console.log("Member ID:", memberId); // Debugging line

  if (!communityId || !memberId) {
    return res.status(400).json({ error: "Community ID and Member ID are required" });
  }

  try {
    const query = "DELETE FROM Members WHERE member_id = ? AND community_id = ?";
    const result = await queryDatabase(query, [memberId, communityId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Member not found in the specified community" });
    }

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Error removing member" });
  }
};

// ✅ Update Community Details
exports.updateCommunityDetails = async (req, res) => {
  const { communityId } = req.params;
  const { address, deliveryDate, deliveryTime } = req.body;

  if (!address || !deliveryDate || !deliveryTime) {
    return res.status(400).json({ error: "All fields are required: address, deliveryDate, deliveryTime" });
  }

  try {
    const query = `
      UPDATE Communities 
      SET address = ?, delivery_date = ?, delivery_time = ? 
      WHERE community_id = ?
    `;
    await queryDatabase(query, [address, deliveryDate, deliveryTime, communityId]);

    res.status(200).json({ message: "Community details updated successfully" });
  } catch (error) {
    console.error("Error updating community details:", error);
    res.status(500).json({ error: "Error updating community details" });
  }
};

// ✅ Join Community
// ✅ Join Community
// exports.joinCommunity = async (req, res) => {
//   const { communityName, password, userEmail } = req.body;

//   if (!communityName || !password || !userEmail) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   try {
//     // Check if the user exists in the consumerregistration table
//     const userResult = await queryDatabase(
//       "SELECT * FROM consumerregistration WHERE email = ?",
//       [userEmail]
//     );

//     if (userResult.length === 0) {
//       return res.status(404).json({ error: "User not found. Please register first." });
//     }

//     const user = userResult[0];

//     // Check if the community exists and the password matches
//     const communityResult = await queryDatabase(
//       "SELECT * FROM communities WHERE community_name = ?",
//       [communityName]
//     );

//     if (communityResult.length === 0) {
//       return res.status(404).json({ error: "Community not found" });
//     }

//     const community = communityResult[0];

//     if (community.password !== password) {
//       return res.status(401).json({ error: "Invalid password" });
//     }

//     // Check if the user is the admin of the community
//     if (community.admin_id === user.consumer_id) {
//       return res.status(400).json({ error: "You are the admin of this community. Admins cannot join as members." });
//     }

//     // Check if the user is already a member of the community
//     const memberResult = await queryDatabase(
//       "SELECT * FROM members WHERE community_id = ? AND consumer_id = ?",
//       [community.community_id, user.consumer_id]
//     );

//     if (memberResult.length > 0) {
//       return res.status(400).json({ error: "User is already a member of this community" });
//     }

//     // Add the user as a member of the community
//     await queryDatabase(
//       "INSERT INTO members (community_id, consumer_id, member_name, member_email, phone_number) VALUES (?, ?, ?, ?, ?)",
//       [
//         community.community_id,
//         user.consumer_id,
//         `${user.first_name} ${user.last_name}`, // Concatenate first and last name
//         user.email,
//         user.phone_number,
//       ]
//     );

//     res.status(200).json({
//       message: "Joined community successfully",
//       communityId: community.community_id,
//     });
//   } catch (error) {
//     console.error("Error joining community:", error);
//     res.status(500).json({ error: "Error joining community" });
//   }
// };

exports.joinCommunity = async (req, res) => {
  const { communityName, password, userEmail } = req.body;

  if (!communityName || !password || !userEmail) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Get consumer details from email
    const userResult = await queryDatabase(
      "SELECT consumer_id, first_name, last_name, email, phone_number FROM consumerregistration WHERE email = ?",
      [userEmail]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    const user = userResult[0];
    const consumerId = user.consumer_id;

    // Check if community exists
    const communityResult = await queryDatabase(
      "SELECT * FROM communities WHERE community_name = ?",
      [communityName]
    );

    if (communityResult.length === 0) {
      return res.status(404).json({ error: "Community not found" });
    }

    const community = communityResult[0];

    // Verify password
    if (community.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Check if user is admin
    if (community.admin_id === consumerId) {
      return res.status(400).json({ 
        error: "You are the admin of this community. Admins cannot join as members." 
      });
    }

    // Check if already a member
    const memberResult = await queryDatabase(
      "SELECT * FROM members WHERE community_id = ? AND consumer_id = ?",
      [community.community_id, consumerId]
    );

    if (memberResult.length > 0) {
      return res.status(400).json({ 
        error: "You are already a member of this community" 
      });
    }

    // Add as member
    const addMemberResult = await queryDatabase(
      `INSERT INTO members 
       (community_id, consumer_id, member_name, member_email, phone_number) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        community.community_id,
        consumerId,
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.phone_number,
      ]
    );

    res.status(200).json({
      message: "Joined community successfully",
      communityId: community.community_id,
      memberId: addMemberResult.insertId
    });

  } catch (error) {
    console.error("Error joining community:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
};

// Add this to your communityController.js
exports.getAddressSuggestions = async (req, res) => {
  console.log('\n=== REQUEST RECEIVED ===');
  console.log('Method:', req.method);
  console.log('Full URL:', req.originalUrl);
  console.log('Query params:', req.query);
  
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(200).json([]);
    }

    const results = await queryDatabase(
      `SELECT community_id, community_name, address 
       FROM communities 
       WHERE address LIKE ? OR community_name LIKE ? 
       LIMIT 5`,
      [`%${query}%`, `%${query}%`]
    );

    console.log('Results:', results);
    res.status(200).json(results);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Keep your existing joinCommunity function as is

// exports.getMemberOrders = async (req, res) => {
//   const { communityId, consumerId } = req.params;

//   try {
//     const query = `
//       SELECT 
//         o.order_id AS orderId,
//         o.product_id AS product,
//         o.quantity,
//         o.price
//       FROM orders o
//       JOIN members m ON o.member_id = m.member_id
//       WHERE o.community_id = ? AND m.consumer_id = ?;
//     `;

//     const orders = await queryDatabase(query, [communityId, consumerId]);
//     res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error fetching member orders:", error);
//     res.status(500).json({ error: "Error fetching member orders" });
//   }
// };
// Add this to communityController.js
exports.getMemberOrders = async (req, res) => {
  const { communityId, memberId } = req.params;

  try {
    // First verify the member belongs to this community
    const verifyQuery = `
      SELECT member_id FROM members 
      WHERE member_id = ? AND community_id = ?
    `;
    const [member] = await queryDatabase(verifyQuery, [memberId, communityId]);

    if (!member) {
      return res.status(404).json({ error: "Member not found in this community" });
    }

    // Get orders for this member in this community
    const query = `
      SELECT 
        o.order_id,
        o.product_id,
        o.quantity,
        o.price,
        o.payment_method,
        o.created_at
      FROM orders o
      WHERE o.community_id = ? AND o.member_id = ?
      ORDER BY o.created_at DESC
    `;

    const orders = await queryDatabase(query, [communityId, memberId]);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching member orders:", error);
    res.status(500).json({ error: "Error fetching member orders" });
  }
};
// Verify community access for a consumer
// Verify community access for a consumer
exports.verifyCommunityAccess = async (req, res) => {
  const { communityName, password, consumerId } = req.body;

  try {
    // Fetch the community by name
    const communityQuery = `
      SELECT * FROM Communities 
      WHERE community_name = ?
    `;
    const [community] = await queryDatabase(communityQuery, [communityName]);

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Verify the password
    if (community.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Check if the consumer is a member of the community
    const memberQuery = `
      SELECT * FROM Members 
      WHERE community_id = ? AND consumer_id = ?
    `;
    const [member] = await queryDatabase(memberQuery, [community.community_id, consumerId]);

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this community' });
    }

    // Return success if all checks pass
    res.json({ 
      success: true, 
      community_id: community.community_id, 
      isAdmin: community.admin_id === consumerId 
    });
  } catch (error) {
    console.error('Error verifying access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Fetch communities where the consumer is an admin or a member
// Fetch communities where the consumer is an admin or a member
exports.getConsumerCommunities = async (req, res) => {
  const { consumerId } = req.params;

  try {
    const query = `
      SELECT 
        c.community_id,
        c.community_name,
        c.password,
        c.admin_id,
        CASE 
          WHEN c.admin_id = ? THEN TRUE 
          ELSE FALSE 
        END AS isAdmin,
        CASE 
          WHEN m.consumer_id IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END AS isMember
      FROM Communities c
      LEFT JOIN Members m ON c.community_id = m.community_id AND m.consumer_id = ?
      WHERE c.admin_id = ? OR m.consumer_id = ?
    `;

    console.log('Executing query:', query); // Debugging: Log the query
    console.log('Parameters:', [consumerId, consumerId, consumerId, consumerId]); // Debugging: Log the parameters

    const communities = await queryDatabase(query, [consumerId, consumerId, consumerId, consumerId]);
    console.log('Fetched communities:', communities); // Debugging: Log the fetched data

    res.status(200).json(communities);
  } catch (error) {
    console.error('Error fetching consumer communities:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Add this to communityController.js
exports.getMembersOrders = async (req, res) => {
  const { communityId, memberId } = req.params;

  try {
    // 1. Verify member belongs to this community
    const verifyQuery = `
      SELECT m.member_id, m.member_name, m.phone_number
      FROM members m
      WHERE m.member_id = ? AND m.community_id = ?
    `;
    const [member] = await queryDatabase(verifyQuery, [memberId, communityId]);

    if (!member) {
      return res.status(404).json({ 
        success: false,
        message: "Member not found in this community" 
      });
    }

    // 2. Get community details
    const communityQuery = `
      SELECT 
        c.community_id as id,
        c.community_name as name,
        c.address,
        DATE_FORMAT(c.delivery_date, '%Y-%m-%d') as delivery_date,
        TIME_FORMAT(c.delivery_time, '%H:%i') as delivery_time,
        CONCAT(cr.first_name, ' ', cr.last_name) as admin_name,
        c.admin_id
      FROM communities c
      JOIN consumerregistration cr ON c.admin_id = cr.consumer_id
      WHERE c.community_id = ?
    `;
    const [community] = await queryDatabase(communityQuery, [communityId]);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // 3. Get orders for this member
    const ordersQuery = `
      SELECT 
        o.order_id,
        o.product_id,
        o.quantity,
        o.price
      FROM orders o
      WHERE o.community_id = ? AND o.member_id = ?
    `;
    const orders = await queryDatabase(ordersQuery, [communityId, memberId]);

    // Calculate total
    const total = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);

    res.status(200).json({
      community,  // Directly include community object
      member,    // Directly include member object
      orders,    // Directly include orders array
      total: total.toFixed(2)
    });

  } catch (error) {
    console.error("Error fetching member orders:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};