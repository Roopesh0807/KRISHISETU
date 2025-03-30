const pool = require("../config/db");

const validateBargainSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const [session] = await pool.query(
      'SELECT * FROM bargain_sessions WHERE session_id = ?',
      [sessionId]
    );

    if (!session.length) {
      return res.status(404).json({ error: 'Bargain session not found' });
    }

    // Check if user is part of this session
    if (
      req.user.consumer_id !== session[0].consumer_id && 
      req.user.farmer_id !== session[0].farmer_id
    ) {
      return res.status(403).json({ error: 'Not authorized for this session' });
    }

    req.bargainSession = session[0];
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkBargainStatus = (allowedStatuses) => async (req, res, next) => {
  if (!allowedStatuses.includes(req.bargainSession.status)) {
    return res.status(400).json({ 
      error: `Bargain session must be in one of these states: ${allowedStatuses.join(', ')}` 
    });
  }
  next();
};

module.exports = { validateBargainSession, checkBargainStatus };