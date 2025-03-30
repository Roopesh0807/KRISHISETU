// const db = require("../config/db");

// class Order {
//   static create({ communityId, memberId, product, quantity, price, paymentStatus }, callback) {
//     const query = `
//       INSERT INTO Orders (community_id, member_id, product, quantity, price, payment_status)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `;
//     db.query(query, [communityId, memberId, product, quantity, price, paymentStatus], callback);
//   }

//   static findByCommunity(communityId, callback) {
//     const query = `
//       SELECT 
//         o.id, 
//         m.name AS memberName, 
//         m.phone, 
//         o.product, 
//         o.quantity, 
//         o.price, 
//         o.payment_status AS paymentStatus
//       FROM Orders o
//       JOIN Members m ON o.member_id = m.id
//       WHERE o.community_id = ?
//     `;
//     db.query(query, [communityId], callback);
//   }
// }

// module.exports = Order;


const db = require("../config/db");

class Order {
  static async create({ communityId, memberId, productId, quantity, price, paymentMethod }) {
    const query = `
      INSERT INTO Orders (community_id, product_id, quantity, price, member_id, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      communityId,
      productId,
      quantity,
      price,
      memberId,
      paymentMethod,
    ]);
    return result;
  }

  static async findByCommunity(communityId) {
    const query = `
      SELECT 
        o.order_id,
        m.member_name AS memberName,
        m.phone_number AS phone,
        o.product_id AS product,
        o.quantity,
        o.price,
        o.payment_method AS paymentMethod
      FROM Orders o
      JOIN Members m ON o.member_id = m.member_id
      WHERE o.community_id = ?
    `;
    const [orders] = await db.query(query, [communityId]);
    return orders;
  }

  static async getMemberOrders(communityId, consumerId) {
    const query = `
      SELECT 
        o.order_id AS orderId,
        o.product_id AS product,
        o.quantity,
        o.price
      FROM orders o
      JOIN members m ON o.member_id = m.member_id
      WHERE o.community_id = ? AND m.consumer_id = ?
    `;
    const [orders] = await db.query(query, [communityId, consumerId]);
    return orders;
  }
}

module.exports = Order;