// const express = require("express");
// const communityController = require("../controllers/communityController");

// const router = express.Router();

// router.post("/create", communityController.createCommunity);
// router.get("/:communityId", communityController.getCommunityDetails);
// router.get("/:communityId/members", communityController.getCommunityMembers);
// router.post("/:communityId/add-member", communityController.addMember);
// //router.delete("/:communityId/remove-member/:memberId", communityController.removeMember);
// router.delete("/community/:memberId/remove-member", communityController.removeMember);

// router.put("/:communityId/update-details", communityController.updateCommunityDetails);
// router.post("/join", communityController.joinCommunity);

// module.exports = router;

const express = require("express");
const communityController = require("../controllers/communityController");
const { queryDatabase } = require('../config/db'); 
// const auth = require('../middleware/auth'); // Add this line to import auth middleware
const router = express.Router();

router.post("/create", communityController.createCommunity);
router.get("/:communityId", communityController.getCommunityDetails);
router.get("/:communityId/members", communityController.getCommunityMembers);
router.post("/:communityId/add-member", communityController.addMember);
router.delete("/:communityId/remove-member/:memberId", communityController.removeMember); // Corrected route
router.put("/:communityId/update-details", communityController.updateCommunityDetails);
router.post("/join", communityController.joinCommunity);
router.post('/verify-access', communityController.verifyCommunityAccess);
// Add these new routes
router.get("/:communityId/status", communityController.checkCommunityStatus);
router.get("/:communityId/member/:memberId/discount", communityController.calculateDiscount);
// Add this route in communityRoutes.js
// router.get("/:communityId/member/:memberId", communityController.getMemberOrders);
// Update this in communityRoutes.js
// Add this to your communityRoutes.js
// router.get("address-suggestions", communityController.getAddressSuggestions);
router.get("/:communityId/member/:memberId/orders", communityController.getMembersOrders);
router.get('/consumer/:consumerId/communities', communityController.getConsumerCommunities);
router.get("/:communityId/members-summary", communityController.getCommunityMembersSummary); // Add this line
// Add this to communityRoutes.js
router.post('/:communityId/member/:memberId/submit-frozen-order', communityController.submitFrozenOrder);
// Add these routes to communityRoutes.js
router.get("/:communityId/order/:orderId", communityController.getFrozenOrderDetails);
// Update this line in communityRoutes.js
router.post("/:communityId/orders/:orderId/complete", communityController.completeFrozenOrder);
// Add this new route with your existing routes
router.get('/:communityId/members/:consumerId/orders',communityController.getMemberOrderss);
router.get("/community/create", async (req, res) => {
    try {
      const query = "SELECT * FROM communities";
      const communities = await queryDatabase(query);
  
      res.status(200).json({
        success: true,
        message: "Communities fetched successfully",
        data: communities,
      });
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });
  
  // POST to create a new community
  router.post("/community/create", async (req, res) => {
    const { name, password, adminId } = req.body;
  
    if (!name || !password || !adminId) {
      return res.status(400).json({ error: "Name, password, and adminId are required" });
    }
  
    try {
      const query = `
        INSERT INTO communities (name, password, admin_id)
        VALUES (?, ?, ?)
      `;
      const result = await queryDatabase(query, [name, password, adminId]);
  
      res.status(201).json({
        success: true,
        message: "Community created successfully",
        communityId: result.insertId,
      });
    } catch (error) {
      console.error("Error creating community:", error);
      res.status(500).json({ error: "Failed to create community" });
    }
  });

//   // Join community by name or ID
//   router.post('/join', async (req, res) => {
//     try {
//       const { communityName, password, userEmail, communityId } = req.body;
  
//       let community;
//       if (communityId) {
//         // Join by community ID (address method)
//         community = await Community.findById(communityId);
//       } else {
//         // Join by community name (original method)
//         community = await Community.findOne({ name: communityName });
//       }
  
//       if (!community) {
//         return res.status(404).json({ error: 'Community not found' });
//       }
  
//       const isMatch = await community.comparePassword(password);
//       if (!isMatch) {
//         return res.status(401).json({ error: 'Invalid password' });
//       }
  
//       // Check if user is already a member
//       const existingMember = await Member.findOne({
//         community: community._id,
//         email: userEmail
//       });
  
//       if (existingMember) {
//         return res.status(400).json({ error: 'You are already a member of this community' });
//       }
  
//       // Create new member
//       const member = new Member({
//         community: community._id,
//         email: userEmail,
//         isAdmin: false
//       });
  
//       await member.save();
  
//       res.status(200).json({
//         message: 'Successfully joined community',
//         communityId: community._id,
//         memberId: member._id
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });
  
// // Get address suggestions
// // Get address suggestions
// router.get('/suggest', async (req, res) => {
//   try {
//     const { address } = req.query;
    
//     if (!address || address.length < 1) {
//       return res.status(400).json({ error: 'Address query too short' });
//     }

//     const communities = await Community.find({
//       address: { $regex: address, $options: 'i' }
//     }).limit(10);

