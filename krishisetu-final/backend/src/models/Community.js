// const db = require("../config/db");

// class Community {
//   static async create({ name, password, adminId }) {
//     const query = `
//       INSERT INTO Communities (community_name, password, admin_id)
//       VALUES (?, ?, ?)
//     `;
//     const [result] = await db.query(query, [name, password, adminId]);
//     return result;
//   }

//   static async findByName(name) {
//     const query = `SELECT * FROM Communities WHERE community_name = ?`;
//     const [rows] = await db.query(query, [name]);
//     return rows[0];
//   }

//   static async updateDetails(id, address, deliveryDate, deliveryTime) {
//     const query = `
//       UPDATE Communities
//       SET address = ?, delivery_date = ?, delivery_time = ?
//       WHERE community_id = ?
//     `;
//     const [result] = await db.query(query, [address, deliveryDate, deliveryTime, id]);
//     return result;
//   }
// }

// module.exports = Community;


const db = require("../config/db");

class Community {
  static async create({ name, password, adminId }) {
    const query = `
      INSERT INTO Communities (community_name, password, admin_id, address, delivery_date, delivery_time)
      VALUES (?, ?, ?, '', CURDATE(), CURTIME())
    `;
    const result = await db.query(query, [name, password, adminId]);
    return result;
  }

  static async findByName(name) {
    const query = `SELECT * FROM Communities WHERE community_name = ?`;
    const [rows] = await db.query(query, [name]);
    return rows[0];
  }

  static async findById(id) {
    const query = `SELECT * FROM Communities WHERE community_id = ?`;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  static async updateDetails(id, address, deliveryDate, deliveryTime) {
    const query = `
      UPDATE Communities
      SET address = ?, delivery_date = ?, delivery_time = ?
      WHERE community_id = ?
    `;
    const [result] = await db.query(query, [address, deliveryDate, deliveryTime, id]);
    return result;
  }

  static async getConsumerCommunities(consumerId) {
    const query = `
      SELECT 
        c.community_id,
        c.community_name,
        c.password,
        c.admin_id,
        CASE 
          WHEN c.admin_id = ? THEN TRUE 
          ELSE FALSE 
        END AS isAdmin,
        CASE 
          WHEN m.consumer_id IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END AS isMember
      FROM Communities c
      LEFT JOIN Members m ON c.community_id = m.community_id AND m.consumer_id = ?
      WHERE c.admin_id = ? OR m.consumer_id = ?
    `;
    const [rows] = await db.query(query, [consumerId, consumerId, consumerId, consumerId]);
    return rows;
  }
}

module.exports = Community;