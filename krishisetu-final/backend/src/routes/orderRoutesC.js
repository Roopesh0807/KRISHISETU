const express = require("express");
const orderController = require("../controllers/orderController");
const communityController = require("../controllers/communityController");
const db = require('../config/db'); // Your existing db.js
const { queryDatabase } = require('../config/db'); 
const router = express.Router();
const { checkFreezeStatus } = require('../controllers/communityController');
router.get("/:communityId", orderController.getOrders);
router.get("/:communityId/member/:consumerId", orderController.getMemberOrders); // Use consumerId
router.post("/create", checkFreezeStatus, orderController.createOrder);
// Add this to orderRoutes.js
// router.delete("/:orderId", orderController.deleteOrder);
// router.delete('/delete/:orderId', orderController.deleteOrder); // Changed path
router.get("/:communityId/all-orders", orderController.getAllOrders); // New endpoint
// Add new route for freeze status
router.get("/:communityId/freeze-status", communityController.isCommunityFrozen);
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



// Add these routes to your orderRoutes.js

// Update order quantity
router.put('/:communityId/:orderId',(req, res, next) => {
  console.log('PUT /order/:orderId route hit');
  next();
}, checkFreezeStatus, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { quantity } = req.body;

    if (!quantity || isNaN(quantity)) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const updateQuery = `
      UPDATE orders 
      SET quantity = ? 
      WHERE order_id = ?
    `;
    
    await queryDatabase(updateQuery, [quantity, orderId]);
    
    res.json({ success: true, message: 'Quantity updated successfully' });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ error: "Failed to update quantity" });
  }
});

// Delete an order
router.delete('/:communityId/:orderId', (req, res, next) => {
  console.log('DELETE /order/:orderId route hit');
  next();
},async (req, res) => {
  try {
    const { orderId } = req.params;

    const deleteQuery = `
      DELETE FROM orders 
      WHERE order_id = ?
    `;
    
    await queryDatabase(deleteQuery, [orderId]);
    
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
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



  router.post('/:communityId/place-community-order', async (req, res) => {
    try {
      console.log("Incoming request body:", req.body);
      
      const { communityId } = req.params;
      const { email } = req.user;
      
      // Define required fields
      const requiredFields = {
        consumer_id: 'Consumer ID',
        name: 'Name',
        mobile_number: 'Mobile Number',
        address: 'Address',
        pincode: 'Pincode',
        produce_name: 'Produce Name',
        quantity: 'Quantity',
        amount: 'Amount',
        payment_method: 'Payment Method'
      };
  
      // Check for missing or empty required fields
      const missingOrEmptyFields = Object.entries(requiredFields)
        .filter(([field]) => {
          const value = req.body[field];
          return value === undefined || value === null || value === '';
        })
        .map(([field]) => field);
  
      if (missingOrEmptyFields.length > 0) {
        console.log("Missing or empty fields:", missingOrEmptyFields);
        return res.status(400).json({
          success: false,
          error: 'Missing or empty required fields',
          missingFields: missingOrEmptyFields,
          receivedData: req.body
        });
      }
  
      // Validate quantity and amount are numbers
      if (isNaN(req.body.quantity) || isNaN(req.body.amount)) {
        return res.status(400).json({
          success: false,
          error: 'Quantity and amount must be numbers'
        });
      }
  
      // Proceed with order creation
      const result = await db.queryDatabase(
        `INSERT INTO community_orders (
          community_id,
          consumer_id,
          name,
          mobile_number,
          email,
          address,
          pincode,
          produce_name,
          quantity,
          amount,
          payment_method,
          is_community,
          status,
          payment_status,
          order_date,
          discount_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          communityId,
          req.body.consumer_id,
          req.body.name,
          req.body.mobile_number,
          email,
          req.body.address,
          req.body.pincode,
          req.body.produce_name,
          Number(req.body.quantity),
          Number(req.body.amount),
          req.body.payment_method,
          true,
          'Pending',
          req.body.payment_method === 'cash-on-delivery' ? 'Pending' : 'Paid',
          new Date(),
          JSON.stringify(req.body.discount_data || {})
        ]
      );
  
      res.status(201).json({
        success: true,
        orderId: result.insertId,
        message: 'Community order placed successfully'
      });
  
    } catch (error) {
      console.error('Error placing community order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to place community order',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

module.exports = router;