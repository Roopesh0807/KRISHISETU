const jwt = require("jsonwebtoken");
const { queryDatabase } = require("../config/db");

// Environment configuration
const JWT_SECRET = process.env.JWT_SECRET || "your_strong_secret_key";

/**
 * 🛡️ Core Authentication Middleware
 * Verifies JWT token and attaches user data to request
 */
const authenticate = async (req, res, next) => {
  try {
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
  }
};

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
  }
};

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
    req.user = null;
    return next();
  }

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
};

module.exports = {
  authenticate,
  farmerOnly,
  consumerOnly,
  authenticateOptional
};