const db = require("../config/db");

class Community {
  static async create({ name, password, adminId }) {
    const query = `
      INSERT INTO Communities (community_name, password, admin_id)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(query, [name, password, adminId]);
    return result;
  }

  static async findByName(name) {
    const query = `SELECT * FROM Communities WHERE community_name = ?`;
    const [rows] = await db.query(query, [name]);
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
}

module.exports = Community;