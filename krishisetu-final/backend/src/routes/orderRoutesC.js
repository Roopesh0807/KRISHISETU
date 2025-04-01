const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.get("/:communityId", orderController.getOrders);
router.get("/:communityId/member/:consumerId", orderController.getMemberOrders); // Use consumerId
router.post("/create", orderController.createOrder);
// Add this to orderRoutes.js
// router.delete("/:orderId", orderController.deleteOrder);
router.delete('/delete/:orderId', orderController.deleteOrder); // Changed path
router.get('/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    
    // 1. Get community basic info
    const communityQuery = `
      SELECT 
        c.id AS communityId,
        c.name AS communityName,
        c.address,
        u.name AS adminName,
        u.id AS adminId,
        o.delivery_date AS deliveryDate,
        o.delivery_time AS deliveryTime,
        o.grand_total AS grandTotal,
        o.payment_status AS overallPaymentStatus
      FROM communities c
      JOIN users u ON c.admin_id = u.id
      JOIN orders o ON o.community_id = c.id
      WHERE c.id = ?
    `;
    const communityResult = await queryDatabase(communityQuery, [communityId]);
    
    if (communityResult.length === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    const communityInfo = communityResult[0];
    
    // 2. Get all members and their orders
    const membersQuery = `
      SELECT 
        m.id AS memberId,
        u.name AS memberName,
        u.phone,
        m.payment_method AS paymentMethod,
        m.payment_status AS paymentStatus,
        (
          SELECT SUM(oi.price * oi.quantity)
          FROM order_items oi
          WHERE oi.order_id = o.id AND oi.member_id = m.id
        ) AS total,
        (
          SELECT json_agg(json_build_object(
            'orderId', oi.id,
            'product', p.name,
            'quantity', oi.quantity,
            'price', oi.price
          ))
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = o.id AND oi.member_id = m.id
        ) AS orders
      FROM members m
      JOIN users u ON m.user_id = u.id
      JOIN orders o ON o.community_id = m.community_id
      WHERE m.community_id = $1 AND o.id = (
        SELECT id FROM orders WHERE community_id = $1 ORDER BY created_at DESC LIMIT 1
      )
    `;
    const membersResult = await db.query(membersQuery, [communityId]);
    
    // 3. Combine the data
    const response = {
      ...communityInfo,
      members: membersResult.rows.map(row => ({
        ...row,
        orders: row.orders || [] // Ensure orders is always an array
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Internal server error' });
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





  // router.get('/community/:communityId/member/:memberId', async (req, res) => {
  //   try {
  //     const { communityId, memberId } = req.params;
  
  //     // Find orders for this member in this community
  //     const orders = await Order.find({
  //       community_id: communityId,
  //       member_id: memberId
  //     }).populate('product_id', 'name price'); // Assuming you're using MongoDB and want product details
  
  //     if (!orders || orders.length === 0) {
  //       return res.status(404).json({ 
  //         success: false,
  //         message: 'No orders found for this member in the community'
  //       });
  //     }
  
  //     res.status(200).json({
  //       success: true,
  //       data: orders
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Server error'
  //     });
  //   }
  // });
module.exports = router;