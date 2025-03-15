const mongoose = require("mongoose");

const FarmerSchema = new mongoose.Schema({
    farmer_id: { type: String, required: true, unique: true }, // Ensure farmer_id is unique
    name: String,
    email: String,
    profile_photo: String,
    dob: String,
    gender: String,
    contact_no: String,
    aadhaar_no: String,
    residential_address: String,
    bank_account_no: String,
    ifsc_code: String,
    bank_branch: String,
    upi_id: String
});

module.exports = mongoose.model("Farmer", FarmerSchema);
