const {queryDatabase} = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const initiateBargain = async (req, res) => {
  try {
    console.log("Received request:", req.body); // Debugging

    const { farmer_id, product_id, quantity, original_price } = req.body;
    const consumer_id = req.user?.consumer_id;

    if (!consumer_id || !farmer_id || !product_id || !quantity || !original_price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure quantity and original_price are valid numbers
    if (isNaN(quantity) || isNaN(original_price) || quantity <= 0 || original_price <= 0) {
      return res.status(400).json({ error: "Invalid quantity or price" });
    }

    // Insert new bargain request
    const result = await queryDatabase(
      `INSERT INTO bargain_requests (consumer_id, farmer_id, product_id, quantity, original_price, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [consumer_id, farmer_id, product_id, quantity, original_price]
    );

    res.json({ success: true, bargainId: result.insertId });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database operation failed" });
  }
};
const getPriceSuggestions = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.query;

    const result = await queryDatabase(
      "CALL get_product_price_suggestions(?, ?)",
      [productId, quantity]
    );

    res.json(result[0][0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const submitOffer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { offerPrice } = req.body;

    await queryDatabase(
      "INSERT INTO bargain_offers (session_id, offered_by, offer_price) VALUES (?, ?, ?)",
      [sessionId, req.userType, offerPrice]
    );

    const session = await queryDatabase(
      "SELECT * FROM bargain_sessions WHERE session_id = ?",
      [sessionId]
    );

    res.json({
      message: "Offer submitted successfully",
      session: session[0],
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const respondToBargain = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { accept } = req.body;
    const status = accept ? "accepted" : "rejected";

    await queryDatabase(
      "UPDATE bargain_sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?",
      [status, sessionId]
    );

    const session = await queryDatabase(
      "SELECT * FROM bargain_sessions WHERE session_id = ?",
      [sessionId]
    );

    res.json({
      message: `Bargain ${status}`,
      session: session[0],
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const finalizeBargain = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await queryDatabase(
      'UPDATE bargain_sessions SET status = "completed", updated_at = CURRENT_TIMESTAMP WHERE session_id = ?',
      [sessionId]
    );

    const session = await queryDatabase(
      "SELECT * FROM bargain_sessions WHERE session_id = ?",
      [sessionId]
    );

    res.json({
      message: "Bargain finalized successfully",
      session: session[0],
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBargainSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await queryDatabase(
      "SELECT * FROM bargain_sessions WHERE session_id = ?",
      [sessionId]
    );

    if (!session.length) {
      return res.status(404).json({ error: "Bargain session not found" });
    }

    const offers = await queryDatabase(
      "SELECT * FROM bargain_offers WHERE session_id = ? ORDER BY created_at",
      [sessionId]
    );

    res.json({
      ...session[0],
      offers,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBargainNotifications = async (req, res) => {
  try {
    const notifications = await queryDatabase(
      "SELECT * FROM bargain_notifications WHERE user_id = ? AND user_type = ? ORDER BY created_at DESC",
      [req.userType === "farmer" ? req.user.farmer_id : req.user.consumer_id, req.userType]
    );

    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await queryDatabase(
      "UPDATE bargain_notifications SET is_read = TRUE WHERE notification_id = ?",
      [notificationId]
    );

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Alternative initiateBargain method for direct insertion

exports.initiateBargain = async (req, res) => {
  try {
    const { farmer_id, product_id, quantity, original_price } = req.body;
    const consumer_id = req.user.consumer_id;

    if (!farmer_id || !product_id || !quantity || !original_price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Insert new bargain session
    const sql = `
      INSERT INTO bargain_sessions (consumer_id, farmer_id, product_id, quantity, original_price)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [consumer_id, farmer_id, product_id, quantity, original_price];

    const result = await queryDatabase(sql, values);

    console.log("Insert Result:", result);

    if (!result.insertId) {
      return res.status(500).json({ error: "Failed to create bargain session" });
    }

    const sessionId = result.insertId;
    console.log("✅ New Bargain Session ID:", sessionId);

    res.status(201).json({ bargainId: sessionId });

  } catch (error) {
    console.error("❌ Error initiating bargain:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getBargainSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing session ID" });
    }

    // ✅ Fetch bargain session from the database
    const sql = `
      SELECT * FROM bargain_sessions WHERE id = ?
    `;
    const results = await queryDatabase(sql, [sessionId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Bargain session not found" });
    }

    res.status(200).json(results[0]);
  } catch (error) {
    console.error("❌ Error fetching bargain session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.respondToBargain = async (req, res) => {
  try {
    const { bargainId } = req.params;
    const { action } = req.body;
    const farmerId = req.farmer.farmer_id;

    const bargain = await queryDatabase(
      "SELECT * FROM bargain_requests WHERE id = ? AND farmer_id = ? AND status = 'pending'",
      [bargainId, farmerId]
    );

    if (!bargain.length) {
      return res.status(404).json({ error: "Bargain not found" });
    }

    if (action === "accept") {
      await queryDatabase(
        "UPDATE bargain_requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [bargainId]
      );
      return res.json({ success: true, message: "Bargain accepted" });
    }

    if (action === "reject") {
      await queryDatabase(
        "UPDATE bargain_requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [bargainId]
      );
      return res.json({ success: true, message: "Bargain rejected" });
    }

    throw new Error("Invalid action");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  initiateBargain,
  getPriceSuggestions,
  submitOffer,
  respondToBargain,
  finalizeBargain,
  getBargainSession,
  getBargainNotifications,
  markNotificationRead,
};
