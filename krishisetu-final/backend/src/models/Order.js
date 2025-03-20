const db = require("../config/db");

class Order {
  static create({ communityId, memberId, product, quantity, price, paymentStatus }, callback) {
    const query = `
      INSERT INTO Orders (community_id, member_id, product, quantity, price, payment_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [communityId, memberId, product, quantity, price, paymentStatus], callback);
  }

  static findByCommunity(communityId, callback) {
    const query = `
      SELECT 
        o.id, 
        m.name AS memberName, 
        m.phone, 
        o.product, 
        o.quantity, 
        o.price, 
        o.payment_status AS paymentStatus
      FROM Orders o
      JOIN Members m ON o.member_id = m.id
      WHERE o.community_id = ?
    `;
    db.query(query, [communityId], callback);
  }
}

module.exports = Order;