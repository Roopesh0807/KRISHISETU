// controllers/orderController.js
// const { queryDatabase } = require("../config/db"); // Import queryDatabase from db.js

// exports.getOrders = async (req, res) => {
//   const { communityId } = req.params;

//   try {
//     // SQL query to fetch community details and admin name
//     const communityQuery = `
//       SELECT 
//         c.community_name AS communityName,
//         cr.first_name AS adminName,
//         c.address,
//         c.delivery_date AS deliveryDate,
//         c.delivery_time AS deliveryTime
//       FROM 
//         communities c
//       JOIN 
//         consumerregistration cr ON c.admin_id = cr.consumer_id
//       WHERE 
//         c.community_id = ?;
//     `;

//     // Execute the community query using queryDatabase
//     const communityResult = await queryDatabase(communityQuery, [communityId]);

//     // Check if the community exists
//     if (communityResult.length === 0) {
//       return res.status(404).json({ detail: "Community not found." });
//     }

//     // SQL query to fetch orders for the given communityId
//     const ordersQuery = `
//       SELECT 
//         o.order_id AS orderId,
//         o.product_id AS product,
//         o.quantity,
//         o.price,
//         'unpaid' AS paymentStatus,  -- Assuming payment status is not stored in the orders table
//         m.member_id AS memberId,
//         m.member_name AS memberName,
//         m.phone_number AS phone
//       FROM 
//         orders o
//       JOIN 
//         members m ON o.member_id = m.member_id
//       WHERE 
//         o.community_id = ?;
//     `;

//     // Execute the orders query using queryDatabase
//     const orders = await queryDatabase(ordersQuery, [communityId]);

//     // Group orders by member
//     const membersMap = new Map();

//     orders.forEach((order) => {
//       if (!membersMap.has(order.memberId)) {
//         membersMap.set(order.memberId, {
//           memberId: order.memberId,
//           memberName: order.memberName,
//           phone: order.phone,
//           orders: [],
//           total: 0,
//           discount: 0, // You can add logic to calculate discounts if needed
//           paymentAmount: 0,
//           paymentStatus: order.paymentStatus,
//         });
//       }

//       const member = membersMap.get(order.memberId);
//       member.orders.push({
//         id: order.orderId,
//         product: order.product,
//         quantity: order.quantity,
//         price: order.price,
//       });

//       // Calculate total for the member (sum of all product prices * quantities)
//       member.total += order.price * order.quantity;
//     });

//     // Convert the map to an array of members
//     const members = Array.from(membersMap.values());

//     // Calculate payment amount for each member (total - discount)
//     members.forEach((member) => {
//       member.paymentAmount = member.total - member.discount;
//     });

//     // Calculate grand total (sum of all members' payment amounts)
//     const grandTotal = members.reduce((total, member) => total + member.paymentAmount, 0);

//     // Calculate overall payment status
//     const overallPaymentStatus = members.every((member) => member.paymentStatus === "paid") ? "paid" : "unpaid";

//     // Format the response
//     const response = {
//       communityName: communityResult[0].communityName,
//       adminName: communityResult[0].adminName,
//       address: communityResult[0].address,
//       deliveryDate: communityResult[0].deliveryDate,
//       deliveryTime: communityResult[0].deliveryTime,
//       grandTotal,
//       overallPaymentStatus,
//       members,
//     };

//     // Send the response back to the client
//     res.json(response);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ detail: "Internal Server Error" });
//   }
// };

// Update the getOrders function in orderController.js

