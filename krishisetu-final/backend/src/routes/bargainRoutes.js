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

router.get('/:sessionId', async (req, res) => {
  try {
      const { sessionId } = req.params;
      console.log("Fetching session with ID:", sessionId);  // Debugging

      const query = `SELECT * FROM bargain_sessions WHERE session_id = ?`;
      const [rows] = await queryDatabase(query, [sessionId]);

      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "No bargain session found." });
      }

      console.log("✅ Session Found:", rows[0]);  
      res.json(rows[0]);
  } catch (error) {
      console.error("❌ Error fetching session:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


// 🔔 Notifications
router.get('/notifications', authenticate, bargainController.getBargainNotifications);
router.patch('/notifications/:notificationId/read', authenticate, bargainController.markNotificationRead);

module.exports = router;
