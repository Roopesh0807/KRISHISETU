const db = require("../config/db");

class User {
  static findByEmail(email, callback) {
    const query = `SELECT * FROM Users WHERE email = ?`;
    db.query(query, [email], callback);
  }
}

module.exports = User;