exports.getOrders = async (req, res) => {
  const { communityId } = req.params;

  try {
    // 1. Get community details with admin info
    const communityQuery = `
      SELECT 
        c.community_id,
        c.community_name,
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

    // 2. Get total members count (excluding admin)
    const membersCountQuery = `
      SELECT COUNT(*) as total_members 
      FROM members 
      WHERE community_id = ? AND consumer_id != ?
    `;
    const [membersCount] = await queryDatabase(membersCountQuery, [communityId, community.admin_id]);

    // 3. Get confirmed orders count (members with orders, excluding admin)
    const confirmedOrdersQuery = `
      SELECT COUNT(DISTINCT m.member_id) as confirmed_members
      FROM orders o
      JOIN members m ON o.member_id = m.member_id
      WHERE o.community_id = ? AND m.consumer_id != ?
    `;
    const [confirmedOrders] = await queryDatabase(confirmedOrdersQuery, [communityId, community.admin_id]);

    // 4. Get admin orders
    const adminOrdersQuery = `
      SELECT 
        o.order_id,
        o.product_id,
        o.quantity,
        o.price,
        o.payment_method
      FROM orders o
      JOIN members m ON o.member_id = m.member_id
      WHERE o.community_id = ? AND m.consumer_id = ?
    `;
    const adminOrders = await queryDatabase(adminOrdersQuery, [communityId, community.admin_id]);

    // 5. Get all other orders grouped by member (excluding admin)
    const ordersQuery = `
      SELECT 
        o.order_id,
        o.product_id,
        o.quantity,
        o.price,
        m.member_id,
        m.member_name,
        m.phone_number
      FROM orders o
      JOIN members m ON o.member_id = m.member_id
      WHERE o.community_id = ? AND m.consumer_id != ?
    `;
    const orders = await queryDatabase(ordersQuery, [communityId, community.admin_id]);

    // Calculate totals
    const adminTotal = adminOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
    const grandTotal = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0) + adminTotal;

    // Format response
    res.json({
      communityName: community.community_name,
      adminName: community.admin_name,
      address: community.address,
      deliveryDate: community.delivery_date,
      deliveryTime: community.delivery_time,
      grandTotal: grandTotal,
      overallPaymentStatus: 'unpaid', // Default status
      totalMembers: membersCount.total_members,
      confirmedMembers: confirmedOrders.confirmed_members,
      adminOrders: adminOrders,
      adminTotal: adminTotal,
      members: formatMemberOrders(orders)
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper function to group orders by member
function formatMemberOrders(orders) {
  const membersMap = {};
  
  orders.forEach(order => {
    if (!membersMap[order.member_id]) {
      membersMap[order.member_id] = {
        memberId: order.member_id,
        memberName: order.member_name,
        phone: order.phone_number,
        orders: [],
        total: 0
      };
    }
    
    const member = membersMap[order.member_id];
    member.orders.push({
      id: order.order_id,
      product: order.product_id,
      quantity: order.quantity,
      price: order.price
    });
    member.total += order.price * order.quantity;
  });

  return Object.values(membersMap);
}

const { queryDatabase } = require("../config/db");


// Get orders for a specific member using consumer_id
exports.getMemberOrders = async (req, res) => {
  const { communityId, consumerId } = req.params;

  try {
    const query = `
      SELECT 
        o.order_id AS orderId,
        o.product_id AS product,
        o.quantity,
        o.price,
        o.payment_method AS paymentMethod
      FROM orders o
      JOIN members m ON o.member_id = m.member_id
      WHERE o.community_id = ? AND m.consumer_id = ?
    `;

    const orders = await queryDatabase(query, [communityId, consumerId]);
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching member orders:", error);
    res.status(500).json({ error: "Error fetching member orders" });
  }
};

exports.createOrder = async (req, res) => {
  const { communityId, productId, quantity, price, memberId, paymentMethod } = req.body;

  try {
    const query = `
      INSERT INTO orders (community_id, product_id, quantity, price, member_id, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await queryDatabase(query, [
      communityId,
      productId,
      quantity,
      price,
      memberId,
      paymentMethod,
    ]);

    res.status(201).json({
      message: "Order created successfully",
      orderId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Error creating order" });
  }
};


// Assuming you have a function to create an order
exports.createOrder = async (req, res) => {
  const { communityId, productId, quantity, price, memberId, paymentMethod } = req.body;

  try {
    // SQL query to insert a new order including the payment method
    const query = `
      INSERT INTO orders (community_id, product_id, quantity, price, member_id, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await queryDatabase(query, [
      communityId,
      productId,
      quantity,
      price,
      memberId,
      paymentMethod, // Include the payment method here
    ]);

    res.status(201).json({
      message: "Order created successfully",
      orderId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Error creating order" });
  }
};

// Add this to orderController.js
// In orderController.js
exports.deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  
  // Debugging
  console.log(`DELETE request for order: ${orderId}`);
  
  try {
    // Verify order exists
    const [order] = await queryDatabase(
      `SELECT * FROM orders WHERE order_id = ?`, 
      [orderId]
    );
    
    if (!order) {
      console.log('Order not found in database');
      return res.status(404).json({ 
        status: 'error',
        message: 'Order not found' 
      });
    }

    // Delete order
    await queryDatabase(
      `DELETE FROM orders WHERE order_id = ?`,
      [orderId]
    );
    
    console.log('Order successfully deleted');
    return res.json({ 
      status: 'success',
      message: 'Order deleted' 
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};