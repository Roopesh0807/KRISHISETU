const bcrypt = require("bcryptjs");
const { queryDatabase } = require("../config/db");
const Farmer = require("../models/farmerModels");

// 🟢 Farmer Registration
const registerFarmer = async (req, res) => {
    const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await queryDatabase(
            `INSERT INTO farmerregistration (first_name, last_name, email, phone_number, password)
             VALUES (?, ?, ?, ?, ?)`,
            [first_name, last_name, email, phone_number, hashedPassword]
        );

        res.json({ success: true, message: "Farmer registered successfully", farmer_id: result.insertId });
    } catch (err) {
        console.error("Error during farmer registration:", err);
        res.status(500).json({ success: false, message: "Farmer registration failed", error: err });
    }
};

// 🟢 Farmer Login
const loginFarmer = async (req, res) => {
    const { emailOrPhone, password } = req.body;

    try {
        const results = await queryDatabase(
            "SELECT * FROM farmerregistration WHERE email = ? OR phone_number = ?",
            [emailOrPhone, emailOrPhone]
        );

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const token = jwt.sign(
                { 
                  farmer_id: user.farmer_id,
                  email: user.email,
                  userType: "farmer"
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
              );
          
              res.json({
                success: true,
                token,
                farmer_id: user.farmer_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number
              });
            } catch (err)
  {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
};
// 📍 Get Personal Details
const getPersonalDetails = async (req, res) => {
  try {
      const { farmer_id } = req.params; // ✅ Use farmer_id (matches routes)
      const result = await queryDatabase("SELECT * FROM personaldetails WHERE farmer_id = ?", [farmer_id]);

      if (result.length === 0) return res.status(404).json({ message: "Farmer not found" });

      res.json(result[0]); // ✅ Return farmer details
  } catch (error) {
      console.error("Error fetching personal details:", error);
      res.status(500).json({ message: "Server error", error });
  }
};

// 📍 Update Personal Details
const updatePersonalDetails = async (req, res) => {
  try {
      const { farmer_id } = req.params; // Get farmer_id from URL
      const updatedFarmer = await queryDatabase(
          `UPDATE farmerregistration SET 
              name = ?, email = ?, dob = ?, gender = ?, contact_no = ?, 
              aadhaar_no = ?, residential_address = ?, bank_account_no = ?, ifsc_code = ?, upi_id = ?
          WHERE farmer_id = ?`,
          [
              req.body.name,
              req.body.email,
              req.body.dob,
              req.body.gender,
              req.body.contact_no,
              req.body.aadhaar_no,
              req.body.residential_address,
              req.body.bank_account_no,
              req.body.ifsc_code,
              req.body.upi_id,
              farmer_id
          ]
      );

      if (updatedFarmer.affectedRows === 0) {
          return res.status(404).json({ message: "Farmer not found" });
      }

      res.json({ message: "Personal details updated successfully" });
  } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ message: "Database update failed", error });
  }
};


// 📍 Get Farm Details
const getFarmDetails = async (req, res) => {
  try {
      const { farmer_id } = req.params; // ✅ Use farmer_id (matches routes)
      const result = await queryDatabase("SELECT * FROM farmdetails WHERE farmer_id = ?", [farmer_id]);

      if (result.length === 0) return res.status(404).json({ message: "Farm details not found" });

      res.json(result[0]); // ✅ Return farm details
  } catch (error) {
      console.error("Error fetching farm details:", error);
      res.status(500).json({ message: "Server error", error });
  }
};

// 📍 Update Farm Details
const updateFarmDetails = async (req, res) => {
  try {
      const { farmer_id } = req.params;
      const { 
          farm_address, farm_size, crops_grown, farming_method, soil_type, 
          water_sources, farm_equipment, land_ownership_proof_pdf, certification_pdf, 
          land_lease_agreement_pdf, farm_photographs_pdf 
      } = req.body;

      // ✅ Update farm details based on farmer_id
      const result = await queryDatabase(
          `UPDATE farmdetails SET 
              farm_address = ?, farm_size = ?, crops_grown = ?, farming_method = ?, soil_type = ?, 
              water_sources = ?, farm_equipment = ?, land_ownership_proof_pdf = ?, 
              certification_pdf = ?, land_lease_agreement_pdf = ?, farm_photographs_pdf = ? 
          WHERE farmer_id = ?`,
          [farm_address, farm_size, crops_grown, farming_method, soil_type, 
           water_sources, farm_equipment, land_ownership_proof_pdf, certification_pdf, 
           land_lease_agreement_pdf, farm_photographs_pdf, farmer_id]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Farm details not found or not updated" });
      }

      res.json({ message: "Farm details updated successfully" });
  } catch (error) {
      console.error("Error updating farm details:", error);
      res.status(500).json({ message: "Failed to update farm details", error });
  }
};



// 📍 Get Profile Photo
const getProfilePhoto = async (req, res) => {
  try {
      const farmer = await Farmer.findOne({ farmer_id: req.params.farmer_id }); // ✅ Find by farmer_id
      if (!farmer || !farmer.profilePhoto) {
          return res.status(404).json({ message: "Profile photo not found" });
      }
      res.json({ photo: farmer.profilePhoto });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// 📍 Upload Profile Photo
const uploadProfilePhoto = async (req, res) => {
  try {
      const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
      await Farmer.findOneAndUpdate(
          { farmer_id: req.params.farmer_id }, // ✅ Find by farmer_id
          { profilePhoto: photoUrl }
      );
      res.json({ photo: photoUrl });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


// 📍 Remove Profile Photo
const removeProfilePhoto = async (req, res) => {
  try {
      await Farmer.findOneAndUpdate(
          { farmer_id: req.params.farmer_id }, // ✅ Find by farmer_id
          { profilePhoto: null }
      );
      res.json({ message: "Profile photo removed successfully" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


// 📍 Upload Files (Farm Documents)
const uploadFile = async (req, res) => {
  try {
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
      res.json({ fileUrl });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
exports.getPersonalDetails = async (req, res) => {
  try {
      const { farmerId } = req.params;
      const farmer = await Farmer.findById(farmerId);
      if (!farmer) return res.status(404).json({ message: "Farmer not found" });
      res.json(farmer);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

exports.getFarmDetails = async (req, res) => {
  try {
      const { farmerId } = req.params;
      const farm = await Farm.findOne({ farmer: farmerId });
      if (!farm) return res.status(404).json({ message: "Farm details not found" });
      res.json(farm);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

exports.getProfilePhoto = async (req, res) => {
  try {
      const { farmerId } = req.params;
      const farmer = await Farmer.findById(farmerId);
      if (!farmer || !farmer.profilePhoto) {
          return res.status(404).json({ message: "Profile photo not found" });
      }
      res.json({ photo: farmer.profilePhoto });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerFarmer, 
  loginFarmer,
  getPersonalDetails, 
  updatePersonalDetails,
  getFarmDetails, 
  updateFarmDetails,
  getProfilePhoto, 
  uploadProfilePhoto, 
  removeProfilePhoto,
  uploadFile 
};
