
const jwt = require("jsonwebtoken");
const { queryDatabase } = require("../config/db");

<<<<<<< HEAD
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
=======
// Environment configuration
const JWT_SECRET = process.env.JWT_SECRET || "your_strong_secret_key";
>>>>>>> 355d88045dcef06d898820f9c326a7954b6e225e

/**
 * 🛡️ Core Authentication Middleware
 * Verifies JWT token and attaches user data to request
 */
const authenticate = async (req, res, next) => {
  try {
<<<<<<< HEAD
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
=======
    console.log("🔍 Incoming Headers:", req.headers);
    
    // 1. Extract token from Authorization header
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) {
      console.error("❌ No Authorization header found");
      return res.status(401).json({ error: "Authorization header required" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.error("❌ Malformed Authorization header");
      return res.status(401).json({ error: "Bearer token required" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);

    // 3. Verify user exists in database
    let user;
    if (decoded.farmer_id) {
      user = await queryDatabase(
        "SELECT farmer_id FROM farmerregistration WHERE farmer_id = ?",
        [decoded.farmer_id]
      );
      if (user.length === 0) {
        throw new Error("Farmer not found");
      }
      req.user = { ...decoded, userType: "farmer" };
    } else if (decoded.consumer_id) {
      user = await queryDatabase(
        "SELECT consumer_id FROM consumerregistration WHERE consumer_id = ?",
        [decoded.consumer_id]
      );
      if (user.length === 0) {
        throw new Error("Consumer not found");
      }
      req.user = { ...decoded, userType: "consumer" };
    } else {
      throw new Error("Invalid token payload");
    }

    next();
  } catch (error) {
    console.error("❌ Authentication Error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    return res.status(401).json({ error: "Authentication failed" });
>>>>>>> 355d88045dcef06d898820f9c326a7954b6e225e
  }

  if (!req.user.consumer_id && req.user.userType !== "consumer") {
    return res.status(403).json({ error: "Consumer access only" });
  }

  next();
};

<<<<<<< HEAD
// 🔒 Farmer-Specific Middleware
const farmerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!req.user.farmer_id || req.user.userType !== "farmer") {
    return res.status(403).json({ error: "Farmer access only" });
=======
/**
 * 🔒 Farmer-Specific Middleware
 * Ensures only farmers can access the route
 */
const farmerOnly = async (req, res, next) => {
  if (!req.user || req.user.userType !== "farmer") {
    console.error("❌ Unauthorized farmer access attempt");
    return res.status(403).json({ error: "Farmer access only" });
  }
  
  try {
    const farmer = await queryDatabase(
      "SELECT farmer_id FROM farmerregistration WHERE farmer_id = ?",
      [req.user.farmer_id]
    );
    
    if (farmer.length === 0) {
      throw new Error("Farmer not found in database");
    }
    
    req.farmer = farmer[0];
    next();
  } catch (error) {
    console.error("❌ Farmer verification failed:", error);
    return res.status(403).json({ error: "Farmer verification failed" });
>>>>>>> 355d88045dcef06d898820f9c326a7954b6e225e
  }

  next();
};

<<<<<<< HEAD
// 🌐 Guest-Friendly Middleware
const authenticateOptional = (req, res, next) => {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
=======
/**
 * 🔒 Consumer-Specific Middleware
 * Ensures only consumers can access the route
 */
const consumerOnly = async (req, res, next) => {
  if (!req.user || req.user.userType !== "consumer") {
    console.error("❌ Unauthorized consumer access attempt");
    return res.status(403).json({ error: "Consumer access only" });
  }
  
  try {
    const consumer = await queryDatabase(
      "SELECT consumer_id FROM consumerregistration WHERE consumer_id = ?",
      [req.user.consumer_id]
    );
    
    if (consumer.length === 0) {
      throw new Error("Consumer not found in database");
    }
    
    req.consumer = consumer[0];
    next();
  } catch (error) {
    console.error("❌ Consumer verification failed:", error);
    return res.status(403).json({ error: "Consumer verification failed" });
  }
};

/**
 * 🌐 Optional Authentication Middleware
 * Allows both authenticated and unauthenticated access
 */
const authenticateOptional = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
>>>>>>> 355d88045dcef06d898820f9c326a7954b6e225e
    req.user = null;
    return next();
  }

<<<<<<< HEAD
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
=======
  const token = authHeader.split(" ")[1];
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("⚠️ Optional auth - invalid token:", err.message);
      req.user = null;
    } else {
      req.user = decoded;
    }
    next();
  });
>>>>>>> 355d88045dcef06d898820f9c326a7954b6e225e
};

module.exports = {
  verifyToken,
  authenticate,
  farmerOnly,
<<<<<<< HEAD
  authenticateOptional,
  checkBargainStatus,
  socketAuth,
  authMiddleware
=======
  consumerOnly,
  authenticateOptional
>>>>>>> 355d88045dcef06d898820f9c326a7954b6e225e
};