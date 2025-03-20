const db = require("../config/db");

class Member {
  static addMember({ communityId, userId, name, email, phone }, callback) {
  const checkQuery = `
    SELECT * FROM Members WHERE community_id = ? AND email = ?
  `;

  db.query(checkQuery, [communityId, email], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length > 0) {
      return callback(new Error("Member with this email already exists in the community"), null);
    }

    // Insert new member if email is unique within the community
    const insertQuery = `
      INSERT INTO Members (community_id, user_id, name, email, phone)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [communityId, userId, name, email, phone], callback);
  });
}


  static removeMember(memberId, callback) {
    const query = `DELETE FROM Members WHERE id = ?`;
    db.query(query, [memberId], callback);
  }
}

module.exports = Member;