//     res.json(communities.map(comm => ({
//       _id: comm._id,
//       name: comm.name,
//       address: comm.address
//     })));
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// router.get('/all-addresses', async (req, res) => {
//   try {
//     const communities = await Community.find({}, 'address');
//     const addresses = communities.map(comm => comm.address);
//     res.json(addresses);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });




  router.get("/:communityId/members", async (req, res) => {
    const { communityId } = req.params;
  
    try {
      const query = `
        SELECT 
          members.member_id, 
          members.consumer_id, 
          members.member_name AS name, 
          members.member_email AS email, 
          members.phone_number AS phone
        FROM members
        WHERE members.community_id = ?
      `;
  
      const result = await queryDatabase(query, [communityId]);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching community members:", error);
      res.status(500).json({ error: "Error fetching community members" });
    }
  });


  router.get("/member/:memberId", async (req, res) => {
    const { memberId } = req.params;
  
    try {
      const query = `
        SELECT 
          orders.order_id,
          orders.product_id,
          orders.quantity,
          orders.price
        FROM orders
        WHERE orders.member_id = ?
      `;
  
      const orders = await queryDatabase(query, [memberId]);
      res.status(200).json({ orders });
    } catch (error) {
      console.error("Error fetching member details:", error);
      res.status(500).json({ error: "Error fetching member details" });
    }
  });


// Simplified routes for testing
router.get("/test/:communityId", async (req, res) => {
  try {
    const { communityId } = req.params;
    const query = `
      SELECT 
        c.community_id,
        c.community_name,
        c.address,
        c.delivery_date,
        c.delivery_time,
        CONCAT(cr.first_name, ' ', cr.last_name) AS admin_name
      FROM Communities c
      JOIN consumerregistration cr ON c.admin_id = cr.consumer_id
      WHERE c.community_id = ?
    `;
    const [result] = await queryDatabase(query, [communityId]);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// // Add this route to communityRoutes.js

// Add this route to verify email matches consumer ID
router.post("/verify-email", async (req, res) => {
  const { consumerId, email } = req.body;

  try {
    const query = "SELECT email FROM consumerregistration WHERE consumer_id = ?";
    const [user] = await queryDatabase(query, [consumerId]);

    if (!user) {
      return res.status(404).json({ match: false, error: "User not found" });
    }

    if (user.email !== email) {
      return res.json({ match: false });
    }

    res.json({ match: true });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



//member ordercart
router.put('/member/:orderId/quantity', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    if (!quantity || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const updateQuery = 'UPDATE orders SET quantity = ? WHERE order_id = ? RETURNING *';
    const [result] = await queryDatabase(updateQuery, [quantity, orderId]);

    if (!result) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update quantity' });
  }
});

// Remove order item
router.delete('/member/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const deleteQuery = 'DELETE FROM orders WHERE order_id = ? RETURNING *';
    const [result] = await queryDatabase(deleteQuery, [orderId]);

    if (!result) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order item removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove order item' });
  }
});


// In communityRoutes.js
router.get("/:communityId/member-by-consumer/:consumerId", async (req, res) => {
  const { communityId, consumerId } = req.params;

  try {
    const query = `
      SELECT member_id 
      FROM members 
      WHERE community_id = ? AND consumer_id = ?
    `;
    const [result] = await queryDatabase(query, [communityId, consumerId]);

    if (!result) {
      return res.status(404).json({ 
        success: false,
        message: "Member not found in this community"
      });
    }

    res.status(200).json({
      success: true,
      memberId: result.member_id
    });
  } catch (error) {
    console.error("Error fetching member ID:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
});


router.post('/:communityId/member/:memberId/submit-frozen-order', async (req, res) => {
  try {
    const { communityId, memberId } = req.params;
    const { orders, discount } = req.body;
    
    // Validate input
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    // Calculate total amount
    const subtotal = orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = subtotal - (discount?.totalDiscountAmount || 0);

    // Create order in database using queryDatabase
    const query = `
      INSERT INTO orders (community_id, member_id, order_data, discount_data, total_amount, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    
    const result = await queryDatabase(query, [
      communityId,
      memberId,
      JSON.stringify(orders),
      JSON.stringify(discount),
      totalAmount
    ]);

    res.status(201).json({ 
      orderId: result.insertId,
      message: 'Order submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting frozen order:', error);
    res.status(500).json({ error: 'Failed to submit order' });
  }
});

router.get('/:communityId/member-by-consumer/:consumerId',  async (req, res) => {
  try {
    const { communityId, consumerId } = req.params;
    
    const member = await CommunityMember.findOne({
      where: {
        community_id: communityId,
        consumer_id: consumerId
      }
    });

    if (!member) {
      return res.status(404).json({ 
        success: false,
        error: 'Member not found in this community'
      });
    }

    res.json({
      success: true,
      memberId: member.id
    });
  } catch (error) {
    console.error('Error fetching member ID:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch member ID' 
    });
  }
});


router.delete('/:communityId/clear-orders/:memberId', async (req, res) => {
  try {
    const { communityId, memberId } = req.params;
    console.log(`Attempting to clear orders for community ${communityId} member ${memberId}`); // Add logging
    
       // Use queryDatabase instead of db.query
       const result = await queryDatabase(
        'DELETE FROM orders WHERE community_id = ? AND member_id = ?',
        [communityId, memberId]
      );

      // Clear from frozen_orders table
    const frozenResult = await queryDatabase(
      'DELETE FROM frozen_orders WHERE community_id = ? AND member_id = ?',
      [communityId, memberId]
    );
    
    console.log(`Cleared ${result} order items`); // Add logging
    res.json({ success: true, deletedCount: result });
  } catch (error) {
    console.error("Error clearing orders:", error);
    res.status(500).json({ 
      error: 'Failed to clear orders',
      details: error.message 
    });
  }
});



router.get('/:communityId/member/:memberId/has-confirmed-order', async (req, res) => {
  try {
    const { communityId, memberId } = req.params;
    
    const query = `
      SELECT * FROM orders 
      WHERE community_id = ? 
      AND member_id = ? 
      
      LIMIT 1
    `;
    
    const [confirmedOrder] = await queryDatabase(query, [communityId, memberId]);
    
    res.json({ hasConfirmedOrder: !!confirmedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check confirmed order' });
  }
});


module.exports = router;