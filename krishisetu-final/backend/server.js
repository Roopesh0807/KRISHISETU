require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { queryDatabase } = require('./src/config/db');
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const FarmerModel = require('./src/models/farmerModels');  // ✅ Ensure this path is correct

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"], credentials: true }));
app.use(cookieParser());

const SECRET_KEY = process.env.JWT_SECRET || "krishisetu_secret_key";

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


// ✅ Farmer Login API (Without Hashed Password)
app.post("/api/farmerlogin", async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
      const results = await queryDatabase(
          "SELECT * FROM farmerregistration WHERE email = ? OR phone_number = ?",
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

      // Check password
      if (!user.password || password !== user.password) {
          return res.status(401).json({ success: false, message: "Invalid password" });
      }

      res.json({ success: true, message: "Login successful", user });
  } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

// ✅ Consumer Registration API (Without Hashing)
app.post("/api/consumerregister", async (req, res) => {
console.log("Consumer Registration API Called ✅");  // Debugging

const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;

if (!first_name || !last_name || !email || !phone_number || !password || !confirm_password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
}

if (password !== confirm_password) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
}

try {
    // ✅ Insert into database
    const result = await queryDatabase(
        `INSERT INTO consumerregistration (first_name, last_name, email, phone_number, password, confirm_password) 
         VALUES (?, ?, ?, ?, ?, ?);`,
        [first_name, last_name, email, phone_number, password, confirm_password]
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
    res.status(500).json({ success: false, message: "Database error", error: err.message });
}
});




// ✅ Consumer Login API
app.post("/api/consumerlogin", async (req, res) => {
const { emailOrPhone, password } = req.body;

try {
    const results = await queryDatabase(
        "SELECT * FROM consumerregistration WHERE email = ? OR phone_number = ?",
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

    // Check password
    if (!user.password || password !== user.password) {
        return res.status(401).json({ success: false, message: "Invalid password" });
    }

    res.json({ success: true, message: "Login successful", user });
} catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Database error", error: err.message });
}
});


// ✅ Logout API (Clears JWT Cookie)
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
});

app.get("/api/getpersonaldetails", async (req, res) => {
  const { user_id } = req.query;
  try {
    const result = await queryDatabase(
      `SELECT * FROM personaldetails WHERE user_id = ?;`,
      [user_id]
    );
    // If no data is found, return an empty object
    res.json(result[0] || {});
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching personal details", error: err.message });
  }
});
app.post("/api/updatepersonaldetails", async (req, res) => {
  const { user_id, email, contact, identification_number, address, bank_account_no, ifsc_code, upi_id, date_of_birth, gender, AdharProof } = req.body;

  if (!user_id || !email || !contact || !identification_number || !address || !date_of_birth || !gender) {
    return res.status(400).json({ success: false, message: "Required fields are missing" });
  }

  try {
    const existingDetails = await queryDatabase(
      `SELECT * FROM personaldetails WHERE user_id = ?;`, [user_id]
    );

    if (existingDetails.length > 0) {
      await queryDatabase(
        `UPDATE personaldetails 
         SET email=?, contact=?, identification_number=?, address=?, bank_account_no=?, ifsc_code=?, upi_id=?, date_of_birth=?, gender=?, AdharProof=?
         WHERE user_id = ?;`,
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
  const { user_id } = req.query;
  try {
    const result = await queryDatabase(
      `SELECT * FROM farmdetails WHERE user_id = ?;`,
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

  if (!user_id || !farm_name || !location || !land_size || !farming_type) {
    return res.status(400).json({ success: false, message: "Required fields are missing" });
  }

  try {
    const existingDetails = await queryDatabase(
      `SELECT * FROM farmdetails WHERE user_id = ?;`, [user_id]
    );

    if (existingDetails.length > 0) {
      await queryDatabase(
        `UPDATE farmdetails 
         SET farm_name=?, location=?, land_size=?, farming_type=?, soil_type=?, irrigation_method=?, types_of_crops=?, farm_equipment=?, LandOwnerShipProof=?, photoofFarm=?, LandLeaseProof=?, certifications=?
         WHERE user_id = ?;`,
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
    const farmers = await queryDatabase(
      "SELECT product_id, user_id, farmer_name, produce_name, availability, price_per_kg, produce_type FROM add_produce"
    );
    res.json(farmers);
  } catch (err) {
    console.error("🔥 Error fetching farmers:", err);
    res.status(500).json({ message: "Server error fetching farmers", error: err });
  }
});

app.get("/api/check-user-details", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    // Check if personal details exist
    const personalDetails = await queryDatabase(
      `SELECT * FROM personaldetails WHERE user_id = ?;`,
      [user_id]
    );

    // Check if farm details exist
    const farmDetails = await queryDatabase(
      `SELECT * FROM farmdetails WHERE user_id = ?;`,
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
app.get("/api/farmers/:id", (req, res) => {
  const farmerId = req.params.id;
  const sql = `
  SELECT user_id, farmer_name AS name, farming_method AS farmingMethod, ratings 
  FROM farmers 
  WHERE user_id = ?
`;


  pool.query(sql, [farmerId], (err, results) => {
    if (err) {
      console.error("🔥 Error fetching farmer details:", err);
      return res.status(500).json({ message: "Server error fetching farmer details" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Fetch produce details for the farmer
    const farmer = results[0];
const produceSql = `
  SELECT 
    produce_name AS name, 
    availability, 
    price_per_kg AS price, 
    produce_type AS type 
  FROM add_produce 
  WHERE user_id = ?
`;

    pool.query(produceSql, [farmerId], (err, produceResults) => {
      if (err) {
        console.error("🔥 Error fetching produce details:", err);
        return res.status(500).json({ message: "Server error fetching produce details" });
      }

      farmer.produce = produceResults;
      res.json(farmer);
    });
  });
});

app.get('/api/farmer-profile', async (req, res) => {
  try {
      const { rows } = await pool.query('SELECT * FROM farmerprofile WHERE user_id = $1', [1]); // Assuming you want to fetch profile for user_id = 1
      res.json(rows[0]);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});
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
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));  // Adjust path based on your project setup
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
