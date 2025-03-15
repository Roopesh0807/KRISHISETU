const db = require('../config/db');

const createMessage = (sender, receiver, text, callback) => {
  const query = 'INSERT INTO messages (sender, receiver, text) VALUES (?, ?, ?)';
  db.query(query, [sender, receiver, text], callback);
};

const getMessages = (sender, receiver, callback) => {
  const query = 'SELECT * FROM messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)';
  db.query(query, [sender, receiver, receiver, sender], callback);
};

module.exports = { createMessage, getMessages };
