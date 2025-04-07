require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { queryDatabase } = require('./src/config/db');
// const http = require("http");
// const socketIo = require("socket.io");
const path = require("path");
// const { authenticateToken } = require("./src/middlewares/authMiddleware");
// const { initiateBargain } = require("./src/controllers/bargainController"); // Correct file
const router = express.Router();
// const express = require('express');

// const FarmerModel = require('./src/models/farmerModels');  // ✅ Ensure this path is correct
// const pool = require('./src/config/db');  // Ensure this line is present
const multer = require("multer");
const orderRoutes = require("./src/routes/orderRoutes");
const farmerRoutes = require("./src/routes/farmerRoutes");
const http = require('http');
const setupSockets = require('./socket');
// const db = require(".src/config/db");
const communityRoutes = require("./src/routes/communityRoutes");
const memberRoutes = require("./src/routes/memberRoutes");
const orderRoutesC = require("./src/routes/orderRoutesC");

//bargainroutes
const bargainRoutes = require("./src/routes/bargainRoutes");
const reviewsRoutes = require('./src/routes/reviews');


// At the top of server.js with your other requires
const auth = require('./src/middlewares/authMiddleware'); // Adjust path as needed


const fs = require("fs");
const app = express();
const { Server } = require("socket.io");
// const server = http.createServer(app);
// Attach WebSocket to Express server
const server = require('http').createServer();
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// ✅ WebSocket Setup
const io = new Server(server, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"]
  }
});
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // ✅ Join Bargaining Room
  socket.on("joinRoom", (room_id) => {
      socket.join(room_id);
      console.log(`User joined room: ${room_id}`);
  });

  // ✅ Handle Sending Bargain Messages
  socket.on("sendBargainMessage", async ({ room_id, sender_id, message_type, message_text, price_offer }) => {
      try {
          await queryDatabase(
              "INSERT INTO bargain_messages (room_id, sender_id, message_type, message_text, price_offer) VALUES (?, ?, ?, ?, ?)",
              [room_id, sender_id, message_type, message_text, price_offer]
          );

          // ✅ Broadcast to the room
          io.to(room_id).emit("receiveBargainMessage", { sender_id, message_type, message_text, price_offer });

      } catch (error) {
          console.error("Error inserting message:", error);
      }
  });

  // ✅ Handle Bargain Finalization
  socket.on("finalizeBargain", async ({ room_id, final_price, quantity }) => {
      try {
          await queryDatabase(
              "INSERT INTO bargain_finalized (room_id, final_price, quantity) VALUES (?, ?, ?)",
              [room_id, final_price, quantity]
          );

          // ✅ Notify all users in the room
          io.to(room_id).emit("bargainFinalized", { final_price, quantity });

      } catch (error) {
          console.error("Error finalizing bargain:", error);
      }
  });

  socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
  });
});


const mysql = require("mysql");

// const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY;
// const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN;
// const REDIRECT_URL = "http://localhost:3000/payment-success";


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
const session = require("express-session"); 
// ✅ Session Middleware (Add This Before Routes)
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret", // Store in .env
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));
app.use('/api/reviews', reviewsRoutes);
app.use((req, res, next) => {
  console.log("Session Data:", req.session);
  next();
});
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



// Configure file storage for profile photos
const profilePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.params.farmer_id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const profilePhotoUpload = multer({ 
  storage: profilePhotoStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});
