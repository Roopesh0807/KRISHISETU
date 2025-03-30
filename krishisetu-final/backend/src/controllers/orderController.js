// controllers/orderController.js
// const { queryDatabase } = require("../config/db"); // Import queryDatabase from db.js

exports.getOrders = async (req, res) => {
  const { communityId } = req.params;

  try {
    // SQL query to fetch community details and admin name
    const communityQuery = `
      SELECT 
        c.community_name AS communityName,
        cr.first_name AS adminName,
        c.address,
        c.delivery_date AS deliveryDate,
        c.delivery_time AS deliveryTime
      FROM 
        communities c
      JOIN 
        consumerregistration cr ON c.admin_id = cr.consumer_id
      WHERE 
        c.community_id = ?;
    `;

    // Execute the community query using queryDatabase
    const communityResult = await queryDatabase(communityQuery, [communityId]);

    // Check if the community exists
    if (communityResult.length === 0) {
      return res.status(404).json({ detail: "Community not found." });
    }

    // SQL query to fetch orders for the given communityId
    const ordersQuery = `
      SELECT 
        o.order_id AS orderId,
        o.product_id AS product,
        o.quantity,
        o.price,
        'unpaid' AS paymentStatus,  -- Assuming payment status is not stored in the orders table
        m.member_id AS memberId,
        m.member_name AS memberName,
        m.phone_number AS phone
      FROM 
        orders o
      JOIN 
        members m ON o.member_id = m.member_id
      WHERE 
        o.community_id = ?;
    `;

    // Execute the orders query using queryDatabase
    const orders = await queryDatabase(ordersQuery, [communityId]);

    // Group orders by member
    const membersMap = new Map();

    orders.forEach((order) => {
      if (!membersMap.has(order.memberId)) {
        membersMap.set(order.memberId, {
          memberId: order.memberId,
          memberName: order.memberName,
          phone: order.phone,
          orders: [],
          total: 0,
          discount: 0, // You can add logic to calculate discounts if needed
          paymentAmount: 0,
          paymentStatus: order.paymentStatus,
        });
      }

      const member = membersMap.get(order.memberId);
      member.orders.push({
        id: order.orderId,
        product: order.product,
        quantity: order.quantity,
        price: order.price,
      });

      // Calculate total for the member (sum of all product prices * quantities)
      member.total += order.price * order.quantity;
    });

    // Convert the map to an array of members
    const members = Array.from(membersMap.values());

    // Calculate payment amount for each member (total - discount)
    members.forEach((member) => {
      member.paymentAmount = member.total - member.discount;
    });

    // Calculate grand total (sum of all members' payment amounts)
    const grandTotal = members.reduce((total, member) => total + member.paymentAmount, 0);

    // Calculate overall payment status
    const overallPaymentStatus = members.every((member) => member.paymentStatus === "paid") ? "paid" : "unpaid";

    // Format the response
    const response = {
      communityName: communityResult[0].communityName,
      adminName: communityResult[0].adminName,
      address: communityResult[0].address,
      deliveryDate: communityResult[0].deliveryDate,
      deliveryTime: communityResult[0].deliveryTime,
      grandTotal,
      overallPaymentStatus,
      members,
    };

    // Send the response back to the client
    res.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

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