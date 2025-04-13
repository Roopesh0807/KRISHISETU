const express = require('express');
const router = express.Router();
const {queryDatabase} = require("../config/db");
const bargainController = require('../controllers/bargainController');
const { authenticate, consumerOnly, farmerOnly } = require('../middlewares/authMiddleware');
const { validateBargainSession, checkBargainStatus } = require('../middlewares/bargainMiddleware');
const {
  initiateBargainValidator,
  submitOfferValidator,
  sessionIdValidator,
  respondToBargainValidator
} = require('../validators/bargainValidators');

// ✅ CORS Middleware
router.use((req, res, next) => {
  res.header({
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': true
  });
  next();
});

// ✅ Preflight request handling
router.options('*', (req, res) => res.sendStatus(200));

// 🛒 Consumer Bargaining Routes
router.post('/initiate', authenticate, consumerOnly, bargainController.initiateBargain);
router.post('/:sessionId/offers', authenticate, consumerOnly, sessionIdValidator, submitOfferValidator, validateBargainSession, checkBargainStatus(['pending', 'countered']), bargainController.submitOffer);
router.post('/:sessionId/finalize', authenticate, consumerOnly, sessionIdValidator, validateBargainSession, checkBargainStatus(['countered']), bargainController.finalizeBargain);

// 👨‍🌾 Farmer Bargaining Routes
router.post('/:sessionId/respond', authenticate, farmerOnly, sessionIdValidator, respondToBargainValidator, validateBargainSession, checkBargainStatus(['pending']), bargainController.respondToBargain);

// 🔄 Shared Routes
// router.get("/:sessionId", authenticate, bargainController.getBargainSession);

router.get('/products/:productId/suggestions', authenticate, bargainController.getPriceSuggestions);

// router.get('/:sessionId', async (req, res) => {
//   try {
//       const { sessionId } = req.params;
//       console.log("Fetching session with ID:", sessionId);  // Debugging

//       const query = `SELECT * FROM bargain_sessions WHERE bargain_id = ?`;
//       const [rows] = await queryDatabase(query, [sessionId]);

//       if (!rows || rows.length === 0) {
//         return res.status(404).json({ message: "No bargain session found." });
//       }

//       console.log("✅ Session Found:", rows[0]);  
//       res.json(rows[0]);
//   } catch (error) {
//       console.error("❌ Error fetching session:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//   }
// });
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log("📦 Fetching session with ID:", sessionId);

    // ✅ Query 1: Fetch basic session info
    const sessionQuery = `
      SELECT 
        bargain_id,
        consumer_id,
        farmer_id,
        status,
        initiator,
        created_at,
        updated_at,
        expires_at
      FROM bargain_sessions 
      WHERE bargain_id = ?
    `;
    const sessionResult = await queryDatabase(sessionQuery, [sessionId]);

    if (!sessionResult || sessionResult.length === 0) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const session = sessionResult[0];

    // ✅ Query 2: Get all products for the session
    const productQuery = `
      SELECT 
        product_id,
        original_price,
        quantity,
        current_offer
      FROM bargain_session_products 
      WHERE bargain_id = ?
    `;
    const products = await queryDatabase(productQuery, [sessionId]);

    // ✅ Query 3: Get all messages from bargain_messages
    const messagesQuery = `
      SELECT 
        message_id,
        bargain_id,
        sender_role AS sender_type,
        sender_id,
        price_suggestion,
        message_type,
        created_at AS timestamp
      FROM bargain_messages
      WHERE bargain_id = ?
      ORDER BY created_at ASC
    `;
    const messages = await queryDatabase(messagesQuery, [sessionId]);

    // ✅ Build and send final response
    const responseData = {
      success: true,
      session: {
        bargain_id: session.bargain_id,
        consumer_id: session.consumer_id,
        farmer_id: session.farmer_id,
        status: session.status,
        initiator: session.initiator,
        created_at: session.created_at,
        updated_at: session.updated_at,
        expires_at: session.expires_at,
        products: products || [],
        messages: messages || []
      }
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error("❌ Error fetching session:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});




const { sendBargainRequestMessage } = require('../controllers/bargainController');

router.post('/send-bargain-message', sendBargainRequestMessage);


// 🔔 Notifications
router.get('/notifications', authenticate, bargainController.getBargainNotifications);
router.patch('/notifications/:notificationId/read', authenticate, bargainController.markNotificationRead);

module.exports = router;
