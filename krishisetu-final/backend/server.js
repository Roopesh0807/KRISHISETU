require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();
const session = require("express-session");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { queryDatabase } = require('./src/config/db');
// const http = require("http");
// const socketIo = require("socket.io");
// const { Server } = require("socket.io");
const path = require("path");
const { verifyToken, authenticate, farmerOnly } = require('./src/middlewares/authMiddleware');
// const { initiateBargain } = require("./src/controllers/bargainController"); // Correct file
// const httpServer = http.createServer(app);
// const FarmerModel = require('./src/models/farmerModels');  // ✅ Ensure this path is correct
// const pool = require('./src/config/db');  // Ensure this line is present
const multer = require("multer");

const { authMiddleware } = require("./src/middlewares/authMiddleware"); // your renamed one



// ✅ PROPER CORS SETUP
const corsOptions = {
  origin: "http://localhost:3000", // your React app
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true, // allow cookies and sessions
  optionsSuccessStatus: 200
};

// ✅ Then these
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));         // ✅ Proper cors middleware
app.options('*', cors(corsOptions)); // ✅ OPTIONS preflight fix

// ✅ Then session setup
app.use(session({
  secret: 'f1a2c3d4e5f67890123456789abcdef1234567890abcdef1234567890abcdef',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,         // true if using HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));
// ✅ Public routes (no auth required)


app.post("/api/consumerregister",  async (req, res) => {
  console.log("Consumer Registration API Called ✅");  // Debugging

  const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;

  // ✅ Check for missing fields
  if (!first_name || !last_name || !email || !phone_number || !password || !confirm_password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // ✅ Check if passwords match
  if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  try {
      // ✅ Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Insert into database (store only hashed password)
      const result = await queryDatabase(
          `INSERT INTO consumerregistration (first_name, last_name, email, phone_number, password) 
           VALUES (?, ?, ?, ?, ?);`,
          [first_name, last_name, email, phone_number, hashedPassword]
      );

      if (result.affectedRows === 0) {
          return res.status(500).json({ success: false, message: "Registration failed" });
      }

      // ✅ Fetch the correct consumer_id
      const consumerData = await queryDatabase(
          `SELECT consumer_id FROM consumerregistration WHERE email = ?`, 
          [email]
      );

      if (consumerData.length === 0) {
          return res.status(500).json({ success: false, message: "Consumer ID retrieval failed" });
      }

      const consumer_id = consumerData[0].consumer_id;

      res.json({ success: true, message: "Consumer registered successfully", consumer_id });

  } catch (err) {
      console.error("❌ Registration Error:", err);
      res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});
// ✅ Consumer Login Route
app.post("/api/consumerlogin", async (req, res) => {
const { emailOrPhone, password } = req.body;

try {
  const results = await queryDatabase(
    "SELECT consumer_id, email, phone_number, first_name , last_name, password FROM consumerregistration WHERE email = ? OR phone_number = ?",
    [emailOrPhone, emailOrPhone]
  );
  console.log("🔍 Query Results:", results);
  if (results.length === 0) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const consumer = results[0];
  console.log("🔍 API Returning Consumer Data:", consumer);
  const isPasswordValid = await bcrypt.compare(password, consumer.password);

  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // ✅ Store consumer_id in session
  req.session.consumer_id = consumer.consumer_id;
  // ✅ Debugging
  console.log("Session set:", req.session);

  const token = jwt.sign(
    { consumer_id: consumer.consumer_id, userType: "consumer" },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  const responseData = {
    success: true,
    token,
    consumer_id: consumer.consumer_id,
    first_name: consumer.first_name,
    last_name: consumer.last_name,
    email: consumer.email,
    phone_number: consumer.phone_number,
  };
  console.log("📌 Sending Response:", responseData); // ✅ Log API response
  res.json(responseData);
} catch (err) {
  console.error("Login error:", err);
  res.status(500).json({ success: false, message: "Server error" });
}
});

app.post("/api/farmerregister", async (req, res) => {
  const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;

  if (!first_name || !last_name || !email || !phone_number || !password || !confirm_password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  try {
      // ✅ Insert farmer details
      const result = await queryDatabase(
          `INSERT INTO farmerregistration (first_name, last_name, email, phone_number, password, confirm_password) 
           VALUES (?, ?, ?, ?, ?, ?);`,
          [first_name, last_name, email, phone_number, password, confirm_password]
      );

      if (result.affectedRows === 0) {
          return res.status(500).json({ success: false, message: "Registration failed" });
      }

      // ✅ Fetch the correct farmer_id
      const farmerData = await queryDatabase(
          `SELECT farmer_id FROM farmerregistration WHERE email = ?`, 
          [email]
      );

      if (farmerData.length === 0) {
          return res.status(500).json({ success: false, message: "Farmer ID retrieval failed" });
      }

      const farmer_id = farmerData[0].farmer_id;

      res.json({ success: true, message: "Farmer registered successfully", farmer_id });
  } catch (err) {
      res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});
//farmerlogin
app.post("/api/farmerlogin", async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    const results = await queryDatabase(
      "SELECT farmer_id, first_name, last_name,email, phone_number,  password FROM farmerregistration WHERE email = ? OR phone_number = ?",
      [emailOrPhone, emailOrPhone]
    );

    console.log("Login Query Results:", results);

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = results[0];
    console.log("User Retrieved:", user);

    // Debug password
    console.log("Entered Password:", password);
    console.log("Stored Password:", user.password);

    // Password check
    if (!user.password || password !== user.password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // ✅ Generate JWT Token
  // When a FARMER logs in:
const token = jwt.sign(
  {
    farmer_id: user.farmer_id,  // Different ID field
    userType: "farmer", 
    email: user.email,        // Explicit type
                            // Other claims
  },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
);

    // ✅ Send response with token
    res.json({
      success: true,
      token,
      farmer_id: user.farmer_id,
      full_name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone_number: user.phone_number,
      first_name: user.first_name,
      last_name: user.last_name,
    });
    
  } catch (err) {
    console.error("❌ Farmer Login Database Error:", err);
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});
app.use((req, res, next) => {
  const publicRoutes = [
    "/api/consumerregister",
    "/api/consumerlogin",
    "/api/farmerregister",
    "/api/farmerlogin"
    // Add more public routes if needed
  ];

  const cleanPath = req.path.toLowerCase();

  const isPublic = publicRoutes.some((route) => cleanPath.startsWith(route));

  if (isPublic) {
    console.log("✅ Skipping auth for public route:", cleanPath);
    return next();
  }

  console.log("🔒 Protected route, applying token check:", cleanPath);
  return authMiddleware(req, res, next);
});



// ⬇️ Must go before routes
app.use(authMiddleware);


// (Optional but helpful) Handle OPTIONS preflight for all routes
// const cors = require('cors'); // Make sure this is at the top!


const orderRoutes = require("./src/routes/orderRoutes");
const farmerRoutes = require("./src/routes/farmerRoutes");
const http = require('http');
// const setupSockets = require('./socket');
//const db = require(".src/config/db");
const communityRoutes = require("./src/routes/communityRoutes");
const memberRoutes = require("./src/routes/memberRoutes");
const orderRoutesC = require("./src/routes/orderRoutesC");

//bargainroutes
const bargainRoutes = require("./src/routes/bargainRoutes");
const reviewsRoutes = require('./src/routes/reviews');

const secretKey = process.env.JWT_SECRET;

const fs = require("fs");

const { Server } = require("socket.io");
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware to verify JWT from HTTP API
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token; // assuming token is in cookies
  if (!token) return res.sendStatus(401);
  jwt.verify(token, "your_random_secret_key_here", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
// Example API route (protected)
app.get("/api/user", authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});
// 🔐 WebSocket Middleware for Auth
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token; // token passed during socket connection

//   if (!token) {
//     return next(new Error('Authentication error: Token not provided'));
//   }

//   jwt.verify(token, secretKey, (err, decoded) => {
//     if (err) {
//       return next(new Error('Authentication error: Invalid token'));
//     }

//     socket.user = decoded; // Attach user data to socket
//     next();
//   });
// });
io.use((socket, next) => {
  try {
    // 1. Extract token from multiple possible locations
    const token = socket.handshake.auth.token;

    console.log(`\n🔐 New socket connection attempt from ${socket.id}`);
    console.log('⏱️ Timestamp:', new Date().toISOString());
    console.log('🔍 Handshake details:', {
      auth: socket.handshake.auth,
      headers: pick(socket.handshake.headers, [
        'authorization', 
        'cookie',
        'origin',
        'user-agent'
      ]),
      ip: socket.handshake.address,
      secure: socket.handshake.secure
    });

    // 2. Validate token presence

      if (!token) {
        const errorMsg = 'No authentication token provided';
        console.warn(`⚠️ ${errorMsg}`);
        socket.emit('auth_error', { 
          message: errorMsg,
          code: 'MISSING_TOKEN'
        });
        return next(new Error(errorMsg));
      }


    // 3. Basic token validation
    if (typeof token !== 'string' || token.length < 30) {
      const errorMsg = 'Invalid token format';
      console.warn(`⚠️ ${errorMsg}`);
      socket.emit('auth_error', {
        message: errorMsg,
        code: 'INVALID_TOKEN_FORMAT'
      });
      return next(new Error(errorMsg));
    }

    // 4. Verify token signature and decode
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        const errorType = err.name === 'TokenExpiredError' ? 
          'EXPIRED_TOKEN' : 'INVALID_TOKEN_SIGNATURE';
        const errorMsg = `Token verification failed: ${err.message}`;
        
        console.error(`❌ ${errorMsg}`);
        socket.emit('auth_error', {
          message: err.message,
          code: errorType,
          expiredAt: err.expiredAt
        });
        
        return next(new Error(errorMsg));
      }

      // 5. Validate token payload structure
      const userId = decoded.userId || decoded.farmer_id || decoded.consumer_id;
      if (!userId) {
        const errorMsg = 'Token payload missing user identifier';
        console.error(`❌ ${errorMsg}`, decoded);
        socket.emit('auth_error', {
          message: errorMsg,
          code: 'INVALID_TOKEN_PAYLOAD'
        });
        return next(new Error(errorMsg));
      }

      // 6. Additional security checks
      if (decoded.iss !== process.env.JWT_ISSUER) {
        const errorMsg = 'Invalid token issuer';
        console.error(`❌ ${errorMsg}`);
        socket.emit('auth_error', {
          message: errorMsg,
          code: 'INVALID_ISSUER'
        });
        return next(new Error(errorMsg));
      }

      // 7. Attach user data to socket
      socket.user = {
        id: userId,
        userType: decoded.userType || (decoded.farmer_id ? 'farmer' : 'consumer'),
        sessionId: socket.id,
        ipAddress: socket.handshake.address,
        ...decoded
      };

      // 8. Success logging
      console.log(`✅ Successfully authenticated socket ${socket.id}`);
      console.log('👤 User details:', {
        id: socket.user.id,
        type: socket.user.userType,
        issuedAt: new Date(decoded.iat * 1000),
        expiresAt: new Date(decoded.exp * 1000)
      });

      next();
    });

  } catch (error) {
    console.error('🔥 Critical authentication error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    socket.emit('auth_error', {
      message: 'Internal authentication error',
      code: 'INTERNAL_SERVER_ERROR'
    });

    next(new Error('AUTH_ERROR: Critical server error'));
  }
});

io.on("connection", (socket) => {
  const user = socket.user;
  const userType = user?.userType;
  const bargainId = socket.handshake.query?.bargainId;

  console.log("🎯 Reached io.on(connection) with socket.user:", user);
  console.log("🔗 bargainId received in query:", bargainId);

  if (!user || (userType !== "farmer" && userType !== "consumer")) {
    console.warn(`❌ Unauthorized socket connection attempt: ${socket.id}`);
    socket.disconnect(true);
    return;
  }

  console.log(`📡 ${userType} connected via socket: ${socket.id} (User ID: ${user.id})`);

  // 💬 Handle bargain messages within the same room
  if (bargainId) {
    socket.join(bargainId); // ✅ Join a room for the bargain session
    console.log(`🏠 Joined room for bargainId: ${bargainId}`);
  }

  // 🔁 Listen and emit within room
  socket.on("bargainMessage", (data) => {
    console.log(`💬 [${userType}] Bargain Message Received from ${user.id}:`, data);

    if (bargainId) {
      socket.to(bargainId).emit("bargainMessage", {
        ...data,
        senderId: user.id,
        senderType: userType,
      });
    } else {
      console.warn("⚠️ bargainId missing. Broadcasting to all instead.");
      socket.broadcast.emit("bargainMessage", {
        ...data,
        senderId: user.id,
        senderType: userType,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ ${userType} disconnected: ${socket.id}`);
  });
});

const mysql = require("mysql");

const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY;
const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN;
const REDIRECT_URL = "http://localhost:3000/payment-success";


const querydatabase = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "krishisetur",
});

querydatabase.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});
app.use(express.json());
// Add this at the top of your backend routes
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.originalUrl}`);
  next();
});

// const MySQLStore = require('express-mysql-session')(session);

// // MySQL session store configuration
// const sessionStoreOptions = {
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 3306,
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'krishisetur',
//   createDatabaseTable: true,
//   schema: {
//     tableName: 'bargain_sessions',
//     columnNames: {
//       session_id: 'bargain_id',
//       expires: 'expires',
//       data: 'data'
//     }
//   }
// };
// const sessionStore = new MySQLStore(sessionStoreOptions);


app.use('/api/reviews', reviewsRoutes);
// app.use((req, res, next) => {
//   console.log("Session Data:", req.session);
//   next();
// });
// 🔓 Only protect routes that are not public


app.get("/test-session", (req, res) => {
  console.log("Session Data:", req.session); // 🔍 Debugging

  if (!req.session.consumer_id) {
    return res.status(401).json({ error: "Session expired or not found" });
  }

  res.json({
    session_id: req.session.id,
    consumer_id: req.session.consumer_id
  });
});




app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("uploads"));
app.use("/api", farmerRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
// app.use((req, res, next) => {
//   console.log("Session Middleware - Current Session:", req.session);
//   next();
// });
app.use((req, res, next) => {
  if (req.path.startsWith("/socket.io")) {
    return next(); // Bypass auth for WebSocket connections
  }
  return verifyToken(req, res, next); // Use the existing verifyToken middleware
});
// // app.use(cors({
// //   origin: "http://localhost:3000",  // Allow requests from React frontend
// //  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these HTTP methods
// //   allowedHeaders: ["Content-Type", "Authorization"],  // Allow these headers
// //   credentials: true  // ✅ Important if you're using cookies or authentication
// // }));
// // app.use(cors({
// //   origin: "http://localhost:3000", // React app
// //   credentials: true,               // Important for sessions
// //   methods: ["GET", "POST", "OPTIONS"], // Allow preflight
// //   allowedHeaders: ["Content-Type", "Authorization"], // Adjust as needed
// // }));
// // Configure CORS properly
// // const corsOptions = {
// //   origin: 'http://localhost:3000', // Your frontend URL
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
// //   credentials: true, // Important for cookies and auth headers
// //   optionsSuccessStatus: 200 // Some legacy browsers choke on 204
// // };
// const corsOptions = {
//   origin: 'http://localhost:3000',
//   credentials: true, // REQUIRED for cookies/sessions
//   methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
//   allowedHeaders: [
//     'Content-Type',
//     'Authorization',
//     'X-Requested-With',
//     'Accept',
//     'Origin'
//   ],
//   optionsSuccessStatus: 200
// };

// // Apply CORS middleware
// app.use(cors(corsOptions));


// // Explicitly handle OPTIONS requests
// // app.options('*', cors(corsOptions)); 
// // // Enable preflight for all routes
// app.options('*', (req, res) => {
//   // Don't initialize session for OPTIONS
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.sendStatus(200);
// });
// // ✅ Middleware setup
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));


// app.use(cors(corsOptions));          // CORS middleware
// app.options("*", cors(corsOptions)); // Handle preflight

// // ✅ Middleware
// // app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ Session setup (important if you're using req.session)
// // ✅ Middleware
// app.use(cookieParser());
// const session = require("express-session"); 
// app.use(
//   session({
//     secret: "your-secret-key",
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       secure: false,
//       httpOnly: true,
//       sameSite: "lax",
//     },
//   })
// );

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// app.use(express.json());


app.use('/api/bargain', require('./src/routes/bargainRoutes'));
// Debugging Middleware for Logging Headers
// app.use((req, res, next) => {
//   console.log('Request Headers:', req.headers);
//   next();
// });
// Add headers before routes
app.use((req, res, next) => {
  if (req.method !== "OPTIONS") {
    console.log("Session Data:", req.session);
  }
  next();
});

app.use("/api", orderRoutes);

app.use(cookieParser());

app.use("/api/community", communityRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/order", orderRoutesC);

const SECRETE_KEY = process.env.SECRET_KEY;
const SECRET_KEY = process.env.JWT_SECRET || "krishisetu_secret_key";
const uploadDir = path.join(__dirname, "uploads"); // Correct path
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// 🔹 Storage settings for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/"); // Save images in uploads folder
  },
  filename: (req, file, cb) => {
      const uniqueName = Date.now() + path.extname(file.originalname);
      cb(null, uniqueName); // Unique filename
  }
});

const upload = multer({ storage });
app.post("/api/upload/:id", upload.single("file"), (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ message: "User ID is missing" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = `/uploads/${req.file.filename}`;

  // Save file path to database
  const sql = "UPDATE consumerprofile SET photo = ? WHERE consumer_id = ?";
  querydatabase.query(sql, [filePath, userId], (err, result) => {
    if (err) {
      console.error("Database Error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log("File Uploaded Successfully:", filePath);
    res.json({ filePath });
  });
});
app.post("/api/place-order", async (req, res) => {
  const { consumer_id, name, mobile_number, email, address, pincode, produce_name, quantity, amount } = req.body;
  try {
    const query = `
      INSERT INTO orders (consumer_id, name, mobile_number, email, address, pincode, produce_name, quantity, amount, status, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pending')
    `;
    await queryDatabase(query, [consumer_id, name, mobile_number, email, address, pincode, produce_name, quantity, amount]);
    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// Create an order in the database and generate payment URL
// app.post("/create-order", async (req, res) => {
//   const { amount, buyer_name, buyer_email, buyer_phone } = req.body;

//   try {
//     const response = await axios.post(
//       "https://www.instamojo.com/api/1.1/payment-requests/",
//       {
//         purpose: "KrishiSetu Order Payment",
//         amount,
//         buyer_name,
//         email: buyer_email,
//         phone: buyer_phone,
//         redirect_url: REDIRECT_URL,
//       },
//       {
//         headers: {
//           "X-Api-Key": INSTAMOJO_API_KEY,
//           "X-Auth-Token": INSTAMOJO_AUTH_TOKEN,
//         },
//       }
//     );

//     // Send the payment URL to the frontend
//     res.json({ success: true, payment_url: response.data.payment_request.longurl });
//   } catch (error) {
//     console.error("Error creating payment request:", error);
//     res.status(500).json({ success: false, message: "Payment request failed" });
//   }
// });

app.delete("/remove-photo/:consumer_id", async (req, res) => {
  const { consumer_id } = req.params;
  console.log("Received request to remove photo for user:", consumer_id);

  if (!consumer_id) {
    return res.status(400).json({ error: "Consumer ID is required" });
  }

  try {
    const sql = "UPDATE consumerprofile SET photo = NULL WHERE consumer_id = ?";
    await queryDatabase(sql, [consumer_id]);

    res.json({ message: "Photo removed successfully" });
  } catch (error) {
    console.error("Error removing photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/test", (req, res) => {
  res.send("API is working!");
});
// Save order API
app.post("/api/save-order", async (req, res) => {
  const { consumer_id, cart, totalPrice } = req.body;

  try {
    const query = "INSERT INTO orders (consumer_id, items, total_price, status) VALUES (?, ?, ?, ?)";
    await db.query(query, [consumer_id, JSON.stringify(cart), totalPrice, "Paid"]);

    res.json({ success: true, message: "Order saved successfully" });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ success: false, message: "Error saving order" });
  }
});
app.delete("/remove-photo/:consumer_id", async (req, res) => {
  const { consumer_id } = req.params;
  console.log("Received request to remove photo for user:", consumer_id);

  if (!consumer_id) {
    return res.status(400).json({ error: "Consumer ID is required" });
  }

  try {
    const sql = "UPDATE consumerprofile SET photo = NULL WHERE consumer_id = ?";
    await queryDatabase(sql, [consumer_id]);

    res.json({ message: "Photo removed successfully" });
  } catch (error) {
    console.error("Error removing photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//bargain sessions
// Fetch bargain session and messages
// app.get("/api/bargain/:bargain_id",verifyToken, async (req, res) => {
//   try {
//     console.log("🔍 Incoming Headers:", req.headers);

//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       console.error("❌ No Authorization header!");
//       return res.status(401).json({ error: "Authorization token required" });
//     }

//     const token = authHeader.split(" ")[1];
//     console.log("🔍 Extracted Token:", token);

//     if (!token) {
//       console.error("❌ Token is missing in Authorization header!");
//       return res.status(401).json({ error: "Authorization token required" });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log("✅ Token Decoded:", decoded);
//     } catch (err) {
//       console.error("❌ Token verification failed:", err.message);
//       return res.status(401).json({ error: "Invalid or expired token" });
//     }

//     const { bargain_id } = req.params;
//     console.log("🔍 Checking bargain session for ID:", bargain_id);

//     const session = await queryDatabase(
//       "SELECT * FROM bargain_sessions WHERE bargain_id = ?",
//       [bargain_id]
//     );
    
//     console.log("🔎 DB Result:", session);
    

//     if (session.length === 0) {
//       console.error("❌ Session not found in DB!");
//       return res.status(404).json({ error: "Session not found" });
//     }
   
//     console.log("📨 Sending response to frontend:", { success: true, session: session[0] });

    

//   } catch (error) {
//     console.error("🔥 Auth Error:", error.stack);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
app.get("/api/bargain/:bargain_id", verifyToken, async (req, res) => {
  try {
    const { bargain_id } = req.params;

    if (!bargain_id) {
      return res.status(400).json({
        success: false,
        error: "Bargain ID is required"
      });
    }

    // Get bargain session
    console.log("🔍 Fetching bargain session for ID:", bargain_id);

    const sessionResult = await queryDatabase(
      `SELECT 
        bargain_id,
        consumer_id,
        farmer_id,
        product_id,
        original_price,
        quantity,
        current_offer,
        status,
        initiator,
        created_at,
        updated_at,
        expires_at
      FROM bargain_sessions 
      WHERE bargain_id = ?`,
      [bargain_id]
    );

    console.log("🧪 Session result:", sessionResult);

    if (!sessionResult || sessionResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Bargain session not found"
      });
    }

    const session = sessionResult[0];

    // Get messages
    const messages = await queryDatabase(
      `SELECT 
        message_id,
        bargain_id,
        price,
        sender_type,
        message_type,
        content,
        timestamp
       FROM bargain_messages
       WHERE bargain_id = ?
       ORDER BY timestamp ASC`,
      [bargain_id]
    );
    if (!Array.isArray(messages)) {
      console.warn("⚠️ messages query returned non-array:", messages);
    }
    // Construct response
    const responseData = {
      success: true,
      session: {
        bargain_id: session.bargain_id,
        consumer_id: session.consumer_id,
        farmer_id: session.farmer_id,
        product_id: session.product_id,
        initial_price: session.original_price,        // ← 💡 You’ll use this as base price per 1kg
        quantity: session.quantity,
        current_price: session.current_offer || null, // ← 💡 Updated based on selected suggestion
        status: session.status,
        initiator: session.initiator,
        created_at: session.created_at,
        updated_at: session.updated_at,
        expires_at: session.expires_at,
        messages: messages || []
      }
    };

    res.status(200).json(responseData); // ✅ Let Express handle serialization

  } catch (error) {
    console.error("🔥 Error fetching bargain:", error);
  
    return res.status(500).json({ // ← ✅ Add `return`
      success: false,
      error: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { details: error.message })
    });
  }
  
});




// Submit an offer
app.post("/api/bargain/:session_id/offer", async (req, res) => {
  try {
    const { session_id } = req.params;
    const { price } = req.body;

    if (!price) {
      return res.status(400).json({ error: "Price is required" });
    }

    const newMessage = { session_id, sender: "consumer", text: `Offered ₹${price}`, timestamp: new Date() };
    await queryDatabase("INSERT INTO bargain_messages (session_id, sender, text, timestamp) VALUES (?, ?, ?, ?)",
      [session_id, "consumer", `Offered ₹${price}`, new Date()]
    );

    res.json({ newMessage });
  } catch (err) {
    console.error("Error submitting offer:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/community/:communityId/members", async (req, res) => {
  const { communityId } = req.params;
  
  try {
    const members = await db.query(
      "SELECT id, name, phone FROM Members WHERE community_id = ?",
      [communityId]
    );
    
    res.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get('/api/upload/:id', (req, res) => {
  const { id } = req.params;
  const filePath = `uploads/${id}`; // Modify based on your file storage
  res.sendFile(filePath, { root: __dirname }, (err) => {
      if (err) res.status(404).json({ error: "File not found" });
  });
});

// 
// app.post('/bargain/initiate', async (req, res) => {
//   try {
//     console.log("🔹 Received Bargain Request:", req.body);
//     const { consumer_id, farmer_id, product_id, quantity, original_price } = req.body;

//     // Validate input
//     if (!consumer_id || !farmer_id || !product_id || !quantity || !original_price) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Create new bargain session
//     const newSession = new BargainSession({
//       consumer_id,  // No longer checking authentication
//       farmer_id,
//       product_id,
//       quantity,
//       original_price,
//       status: 'requested'
//     });

//     await newSession.save();

//     res.status(201).json({
//       message: 'Bargain session initiated',
//       session_id: newSession._id,
//       farmer_id,
//       product_id
//     });
//   } catch (error) {
//     console.error('Error creating bargain session:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// In your bargain route file
// app.post('/api/bargain/initiate', authenticateToken, async (req, res) => {
//   try {
//     console.log("🔹 Authenticated User:", req.user); // Debug log
    
//     const { farmer_id, product_id, quantity, original_price } = req.body;
//     const { consumer_id } = req.user; // From middleware

//     if (!farmer_id || !product_id || !quantity || !original_price) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     await pool.query(
//       `INSERT INTO bargain_requests 
//        (consumer_id, farmer_id, product_id, quantity, original_price, status) 
//        VALUES (?, ?, ?, ?, ?, 'pending')`,
//       [consumer_id, farmer_id, product_id, quantity, original_price]
//     );

//     res.json({ success: true });
    
//   } catch (err) {
//     console.error("❌ Bargain Error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// app.get('/api/bargain/sessions/:consumer_id', async (req, res) => {
//   try {
//     const { consumer_id } = req.params;
//     console.log("🔹 Fetching Bargain Sessions for Consumer:", consumer_id);

//     if (!consumer_id) {
//       return res.status(400).json({ error: "Consumer ID is required" });
//     }

//     const sessions = await BargainSession.find({ consumer_id });

//     res.status(200).json({ sessions });
//   } catch (error) {
//     console.error("❌ Error fetching bargain sessions:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// **Get Consumer Profile API**
app.get("/api/profile/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT * FROM consumers WHERE id = ?";
  
  querydatabase.query(sql, [userId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.length > 0) {
          res.json(result[0]); // Return user data including the photo
      } else {
          res.status(404).json({ message: "User not found" });
      }
  });
});

app.put("/api/consumerprofile/:id", upload.single("photo"), async (req, res) => {
  try {
    const consumer_id = req.params.id || req.body.consumer_id; // ✅ Ensure correct reference

    const { address, pincode, location, preferred_payment_method, subscription_method } = req.body;

    let photo = null;
    if (req.file) {
      // Save the file and get the file path
      photo = `/uploads/${req.file.filename.replace(/\\/g, "/")}`;

      // ✅ Fix: Correct Table Name (should match your DB structure)
      const updatePhotoQuery = "UPDATE consumerprofile SET photo = ? WHERE consumer_id = ?";
      await queryDatabase(updatePhotoQuery, [photo, consumer_id]);
    }

    // ✅ Fix: Ensure Updating the Correct Table
    let query = `
      UPDATE consumerprofile
      SET address = ?, pincode = ?, location = ?, 
          preferred_payment_method = ?, subscription_method = ?
    `;

    let params = [address, pincode, location, preferred_payment_method, subscription_method];

    if (photo) {
      query += ", photo = ?";
      params.push(photo);
    }

    query += " WHERE consumer_id = ?;";
    params.push(consumer_id);

    const result = await queryDatabase(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Consumer profile not found" });
    }

    res.json({
      consumer_id: consumer_id,
      photo: photo ? `http://localhost:5000/uploads/${photo}` : null, // ✅ Ensure correct path
    });    
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// API to fetch all consumers
app.get('/api/consumerprof', async (req, res) => {
  try {
    const query = 'SELECT * FROM consumerprofile';  // Selecting only the necessary fields
    const results = await queryDatabase(query);  // Use queryDatabase function
    res.json(results);  // Send all consumers data
  } catch (err) {
    res.status(500).send('Error fetching data');
  }
});

// API to fetch a specific consumer by ID or all consumers
app.get('/api/consumerprof/:consumer_id?', async (req, res) => {
  const consumer_id = req.params.consumer_id;

  try {
    if (consumer_id) {
      const query = 'SELECT consumer_id, name, photo FROM consumerprofile WHERE consumer_id = ?';
      const results = await queryDatabase(query, [consumer_id]);  // Use queryDatabase with parameters
      if (results.length === 0) {
        return res.status(404).send('Consumer not found');
      }
      res.json(results);  // Send the found consumer data
    } else {
      const query = 'SELECT consumer_id, name, photo FROM consumerprofile';  // Fetch all consumers
      const results = await queryDatabase(query);  // Use queryDatabase function
      res.json(results);  // Send all consumers data
    }
  } catch (err) {
    res.status(500).send('Error fetching data');
  }
});
app.get('/api/products/price', async (req, res) => {
  const { farmer_id, product_id } = req.query;

  if (!farmer_id || !product_id) {
      return res.status(400).json({ error: "Missing farmer_id or product_id" });
  }

  try {
      const product = await db.query(
          "SELECT price FROM products WHERE farmer_id = ? AND product_id = ?",
          [farmer_id, product_id]
      );

      if (product.length > 0) {
          res.json({ price: product[0].price });
      } else {
          res.status(404).json({ error: "Product not found for this farmer" });
      }
  } catch (error) {
      res.status(500).json({ error: "Database error" });
  }
});
app.get('/api/consumerprofile/:consumer_id', async (req, res) => {
  const { consumer_id } = req.params;
  try {
      const query = `
      SELECT consumer_id, 
             name, 
             mobile_number, 
             email, 
             address, 
             pincode, 
             location, 
             photo, 
             preferred_payment_method, 
             subscription_method 
      FROM consumerprofile 
      WHERE consumer_id = ?`;

      const results = await queryDatabase(query, [consumer_id]);

      if (results.length > 0) {
          res.json(results[0]);
      } else {
          res.status(404).json({ message: 'Consumer profile not found' });
      }
  } catch (error) {
      console.error('Error fetching consumer profile:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get("/api/consumerdetails/:id", async (req, res) => {
  try {
    const consumer_id = req.params.id;
    console.log("Fetching consumer details for ID:", consumer_id);

    // Fetch Consumer Profile from consumer_addresses table instead of consumerprofile
    const query = `
      SELECT consumer_id, name, phone_number 
      FROM consumer_addresses 
      WHERE consumer_id = ?;
    `;
    const result = await queryDatabase(query, [consumer_id]);

    if (result.length === 0) {
      console.log("❌ Consumer not found:", consumer_id);
      return res.status(404).json({ message: "Consumer not found" });
    }

    res.json(result[0]); // ✅ Send correct consumer data
  } catch (error) {
    console.error("❌ Error fetching consumer details:", error);
    res.status(500).json({ error: "Failed to fetch consumer details" });
  }
});


// Fetch consumer's address
app.get("/api/addresses/:consumer_id", async (req, res) => {
  try {
      const { consumer_id } = req.params;

      // Fetch consumer details with concatenated name
      const consumerQuery = `
          SELECT consumer_id, 
                  name, 
                 mobile_number 
          FROM consumerprofile
          WHERE consumer_id = ?`;
      const consumer = await queryDatabase(consumerQuery, [consumer_id]);

      if (consumer.length === 0) {
          return res.status(404).json({ error: "Consumer not found" });
      }

      // Fetch stored address
      const addressQuery = "SELECT * FROM consumer_addresses WHERE consumer_id = ?";
      const address = await queryDatabase(addressQuery, [consumer_id]);

      res.json({
          consumerProfile: consumer[0],  // Renamed consumer to consumerProfile
          address: address.length > 0 ? address[0] : null,
      });

  } catch (error) {
      console.error("Error fetching consumer address:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add or update consumer address
app.post("/api/addresses/:consumer_id", async (req, res) => {
  try {
    const { consumer_id } = req.params;
    const { name, mobile_number, pincode, city, state, street, landmark } = req.body;

    // Validation: Ensure all required fields are provided
    if (!consumer_id || !name || !mobile_number || !pincode || !city || !state || !street) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the address already exists
    const existingAddressQuery = `
      SELECT * FROM consumer_addresses
      WHERE consumer_id = ? AND pincode = ? AND street = ?
    `;
    const existingAddress = await queryDatabase(existingAddressQuery, [consumer_id, pincode, street]);

    if (existingAddress.length > 0) {
      return res.status(400).json({ error: "Address already exists" });
    }

    // Insert the new address
    const insertQuery = `
      INSERT INTO consumer_addresses (consumer_id, name, mobile_number, pincode, city, state, street, landmark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await queryDatabase(insertQuery, [consumer_id, name, mobile_number, pincode, city, state, street, landmark]);

    res.status(200).json({ message: "Address added successfully", consumer_id, name, pincode, city, street, landmark });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/orders/:consumer_id", async (req, res) => {
  const { consumer_id } = req.params;
  try {
      const products = await queryDatabase(
          "SELECT * FROM placeorder WHERE consumer_id = ?",
          [consumer_id]
      );
      res.json(products);
  } catch (error) {
      res.status(500).json({ error: "Failed to fetch order products" });
  }
});

// // ✅ Middleware: Verify JWT Token
// const verifyToken = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ success: false, message: "Access denied. No token provided." });

//   try {
//     const decoded = jwt.verify(token, SECRET_KEY);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ success: false, message: "Invalid or expired token" });
//   }
// };

// ✅ API to Fetch Products
// app.get("/api/products", async (req, res) => {
//   try {
//     const products = await queryDatabase("SELECT * FROM products");
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Error fetching products", error: err.message });
//   }
// });

app.get("/api/products", async (req, res) => {
  try {
    const products = await queryDatabase("SELECT * FROM products");
    if (!products) {
      return res.status(200).json([]); // Always return valid JSON
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching products", error: err.message });
  }
});


app.get("/api/getFarmerDetails", async (req, res) => {
  try {
    const { farmer_id } = req.query;
    if (!farmer_id) {
      return res.status(400).json({ success: false, message: "Farmer ID is required" });
    }

    const query = `SELECT farmer_id, first_name, last_name, email, phone_number FROM farmerregistration WHERE farmer_id = ?`;
    const result = await queryDatabase(query, [farmer_id]);

    if (!result || !Array.isArray(result) || result.length === 0) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }

    const farmer = result[0]; // Get the first row safely

    res.json({
      success: true,
      farmer: {
        farmer_id: farmer.farmer_id,
        farmerName: `${farmer.first_name} ${farmer.last_name}`,
        email: farmer.email,
        phone_number: farmer.phone_number,
      },
    });
  } catch (error) {
    console.error("🚨 Error fetching farmer details:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});



// ✅ Consumer Registration API (With Hashing)



// ✅ Logout API (Clears JWT Cookie)
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
});

app.get("/api/getpersonaldetails", async (req, res) => {
  const { farmer_id } = req.query;
  try {
    const result = await queryDatabase(
      `SELECT * FROM personaldetails WHERE farmer_id = ?;`,
      [farmer_id]
    );
    // If no data is found, return an empty object
    res.json(result[0] || {});
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching personal details", error: err.message });
  }
});
app.post("/api/updatepersonaldetails", async (req, res) => {
  const { user_id, email, contact, identification_number, address, bank_account_no, ifsc_code, upi_id, date_of_birth, gender, AdharProof } = req.body;

  if (!farmer_id || !email || !contact || !identification_number || !address || !date_of_birth || !gender) {
    return res.status(400).json({ success: false, message: "Required fields are missing" });
  }

  try {
    const existingDetails = await queryDatabase(
      `SELECT * FROM personaldetails WHERE farmer_id = ?;`, [user_id]
    );

    if (existingDetails.length > 0) {
      await queryDatabase(
        `UPDATE personaldetails 
         SET email=?, contact=?, identification_number=?, address=?, bank_account_no=?, ifsc_code=?, upi_id=?, date_of_birth=?, gender=?, AdharProof=?
         WHERE farmer_id = ?;`,
        [email, contact, identification_number, address, bank_account_no, ifsc_code, upi_id, date_of_birth, gender, AdharProof, user_id]
      );
    } else {
      await queryDatabase(
        `INSERT INTO personaldetails (user_id, email, contact, identification_number, address, bank_account_no, ifsc_code, upi_id, date_of_birth, gender, AdharProof) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [user_id, email, contact, identification_number, address, bank_account_no, ifsc_code, upi_id, date_of_birth, gender, AdharProof]
      );
    }

    res.json({ success: true, message: "Personal details updated successfully" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ success: false, message: "Error updating personal details", error: err.message });
  }
});

app.get("/api/getfarmdetails", async (req, res) => {
  const { farmer_id } = req.query;
  try {
    const result = await queryDatabase(
      `SELECT * FROM farmdetails WHERE farmer_id = ?;`,
      [user_id]
    );
    // If no data is found, return an empty object
    res.json(result[0] || {});
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching farm details", error: err.message });
  }
});
app.post("/api/updatefarmdetails", async (req, res) => {
  const { user_id, farm_name, location, land_size, farming_type, soil_type, irrigation_method, types_of_crops, farm_equipment, LandOwnerShipProof, photoofFarm, LandLeaseProof, certifications } = req.body;

  if (!farmer_id || !farm_name || !location || !land_size || !farming_type) {
    return res.status(400).json({ success: false, message: "Required fields are missing" });
  }

  try {
    const existingDetails = await queryDatabase(
      `SELECT * FROM farmdetails WHERE farmer_id = ?;`, [user_id]
    );

    if (existingDetails.length > 0) {
      await queryDatabase(
        `UPDATE farmdetails 
         SET farm_name=?, location=?, land_size=?, farming_type=?, soil_type=?, irrigation_method=?, types_of_crops=?, farm_equipment=?, LandOwnerShipProof=?, photoofFarm=?, LandLeaseProof=?, certifications=?
         WHERE farmer_id = ?;`,
        [farm_name, location, land_size, farming_type, soil_type, irrigation_method, types_of_crops, farm_equipment, LandOwnerShipProof, photoofFarm, LandLeaseProof, certifications, user_id]
      );
    } else {
      await queryDatabase(
        `INSERT INTO farmdetails (user_id, farm_name, location, land_size, farming_type, soil_type, irrigation_method, types_of_crops, farm_equipment, LandOwnerShipProof, photoofFarm, LandLeaseProof, certifications) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [user_id, farm_name, location, land_size, farming_type, soil_type, irrigation_method, types_of_crops, farm_equipment, LandOwnerShipProof, photoofFarm, LandLeaseProof, certifications]
      );
    }

    res.json({ success: true, message: "Farm details updated successfully" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ success: false, message: "Error updating farm details", error: err.message });
  }
});
app.get("/api/farmers", async (req, res) => {
  try {
    const farmers = await queryDatabase(`
        SELECT 
    f.farmer_id, 
    CONCAT(f.first_name, ' ', f.last_name) AS farmer_name,  -- Combine first_name and last_name
    CONCAT('[', 
        GROUP_CONCAT(
            JSON_OBJECT(
                'product_id', p.product_id,
                'produce_name', p.produce_name,
                'availability', p.availability,
                'price_per_kg', p.price_per_kg,
                'produce_type', p.produce_type
            )
        SEPARATOR ','),  -- Ensure JSON objects are properly separated
    ']') AS products
FROM farmerregistration f
JOIN add_produce p ON f.farmer_id = p.farmer_id
GROUP BY f.farmer_id;


    `);

    res.json(farmers);
  } catch (err) {
    console.error("🔥 Error fetching farmers:", err);
    res.status(500).json({ message: "Server error fetching farmers", error: err });
  }
});
app.get("/api/farmers/simple", async (req, res) => {
  try {
    // Fetch farmers and their associated products from the database
    const farmers = await queryDatabase(`
      SELECT 
        f.farmer_id, 
        CONCAT(f.first_name, ' ', f.last_name) AS name,  -- Combine first_name and last_name
        fp.profile_photo,  -- Fetch profile_photo from farmerprofile
        ap.product_id  -- Fetch product_id from add_produce table
      FROM farmerregistration f
      JOIN farmerprofile fp ON f.farmer_id = fp.farmer_id  -- Join farmerprofile table
      LEFT JOIN add_produce ap ON f.farmer_id = ap.farmer_id  -- Join add_produce table to get product_id
    `);

    // Group products by farmer_id
    const farmersWithProducts = farmers.reduce((acc, farmer) => {
      // Check if the farmer already exists in the accumulator
      if (!acc[farmer.farmer_id]) {
        acc[farmer.farmer_id] = {
          ...farmer,  // Spread the farmer data
          profilephoto: farmer.profile_photo && farmer.profile_photo.length > 0
            ? `data:image/jpeg;base64,${farmer.profile_photo.toString('base64')}` 
            : null,  // Convert the profile photo to base64
          products: [],  // Initialize the products array for the farmer
        };
      }

      // If the product_id exists, add it to the farmer's products array
      if (farmer.product_id) {
        acc[farmer.farmer_id].products.push(farmer.product_id);
      }

      return acc;
    }, {});

    // Convert the accumulator into an array
    const result = Object.values(farmersWithProducts);

    res.json(result); // Send the final array of farmers with their products
  } catch (err) {
    console.error("🔥 Error fetching simplified farmers:", err); // Log the full error object
    res.status(500).json({ message: "Server error fetching simplified farmers", error: err.message || err });
  }
});

app.get('/api/get-produce-price/:product_id', async (req, res) => {
  const { product_id } = req.params;
  try {
    const query = "SELECT price_per_kg FROM add_produce WHERE product_id = ?";
    const result = await queryDatabase(query, [product_id]);

    if (result.length > 0) {
      res.json({ price_per_kg: result[0].price_per_kg });
    } else {
      console.warn("No produce found for product_id:", product_id);
      res.status(404).json({ error: "Produce not found" });
    }
  } catch (error) {
    console.error("Error fetching produce price:", error.message); // Detailed error logging
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.get("/api/check-user-details", async (req, res) => {
  const { farmer_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    // Check if personal details exist
    const personalDetails = await queryDatabase(
      `SELECT * FROM personaldetails WHERE farmer_id = ?;`,
      [user_id]
    );

    // Check if farm details exist
    const farmDetails = await queryDatabase(
      `SELECT * FROM farmdetails WHERE farmer_id = ?;`,
      [user_id]
    );

    res.json({
      success: true,
      hasPersonalDetails: personalDetails.length > 0,
      hasFarmDetails: farmDetails.length > 0,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ success: false, message: "Error checking user details", error: err.message });
  }
});

app.get("/farmer/:farmer_id", async (req, res) => {
  try {
    const { farmer_id } = req.params;

    // Fetch farmer details
    const farmer = await queryDatabase(
      "SELECT farmer_id, CONCAT(first_name, ' ', last_name) AS farmer_name FROM farmerregistration WHERE farmer_id = ?", 
      [farmer_id]
    );
    
    if (!farmer || farmer.length === 0) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Fetch farmer products
    const products = await queryDatabase(
      "SELECT * FROM add_produce WHERE farmer_id = ?", 
      [farmer_id]
    );

    // Return data
    res.json({ ...farmer[0], products });
  } catch (error) {
    console.error("Error fetching farmer details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Endpoint to fetch farmer details
app.get('/api/farmer/details/:farmer_id', async (req, res) => {
  const farmerId = req.params.farmer_id;
  const query = 'SELECT * FROM farmerprofile WHERE farmer_id = ?';

  try {
    const results = await queryDatabase(query, [farmerId]);
    if (results.length === 0) {
      res.status(404).json({ error: 'Farmer not found' });
      return;
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching farmer details:', err);
    res.status(500).json({ error: 'Failed to fetch farmer details' });
  }
});
app.post("/api/login", async (req, res) => {
  const user = await findConsumer(req.body.email);
  if (user) {
    res.json({ 
      consumer_id: user.id, 
      name: user.name, 
      email: user.email 
    }); // ✅ Ensure `consumer_id` is sent
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.get("/api/products/:product_id", async (req, res) => {
  try {
    const { product_id } = req.params;
    console.log("Received Product ID:", product_id); 

    const product = await queryDatabase(
      `SELECT product_id, product_name, category, buy_type, price_1kg, price_2kg, price_5kg, image 
      FROM products WHERE product_id = ?`, 
      [product_id]
    );

    if (!product || product.length === 0) {
      console.log("Product not found in database");
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product[0]); 
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});
app.get('/api/farmers-ratings', async (req, res) => {
  try {
      const query = `
          SELECT farmer_id, 
                 COALESCE(AVG(rating), 0) AS average_rating
          FROM reviews 
          GROUP BY farmer_id;
      `;

      const ratings = await queryDatabase(query);

      console.log("Fetched Farmer Ratings:", ratings); // Debugging Log

      // Ensure ratings are returned as float numbers
      const formattedRatings = ratings.map(rating => ({
          farmer_id: rating.farmer_id,
          average_rating: parseFloat(rating.average_rating) // Convert to float
      }));

      res.json(formattedRatings);
  } catch (error) {
      console.error("Error fetching farmer ratings:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


app.get("/api/product/:product_id", async (req, res) => {
  try {
    const { product_id } = req.params;
    const [product] = await db.query("SELECT product_name, price_1kg, image FROM products WHERE product_id = ?", [product_id]);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/api/farmer-profile', async (req, res) => {
  try {
    const farmerId = 1; // Change this to dynamic ID as needed
    const result = await queryDatabase('SELECT * FROM farmerprofile WHERE farmer_id = $1', [farmerId]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// ✅ **Get Consumer Profile by consumer_id**
// ✅ Get Consumer Profile by consumer_id using queryDatabase
// ✅ Get Consumer Profile by consumer_id using queryDatabase
// GET Consumer Profile
app.get("/api/consumer/:id", async (req, res) => {
  try {
    const consumer_id = req.params.id;
    const query = `
      SELECT 
        c.consumer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS name,
        c.phone_number,
        c.email,
        COALESCE(p.address, 'Not Provided') AS address,
        COALESCE(p.pincode, 'Not Provided') AS pincode,
       
        COALESCE(p.preferred_payment_method, 'Not Provided') AS preferred_payment_method,
        COALESCE(p.subscription_method, 'Not Provided') AS subscription_method
      FROM consumerregistration c
      LEFT JOIN consumerprofile p ON c.consumer_id = p.consumer_id
      WHERE c.consumer_id = ?;
    `;
    const result = await queryDatabase(query, [consumer_id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // 🔹 Append full image URL if stored as file path
    const baseUrl = "http://localhost:5000";
result[0].photo = result[0].photo && !result[0].photo.startsWith("http")
  ? `${baseUrl}${result[0].photo}`
  : result[0].photo || `${baseUrl}/uploads/default.png`;  // ✅ Ensure a fallback image

    
    res.json(result[0]);
  } catch (err) {
    console.error("Error in API:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ PUT Consumer Profile (Update Consumer Details)
// app.put("/api/consumer/:id", async (req, res) => {
//   try {
//     const consumer_id = req.params.id;
//     const { address, pincode, location, photo, preferred_payment_method, subscription_method } = req.body;

//     // Check if the consumer exists in consumerprofile table
//     const checkQuery = "SELECT * FROM consumerprofile WHERE consumer_id = ?";
//     const checkResult = await queryDatabase(checkQuery, [consumer_id]);

//     if (checkResult.length === 0) {
//       // If the profile doesn't exist, insert a new row
//       const insertQuery = `
//         INSERT INTO consumerprofile (consumer_id, address, pincode, location, photo, preferred_payment_method, subscription_method)
//         VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
//       await queryDatabase(insertQuery, [consumer_id, address, pincode, location, photo, preferred_payment_method, subscription_method]);
//       return res.json({ message: "Profile created successfully!" });
//     }

//     // If the profile exists, update it
//     const updateQuery = `
//       UPDATE consumerprofile
//       SET address = ?, pincode = ?, location = ?, photo = ?, preferred_payment_method = ?, subscription_method = ?
//       WHERE consumer_id = ?`;

//     await queryDatabase(updateQuery, [address, pincode, location, photo, preferred_payment_method, subscription_method, consumer_id]);

//     res.json({ message: "Profile updated successfully!" });
//   } catch (err) {
//     console.error("Error updating profile:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });


// app.post("/api/addFarmer", async (req, res) => {
//   const { farmer_name, produce_name, availability, price_per_kg, produce_type, email } = req.body;
//   try {
//     const sql = "INSERT INTO farmers (farmer_name, produce_name, availability, price_per_kg, produce_type, email) VALUES (?, ?, ?, ?, ?, ?)";
//     const values = [farmer_name, produce_name, availability, price_per_kg, produce_type, email];
//     await db.query(sql, values);
//     res.status(201).json({ message: "Farmer added successfully!" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to insert farmer data" });
//   }
// });

// Serve static files in production (for React app)

// Get communities for a consumer
// Updated community check endpoint
app.get("/api/consumer-communities/:consumer_id", async (req, res) => {
  try {
    const { consumer_id } = req.params;
    
    // First verify consumer exists
    const consumerCheck = await queryDatabase(
      "SELECT consumer_id FROM consumerregistration WHERE consumer_id = ?", 
      [consumer_id]
    );
    
    if (consumerCheck.length === 0) {
      return res.status(404).json({ error: "Consumer not found" });
    }

    // Then get communities
    const query = `
      SELECT c.community_id, c.community_name 
      FROM communities c
      JOIN members m ON c.community_id = m.community_id
      WHERE m.consumer_id = ?;
    `;
    const results = await queryDatabase(query, [consumer_id]);
    
    if (results.length === 0) {
      return res.status(200).json([]); // Return empty array instead of error
    }
    
    res.json(results);
  } catch (error) {
    console.error("Error fetching consumer communities:", error);
    res.status(500).json({ error: "Failed to fetch communities" });
  }
});

// Add to community cart
// Updated community cart endpoint
// Updated community cart endpoint with better consumer verification
app.post("/api/community-cart", async (req, res) => {
  console.log("Received community cart request with body:", req.body);
  const { community_id, product_id, consumer_id, quantity, price } = req.body;
  
  // Validate all required fields
  if (!community_id || !product_id || !consumer_id || !quantity || !price) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    console.log(`Checking consumer with ID: ${consumer_id}`);
    
    // First verify the consumer exists
    const [consumer] = await queryDatabase(
      "SELECT consumer_id, CONCAT(first_name, ' ', last_name) AS name FROM consumerregistration WHERE consumer_id = ?",
      [consumer_id]
    );

    if (!consumer) {
      console.error(`Consumer not found with ID: ${consumer_id}`);
      return res.status(404).json({ 
        error: "Consumer not found",
        details: `No consumer found with ID: ${consumer_id}`,
        suggestion: "Please ensure you're logged in with a valid account"
      });
    }

    // Then verify the community exists
    const [community] = await queryDatabase(
      "SELECT community_id, community_name FROM communities WHERE community_id = ?",
      [community_id]
    );
    
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Get member info (including verification that consumer belongs to community)
    const [member] = await queryDatabase(
      `SELECT m.member_id, m.consumer_id, m.community_id
       FROM members m
       WHERE m.consumer_id = ? 
       AND m.community_id = ?`,
      [consumer_id, community_id]
    );
    
    if (!member) {
      return res.status(403).json({ 
        error: "Membership not found",
        details: `Consumer ${consumer.consumer_id} is not a member of community ${community_id}`
      });
    }

    // Insert the order
    const result = await queryDatabase(
      `INSERT INTO orders (community_id, product_id, quantity, price, member_id, payment_method)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [community_id, product_id, quantity, price, member.member_id]
    );
    
    res.json({ 
      success: true, 
      message: "Added to community cart",
      community_id: community.community_id,
      community_name: community.community_name,
      order_id: result.insertId
    });
  } catch (error) {
    console.error("Error adding to community cart:", error);
    res.status(500).json({ 
      error: "Failed to add to community cart",
      details: error.message 
    });
  }
});


// GET /api/consumers - Fetch consumers from the database
app.get('/consumers', async (req, res) => {
  try {
    const result = await queryDatabase('SELECT * FROM consumerprofile'); // Modify to match your query
    res.json(result); // Send the result as a JSON response
  } catch (error) {
    console.error('Error fetching consumers:', error);
    res.status(500).json({ error: 'Failed to fetch consumers' });
  }
});
// Fetch logged-in farmer details
app.get('/api/farmer-details/:farmer_id', async (req, res) => {
  try {
    const farmerId = req.params.farmer_id; // Extract farmer_id from URL

    if (!farmerId) {
      return res.status(400).json({ error: 'Farmer ID is required' });
    }

    // Fetch farmer details using farmer_id
    const query = `
      SELECT farmer_id, CONCAT(first_name, ' ', last_name) AS farmer_name
      FROM farmerregistration
      WHERE farmer_id = ?;
    `;
    
    const result = await queryDatabase(query, [farmerId]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching farmer details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// app.get("/reviews", async (req, res) => {
//   const farmerId = req.query.farmer_id;

//   if (!farmerId) {
//     return res.status(400).json({ error: "farmer_id is required" });
//   }

//   try {
//     const reviews = await queryDatabase(
//       `SELECT r.review_id, r.consumer_name, r.rating, r.comment, r.created_at,
//               JSON_ARRAYAGG(ri.image_url) AS image_urls
//        FROM reviews r
//        LEFT JOIN review_images ri ON r.review_id = ri.review_id
//        WHERE r.farmer_id = ?
//        GROUP BY r.review_id`,
//       [farmerId]
//     );

//     if (reviews.length === 0) {
//       return res.status(404).json({ error: "No reviews found" });
//     }

//     // Convert `null` to an empty array in case of no images
//     const formattedReviews = reviews.map(review => ({
//       ...review,
//       image_urls: review.image_urls[0] ? JSON.parse(review.image_urls) : []
//     }));

//     res.json(formattedReviews);
//   } catch (err) {
//     console.error("Error fetching reviews:", err);
//     res.status(500).json({ error: "Error fetching reviews" });
//   }
// });
// In your backend code (Node.js/Express)
app.get("/reviews/:farmer_id", async (req, res) => {
  const { farmer_id } = req.params;
  console.log("Fetching reviews for farmer:", farmer_id);
  
  // Validate farmer_id
  if (!farmer_id || farmer_id.trim() === "" || farmer_id === "0") {
    return res.status(400).json({ error: "Invalid Farmer ID" });
  }
  try {
    // 1. Verify the farmer_id is being received correctly
  
    // 2. Check the actual query being executed
    const reviewsQuery = `
      SELECT r.* 
      FROM reviews r
      WHERE CAST(r.farmer_id AS CHAR) = ?
      ORDER BY r.created_at DESC
    `;
    console.log("Executing query:", reviewsQuery.replace(/\s+/g, ' ').trim());
    console.log("With parameters:", [farmer_id]);

    const reviews = await queryDatabase(reviewsQuery, [farmer_id]);
    console.log("Database returned:", reviews);

    // 3. Verify image fetching
    const reviewsWithImages = await Promise.all(reviews.map(async (review) => {
      console.log(`Fetching images for review ${review.review_id}`);
      const imagesQuery = `SELECT image_url FROM review_images WHERE review_id = ?`;
      const images = await queryDatabase(imagesQuery, [review.review_id]);
      return {
        ...review,
        image_urls: images.map(img => img.image_url)
      };
    }));

    console.log("Final response data:", reviewsWithImages);
    res.json(reviewsWithImages);
  } catch (error) {
    console.error("Full error stack:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});  
// API to add a review with an image
app.post("/reviews", upload.array("images", 5), async (req, res) => {
  console.log("🛠️ Received review data:", req.body);
  const { farmer_id, consumer_name, rating, comment } = req.body;

  console.log("📌 Extracted Data:");
  console.log("Farmer ID:", farmer_id);
  console.log("Consumer Name:", consumer_name);
  console.log("Rating:", rating);
  console.log("Comment:", comment);

  if (!farmer_id || farmer_id === "0") {
    return res.status(400).json({ error: "Farmer ID is required" });
  }
  try {
    // Start transaction
    await queryDatabase("START TRANSACTION");

    // Insert review
    // Insert review
    const reviewSql = `
      INSERT INTO reviews (farmer_id, consumer_name, rating, comment)
      VALUES (?, ?, ?, ?)
    `;
    const reviewResult = await queryDatabase(reviewSql, [farmer_id, consumer_name, rating, comment]);

    console.log("✅ Inserted Review with farmer_id:", farmer_id);

    // Insert images
    if (req.files?.length > 0) {
      for (const file of req.files) {
        await queryDatabase(
          `INSERT INTO review_images (review_id, image_url) VALUES (?, ?)`,
          [reviewResult.insertId, `/uploads/${file.filename}`]
        );
      }
    }

    await queryDatabase("COMMIT");
    res.json({ success: true, reviewId: reviewResult.insertId });

  } catch (error) {
    await queryDatabase("ROLLBACK");
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to save review" });
  }
});
app.get("/consumerregistration/:consumer_id", async (req, res) => {
  const { consumer_id } = req.params;

  try {
    const consumer = await queryDatabase(
      "SELECT first_name, last_name FROM consumerregistration WHERE consumer_id = ?",
      [consumer_id]
    );

    if (consumer.length === 0) {
      return res.status(404).json({ error: "Consumer not found" });
    }

    res.json(consumer[0]);
  } catch (error) {
    console.error("Error fetching consumer:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add produce to add_produce table
app.post('/api/add-produce', async (req, res) => {
  try {
    const { farmer_id, farmer_name, produce_name, availability, price_per_kg, market_type } = req.body;

    await queryDatabase(
      'INSERT INTO add_produce (farmer_id, farmer_name, produce_name, availability, price_per_kg, market_type) VALUES (?, ?, ?, ?, ?, ?)',
      [farmer_id, farmer_name, produce_name, availability, price_per_kg, market_type]
    );

    res.json({ message: 'Produce added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add produce' });
  }
});


// 🌐 WebSocket Connection Handling
const onlineUsers = new Map();

// ✅ Authenticate socket connection
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) return next(new Error("Authentication error"));

//   try {
//     const user = jwt.verify(token, "your_secret_key");
//     socket.user = user;
//     next();
//   } catch (err) {
//     next(new Error("Authentication failed"));
//   }
// });


// Helper function to pick specific properties from an object
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});
}

// ✅ Single connection handler
// io.on("connection", (socket) => {
//   console.log(`📡 Socket connected: ${socket.id}`);

//   socket.on("bargainMessage", (data) => {
//     console.log("💬 Bargain Message Received:", data);
//     socket.broadcast.emit("bargainMessage", data);
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ Socket disconnected: ${socket.id}`);
//   });
// });


// POST route for creating the bargain
// app.post('/api/create-bargain', async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ error: 'Missing or invalid authorization header' });
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Only require initiator (not product_id or quantity here)
//     const { initiator } = req.body;
//     if (!initiator) {
//       return res.status(400).json({ error: 'Missing initiator' });
//     }

//     // You should pass farmer_id in body from frontend
//     const { farmer_id } = req.body;

//     if (!farmer_id) {
//       return res.status(400).json({ error: 'Missing farmer_id' });
//     }

//     // Step: Insert only into bargain_sessions
//     const bargainResult = await queryDatabase(
//       `INSERT INTO bargain_sessions 
//        (consumer_id, farmer_id, status, initiator)
//        VALUES (?, ?, ?, ?)`,
//       [
//         decoded.consumer_id,
//         farmer_id,
//         'pending',
//         initiator
//       ]
//     );

//     const bargain_id = bargainResult.insertId;

//     // Return just the bargain_id
//     res.status(201).json({
//       success: true,
//       bargainId: bargain_id,
//       message: "Bargain session created. Now submit product selection separately."
//     });

//   } catch (error) {
//     console.error('Bargain session creation error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.post('/api/create-bargain', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { initiator, farmer_id } = req.body;

    if (!initiator || !farmer_id) {
      return res.status(400).json({ error: 'Missing initiator or farmer_id' });
    }

    const result = await queryDatabase(
      `INSERT INTO bargain_sessions (consumer_id, farmer_id, status, initiator) VALUES (?, ?, ?, ?)`,
      [decoded.consumer_id, farmer_id, 'pending', initiator]
    );

    const newId = result?.insertId;

    if (!newId) {
      return res.status(500).json({ error: 'Failed to retrieve bargain session ID' });
    }

    res.status(200).json({ message: 'Bargain session created', bargainId: newId });


  } catch (err) {
    console.error("🔥 Error in create-bargain:", err);
    res.status(500).json({ error: 'Failed to create bargain session' });
  }
});



// GET route to check if the server is responding
app.get('/create-bargain', (req, res) => {
  res.status(200).json({ message: 'POST route is available, use POST to create bargain.' });
});


app.get('/api/bargain/:bargainId', async (req, res) => {
  const { bargainId } = req.params;

  try {
    const sessionQuery = `
      SELECT 
        bargain_id, consumer_id, farmer_id, status, initiator, created_at, updated_at
      FROM bargain_sessions
      WHERE bargain_id = ?
    `;

    const sessionResult = await queryDatabase(sessionQuery, [bargainId]);

    if (!sessionResult || sessionResult.length === 0) {
      return res.status(404).json({ success: false, error: 'Bargain session not found' });
    }

    const session = sessionResult[0];

    // Now fetch associated products
    const productsQuery = `
      SELECT 
        bsp.product_id,
        bsp.original_price,
        bsp.quantity,
        bsp.current_offer,
        ap.produce_name,
        ap.produce_type,
        ap.price_per_kg
      FROM bargain_session_products bsp
      LEFT JOIN add_produce ap ON bsp.product_id = ap.product_id
      WHERE bsp.bargain_id = ?
    `;

    const productResults = await queryDatabase(productsQuery, [bargainId]);

    const products = productResults.map(row => ({
      product_id: row.product_id,
      name: row.produce_name,
      type: row.produce_type,
      price_per_kg: row.price_per_kg,
      original_price: row.original_price,
      quantity: row.quantity,
      current_offer: row.current_offer
    }));

    res.json({
      success: true,
      bargain_id: session.bargain_id,
      consumer_id: session.consumer_id,
      farmer_id: session.farmer_id,
      status: session.status,
      initiator: session.initiator,
      created_at: session.created_at,
      updated_at: session.updated_at,
      products
    });

  } catch (error) {
    console.error('❌ Error fetching bargain session:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching bargain data' });
  }
});


// routes/bargain.js or wherever you define your routes

app.post('/api/add-bargain-product', verifyToken, async (req, res) => {
  const { bargain_id, product_id, quantity } = req.body;

  if (!bargain_id || !product_id || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [product] = await queryDatabase('SELECT price_per_kg FROM add_produce WHERE product_id = ?', [product_id]);

    if (!product) {
      return res.status(400).json({ error: "Invalid product_id. Product not found." });
    }

    const original_price = product.price_per_kg;
    const current_offer = quantity * original_price;

    await queryDatabase(
      `INSERT INTO bargain_session_products (bargain_id, product_id, original_price, quantity, current_offer) 
       VALUES (?, ?, ?, ?, ?)`,
      [bargain_id, product_id, original_price, quantity, current_offer]
    );

    res.json({ message: "Product added to bargain session." });
  } catch (error) {
    console.error("Error inserting into bargain_session_products:", error);
    res.status(500).json({ error: "Server error" });
  }
});
app.get('/api/bargain/fetch-session-data', async (req, res) => {
  const bargainId = req.query.id;
  try {
    const sessionData = await queryDatabase('SELECT * FROM bargain_sessions WHERE bargain_id = ?', [bargainId]);

    if (sessionData.length === 0) {
      return res.status(404).json({ message: 'No session found' });
    }

    res.json(sessionData[0]); // ✅ This must return JSON
  } catch (err) {
    console.error('Error fetching session data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// Import necessary controllers for handling bargain messages and price updates
const { getMessages, sendMessage, updatePrice } = require('./src/controllers/bargainController'); // Assuming these controllers are defined

// Fetch all messages for a specific bargain session
app.get("/api/bargain/:bargainId/messages", async (req, res) => {
  try {
    const bargainId = req.params.bargainId; // Use the correct param name `bargainId`
    const messages = await getMessages(bargainId);  // Ensure this function exists and is correctly imported
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
})

// Send a new message in the bargain session
app.post('/api/bargain/:bargainId/messages', async (req, res) => {
  const { bargainId } = req.params;
  const { content, senderType, price } = req.body; // Expecting content, senderType, and price in the body
  
  if (!content || !senderType) {
    return res.status(400).json({ error: "Message content and sender type are required" });
  }
  
  try {
    // Assuming sendMessage handles inserting the new message into the database
    const message = await sendMessage(bargainId, content, senderType, price);
    res.json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Unable to send message" });
  }
});

// Update the price for the bargain session
app.post('/api/bargain/:bargainId/price', async (req, res) => {
  const { bargainId } = req.params;
  const { newPrice } = req.body; // Expecting newPrice in the body
  
  if (newPrice == null || isNaN(newPrice)) {
    return res.status(400).json({ error: "Valid price is required" });
  }

  try {
    // Assuming updatePrice handles updating the price for the given bargainId
    const updatedPrice = await updatePrice(bargainId, newPrice);
    res.json({ newPrice: updatedPrice });
  } catch (error) {
    console.error("Error updating price:", error);
    res.status(500).json({ error: "Unable to update price" });
  }
});


// Example backend API for fetching bargain sessions
// In your backend API route (server.js)
// Updated backend route
// Updated route handler
// Middleware to force JSON responses
app.get('/api/bargain/farmers/:farmerId/sessions', authenticate, farmerOnly, async (req, res) => {
  try {
    const farmerId = req.params.farmerId;

    // ✅ Format validation (example: KRST01FR001)
    if (!/^[A-Z0-9]{8,12}$/.test(farmerId)) {
      return res.status(400).json({ error: "Invalid farmer ID format" });
    }

    const sessions = await queryDatabase(
      `SELECT * FROM bargain_sessions 
       WHERE farmer_id = ?
       ORDER BY created_at DESC`,
      [farmerId]
    );

    res.status(200).json(sessions.rows);

  } catch (err) {
    console.error("💥 DB Error:", err);
    res.status(500).json({ error: "Database operation failed" });
  }
});



// Handle unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Handle unexpected server errors
app.use((err, req, res, next) => {
  console.error("💥 Express error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});


if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));  // Adjust path based on your project setup
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
// setupSockets(httpServer);
// setupSockets(io);
// ✅ Start Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`
    🚀 Server running on port ${PORT}
    Socket.IO available at ws://localhost:${PORT}
    
    🧪 To test:
    1. Use a Socket.IO client (e.g., from frontend)
    2. Ensure token is passed via 'auth' during socket connection:
       socket = io("http://localhost:5000", {
         auth: { token: "YOUR_JWT_TOKEN" }
       });
    `);
    
});