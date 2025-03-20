const Order = require("../models/Order");
const db = require("../config/db");

exports.getOrders = async (req, res) => {
  const { communityId } = req.params;

  try {
    // SQL query to fetch community details and admin name
    const communityQuery = `
      SELECT 
        c.name AS communityName,
        u.name AS adminName,
        c.address,
        c.delivery_date AS deliveryDate,
        c.delivery_time AS deliveryTime
      FROM 
        Communities c
      JOIN 
        Users u ON c.admin_id = u.id
      WHERE 
        c.id = ?;
    `;

    // Execute the community query
    const [communityResult] = await db.query(communityQuery, [communityId]);

    // Check if the community exists
    if (communityResult.length === 0) {
      return res.status(404).json({ detail: "Community not found." });
    }

    // SQL query to fetch orders for the given communityId
    const ordersQuery = `
      SELECT 
        o.id AS orderId,
        o.product,
        o.quantity,
        o.price,
        o.payment_status AS paymentStatus,
        m.id AS memberId,
        m.name AS memberName,
        m.phone
      FROM 
        Orders o
      JOIN 
        Members m ON o.member_id = m.id
      WHERE 
        o.community_id = ?;
    `;

    // Execute the orders query
    const [orders] = await db.query(ordersQuery, [communityId]);

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



exports.getMemberOrders = async (req, res) => {
  const { communityId, memberId } = req.params;

  try {
    // SQL query to fetch community details and admin name
    const communityQuery = `
      SELECT 
        c.name AS communityName,
        u.name AS adminName,
        c.address,
        c.delivery_date AS deliveryDate,
        c.delivery_time AS deliveryTime
      FROM 
        Communities c
      JOIN 
        Users u ON c.admin_id = u.id
      WHERE 
        c.id = ?;
    `;

    // Execute the community query
    const [communityResult] = await db.query(communityQuery, [communityId]);

    // Check if the community exists
    if (communityResult.length === 0) {
      return res.status(404).json({ detail: "Community not found." });
    }

    // SQL query to fetch member details (name and phone)
    const memberQuery = `
      SELECT 
        name AS memberName,
        phone AS memberPhone
      FROM 
        Members
      WHERE 
        id = ?;
    `;

    // Execute the member query
    const [memberResult] = await db.query(memberQuery, [memberId]);

    // Check if the member exists
    if (memberResult.length === 0) {
      return res.status(404).json({ detail: "Member not found." });
    }

    // SQL query to fetch orders for the given memberId
    const ordersQuery = `
      SELECT 
        o.id AS orderId,
        o.product,
        o.quantity,
        o.price,
        o.payment_status AS paymentStatus
      FROM 
        Orders o
      WHERE 
        o.community_id = ? AND o.member_id = ?;
    `;

    // Execute the orders query
    const [orders] = await db.query(ordersQuery, [communityId, memberId]);

    // Calculate total, discount, and payment amount for the member
    const total = orders.reduce((sum, order) => sum + order.price * order.quantity, 0);
    const discount = 0; // You can add logic to calculate discounts if needed
    const paymentAmount = total - discount;

    // Format the response
    const response = {
      communityName: communityResult[0].communityName,
      adminName: communityResult[0].adminName,
      address: communityResult[0].address,
      deliveryDate: communityResult[0].deliveryDate,
      deliveryTime: communityResult[0].deliveryTime,
      memberName: memberResult[0].memberName,
      memberPhone: memberResult[0].memberPhone,
      total,
      discount,
      paymentAmount,
      paymentStatus: orders.length > 0 ? orders[0].paymentStatus : "No orders",
      orders,
    };

    // Send the response back to the client
    res.json(response);
  } catch (error) {
    console.error("Error fetching member orders:", error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};