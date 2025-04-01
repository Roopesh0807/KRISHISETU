// // const db = require("../models"); // Import your database models
// const { queryDatabase } = require("../config/db");
// const Member = require("../models/Member");
// exports.addMember = (req, res) => {
//   const { communityId, name, email, phone } = req.body;

//   if (!communityId || !name || !email || !phone) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   Member.addMember({ communityId, name, email, phone }, (err, result) => {
//     if (err) {
//       console.error("Error adding member:", err);
//       return res.status(500).json({ error: "Error adding member" });
//     }

//     res.status(201).json({ message: "Member added successfully" });
//   });
// };

// exports.getMembers = (req, res) => {
//   const { communityId } = req.params;
//   Member.findByCommunity(communityId, (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: "Error fetching members" });
//     }
//     res.status(200).json(result);
//   });
// };

// exports.removeMember = async (req, res) => {
//   const { memberId, communityId } = req.params;

//   if (!memberId || !communityId) {
//     return res.status(400).json({ error: "Member ID and Community ID are required" });
//   }

//   try {
//     const query = "DELETE FROM Members WHERE member_id = ? AND community_id = ?";
//     const [result] = await db.execute(query, [memberId, communityId]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Member not found in the specified community" });
//     }

//     res.json({ message: "Member removed successfully" });
//   } catch (error) {
//     console.error("Error removing member:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


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

// // Get member details by consumer_id
// exports.getMemberByMemberId = async (req, res) => {
//   const { memberId } = req.params;

//   try {
//     const query = `
//       SELECT 
//         m.member_id, 
//         m.member_name, 
//         m.member_email, 
//         m.phone_number,
//         m.consumer_id
//       FROM members m
//       WHERE m.member_id = ?
//     `;

//     const [member] = await queryDatabase(query, [memberId]);

//     if (!member) {
//       return res.status(404).json({ error: "Member not found" });
//     }

//     res.status(200).json(member);
//   } catch (error) {
//     console.error("Error fetching member details:", error);
//     res.status(500).json({ 
//       error: "Internal server error",
//       details: error.message 
//     });
//   }
// };

// exports.getCommunityMembers = async (req, res) => {
//   const { communityId } = req.params;

//   try {
//     const query = `
//       SELECT 
//         members.member_id, 
//         members.consumer_id, 
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

// exports.getMemberOrders = async (req, res) => {
//   const { communityId, consumerId } = req.params;

//   try {
//     const query = `
//       SELECT 
//         o.order_id AS orderId,
//         o.product_id AS product,
//         o.quantity,
//         o.price,
//         o.payment_method AS paymentMethod,
//         o.created_at AS orderDate
//       FROM orders o
//       JOIN members m ON o.member_id = m.member_id
//       WHERE o.community_id = ? AND m.consumer_id = ?
//       ORDER BY o.created_at DESC
//     `;

//     const orders = await queryDatabase(query, [communityId, consumerId]);
//     res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error fetching member orders:", error);
//     res.status(500).json({ error: "Error fetching member orders" });
//   }
// };



// const db = require("../models"); // Import your database models
const { queryDatabase } = require("../config/db");
const Member = require("../models/Member");
exports.addMember = async (req, res) => {
  const { communityId, name, email, phone } = req.body;

  if (!communityId || !name || !email || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // First get consumer_id from consumerregistration
    const [consumer] = await queryDatabase(
      "SELECT consumer_id FROM consumerregistration WHERE email = ? AND phone_number = ?",
      [email, phone]
    );

    if (!consumer) {
      return res.status(404).json({ error: "Consumer not found. Please register first." });
    }

    const result = await Member.addMember({
      communityId,
      consumerId: consumer.consumer_id,
      name,
      email,
      phone
    });

    res.status(201).json({ 
      message: "Member added successfully",
      memberId: result.insertId 
    });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: error.message || "Error adding member" });
  }
};
exports.getMembers = async (req, res) => {
  const { communityId } = req.params;

  try {
    const members = await Member.findByCommunity(communityId);
    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: error.message || "Error fetching members" });
  }
};
exports.removeMember = async (req, res) => {
  const { memberId, communityId } = req.params;

  if (!memberId || !communityId) {
    return res.status(400).json({ error: "Member ID and Community ID are required" });
  }

  try {
    const result = await Member.removeMember(memberId, communityId);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Member not found in the specified community" });
    }

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};


exports.getMemberOrders = async (req, res) => {
  const { communityId, consumerId } = req.params;

  try {
    const query = `
      SELECT 
        o.order_id AS orderId,
        o.product_id AS product,
        o.quantity,
        o.price
      FROM orders o
      JOIN members m ON o.member_id = m.member_id
      WHERE o.community_id = ? AND m.consumer_id = ?;
    `;

    const orders = await queryDatabase(query, [communityId, consumerId]);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching member orders:", error);
    res.status(500).json({ error: "Error fetching member orders" });
  }
};

// Get member details by consumer_id


exports.getMemberByMemberId = async (req, res) => {
  const { memberId } = req.params;

  try {
    // Validate memberId exists
    if (!memberId) {
      return res.status(400).json({ 
        success: false,
        message: "Member ID is required"
      });
    }

    const query = `
      SELECT 
        m.member_id, 
        m.member_name, 
        m.member_email, 
        m.phone_number,
        m.consumer_id
      FROM members m
      WHERE m.member_id = ?
    `;

    const [results] = await queryDatabase(query, [memberId]);
    
    // Explicitly check for empty results
    if (!results || results.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Member not found"
      });
    }

    // Ensure consistent response format
    res.status(200).json({
      success: true,
      data: results[0]
    });

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


exports.getCommunityMembers = async (req, res) => {
  const { communityId } = req.params;

  try {
    const members = await Member.findByCommunity(communityId);
    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching community members:", error);
    res.status(500).json({ error: error.message || "Error fetching community members" });
  }
};
exports.getMemberOrders = async (req, res) => {
  const { communityId, consumerId } = req.params;

  try {
    const query = `
      SELECT 
        o.order_id AS orderId,
        o.product_id AS product,
        o.quantity,
        o.price,
        o.payment_method AS paymentMethod,
        o.created_at AS orderDate
      FROM orders o
      JOIN members m ON o.member_id = m.member_id
      WHERE o.community_id = ? AND m.consumer_id = ?
      ORDER BY o.created_at DESC
    `;

    const orders = await queryDatabase(query, [communityId, consumerId]);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching member orders:", error);
    res.status(500).json({ error: error.message || "Error fetching member orders" });
  }
};


