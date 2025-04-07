
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret_key";

// 🛡️ Unified Authentication Middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// const authenticate = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   console.log("🔍 Received Authorization Header:", authHeader);

//   if (!authHeader) {
//     return res.status(401).json({ error: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];
//   console.log("🔍 Extracted Token:", token);

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     console.log("✅ Decoded Token:", decoded);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error("❌ Invalid Token:", err.message);
//     return res.status(403).json({ error: "Invalid token" });
//   }
// };

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("🔍 Received Authorization Header:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔍 Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);
    
    // Add this validation
    if (!decoded.farmer_id && !decoded.consumer_id) {
      return res.status(400).json({ error: "Token missing user identity" });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Invalid Token:", err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};
// 🔒 Consumer-Specific Middleware
const consumerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.farmer_id) {
    return res.status(403).json({ error: "Farmer account cannot access consumer features" });
  }

  if (!req.user.consumer_id && req.user.userType !== "consumer") {
    return res.status(403).json({ error: "Consumer access only" });
  }

  next();
};

// 🔒 Farmer-Specific Middleware
const farmerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!req.user.farmer_id || req.user.userType !== "farmer") {
    return res.status(403).json({ error: "Farmer access only" });
  }

  next();
};

// 🌐 Guest-Friendly Middleware
const authenticateOptional = (req, res, next) => {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Optional Auth Token Data:", decoded);
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
  if (!req.bargain || !allowedStatuses.includes(req.bargain.status)) {
    return res.status(403).json({ 
      error: `Bargain must be in ${allowedStatuses.join(" or ")} state` 
    });
  }
  next();
};

// Socket.IO Authentication Middleware
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded;
    next();
  });
};
const authMiddleware = (req, res, next) => {
  // Allow public routes
  const publicRoutes = [
    "/api/consumerregister",
    "/api/consumerlogin",
    "/api/farmerregister",
    "/api/farmerlogin"
  ];

  if (publicRoutes.includes(req.path)) {
    return next(); // Skip auth
  }

  // Else, verify token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = {
  verifyToken,
  authenticate,
  consumerOnly,
  farmerOnly,
  authenticateOptional,
  checkBargainStatus,
  socketAuth,
  authMiddleware
};