// Configure file storage for documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + req.params.farmer_id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const documentUpload = multer({ storage: documentStorage });
// Add this near your other middleware
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("uploads"));
app.use("/api", farmerRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
app.use((req, res, next) => {
  console.log("Session Middleware - Current Session:", req.session);
  next();
});
app.use(cors({
  origin: "http://localhost:3000",  // Allow requests from React frontend
 methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"],  // Allow these headers
  credentials: true  // ✅ Important if you're using cookies or authentication
}));

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle OPTIONS requests
app.options('*', cors(corsOptions)); // Enable preflight for all routes
// ✅ Middleware setup
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); 
app.use('/api/bargain', require('./src/routes/bargainRoutes'));
// Debugging Middleware for Logging Headers
app.use((req, res, next) => {
  console.log('Request Headers:', req.headers);
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


///this is before place order
// app.post("/api/place-order", async (req, res) => {
//   const { consumer_id, name, mobile_number, email, address, pincode, produce_name, quantity, amount } = req.body;
//   try {
//     const query = `
//       INSERT INTO orders (consumer_id, name, mobile_number, email, address, pincode, produce_name, quantity, amount, status, payment_status)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pending')
//     `;
//     await queryDatabase(query, [consumer_id, name, mobile_number, email, address, pincode, produce_name, quantity, amount]);
//     res.json({ success: true, message: "Order placed successfully" });
//   } catch (error) {
//     console.error("Error placing order:", error);
//     res.status(500).json({ error: "Failed to place order" });
//   }
// });
// Add this endpoint to fetch consumer profile
// Add this endpoint to fetch consumer profile
app.get("/api/consumerprofile/:consumer_id", async (req, res) => {
  try {
    const { consumer_id } = req.params;
    const query = `
      SELECT 
        consumer_id, 
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

// Add this endpoint to update consumer profile address
app.put("/api/consumerprofile/:consumer_id", async (req, res) => {
  try {
    const { consumer_id } = req.params;
    const { address, pincode, location } = req.body;

    const query = `
      UPDATE consumerprofile 
      SET address = ?, pincode = ?, location = ?
      WHERE consumer_id = ?`;
    
    await queryDatabase(query, [address, pincode, location, consumer_id]);
    
    res.json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    console.error('Error updating consumer profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Add this endpoint to fetch consumer profile
app.get("/api/consumerprofile/:consumer_id", async (req, res) => {
  try {
    const { consumer_id } = req.params;
    const query = `
      SELECT 
        consumer_id, 
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
// Update the place-order endpoint
app.post("/api/place-order", async (req, res) => {
  const { 
    consumer_id,
    name,
    mobile_number,
    email,
    produce_name,
    quantity,
    amount,
    is_self_delivery,
    recipient_name,
    recipient_phone,
    address,
    payment_method
  } = req.body;

  console.log("Received payment method:", payment_method); // Debug log

  try {
    const query = `
      INSERT INTO placeorder (
        consumer_id, 
        name, 
        mobile_number, 
        email, 
        produce_name, 
        quantity, 
        amount,
        status,
        payment_status,
        payment_method,
        is_self_delivery,
        recipient_name,
        recipient_phone,
        address
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pending', ?, ?, ?, ?, ?)
    `;
    
    const values = [
      consumer_id,
      is_self_delivery ? name : recipient_name,
      is_self_delivery ? mobile_number : recipient_phone,
      email,
      produce_name,
      quantity,
      amount,
      payment_method, // This should be the 10th parameter
      is_self_delivery,
      recipient_name || null,
      recipient_phone || null,
      address
    ];
    const result = await queryDatabase(query, values);

    // Get the inserted order with its auto-generated ID
    const [order] = await queryDatabase(
      "SELECT * FROM placeorder WHERE order_id = ?",
      [result.insertId]
    );
    

    res.json({ 
      success: true, 
      message: "Order placed successfully",
      order_id: order.order_id 
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});


// Save address to placeorder table (before order is placed)
// Add this endpoint to save address
// Add these endpoints to your server.js

// Endpoint to save address
app.post("/api/save-address", async (req, res) => {
  try {
    const { 
      consumer_id, 
      name, 
      mobile_number, 
      email, 
      street, 
      city, 
      state, 
      landmark, 
      pincode 
    } = req.body;

    // Validate required fields
    const requiredFields = ['consumer_id', 'street', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: "Missing required fields",
        missingFields,
        details: `Please provide: ${missingFields.join(', ')}`
      });
    }

    // Construct full address string
    const fullAddress = [street, landmark, city, state]
      .filter(Boolean) // Remove empty parts
      .join(', ');

    // Update consumer profile
    await queryDatabase(
      "UPDATE consumerprofile SET address = ?, pincode = ? WHERE consumer_id = ?",
      [fullAddress, pincode, consumer_id]
    );

    // Save to placeorder table
    const [existing] = await queryDatabase(
      "SELECT order_id FROM placeorder WHERE consumer_id = ? AND status = 'Draft' LIMIT 1",
      [consumer_id]
    );

    if (existing) {
      await queryDatabase(
        "UPDATE placeorder SET address = ?, pincode = ?, name = ?, mobile_number = ?, email = ? WHERE order_id = ?",
        [fullAddress, pincode, name, mobile_number, email, existing.order_id]
      );
    } else {
      await queryDatabase(
        "INSERT INTO placeorder (consumer_id, name, mobile_number, email, address, pincode, status) VALUES (?, ?, ?, ?, ?, ?, 'Draft')",
        [consumer_id, name, mobile_number, email, fullAddress, pincode]
      );
    }

    res.json({ 
      success: true, 
      message: "Address saved successfully",
      address: fullAddress,
      pincode: pincode
    });
  } catch (error) {
    console.error("Error saving address:", error);
    res.status(500).json({ 
      error: "Failed to save address",
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        sqlMessage: error.sqlMessage
      } : undefined
    });
  }
});


// Update existing address (won't create new records)
// Update address endpoint
// PUT endpoint for updating address - place this with your other API routes
app.put("/api/update-address", async (req, res) => {
  console.log("PUT /api/update-address hit"); // Debug log
  try {
    const { consumer_id, street, city, state, pincode } = req.body;
    
    if (!consumer_id || !street || !city || !state || !pincode) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ['consumer_id', 'street', 'city', 'state', 'pincode']
      });
    }

    const fullAddress = `${street}, ${city}, ${state} ${pincode}`;
    
    // Update consumer profile
    await queryDatabase(
      `UPDATE consumerprofile 
       SET address = ?, pincode = ?
       WHERE consumer_id = ?`,
      [fullAddress, pincode, consumer_id]
    );

    res.json({ 
      success: true,
      address: fullAddress,
      pincode: pincode
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update address" });
  }
});


// Add this temporary test route in your server.js
// Add these test endpoints in your server.js file





// Endpoint to get saved address
app.get("/api/saved-address/:consumer_id", async (req, res) => {
  try {
    const { consumer_id } = req.params;
    const [result] = await queryDatabase(
      "SELECT address FROM placeorder WHERE consumer_id = ? AND status = 'Draft' ORDER BY created_at DESC LIMIT 1",
      [consumer_id]
    );

    res.json({ 
      success: true,
      address: result?.address || null 
    });
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({ error: "Failed to fetch address" });
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
app.get("/api/bargain/:bargain_id", async (req, res) => {
  try {
    console.log("🔍 Incoming Headers:", req.headers);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error("❌ No Authorization header!");
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔍 Extracted Token:", token);

    if (!token) {
      console.error("❌ Token is missing in Authorization header!");
      return res.status(401).json({ error: "Authorization token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token Decoded:", decoded);

    const { bargain_id } = req.params;
    console.log("🔍 Checking bargain session for ID:", bargain_id);

    const session = await queryDatabase(
      "SELECT * FROM bargain_sessions WHERE bargain_id = ?",
      [bargain_id]
    );

    if (session.length === 0) {
      console.error("❌ Session not found in DB!");
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ success: true, session: session[0] });

  } catch (error) {
    console.error("🔥 Auth Error:", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
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

// ✅ Middleware: Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
// ✅ Real-Time Chat using Socket.io
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    io.to(room).emit("message", { username: "Chat Bot", text: `${username} has joined the chat!` });
  });

  socket.on("chatMessage", ({ room, username, message }) => {
    io.to(room).emit("message", { username, text: message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
// ✅ API to Fetch Products
app.get("/api/products", async (req, res) => {
  try {
    const products = await queryDatabase("SELECT * FROM products");
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching products", error: err.message });
  }
});

const saltRounds = 10;
app.post("/api/farmerregister", async (req, res) => {
  const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;

  // Validation
  if (!first_name || !last_name || !email || !phone_number || !password || !confirm_password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  // Phone validation
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
  }

  try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert farmer details
      const result = await queryDatabase(
          `INSERT INTO farmerregistration 
           (first_name, last_name, email, phone_number, password, confirm_password) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [first_name, last_name, email, phone_number, hashedPassword, hashedPassword]
      );

      if (result.affectedRows === 0) {
          return res.status(500).json({ success: false, message: "Registration failed" });
      }

      // Get the generated farmer_id
      const farmerData = await queryDatabase(
          `SELECT farmer_id FROM farmerregistration WHERE email = ?`, 
          [email]
      );

      if (farmerData.length === 0) {
          return res.status(500).json({ success: false, message: "Farmer ID retrieval failed" });
      }

      const farmer_id = farmerData[0].farmer_id;

      return res.json({ 
          success: true, 
          message: "Farmer registered successfully", 
          farmer_id 
      });

  } catch (err) {
      // Handle duplicate entry
      if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
              success: false, 
              message: "Email or phone number already registered" 
          });
      }
      
      console.error("Registration error:", err);
      return res.status(500).json({ 
          success: false, 
          message: "Internal server error",
          error: err.message 
      });
  }
});
//farmerlogin

app.post("/api/farmerlogin", async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    // 1. Find the farmer by email or phone
    const results = await queryDatabase(
      "SELECT farmer_id, first_name, last_name, email, phone_number, password FROM farmerregistration WHERE email = ? OR phone_number = ?",
      [emailOrPhone, emailOrPhone]
    );

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = results[0];

    // 2. Compare hashed password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      {
        farmer_id: user.farmer_id,
        userType: "farmer",
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 4. Send successful response
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
    console.error("Farmer Login Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: err.message 
    });
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


// app.post("/api/consumerregister", async (req, res) => {
//     console.log("Consumer Registration API Called ✅");  // Debugging

//     const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;

//     // ✅ Check for missing fields
//     if (!first_name || !last_name || !email || !phone_number || !password || !confirm_password) {
//         return res.status(400).json({ success: false, message: "All fields are required" });
//     }

//     // ✅ Check if passwords match
//     if (password !== confirm_password) {
//         return res.status(400).json({ success: false, message: "Passwords do not match" });
//     }

//     try {
//         // ✅ Hash the password before storing
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // ✅ Insert into database (store only hashed password)
//         const result = await queryDatabase(
//             `INSERT INTO consumerregistration (first_name, last_name, email, phone_number, password) 
//              VALUES (?, ?, ?, ?, ?);`,
//             [first_name, last_name, email, phone_number, hashedPassword]
//         );

//         if (result.affectedRows === 0) {
//             return res.status(500).json({ success: false, message: "Registration failed" });
//         }

//         // ✅ Fetch the correct consumer_id
//         const consumerData = await queryDatabase(
//             `SELECT consumer_id FROM consumerregistration WHERE email = ?`, 
//             [email]
//         );

//         if (consumerData.length === 0) {
//             return res.status(500).json({ success: false, message: "Consumer ID retrieval failed" });
//         }

//         const consumer_id = consumerData[0].consumer_id;

//         res.json({ success: true, message: "Consumer registered successfully", consumer_id });

//     } catch (err) {
//         console.error("❌ Registration Error:", err);
//         res.status(500).json({ success: false, message: "Database error", error: err.message });
//     }
// });
app.post("/api/consumerregister", async (req, res) => {
  const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;

  // Basic validation
  if (!first_name || !email || !phone_number || !password) {
      return res.status(400).json({ 
          success: false, 
          message: "First name, email, phone number and password are required" 
      });
  }

  if (password !== confirm_password) {
      return res.status(400).json({ 
          success: false, 
          message: "Password and confirmation do not match" 
      });
  }

  try {
      // Start transaction
      await queryDatabase("START TRANSACTION");

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into consumerregistration (trigger will generate ID)
      const result = await queryDatabase(
          `INSERT INTO consumerregistration 
           (first_name, last_name, email, phone_number, password, confirm_password) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [first_name, last_name || '', email, phone_number, hashedPassword, hashedPassword]
      );

      // Get the newly created consumer with all details
      const [consumer] = await queryDatabase(
          `SELECT * FROM consumerregistration WHERE email = ?`,
          [email]
      );

      // Verify the profile was created
      const [profile] = await queryDatabase(
          `SELECT * FROM consumerprofile WHERE consumer_id = ?`,
          [consumer.consumer_id]
      );

      if (!profile) {
          throw new Error("Profile creation failed");
      }

      // Commit transaction
      await queryDatabase("COMMIT");

      return res.json({
          success: true,
          message: "Registration successful",
          consumer_id: consumer.consumer_id,
          profile_created: true
      });

  } catch (err) {
      await queryDatabase("ROLLBACK");
      
      console.error("Registration error:", err);
      
      // Handle duplicate email/phone
      if (err.code === 'ER_DUP_ENTRY') {
          if (err.sqlMessage.includes('email')) {
              return res.status(400).json({ 
                  success: false, 
                  message: "Email already registered" 
              });
          }
          if (err.sqlMessage.includes('phone_number')) {
              return res.status(400).json({ 
                  success: false, 
                  message: "Phone number already registered" 
              });
          }
      }
      
      return res.status(500).json({ 
          success: false, 
          message: "Registration failed",
          error: err.message 
      });
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
        `INSERT INTO farmdetails (farm_name, location, land_size, farming_type, soil_type, irrigation_method, types_of_crops, farm_equipment, LandOwnerShipProof, photoofFarm, LandLeaseProof, certifications) 
         VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [ farm_name, location, land_size, farming_type, soil_type, irrigation_method, types_of_crops, farm_equipment, LandOwnerShipProof, photoofFarm, LandLeaseProof, certifications]
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
// Add these new routes to your server.js file

// Get Farmer Basic Info
// Farmer Profile Routes
app.get("/api/farmer/:farmer_id/basic", async (req, res) => {
  try {
    const { farmer_id } = req.params;
    const result = await queryDatabase(
      "SELECT farmer_id, CONCAT(first_name, ' ', last_name) as name, email, phone_number as contact_no FROM farmerregistration WHERE farmer_id = ?",
      [farmer_id]
    );

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }

    res.json({ success: true, ...result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching farmer details", error: err.message });
  }
});

// 🟢 Get Farmer Personal Details
app.get("/api/farmer/:farmer_id/personal-details", async (req, res) => {
  try {
    const { farmer_id } = req.params;
    const result = await queryDatabase("SELECT * FROM personaldetails WHERE farmer_id = ?", [farmer_id]);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Personal details not found" });
    }

    res.json({ success: true, ...result[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching personal details", error: err.message });
  }
});

// 🟢 Update Farmer Personal Details
// In server.js, add these update endpoints:

app.put("/api/farmer/:farmer_id/personal-details", async (req, res) => {
  try {
    const { farmer_id } = req.params;
    const {
      dob, gender, contact_no, aadhaar_no, residential_address,
      bank_account_no, ifsc_code, upi_id
    } = req.body;

    const result = await queryDatabase(
      `UPDATE personaldetails SET 
        dob = ?, gender = ?, contact_no = ?, aadhaar_no = ?, 
        residential_address = ?, bank_account_no = ?, ifsc_code = ?, upi_id = ?
      WHERE farmer_id = ?`,
      [dob, gender, contact_no, aadhaar_no, residential_address, 
       bank_account_no, ifsc_code, upi_id, farmer_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Personal details not found or not updated" });
    }

    res.json({ success: true, message: "Personal details updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating personal details", error: err.message });
  }
});

app.put("/api/farmer/:farmer_id/farm-details", async (req, res) => {
  try {
    const { farmer_id } = req.params;
    const {
      farm_address, farm_size, crops_grown, farming_method, soil_type,
      water_sources, farm_equipment
    } = req.body;

    const result = await queryDatabase(
      `UPDATE farmdetails SET 
        farm_address = ?, farm_size = ?, crops_grown = ?, farming_method = ?, 
        soil_type = ?, water_sources = ?, farm_equipment = ?
      WHERE farmer_id = ?`,
      [farm_address, farm_size, crops_grown, farming_method, 
       soil_type, water_sources, farm_equipment, farmer_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Farm details not found or not updated" });
    }

    res.json({ success: true, message: "Farm details updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating farm details", error: err.message });
  }
});
// 🟢 Update Farmer Farm Details
app.put("/api/farmer/:farmer_id/farm-details", async (req, res) => {
  try {
    const { farmer_id } = req.params;
    const {
      farm_address, farm_size, crops_grown, farming_method, soil_type,
      water_sources, farm_equipment
    } = req.body;

    const result = await queryDatabase(
      `UPDATE farmdetails SET 
        farm_address = ?, farm_size = ?, crops_grown = ?, farming_method = ?, 
        soil_type = ?, water_sources = ?, farm_equipment = ?
      WHERE farmer_id = ?`,
      [farm_address, farm_size, crops_grown, farming_method, 
       soil_type, water_sources, farm_equipment, farmer_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Farm details not found or not updated" });
    }

    res.json({ success: true, message: "Farm details updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating farm details", error: err.message });
  }
});

// 🟢 Get Farmer Profile Photo
app.get("/api/farmer/:farmer_id/profile-photo", async (req, res) => {
  try {
    const { farmer_id } = req.params;
    
    // First check if farmer exists
    const farmerExists = await queryDatabase(
      "SELECT 1 FROM farmerregistration WHERE farmer_id = ?", 
      [farmer_id]
    );
    
    if (!farmerExists.length) {
      return res.status(404).json({ 
        success: false, 
        message: "Farmer not found" 
      });
    }

    // Then get photo
    const result = await queryDatabase(
      "SELECT profile_photo FROM personaldetails WHERE farmer_id = ?", 
      [farmer_id]
    );

    if (!result.length || !result[0].profile_photo) {
      return res.status(404).json({ 
        success: false, 
        message: "Profile photo not found" 
      });
    }

    res.json({ 
      success: true, 
      photo: result[0].profile_photo 
    });
    
  } catch (err) {
    console.error("Error fetching profile photo:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching photo",
      error: err.message 
    });
  }
});

// 🟢 Upload Farmer Profile Photo
app.post("/api/farmer/:farmer_id/upload-photo", upload.single("photo"), async (req, res) => {
  try {
    const { farmer_id } = req.params;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await queryDatabase(
      "UPDATE personaldetails SET profile_photo = ? WHERE farmer_id = ?",
      [photoUrl, farmer_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }

    res.json({ success: true, photo: photoUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error uploading photo", error: err.message });
  }
});

// 🟢 Remove Farmer Profile Photo
app.delete("/api/farmer/:farmer_id/remove-photo", async (req, res) => {
  try {
    const { farmer_id } = req.params;

    const result = await queryDatabase(
      "UPDATE personaldetails SET profile_photo = NULL WHERE farmer_id = ?",
      [farmer_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }

    res.json({ success: true, message: "Profile photo removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error removing photo", error: err.message });
  }
});

// 🟢 Upload File (for farm documents)
app.post("/api/farmer/:farmer_id/upload-file", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    res.json({ success: true, fileUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error uploading file", error: err.message });
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
// Get farmer orders from orderall table
// app.get("/api/farmer/orders/:farmer_id", async (req, res) => {
//   const { farmer_id } = req.params;
  
//   try {
//     // First check if the farmer exists
//     const farmerCheck = await queryDatabase(
//       "SELECT farmer_id FROM farmerregistration WHERE farmer_id = ?",
//       [farmer_id]
//     );
    
//     if (farmerCheck.length === 0) {
//       return res.status(404).json({ error: "Farmer not found" });
//     }

//     // Get orders from orderall table
//     const orders = await queryDatabase(
//       `SELECT 
//         orderid,
//         order_date,
//         produce_name,
//         quantity,
//         amount,
//         status,
//         payment_status,
//         farmer_name
//        FROM orderall 
//        WHERE farmer_id = ?
//        ORDER BY order_date DESC`,
//       [farmer_id]
//     );

//     res.json(orders);
//   } catch (error) {
//     console.error("Error fetching farmer orders:", error);
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

// In your server.js
app.get("/api/farmer/orders/:farmer_id", async (req, res) => {
  const { farmer_id } = req.params;
  
  if (!farmer_id) {
    return res.status(400).json({ error: "Farmer ID is required" });
  }

  try {
    // Verify farmer exists
    const farmerExists = await queryDatabase(
      "SELECT farmer_id FROM farmerregistration WHERE farmer_id = ?",
      [farmer_id]
    );
    
    if (farmerExists.length === 0) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    const orders = await queryDatabase(
      `SELECT * FROM orderall 
       WHERE farmer_id = ? 
       ORDER BY order_date DESC`,
      [farmer_id]
    );
    
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Get logged-in farmer details
// app.get('/api/farmer', async (req, res) => {
//   try {
//     // Get farmer ID from session or JWT token
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const farmerId = decoded.farmer_id;

//     const query = `
//       SELECT farmer_id, CONCAT(first_name, ' ', last_name) AS farmer_name, email 
//       FROM farmerregistration 
//       WHERE farmer_id = ?
//     `;
//     const result = await queryDatabase(query, [farmerId]);
    
//     if (result.length === 0) {
//       return res.status(404).json({ error: 'Farmer not found' });
//     }

//     res.json(result[0]);
//   } catch (error) {
//     console.error('Error fetching farmer details:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// CRUD endpoints for produces
app.get('/api/produces', async (req, res) => {
  const { farmer_id, market_type } = req.query;
  
  try {
    const query = `
      SELECT * FROM add_produce 
      WHERE farmer_id = ? AND market_type = ?
      ORDER BY produce_name
    `;
    const results = await queryDatabase(query, [farmer_id, market_type]);
    res.json(results);
  } catch (error) {
    console.error('Error fetching produces:', error);
    res.status(500).json({ error: 'Failed to fetch produces' });
  }
});

app.post('/api/produces', async (req, res) => {
  const { farmer_id, farmer_name, produce_name, availability, price_per_kg, produce_type, market_type } = req.body;
  
  try {
    // First get the farmer's email
    const farmerQuery = 'SELECT email FROM farmerregistration WHERE farmer_id = ?';
    const [farmer] = await queryDatabase(farmerQuery, [farmer_id]);
    
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    const query = `
      INSERT INTO add_produce 
      (farmer_id, farmer_name, produce_name, availability, price_per_kg, produce_type, market_type, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await queryDatabase(query, [
      farmer_id, 
      farmer_name, 
      produce_name, 
      availability, 
      price_per_kg, 
      produce_type, 
      market_type, 
      farmer.email  // Use actual email from database
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding produce:', error);
    res.status(500).json({ error: 'Failed to add produce' });
  }
});

// Add the PUT and DELETE endpoints as previously shown
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
    const farmerId = req.params.farmerId || 'KRST01FR001'; // Default to a sample farmer ID if not provided
    const result = await queryDatabase('SELECT * FROM farmerprofile WHERE farmer_id = ?', [farmerId]);

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
        COALESCE(p.location, 'Not Provided') AS location,
        COALESCE(NULLIF(p.photo, ''), '/uploads/default.png') AS photo,  -- ✅ Ensure photo is not empty
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

// Get produces for a farmer and market type
app.get("/api/produces", async (req, res) => {
  const { farmer_id, market_type } = req.query;
  
  try {
    const query = `
      SELECT * FROM add_produce 
      WHERE farmer_id = ? AND market_type = ?
      ORDER BY produce_name
    `;
    const results = await queryDatabase(query, [farmer_id, market_type]);
    res.json(results);
  } catch (error) {
    console.error("Error fetching produces:", error);
    res.status(500).json({ error: "Failed to fetch produces" });
  }
});

// Add new produce
app.post("/api/produces", async (req, res) => {
  const { farmer_id, farmer_name, produce_name, availability, price_per_kg, produce_type, market_type, email } = req.body;
  
  try {
    const query = `
      INSERT INTO add_produce 
      (farmer_id, farmer_name, produce_name, availability, price_per_kg, produce_type, market_type, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await queryDatabase(query, [
      farmer_id, farmer_name, produce_name, availability, price_per_kg, produce_type, market_type, email
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error adding produce:", error);
    res.status(500).json({ error: "Failed to add produce" });
  }
});

// Update produce
app.put("/api/produces/:product_id", async (req, res) => {
  const { product_id } = req.params;
  const { produce_name, availability, price_per_kg, produce_type } = req.body;
  
  try {
    const query = `
      UPDATE add_produce 
      SET produce_name = ?, availability = ?, price_per_kg = ?, produce_type = ?
      WHERE product_id = ?
    `;
    await queryDatabase(query, [produce_name, availability, price_per_kg, produce_type, product_id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating produce:", error);
    res.status(500).json({ error: "Failed to update produce" });
  }
});

// Delete produce
app.delete("/api/produces/:product_id", async (req, res) => {
  const { product_id } = req.params;
  
  try {
    const query = "DELETE FROM add_produce WHERE product_id = ?";
    await queryDatabase(query, [product_id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting produce:", error);
    res.status(500).json({ error: "Failed to delete produce" });
  }
});


//bargain routes 
const WebSocket = require('ws');

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, request) => {
    const params = new URLSearchParams(request.url.split('?')[1]);
    const token = params.get('token');

    if (!token) {
        ws.close(4001, 'Token required');
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ws.user = decoded;
    } catch (error) {
        ws.close(4002, 'Invalid token');
        return;
    }

    console.log(`✅ WebSocket connected for user ${ws.user.id}`);

    ws.on('message', (message) => {
        console.log('Received:', message);
        ws.send(JSON.stringify({ text: 'Message received', timestamp: Date.now() }));
    });

    ws.on('close', () => {
        console.log(`🔌 WebSocket disconnected for user ${ws.user.id}`);
    });
});


// POST /api/bargain/initiate
// app.post('/initiate', verifyToken, async (req, res) => {
//   try {
//     const { farmer_id, product_id, quantity, initial_price } = req.body;
    
//     // 1. Verify consumer exists
//     const consumer = await Consumer.findById(req.user.consumer_id);
//     if (!consumer) throw new Error("Invalid consumer");

//     // 2. Create bargain session
//     const session = new BargainSession({
//       consumer_id: req.user.consumer_id,
//       farmer_id,
//       product_id,
//       quantity,
//       current_price: initial_price,
//       status: "pending"
//     });

//     await session.save();

//     // 3. Notify farmer via WebSocket
//     notifyFarmer(farmer_id, {
//       type: "NEW_BARGAIN_REQUEST",
//       session_id: session._id,
//       product_id,
//       consumer_name: consumer.full_name
//     });

//     res.status(201).json({
//       session_id: session._id,
//       message: "Bargain request sent"
//     });

//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// POST /api/bargain/:session_id/offer
// app.post('/:id/offer', verifyToken, async (req, res) => {
//   try {
//     const session = await BargainSession.findById(req.params.id);
    
//     // Validate participant
//     if (![session.consumer_id, session.farmer_id].includes(req.user.id)) {
//       throw new Error("Not a participant in this session");
//     }

//     // Update price
//     session.current_price = req.body.price;
//     session.status = "counter_offer";
//     await session.save();

//     // Notify other participant
//     const recipient = req.user.id === session.consumer_id 
//       ? session.farmer_id 
//       : session.consumer_id;

//     notifyUser(recipient, {
//       type: "PRICE_UPDATE",
//       session_id: session._id,
//       new_price: req.body.price
//     });

//     res.json({ success: true });

//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });
// Token verification endpoint

// Route usage
app.get('/api/verify-token', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// POST route for creating the bargain
app.post('/api/create-bargain', async (req, res) => {
  try {
    // 1. Verify Authorization Header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    // 2. Extract and Verify Token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Decoded token payload:', decoded);

    // 3. Validate Request Body
    const { product_id, quantity, initiator } = req.body;
    if (!product_id || !quantity || !initiator) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['product_id', 'quantity', 'initiator']
      });
    }

    // 4. Fetch Product and Farmer from add_produce
    const [produce] = await queryDatabase(
      `SELECT 
        ap.*,
        fr.first_name,
        fr.last_name,
        fr.phone_number,
        fr.email
       FROM add_produce ap
       JOIN farmerregistration fr ON ap.farmer_id = fr.farmer_id
       WHERE ap.product_id = ?`,
      [product_id]
    );

    if (!produce) {
      return res.status(404).json({ 
        error: 'Product not found in marketplace',
        product_id
      });
    }

    // 5. Create Bargain Session
    const result = await queryDatabase(
      `INSERT INTO bargain_sessions 
       (consumer_id, farmer_id, product_id, original_price, quantity, initiator, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        decoded.consumer_id,
        produce.farmer_id,
        produce.product_id,
        produce.price_per_kg * quantity,
        quantity,
        initiator,
        'pending'
      ]
    );

    // 6. Success Response
    res.status(201).json({
      success: true,
      bargainId: result.insertId,
      farmer: {
        id: produce.farmer_id,
        name: `${produce.first_name} ${produce.last_name}`,
        contact: produce.phone,
        email: produce.email
      },
      product: {
        id: produce.product_id,
        name: produce.produce_name,
        type: produce.produce_type,
        price_per_kg: produce.price_per_kg
      },
      originalPrice: produce.price_per_kg * quantity,
      quantity: quantity
    });

  } catch (error) {
    console.error('Bargain creation error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
// GET route to check if the server is responding
app.get('/create-bargain', (req, res) => {
  res.status(200).json({ message: 'POST route is available, use POST to create bargain.' });
});



app.get('/api/bargain/:bargainId', async (req, res) => {
  const { bargainId } = req.params;

  try {
    const result = await db.query('SELECT * FROM bargain_sessions WHERE bargain_id = ?', [bargainId]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Bargain session not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching bargain session:', error);
    res.status(500).json({ error: 'Error fetching bargain session' });
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

// Get personal details
app.get("/api/getpersonaldetails", async (req, res) => {
  try {
    const { farmer_id } = req.query;
    if (!farmer_id) {
      return res.status(400).json({ success: false, message: "Farmer ID is required" });
    }

    const result = await queryDatabase(
      `SELECT * FROM personaldetails WHERE farmer_id = ?;`,
      [farmer_id]
    );

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Personal details not found" });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching personal details", error: err.message });
  }
});

// Update personal details
app.post("/api/updatepersonaldetails", async (req, res) => {
  try {
    const { user_id, email, contact, identification_number, address, bank_account_no, ifsc_code, upi_id, date_of_birth, gender } = req.body;

    if (!user_id || !email || !contact || !identification_number || !address || !date_of_birth || !gender) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    const existingDetails = await queryDatabase(
      `SELECT * FROM personaldetails WHERE farmer_id = ?;`, [user_id]
    );

    if (existingDetails.length > 0) {
      await queryDatabase(
        `UPDATE personaldetails 
         SET email=?, contact_no=?, identification_number=?, residential_address=?, bank_account_no=?, ifsc_code=?, upi_id=?, date_of_birth=?, gender=?
         WHERE farmer_id = ?;`,
        [email, contact, identification_number, address, bank_account_no, ifsc_code, upi_id, date_of_birth, gender, user_id]
      );
    } else {
      await queryDatabase(
        `INSERT INTO personaldetails (farmer_id, email, contact_no, identification_number, residential_address, bank_account_no, ifsc_code, upi_id, date_of_birth, gender) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [user_id, email, contact, identification_number, address, bank_account_no, ifsc_code, upi_id, date_of_birth, gender]
      );
    }

    res.json({ success: true, message: "Personal details updated successfully" });
  } catch (err) {
    console.error("Database error:", err);

  }
});
// ✅ Get Farmer Profile
// ✅ Get Farmer Profile with combined personal and farm details
// app.get("/api/farmerprofile/:farmer_id", 
//   auth.authenticate, 
//   auth.farmerOnly,
//   async (req, res) => {
//     try {
//       const { farmer_id } = req.params;
      
//       // Verify requested profile matches authenticated farmer
//       if (farmer_id !== req.user.farmer_id) {
//         return res.status(403).json({ error: "Unauthorized profile access" });
//       }

//       // Fetch combined farmer data
//       const farmerData = await queryDatabase(`
//         SELECT 
//           fr.farmer_id, fr.first_name, fr.last_name, fr.email, fr.phone_number,
//           pd.dob, pd.gender, pd.contact_no, pd.aadhaar_no, pd.residential_address,
//           pd.bank_account_no, pd.ifsc_code, pd.upi_id, pd.profile_photo,
//           fd.farm_address, fd.farm_size, fd.crops_grown, fd.farming_method,
//           fd.soil_type, fd.water_sources, fd.farm_equipment
//         FROM farmerregistration fr
//         LEFT JOIN personaldetails pd ON fr.farmer_id = pd.farmer_id
//         LEFT JOIN farmdetails fd ON fr.farmer_id = fd.farmer_id
//         WHERE fr.farmer_id = ?
//       `, [farmer_id]);

//       if (farmerData.length === 0) {
//         return res.status(404).json({ error: "Farmer not found" });
//       }

//       // Format response
//       const response = {
//         farmer_id: farmerData[0].farmer_id,
//         full_name: `${farmerData[0].first_name} ${farmerData[0].last_name}`,
//         email: farmerData[0].email,
//         phone_number: farmerData[0].phone_number,
//         personal: {
//           dob: farmerData[0].dob,
//           gender: farmerData[0].gender,
//           contact_no: farmerData[0].contact_no,
//           aadhaar_no: farmerData[0].aadhaar_no,
//           residential_address: farmerData[0].residential_address,
//           bank_account_no: farmerData[0].bank_account_no,
//           ifsc_code: farmerData[0].ifsc_code,
//           upi_id: farmerData[0].upi_id,
//           profile_photo: farmerData[0].profile_photo 
//             ? `/uploads/${farmerData[0].profile_photo}`
//             : null
//         },
//         farm: {
//           farm_address: farmerData[0].farm_address,
//           farm_size: farmerData[0].farm_size,
//           crops_grown: farmerData[0].crops_grown,
//           farming_method: farmerData[0].farming_method,
//           soil_type: farmerData[0].soil_type,
//           water_sources: farmerData[0].water_sources,
//           farm_equipment: farmerData[0].farm_equipment
//         }
//       };

//       res.json(response);
//     } catch (error) {
//       console.error("Error fetching farmer profile:", error);
//       res.status(500).json({ error: "Failed to fetch farmer profile" });
//     }
//   }
// );

app.get("/api/farmerprofile/:farmer_id", 
  auth.authenticate,
  auth.farmerOnly,
  async (req, res) => {
    try {
      const { farmer_id } = req.params;
      
      // Verify requested profile matches authenticated farmer
      if (farmer_id !== req.user.farmer_id) {
        return res.status(403).json({ error: "Unauthorized profile access" });
      }

      // Fetch combined farmer data
      const [farmerData] = await queryDatabase(`
        SELECT 
          fr.farmer_id, 
          fr.first_name, 
          fr.last_name, 
          fr.email, 
          fr.phone_number,
          pd.dob, 
          pd.gender, 
          pd.contact_no, 
          pd.aadhaar_no, 
          pd.residential_address,
          pd.bank_account_no, 
          pd.ifsc_code, 
          pd.upi_id, 
          pd.profile_photo,
          pd.aadhaar_proof,
          pd.bank_proof,
          fd.farm_address, 
          fd.farm_size, 
          fd.crops_grown, 
          fd.farming_method,
          fd.soil_type, 
          fd.water_sources, 
          fd.farm_equipment,
          fd.land_ownership_proof,
          fd.certification,
          fd.land_lease_agreement,
          fd.farm_photographs
        FROM farmerregistration fr
        LEFT JOIN personaldetails pd ON fr.farmer_id = pd.farmer_id
        LEFT JOIN farmdetails fd ON fr.farmer_id = fd.farmer_id
        WHERE fr.farmer_id = ?
      `, [farmer_id]);

      if (!farmerData) {
        return res.status(404).json({ error: "Farmer not found" });
      }

      // Format response
      const response = {
        farmer_id: farmerData.farmer_id,
        full_name: `${farmerData.first_name} ${farmerData.last_name}`,
        email: farmerData.email,
        phone_number: farmerData.phone_number,
        personal: {
          dob: farmerData.dob || null,
          gender: farmerData.gender || null,
          contact_no: farmerData.contact_no || farmerData.phone_number,
          aadhaar_no: farmerData.aadhaar_no || null,
          residential_address: farmerData.residential_address || null,
          bank_account_no: farmerData.bank_account_no || null,
          ifsc_code: farmerData.ifsc_code || null,
          upi_id: farmerData.upi_id || null,
          profile_photo: farmerData.profile_photo || null,
          aadhaar_proof: farmerData.aadhaar_proof || null,
          bank_proof: farmerData.bank_proof || null
        },
        farm: {
          farm_address: farmerData.farm_address || null,
          farm_size: farmerData.farm_size || null,
          crops_grown: farmerData.crops_grown || null,
          farming_method: farmerData.farming_method || null,
          soil_type: farmerData.soil_type || null,
          water_sources: farmerData.water_sources || null,
          farm_equipment: farmerData.farm_equipment || null,
          land_ownership_proof: farmerData.land_ownership_proof || null,
          certification: farmerData.certification || null,
          land_lease_agreement: farmerData.land_lease_agreement || null,
          farm_photographs: farmerData.farm_photographs || null
        }
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching farmer profile:", error);
      res.status(500).json({ error: "Failed to fetch farmer profile" });
    }
  }
);

// Update Farmer Profile
app.put("/api/farmerprofile/:farmer_id", 
  auth.authenticate,
  auth.farmerOnly,
  async (req, res) => {
    try {
      const { farmer_id } = req.params;
      
      // Verify authorization
      if (farmer_id !== req.user.farmer_id) {
        return res.status(403).json({ error: "Unauthorized update attempt" });
      }

      const { personal, farm } = req.body;

      // Update personal details
      if (personal) {
        await queryDatabase(`
          UPDATE personaldetails SET
            dob = ?, gender = ?, contact_no = ?, aadhaar_no = ?,
            residential_address = ?, bank_account_no = ?, ifsc_code = ?, upi_id = ?
          WHERE farmer_id = ?
        `, [
          personal.dob, personal.gender, personal.contact_no, personal.aadhaar_no,
          personal.residential_address, personal.bank_account_no, 
          personal.ifsc_code, personal.upi_id, farmer_id
        ]);
      }

      // Update farm details
      if (farm) {
        await queryDatabase(`
          UPDATE farmdetails SET
            farm_address = ?, farm_size = ?, crops_grown = ?, farming_method = ?,
            soil_type = ?, water_sources = ?, farm_equipment = ?
          WHERE farmer_id = ?
        `, [
          farm.farm_address, farm.farm_size, farm.crops_grown, farm.farming_method,
          farm.soil_type, farm.water_sources, farm.farm_equipment, farmer_id
        ]);
      }

      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating farmer profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

app.put("/api/farmerprofile/:farmer_id/:section", 
  auth.authenticate,
  auth.farmerOnly,
  async (req, res) => {
    try {
      const { farmer_id, section } = req.params;
      
      // Verify authorization - ensure the farmer is updating their own profile
      if (farmer_id !== req.user.farmer_id) {
        return res.status(403).json({ 
          success: false,
          error: "Unauthorized update attempt" 
        });
      }

      // Validate section parameter
      if (!['personal', 'farm'].includes(section)) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid section parameter" 
        });
      }

      if (section === 'personal') {
        // List of allowed personal fields
        const allowedFields = [
          'dob', 'gender', 'contact_no', 'aadhaar_no',
          'residential_address', 'bank_account_no', 'ifsc_code', 'upi_id'
        ];
        
        // Filter and validate fields
        const updateData = {};
        allowedFields.forEach(field => {
          if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
          }
        });

        // Check if we have any fields to update
        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ 
            success: false,
            error: "No valid fields provided for update" 
          });
        }

        // First check if personal details exist for this farmer
        const [existing] = await queryDatabase(
          "SELECT 1 FROM personaldetails WHERE farmer_id = ?",
          [farmer_id]
        );

        if (existing) {
          // Build the update query
          const setClause = Object.keys(updateData)
            .map(field => `${field} = ?`)
            .join(', ');
          
          const values = [...Object.values(updateData), farmer_id];

          await queryDatabase(
            `UPDATE personaldetails SET ${setClause} WHERE farmer_id = ?`,
            values
          );
        } else {
          // Insert new record
          const columns = ['farmer_id', ...Object.keys(updateData)];
          const placeholders = columns.map(() => '?').join(', ');
          const values = [farmer_id, ...Object.values(updateData)];

          await queryDatabase(
            `INSERT INTO personaldetails (${columns.join(', ')}) VALUES (${placeholders})`,
            values
          );
        }

      } else if (section === 'farm') {
        // List of allowed farm fields
        const allowedFields = [
          'farm_address', 'farm_size', 'crops_grown', 'farming_method',
          'soil_type', 'water_sources', 'farm_equipment'
        ];
        
        // Filter and validate fields
        const updateData = {};
        allowedFields.forEach(field => {
          if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
          }
        });

        // Check if we have any fields to update
        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ 
            success: false,
            error: "No valid fields provided for update" 
          });
        }

        // First check if farm details exist for this farmer
        const [existing] = await queryDatabase(
          "SELECT 1 FROM farmdetails WHERE farmer_id = ?",
          [farmer_id]
        );

        if (existing) {
          // Build the update query
          const setClause = Object.keys(updateData)
            .map(field => `${field} = ?`)
            .join(', ');
          
          const values = [...Object.values(updateData), farmer_id];

          await queryDatabase(
            `UPDATE farmdetails SET ${setClause} WHERE farmer_id = ?`,
            values
          );
        } else {
          // Insert new record
          const columns = ['farmer_id', ...Object.keys(updateData)];
          const placeholders = columns.map(() => '?').join(', ');
          const values = [farmer_id, ...Object.values(updateData)];

          await queryDatabase(
            `INSERT INTO farmdetails (${columns.join(', ')}) VALUES (${placeholders})`,
            values
          );
        }
      }

      res.json({ 
        success: true, 
        message: `${section} details updated successfully`,
        updatedFields: Object.keys(req.body)
      });
    } catch (error) {
      console.error("Error updating farmer profile:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to update profile",
        details: error.message 
      });
    }
  }
);
    


// ✅ Configure storage for farmer documents
// const farmerDocumentStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, '../uploads/farmer-documents');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const farmerId = req.params.farmer_id;
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const ext = path.extname(file.originalname);
//     cb(null, `farmer-${farmerId}-${uniqueSuffix}${ext}`);
//   }
// });

// const farmerDocumentUpload = multer({ 
//   storage: farmerDocumentStorage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'application/pdf' || 
//         file.mimetype.startsWith('image/') ||
//         file.mimetype === 'application/msword' ||
//         file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF, Word, and image files are allowed!'), false);
//     }
//   }
// });


const farmerDocumentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'F:/Project/KRISHISETU/krishisetu-final/backend/uploads/farmer-documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const farmerId = req.params.farmer_id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `farmer-${farmerId}-${uniqueSuffix}${ext}`);
  }
});

const farmerDocumentUpload = multer({ 
  storage: farmerDocumentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, and image files are allowed!'), false);
    }
  }
});


// ✅ Update Personal Details
// app.put("/api/farmerprofile/:farmer_id/personal", verifyToken, async (req, res) => {
//   try {
//     const farmerId = req.params.farmer_id;
//     const personalDetails = req.body;

//     await queryDatabase(`
//       UPDATE personaldetails 
//       SET 
//         dob = ?,
//         gender = ?,
//         contact_no = ?,
//         aadhaar_no = ?,
//         residential_address = ?,
//         bank_account_no = ?,
//         ifsc_code = ?,
//         upi_id = ?
//       WHERE farmer_id = ?
//     `, [
//       personalDetails.dob,
//       personalDetails.gender,
//       personalDetails.contact_no,
//       personalDetails.aadhaar_no,
//       personalDetails.residential_address,
//       personalDetails.bank_account_no,
//       personalDetails.ifsc_code,
//       personalDetails.upi_id,
//       farmerId
//     ]);

//     res.json({ success: true, message: "Personal details updated successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Error updating personal details", error: err.message });
//   }
// });
app.put("/api/farmerprofile/:farmer_id/personal", 
  auth.authenticate,
  auth.farmerOnly,
  async (req, res) => {
    try {
      const { farmer_id } = req.params;
      
      // Verify authorization - ensure the farmer is updating their own profile
      if (farmer_id !== req.user.farmer_id) {
        return res.status(403).json({ 
          success: false,
          error: "Unauthorized update attempt" 
        });
      }

      const { dob, gender, contact_no, aadhaar_no, residential_address, 
              bank_account_no, ifsc_code, upi_id } = req.body;

      // First check if personal details exist for this farmer
      const [existing] = await queryDatabase(
        "SELECT 1 FROM personaldetails WHERE farmer_id = ?",
        [farmer_id]
      );

      if (existing) {
        // Update existing record
        await queryDatabase(
          `UPDATE personaldetails SET
            dob = ?, gender = ?, contact_no = ?, aadhaar_no = ?,
            residential_address = ?, bank_account_no = ?, ifsc_code = ?, upi_id = ?
          WHERE farmer_id = ?`,
          [dob, gender, contact_no, aadhaar_no, residential_address,
           bank_account_no, ifsc_code, upi_id, farmer_id]
        );
      } else {
        // Insert new record
        await queryDatabase(
          `INSERT INTO personaldetails 
          (farmer_id, dob, gender, contact_no, aadhaar_no, 
           residential_address, bank_account_no, ifsc_code, upi_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [farmer_id, dob, gender, contact_no, aadhaar_no,
           residential_address, bank_account_no, ifsc_code, upi_id]
        );
      }

      res.json({ success: true, message: "Personal details updated" });
    } catch (error) {
      console.error("Error updating personal details:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to update personal details",
        details: error.message 
      });
    }
  }
);
// Update farm details
app.post("/api/updatefarmdetails", async (req, res) => {
  try {
    const { user_id, farm_name, location, land_size, farming_type, soil_type, irrigation_method, types_of_crops, farm_equipment } = req.body;

    if (!user_id || !farm_name || !location || !land_size || !farming_type) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    const existingDetails = await queryDatabase(
      `SELECT * FROM farmdetails WHERE farmer_id = ?;`, [user_id]
    );

    if (existingDetails.length > 0) {
      await queryDatabase(
        `UPDATE farmdetails 
         SET farm_name=?, location=?, land_size=?, farming_type=?, soil_type=?, irrigation_method=?, types_of_crops=?, farm_equipment=?
         WHERE farmer_id = ?;`,
        [farm_name, location, land_size, farming_type, soil_type, irrigation_method, types_of_crops, farm_equipment, user_id]
      );
    } else {
      await queryDatabase(
        `INSERT INTO farmdetails (user_id, farm_name, location, land_size, farming_type, soil_type, irrigation_method, types_of_crops, farm_equipment) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [user_id, farm_name, location, land_size, farming_type, soil_type, irrigation_method, types_of_crops, farm_equipment]
      );
    }

    res.json({ success: true, message: "Farm details updated successfully" });
  } catch (err) {
    console.error("Database error:", err);

  }
});

// ✅ Update Farm Details
app.put("/api/farmerprofile/:farmer_id/farm", 
  auth.authenticate,
  auth.farmerOnly,
  async (req, res) => {
    try {
      const { farmer_id } = req.params;
      
      // Verify authorization - ensure the farmer is updating their own profile
      if (farmer_id !== req.user.farmer_id) {
        return res.status(403).json({ 
          success: false,
          error: "Unauthorized update attempt" 
        });
      }

      const { farm_address, farm_size, crops_grown, farming_method,
              soil_type, water_sources, farm_equipment } = req.body;

      // First check if farm details exist for this farmer
      const [existing] = await queryDatabase(
        "SELECT 1 FROM farmdetails WHERE farmer_id = ?",
        [farmer_id]
      );

      if (existing) {
        // Update existing record
        await queryDatabase(
          `UPDATE farmdetails SET
            farm_address = ?, farm_size = ?, crops_grown = ?, farming_method = ?,
            soil_type = ?, water_sources = ?, farm_equipment = ?
          WHERE farmer_id = ?`,
          [farm_address, farm_size, crops_grown, farming_method,
           soil_type, water_sources, farm_equipment, farmer_id]
        );
      } else {
        // Insert new record
        await queryDatabase(
          `INSERT INTO farmdetails
          (farmer_id, farm_address, farm_size, crops_grown, 
           farming_method, soil_type, water_sources, farm_equipment)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [farmer_id, farm_address, farm_size, crops_grown,
           farming_method, soil_type, water_sources, farm_equipment]
        );
      }

      res.json({ success: true, message: "Farm details updated" });
    } catch (error) {
      console.error("Error updating farm details:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to update farm details",
        details: error.message 
      });
    }
  }
);


// ✅ Upload Profile Photo
app.post("/api/farmerprofile/:farmer_id/photo", verifyToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const farmerId = req.params.farmer_id;
    const photoPath = req.file.filename;

    await queryDatabase(`
      UPDATE personaldetails 
      SET profile_photo = ?
      WHERE farmer_id = ?
    `, [photoPath, farmerId]);

    res.json({ success: true, message: "Profile photo uploaded", profile_photo: photoPath });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error uploading photo", error: err.message });
  }
});
// ✅ Remove Profile Photo
app.delete("/api/farmerprofile/:farmer_id/photo", verifyToken, async (req, res) => {
  try {
    const farmerId = req.params.farmer_id;

    await queryDatabase(`
      UPDATE personaldetails 
      SET profile_photo = NULL
      WHERE farmer_id = ?
    `, [farmerId]);

    res.json({ success: true, message: "Profile photo removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error removing photo", error: err.message });
  }
});

app.delete("/api/farmerprofile/:farmer_id/remove-file", 
  auth.authenticate,
  auth.farmerOnly,
  async (req, res) => {
    try {
      const { farmer_id } = req.params;
      const { field } = req.body;

      if (!field) {
        return res.status(400).json({ success: false, message: "Field name is required" });
      }

      // Determine which table to update based on field
      let table, idField;
      if (field.includes('profile_photo') || field.includes('aadhaar_proof') || field.includes('bank_proof')) {
        table = 'personaldetails';
        idField = 'farmer_id';
      } else {
        table = 'farmdetails';
        idField = 'farmer_id';
      }

      // First get the file path to delete it from the filesystem
      const [result] = await queryDatabase(
        `SELECT ${field} FROM ${table} WHERE ${idField} = ?`,
        [farmer_id]
      );

      if (result && result[field]) {
        const filePath = path.join('F:/Project/KRISHISETU/krishisetu-final/backend', result[field]);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Update the database to remove the file reference
      await queryDatabase(
        `UPDATE ${table} SET ${field} = NULL WHERE ${idField} = ?`,
        [farmer_id]
      );

      res.json({ 
        success: true, 
        message: "File removed successfully" 
      });

    } catch (error) {
      console.error("Error removing file:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error removing file",
        error: error.message 
      });
    }
  }
);



// ✅ Upload File
// app.post("/api/farmerprofile/:farmer_id/file", verifyToken, upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "No file uploaded" });
//     }

//     res.json({ success: true, message: "File uploaded", fileUrl: req.file.filename });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Error uploading file", error: err.message });
//   }
// });

// In server.js, update the farmer profile photo upload endpoint
app.post("/api/farmerprofile/:farmer_id/upload-file", 
  auth.authenticate,
  auth.farmerOnly,
  farmerDocumentUpload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const { farmer_id } = req.params;
      const { field } = req.body;

      if (!field) {
        return res.status(400).json({ success: false, message: "Field name is required" });
      }

      const filePath = `/uploads/farmer-documents/${req.file.filename}`;

      // Update the database with the file path
      let table, idField;
      if (field === 'profile_photo' || field === 'aadhaar_proof' || field === 'bank_proof') {
        table = 'personaldetails';
        idField = 'farmer_id';
      } else {
        table = 'farmdetails';
        idField = 'farmer_id';
      }

      await queryDatabase(
        `UPDATE ${table} SET ${field} = ? WHERE ${idField} = ?`,
        [filePath, farmer_id]
      );

      res.json({ 
        success: true, 
        message: "File uploaded successfully",
        filePath: filePath,
        filename: req.file.filename
      });

    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error uploading file",
        error: error.message 
      });
    }
  }
);

// const Razorpay = require('razorpay');

// const razorpay = new Razorpay({
//   key_id: 'YOUR_RAZORPAY_KEY_ID',
//   key_secret: 'YOUR_RAZORPAY_KEY_SECRET'
// });

// // Create Razorpay order
// app.post('/api/create-razorpay-order', async (req, res) => {
//   try {
//     const options = {
//       amount: req.body.amount,
//       currency: req.body.currency,
//       receipt: req.body.receipt,
//       notes: req.body.notes
//     };

//     const order = await razorpay.orders.create(options);
//     res.json(order);
//   } catch (error) {
//     console.error('Razorpay order error:', error);
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// });

// // Verify payment
// app.post('/api/verify-payment', async (req, res) => {
//   const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderData } = req.body;

//   try {
//     // Verify the payment signature
//     const crypto = require('crypto');
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest('hex');

//     if (expectedSignature === razorpay_signature) {
//       // Payment is successful, create your order
//       const query = `
//         INSERT INTO placeorder (
//           consumer_id, name, mobile_number, email, produce_name, 
//           quantity, amount, status, payment_status, payment_method,
//           razorpay_payment_id, razorpay_order_id, is_self_delivery,
//           recipient_name, recipient_phone, address
//         )
//         VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Paid', ?, ?, ?, ?, ?, ?, ?)
//       `;

//       await queryDatabase(query, [
//         orderData.consumer_id,
//         orderData.name,
//         orderData.mobile_number,
//         orderData.email,
//         orderData.produce_name,
//         orderData.quantity,
//         orderData.amount,
//         orderData.payment_method,
//         razorpay_payment_id,
//         razorpay_order_id,
//         orderData.is_self_delivery,
//         orderData.recipient_name || null,
//         orderData.recipient_phone || null,
//         orderData.address
//       ]);

//       res.json({ success: true });
//     } else {
//       res.status(400).json({ error: 'Invalid payment signature' });
//     }
//   } catch (error) {
//     console.error('Payment verification error:', error);
//     res.status(500).json({ error: 'Payment verification failed' });
//   }
// });

const paymentRoutes = require('./src/routes/payment'); // Assuming you put the route in routes/payment.js

app.use('/api', paymentRoutes);
const axios = require('axios');
// Instamojo API configuration
const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY || '37393680f8c2f74c4962a7128cd25ad9';
const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN || '371fd9a798b0bf71538b6e1a2603dced';
const INSTAMOJO_BASE_URL = 'https://test.instamojo.com/api/1.1/'; // Use https://www.instamojo.com/api/1.1/ for live
// Create Instamojo payment request
app.post('/create-instamojo-payment', async (req, res) => {
  try {
    const response = await axios.post(`${INSTAMOJO_BASE_URL}payment-requests/`, req.body, {
      headers: {
        'X-Api-Key': INSTAMOJO_API_KEY,
        'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Instamojo payment request error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create payment request' });
  }
});

// Verify Instamojo payment
app.post('/api/verify-instamojo-payment', async (req, res) => {
  const { payment_id, payment_request_id, orderData } = req.body;

  try {
    // First verify the payment with Instamojo
    const response = await axios.get(`${INSTAMOJO_BASE_URL}payments/${payment_id}/`, {
      headers: {
        'X-Api-Key': INSTAMOJO_API_KEY,
        'X-Auth-Token': INSTAMOJO_AUTH_TOKEN
      }
    });

    const paymentDetails = response.data.payment;

    if (paymentDetails.status === 'Credit' && paymentDetails.payment_request.id === payment_request_id) {
      // Payment is successful, create your order
      const query = `
        INSERT INTO placeorder (
          consumer_id, name, mobile_number, email, produce_name, 
          quantity, amount, status, payment_status, payment_method,
          instamojo_payment_id, instamojo_payment_request_id, is_self_delivery,
          recipient_name, recipient_phone, address
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Paid', ?, ?, ?, ?, ?, ?, ?)
      `;

      await queryDatabase(query, [
        orderData.consumer_id,
        orderData.name,
        orderData.mobile_number,
        orderData.email,
        orderData.produce_name,
        orderData.quantity,
        orderData.amount,
        orderData.payment_method,
        paymentDetails.id,
        paymentDetails.payment_request.id,
        orderData.is_self_delivery,
        orderData.recipient_name || null,
        orderData.recipient_phone || null,
        orderData.address
      ]);

      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Instamojo webhook handler
app.post('/api/instamojo-webhook', async (req, res) => {
  try {
    const { payment_id, payment_request_id, status } = req.body;

    if (status === 'Credit') {
      // Update your database with payment confirmation
      await queryDatabase(
        'UPDATE placeorder SET payment_status = ? WHERE instamojo_payment_id = ?',
        ['Paid', payment_id]
      );
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});





// Example backend API for fetching bargain sessions
app.get('/api/bargain/sessions/farmer', async (req, res) => {
  try {
      console.log("Request received:", req.user);  // Debugging line
      const farmerId = req.user?.id;  // Ensure farmerId is correctly extracted

      if (!farmerId) {
          return res.status(400).json({ error: "Farmer ID is missing" });
      }

      const sessions = await db.query('SELECT * FROM bargain_sessions WHERE farmer_id = ?', [farmerId]);
      res.json(sessions);
  } catch (err) {
      console.error("Error fetching bargain sessions:", err);
      res.status(500).json({ error: "Database error" });
  }
});


if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));  // Adjust path based on your project setup
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
setupSockets(server);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
