const express = require("express");
const memberController = require("../controllers/memberController");
const { queryDatabase } = require('../config/db'); 
const { checkFreezeStatus } = require('../controllers/communityController');

const router = express.Router();
const app = express();
router.post("/add-member", memberController.addMember);
router.get("/:communityId", memberController.getMembers);
//router.delete("/remove-member/:memberId", memberController.removeMember);
router.delete("/:communityId/remove-member/:memberId", memberController.removeMember);
router.delete("/:id", memberController.removeMember);
// router.get("/api/member/:consumerId", memberController.getMemberByConsumerId);
router.get("/member/:memberId", memberController.getMemberByMemberId);
router.get("/:memberId", memberController.getMemberByMemberId);
// router.get('/find-member', memberController.findMember);
// Fetch member details by email
router.get("/member/email/:email", async (req, res) => {
    const { email } = req.params;
  
    try {
      const query = `
        SELECT 
          members.member_id, 
          members.consumer_id, 
          members.member_name AS name, 
          members.member_email AS email, 
          members.phone_number AS phone
        FROM members
        WHERE members.member_email = ?
      `;
  
      const result = await queryDatabase(query, [email]);
      if (result.length === 0) {
        return res.status(404).json({ error: "Member not found" });
      }
  
      res.status(200).json(result[0]); // Return the first matching member
    } catch (error) {
      console.error("Error fetching member by email:", error);
      res.status(500).json({ error: "Error fetching member by email" });
    }
  });
// router.delete("/community/:memberId/remove-member", async (req, res) => {
//     const { memberId } = req.params;
  
//     if (!memberId) {
//       return res.status(400).json({ error: "Member ID is required" });
//     }
  
//     try {
//       const result = await db.query("DELETE FROM Members WHERE id = ?", [memberId]);
      
//       if (result.affectedRows === 0) {
//         return res.status(404).json({ error: "Member not found" });
//       }
  
//       res.json({ message: "Member removed successfully!" });
//     } catch (error) {
//       console.error("Error deleting member:", error);
//       res.status(500).json({ error: "Server error while deleting member" });
//     }
//   });
  
// app.delete('/remove-member/:memberId', async (req, res) => {
//     const { memberId } = req.params;

//     try {
//         console.log(`Attempting to remove member with ID: ${memberId}`);

//         const query = 'DELETE FROM Members WHERE member_id = ?';
//         const result = await db.execute(query, [memberId]);

//         if (result.affectedRows > 0) {
//             res.json({ success: true, message: "Member removed successfully" });
//         } else {
//             res.status(404).json({ success: false, message: "Member not found or already removed" });
//         }
//     } catch (error) {
//         console.error("Error removing member:", error);
//         res.status(500).json({ success: false, message: "Server error while removing member" });
//     }
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

  

  router.get("/order/:communityId/member/:memberId", async (req, res) => {
    const { communityId, memberId } = req.params;
  
    try {
      const query = `
        SELECT 
          orders.order_id,
          orders.product_id,
          orders.quantity,
          orders.price
        FROM orders
        WHERE orders.community_id = ? AND orders.member_id = ?
      `;
  
      const orders = await queryDatabase(query, [communityId, memberId]);
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Error fetching orders" });
    }
  });










// Get member orders with product details
router.get('/:communityId/member/:memberId/orders', async (req, res) => {
  try {
    const { communityId, memberId } = req.params;

    // Verify member belongs to community
    const verifyQuery = `
      SELECT m.member_id, m.member_name, m.phone_number
      FROM members m
      WHERE m.member_id = ? AND m.community_id = ?
    `;
    const [member] = await queryDatabase(verifyQuery, [memberId, communityId]);

    if (!member) {
      return res.status(404).json({ 
        error: "Member not found in this community" 
      });
    }

    // Get community details
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
      return res.status(404).json({ error: "Community not found" });
    }

    // Get orders with product details
    const ordersQuery = `
      SELECT 
        o.order_id,
        o.product_id,
        p.product_name,
        p.category,
        p.price_1kg as price,
        o.quantity
      FROM orders o
      JOIN products p ON o.product_id = p.product_id
      WHERE o.community_id = ? AND o.member_id = ?
    `;
    const orders = await queryDatabase(ordersQuery, [communityId, memberId]);

    // Calculate total
    const total = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);

    res.json({
      community,
      member,
      orders,
      total: total.toFixed(2)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order quantity
//router.put('/order/:orderId/quantity',checkFreezeStatus , async (req, res) => {

router.put('/:communityId/order/:orderId',checkFreezeStatus , async (req, res) => {
  try {
    const { orderId } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    if (!quantity || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const updateQuery = 'UPDATE orders SET quantity = ? WHERE order_id = ?';
    // const [result] = await queryDatabase(updateQuery, [quantity, orderId]);

    // Then fetch the updated order
    const selectQuery = 'SELECT * FROM orders WHERE order_id = ?';
    const [result] = await queryDatabase(selectQuery, [orderId]);

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
//router.delete('/order/:orderId',checkFreezeStatus , async (req, res) => {

router.delete('/:communityId/:orderId',checkFreezeStatus , async (req, res) => {
  console.log('DELETE order route hit!', req.params); // Add this line
  try {
    const { orderId } = req.params;
    console.log('Deleting order:', orderId); // And this one
    
    // const deleteQuery = 'DELETE FROM orders WHERE order_id = ? RETURNING *';
    // const [result] = await queryDatabase(deleteQuery, [orderId]);
     // First fetch the order before deleting (if you need to return it)
     const selectQuery = 'SELECT * FROM orders WHERE order_id = ?';
     const [order] = await queryDatabase(selectQuery, [orderId]);
    if (!order) {
      console.log('Order not found in DB');
      return res.status(404).json({ error: 'Order not found' });
    }

     // Then delete the order
     const deleteQuery = 'DELETE FROM orders WHERE order_id = ?';
     await queryDatabase(deleteQuery, [orderId]);
    
    console.log('Delete successful');
    res.json({message: 'Order item removed successfully',
      deletedOrder: order });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to remove order item' });
  }
});














module.exports = router;