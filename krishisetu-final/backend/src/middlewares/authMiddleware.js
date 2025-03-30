const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET; // Ensure consistency

// 🛡️ Unified Authentication Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("🔍 Received Authorization Header:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔍 Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Invalid Token:", err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};


// 🔒 Consumer-Specific Middleware
const consumerOnly = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token required" });
  }

  const extractedToken = token.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(extractedToken, JWT_SECRET);
    console.log("Consumer Token Data:", decoded); // Log consumer token

    if (decoded.farmer_id) {
      return res.status(403).json({ error: "Farmer account cannot access consumer features" });
    }

    if (!decoded.consumer_id && decoded.userType !== "consumer") {
      return res.status(403).json({ error: "Consumer access only" });
    }

    req.user = { consumer_id: decoded.consumer_id };
    next();
  } catch (err) {
    console.error("Consumer JWT Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// 🔒 Farmer-Specific Middleware
const farmerOnly = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token required" });
  }

  const extractedToken = token.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(extractedToken, JWT_SECRET);
    console.log("Farmer Token Data:", decoded); // Log farmer token

    if (!decoded.farmer_id || decoded.userType !== "farmer") {
      return res.status(403).json({ error: "Farmer access only" });
    }

    req.farmer = decoded;
    next();
  } catch (err) {
    console.error("Farmer JWT Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// 🌐 Guest-Friendly Middleware
const authenticateOptional = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const extractedToken = token.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(extractedToken, JWT_SECRET);
    console.log("Optional Auth Token Data:", decoded); // Log guest token

    req.user = {
      id: decoded.farmer_id || decoded.consumer_id || decoded.id,
      userType: decoded.userType || (decoded.farmer_id ? "farmer" : "consumer"),
    };
  } catch (err) {
    console.error("Optional Auth JWT Error:", err.message);
    req.user = null;
  }
  next();
};

// 🔄 Bargain Status Middleware
const checkBargainStatus = (allowedStatuses) => (req, res, next) => {
  if (!allowedStatuses.includes(req.bargain.status)) {
    return res.status(403).json({ error: `Bargain must be in ${allowedStatuses.join(" or ")} state` });
  }
  next();
};
exports.authenticate = (req, res, next) => {
  console.log("🔍 Incoming Headers:", req.headers);  // ✅ Debugging

  const authHeader = req.headers["authorization"];  // Read header correctly
  console.log("🔍 Extracted Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No valid token provided" });
  }

  const token = authHeader.split(" ")[1];  // Extract token
  console.log("✅ Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;  // Attach user data to request
    console.log("✅ Decoded Token Data:", decoded);
    next();
  } catch (error) {
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};
module.exports = {
  authenticate,
  consumerOnly,
  farmerOnly,
  checkBargainStatus,
  authenticateOptional,
};
