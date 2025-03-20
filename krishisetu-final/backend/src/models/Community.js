const db = require("../config/db");

class Community {
  static async create({ name, password, adminId }) {
    const query = `
      INSERT INTO Communities (name, password, admin_id)
      VALUES (?, ?, ?)
    `;
    const [result] = await queryDatabase(query, [name, password, adminId]);
    return result;
  }

  static async findByName(name) {
    const query = `SELECT * FROM Communities WHERE name = ?`;
    const [rows] = await queryDatabase(query, [name]);
    return rows[0];
  }

  static async updateDetails(id, address, deliveryDate, deliveryTime) {
    const query = `
      UPDATE Communities
      SET address = ?, delivery_date = ?, delivery_time = ?
      WHERE id = ?
    `;
    const [result] = await queryDatabase(query, [address, deliveryDate, deliveryTime, id]);
    return result;
  }
}

module.exports = Community;