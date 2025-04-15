const { queryDatabase } = require('../config/db');

// ✅ Create Community
// const { queryDatabase } = require('../config/db');

// ✅ Create Community
exports.createCommunity = async (req, res) => {
  try {
    const { name, password } = req.body;
    const consumerId = req.user.consumer_id; // assuming your JWT middleware adds this
    
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
      m.consumer_id,
      COUNT(o.order_id) AS order_count,
      CASE 
        WHEN COUNT(o.order_id) > 0 THEN 'Confirmed'
        ELSE 'Pending'
      END AS status,
      MAX(o.payment_method) AS payment_method
    FROM members m
    LEFT JOIN orders o ON m.member_id = o.member_id AND o.community_id = ?
    WHERE m.community_id = ? AND m.consumer_id != ?
    GROUP BY m.member_id, m.member_name, m.phone_number, m.member_email, m.consumer_id
  `;
    
    const result = await queryDatabase(query, [communityId,communityId, adminId]);
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


        // First check if community is frozen
        const statusQuery = `
        SELECT 
          TIMESTAMPDIFF(HOUR, NOW(), CONCAT(delivery_date, ' ', delivery_time)) AS hours_until_delivery
        FROM Communities 
        WHERE community_id = ?
      `;
      
      const [communityStatus] = await queryDatabase(statusQuery, [communityId]);
  
      if (communityStatus.hours_until_delivery <= 24) {
        return res.status(400).json({ 
          error: "Community is frozen - no new members can be added within 24 hours of delivery" 
        });
      }
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
  const { communityName, password } = req.body;
  const consumerId = req.user?.consumer_id; // Get from authenticated user

  if (!communityName || !password || !consumerId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
       // First check if community is frozen
    const statusQuery = `
    SELECT 
      c.community_id,
      TIMESTAMPDIFF(HOUR, NOW(), CONCAT(c.delivery_date, ' ', c.delivery_time)) AS hours_until_delivery
    FROM communities c
    WHERE c.community_name = ?
  `;
  
  const [communityStatus] = await queryDatabase(statusQuery, [communityName]);

  if (!communityStatus) {
    return res.status(404).json({ error: "Community not found" });
  }

  if (communityStatus.hours_until_delivery <= 24) {
    return res.status(400).json({ 
      error: "Community is frozen - no new members can join within 24 hours of delivery" 
    });
  }



    // Get consumer details from consumer_id
    const userResult = await queryDatabase(
      "SELECT first_name, last_name, email, phone_number FROM consumerregistration WHERE consumer_id = ?",
      [consumerId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    const user = userResult[0];

    // Check if community exists
    const communityResult = await queryDatabase(
      `SELECT community_id, community_name, admin_id, password 
       FROM communities WHERE community_name = ?`,
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
      "SELECT member_id FROM members WHERE community_id = ? AND consumer_id = ?",
      [community.community_id, consumerId]
    );

    if (memberResult.length > 0) {
      return res.status(400).json({ 
        error: "You are already a member of this community",
        memberId: memberResult[0].member_id
      });
    }

    // Add as member (trigger will handle member_id generation and data consistency)
    await queryDatabase(
      `INSERT INTO members (community_id, consumer_id) VALUES (?, ?)`,
      [community.community_id, consumerId]
    );

    // Get the newly created member ID
    const newMemberResult = await queryDatabase(
      "SELECT member_id FROM members WHERE community_id = ? AND consumer_id = ?",
      [community.community_id, consumerId]
    );

    res.status(200).json({
      message: "Joined community successfully",
      communityId: community.community_id,
      memberId: newMemberResult[0].member_id
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
// exports.getAddressSuggestions = async (req, res) => {
//   console.log('\n=== REQUEST RECEIVED ===');
//   console.log('Method:', req.method);
//   console.log('Full URL:', req.originalUrl);
//   console.log('Query params:', req.query);
  
//   try {
//     const { query } = req.query;
//     if (!query) {
//       return res.status(200).json([]);
//     }

//     const results = await queryDatabase(
//       `SELECT community_id, community_name, address 
//        FROM communities 
//        WHERE address LIKE ? OR community_name LIKE ? 
//        LIMIT 5`,
//       [`%${query}%`, `%${query}%`]
//     );

//     console.log('Results:', results);
//     res.status(200).json(results);
//   } catch (error) {
//     console.error('Database error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };



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
      p.product_name,
      p.category,
      p.buy_type,
      o.quantity,
      o.price,
      o.payment_method,
      o.created_at
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
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


// Add this new function to check if community is frozen
exports.checkCommunityStatus = async (req, res) => {
  const { communityId } = req.params;

  try {
    const query = `
      SELECT 
        community_id,
        community_name,
        delivery_date,
        delivery_time,
        TIMESTAMPDIFF(HOUR, NOW(), CONCAT(delivery_date, ' ', delivery_time)) AS hours_until_delivery
      FROM Communities 
      WHERE community_id = ?
    `;
    
    const [community] = await queryDatabase(query, [communityId]);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    const isFrozen = community.hours_until_delivery <= 24;
    
    res.status(200).json({
      isFrozen,
      hoursUntilFreeze: Math.max(0, 24 - community.hours_until_delivery),
      deliveryDate: community.delivery_date,
      deliveryTime: community.delivery_time
    });
  } catch (error) {
    console.error("Error checking community status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Add this new route to calculate discount
// exports.calculateDiscount = async (req, res) => {
//   const { communityId, memberId } = req.params;

//   try {
//     // Get total members in community
//     const membersQuery = `
//       SELECT COUNT(*) AS member_count 
//       FROM members 
//       WHERE community_id = ?
//     `;
//     const [membersResult] = await queryDatabase(membersQuery, [communityId]);
//     const memberCount = membersResult.member_count;

//     // Get total items ordered by this member
//     const itemsQuery = `
//       SELECT SUM(quantity) AS item_count
//       FROM orders
//       WHERE community_id = ? AND member_id = ?
//     `;
//     const [itemsResult] = await queryDatabase(itemsQuery, [communityId, memberId]);
//     const itemCount = itemsResult.item_count || 0;

//     // Calculate discount (example: 1% per 5 members + 0.5% per item)
//     const memberDiscount = Math.min(20, Math.floor(memberCount / 5)); // Max 20%
//     const itemDiscount = Math.min(10, Math.floor(itemCount * 0.5)); // Max 10%
//     const totalDiscount = memberDiscount + itemDiscount;

//     res.status(200).json({
//       memberCount,
//       itemCount,
//       memberDiscount,
//       itemDiscount,
//       totalDiscount
//     });
//   } catch (error) {
//     console.error("Error calculating discount:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
// Update the calculateDiscount function

exports.calculateDiscount = async (req, res) => {
  const { communityId, memberId } = req.params;

  try {
       // Initialize default values
       const defaultResponse = {
        memberCount: 0,
        itemCount: 0,
        memberDiscount: 0,
        itemDiscount: 0,
        totalDiscount: 0,
        memberDiscountAmount: 0,
        itemDiscountAmount: 0,
        totalDiscountAmount: 0,
        subtotal: 0
      };
    // Check if community is frozen
    const statusQuery = `
      SELECT 
        TIMESTAMPDIFF(SECOND, NOW(), CONCAT(delivery_date, ' ', delivery_time)) AS seconds_until_delivery
      FROM Communities 
      WHERE community_id = ?
    `;
    const [community] = await queryDatabase(statusQuery, [communityId]);

    if (!community || community.seconds_until_delivery > 86400) { // Not frozen yet
      return res.status(200).json(defaultResponse);
    }

    // Get member's subtotal
    const subtotalQuery = `
      SELECT COALESCE(SUM(price * quantity), 0) AS subtotal
      FROM orders
      WHERE community_id = ? AND member_id = ?
    `;
    const [subtotalResult] = await queryDatabase(subtotalQuery, [communityId, memberId]);
    const subtotal = parseFloat(subtotalResult.subtotal) || 0;

    // Get all active members (who have placed orders)
    const activeMembersQuery = `
       SELECT COALESCE(COUNT(DISTINCT m.member_id), 0) AS active_member_count
      FROM members m
      JOIN orders o ON m.member_id = o.member_id
      WHERE m.community_id = ?
    `;
    const [activeMembers] = await queryDatabase(activeMembersQuery, [communityId]);
    const activeMemberCount = parseInt(activeMembers.active_member_count) || 0;

    // Get total items ordered by this member
    const itemsQuery = `
      SELECT COALESCE(SUM(quantity), 0) AS item_count
      FROM orders
      WHERE community_id = ? AND member_id = ?
    `;
    const [itemsResult] = await queryDatabase(itemsQuery, [communityId, memberId]);
    const itemCount = parseInt(itemsResult.item_count) || 0;

    // Calculate discounts only if minimum 5 members have placed orders
    let memberDiscount = 0;
    let itemDiscount = 0;
    
    if (activeMemberCount >= 5) {
      // Member discount: 2% per 5 members, capped at 20%
      memberDiscount = Math.min(20, Math.floor(activeMemberCount / 5) * 2);
      
      // Item discount: 0.5% per item, capped at 10%
      itemDiscount = Math.min(10, Math.floor(itemCount * 0.4));
    }

    const totalDiscount = memberDiscount + itemDiscount;

     // Calculate discount amounts
     const memberDiscountAmount = (subtotal * memberDiscount / 100);
     const itemDiscountAmount = (subtotal * itemDiscount / 100);
     const totalDiscountAmount = memberDiscountAmount + itemDiscountAmount;

    res.status(200).json({
      memberCount: activeMemberCount,
      itemCount,
      memberDiscount,
      itemDiscount,
      totalDiscount,
      memberDiscountAmount,
      itemDiscountAmount,
      totalDiscountAmount,
      subtotal
    });
  } catch (error) {
    console.error("Error calculating discount:", error);
    res.status(500).json({ 
      ...defaultResponse,
      error: "Internal server error" 
    });
  }
};

// Add this function to check if community is frozen
exports.isCommunityFrozen = async (req, res) => {
  const { communityId } = req.params;

  try {
    const query = `
      SELECT 
        TIMESTAMPDIFF(SECOND, NOW(), CONCAT(delivery_date, ' ', delivery_time)) AS seconds_until_delivery
      FROM Communities 
      WHERE community_id = ?
    `;
    
    const [result] = await queryDatabase(query, [communityId]);

    if (!result) {
      return res.status(404).json({ error: "Community not found" });
    }

    const isFrozen = result.seconds_until_delivery <= 86400; // 24 hours in seconds
    const timeUntilFreeze = Math.max(0, result.seconds_until_delivery - 86400);
    
    res.status(200).json({
      isFrozen,
      timeUntilFreeze,
      secondsUntilDelivery: result.seconds_until_delivery
    });
  } catch (error) {
    console.error("Error checking community status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add this middleware to check freeze status before order operations
exports.checkFreezeStatus = async (req, res, next) => {
  const { communityId } = req.params;

  try {
    
    const query = `
      SELECT 
        TIMESTAMPDIFF(SECOND, NOW(), CONCAT(delivery_date, ' ', delivery_time)) AS seconds_until_delivery
      FROM Communities 
      WHERE community_id = ?
    `;
    
    const [result] = await queryDatabase(query, [communityId]);

    if (!result) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Allow order modifications only if more than 24 hours until delivery
    if (result.seconds_until_delivery <= 86400) {
      return res.status(403).json({ 
        error: "Community is frozen - no order modifications allowed within 24 hours of delivery" 
      });
    }

    next();
  } catch (error) {
    console.error("Error checking community status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Submit Frozen Order
// In communityController.js - update the submitFrozenOrder function
exports.submitFrozenOrder = async (req, res) => {
  const { communityId, memberId } = req.params;
  const { orders, discount } = req.body;

  try {
    // Verify community is frozen
    const statusQuery = `
      SELECT 
        TIMESTAMPDIFF(SECOND, NOW(), CONCAT(delivery_date, ' ', delivery_time)) AS seconds_until_delivery
      FROM Communities 
      WHERE community_id = ?
    `;
    const [community] = await queryDatabase(statusQuery, [communityId]);

    if (!community || community.seconds_until_delivery > 86400) {
      return res.status(400).json({ 
        error: "Community is not frozen yet" 
      });
    }

    // Verify member belongs to community
    const memberQuery = `
      SELECT member_id FROM members 
      WHERE member_id = ? AND community_id = ?
    `;
    const [member] = await queryDatabase(memberQuery, [memberId, communityId]);

    if (!member) {
      return res.status(404).json({ error: "Member not found in this community" });
    }

    // Calculate discount
    const discount = await calculateDiscountForMember(communityId, memberId);

    // Store the frozen order
    const insertQuery = `
      INSERT INTO frozen_orders 
      (community_id, member_id, order_data, discount_data, total_amount, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const orderData = JSON.stringify(orders);
    const discountData = JSON.stringify(discount);
    const totalAmount = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);

    // Add this line to capture the result
    const result = await queryDatabase(insertQuery, [
      communityId,
      memberId,
      orderData,
      discountData,
      totalAmount
    ]);

    res.status(201).json({ 
      message: "Frozen order submitted successfully",
      orderId: result.insertId
    });

  } catch (error) {
    console.error("Error submitting frozen order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Helper function to calculate discount
async function calculateDiscountForMember(communityId, memberId) {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT m.member_id) AS member_count,
        COALESCE(SUM(o.quantity), 0) AS item_count,
        COALESCE(SUM(o.price * o.quantity), 0) AS subtotal
      FROM members m
      LEFT JOIN orders o ON m.member_id = o.member_id AND o.community_id = ?
      WHERE m.community_id = ?
    `;
    
    const [result] = await queryDatabase(query, [communityId, communityId]);

    let memberDiscount = 0;
    let itemDiscount = 0;

    if (result.member_count >= 5) {
      memberDiscount = Math.min(20, Math.floor(result.member_count / 5) * 2);
      itemDiscount = Math.min(10, Math.floor(result.item_count * 0.4));
    }

    return {
      memberCount: result.member_count,
      itemCount: result.item_count,
      memberDiscount,
      itemDiscount,
      totalDiscount: memberDiscount + itemDiscount,
      subtotal: result.subtotal
    };
  } catch (error) {
    console.error("Error calculating discount:", error);
    return {
      memberCount: 0,
      itemCount: 0,
      memberDiscount: 0,
      itemDiscount: 0,
      totalDiscount: 0,
      subtotal: 0
    };
  }
}


// ✅ Get Frozen Order Details
// Add this to communityController.js
exports.getFrozenOrderDetails = async (req, res) => {
  const { communityId, orderId } = req.params;

  try {
    const [order] = await queryDatabase(`
      SELECT 
        order_id,
        community_id,
        member_id,
        order_data,
        discount_data,
        CAST(total_amount AS DECIMAL(10,2)) as total_amount,
        status,
        created_at
      FROM frozen_orders 
      WHERE community_id = ? AND order_id = ?
    `, [communityId, orderId]);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Get community details
    const communityQuery = `
      SELECT 
        community_name as name, 
        address, 
        delivery_date, 
        delivery_time 
      FROM communities 
      WHERE community_id = ?
    `;
    const [community] = await queryDatabase(communityQuery, [communityId]);

    // Get member details including consumer_id
    const memberQuery = `
      SELECT 
        member_id,
        member_name, 
        phone_number,
        consumer_id
      FROM members 
      WHERE member_id = ?
    `;
    const [member] = await queryDatabase(memberQuery, [order.member_id]);

    res.status(200).json({
      order,
      community,
      member
    });
  } catch (error) {
    console.error("Error fetching frozen order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.completeFrozenOrder = async (req, res) => {
  const { communityId, orderId } = req.params;
  const { paymentMethod } = req.body;

  try {
    // 1. Verify the order exists and belongs to this community
    const orderQuery = `
      SELECT * FROM frozen_orders 
      WHERE community_id = ? AND order_id = ? AND status = 'pending'
    `;
    const [order] = await queryDatabase(orderQuery, [communityId, orderId]);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: "Order not found or already completed" 
      });
    }

    // 2. Update the frozen order status
    const updateQuery = `
      UPDATE frozen_orders 
      SET status = 'completed', 
          payment_method = ?, 
          completed_at = NOW() 
      WHERE order_id = ?
    `;
    await queryDatabase(updateQuery, [paymentMethod, orderId]);

    // 3. Get member details
    const memberQuery = `
      SELECT m.member_name, m.member_email, m.phone_number, m.consumer_id
      FROM members m
      WHERE m.member_id = ?
    `;
    const [member] = await queryDatabase(memberQuery, [order.member_id]);

    // 4. Get community details
    const communityQuery = `
      SELECT community_name, address, delivery_date, delivery_time
      FROM communities
      WHERE community_id = ?
    `;
    const [community] = await queryDatabase(communityQuery, [communityId]);

    // 5. Parse order data for placeorder table
    const orderData = JSON.parse(order.order_data || '[]');
    const discountData = JSON.parse(order.discount_data || '{}');

    res.status(200).json({ 
      success: true,
      message: "Order completed successfully",
      orderId,
      orderData: {
        community,
        member,
        order,
        discountData
      }
    });

  } catch (error) {
    console.error("Error in completeFrozenOrder:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      details: error.message 
    });
  }
};


// Add this new endpoint to get simplified member info
exports.getCommunityMembersSummary = async (req, res) => {
  const { communityId } = req.params;

  try {
    // Get all members with their order count and payment status
    const query = `
      SELECT 
        m.member_id,
        m.member_name,
        m.phone_number,
        COUNT(o.order_id) AS order_count,
        CASE 
          WHEN COUNT(o.order_id) > 0 THEN 'Confirmed'
          ELSE 'Pending'
        END AS status,
        MAX(o.payment_method) AS payment_method
      FROM members m
      LEFT JOIN orders o ON m.member_id = o.member_id AND o.community_id = ?
      WHERE m.community_id = ?
      GROUP BY m.member_id, m.member_name, m.phone_number
    `;

    const members = await queryDatabase(query, [communityId, communityId]);
    
    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching community members summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add this new function with your existing controller functions
exports.getMemberOrderss = async (req, res) => {
  const { communityId, consumerId } = req.params;

  try {
    // 1. Verify member belongs to this community and get member_id
    const memberQuery = `
      SELECT m.member_id, m.member_name 
      FROM members m
      WHERE m.community_id = ? AND m.consumer_id = ?
    `;
    const [member] = await queryDatabase(memberQuery, [communityId, consumerId]);

    if (!member) {
      return res.status(404).json({ 
        success: false,
        message: "Member not found in this community" 
      });
    }

    // 2. Get all orders for this member in this community
    const ordersQuery = `
      SELECT 
        o.order_id,
        o.product_id,
        p.product_name,
        o.quantity,
        o.price,
        (o.price * o.quantity) as total,
        o.created_at
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.product_id
      WHERE o.community_id = ? AND o.member_id = ?
      ORDER BY o.created_at DESC
    `;
    const orders = await queryDatabase(ordersQuery, [communityId, member.member_id]);

    // 3. Calculate subtotal - ensure it's a number
    const subtotal = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        member: {
          id: member.member_id,
          name: member.member_name
        },
        orders,
        subtotal: Number(subtotal).toFixed(2) // Ensure it's a number before toFixed()
      }
    });

  } catch (error) {
    console.error("Error fetching member orders:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message
    });
  }
};


