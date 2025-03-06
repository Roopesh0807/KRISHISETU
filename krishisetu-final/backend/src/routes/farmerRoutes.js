// routes/farmerRoutes.js
const express = require("express");
const { registerFarmer, loginFarmer } = require("../controllers/farmerController");

const router = express.Router();

router.post("/register", registerFarmer);
router.post("/login", loginFarmer);

module.exports = router;
