const express = require("express");
const {
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
} = require("../controllers/farmerControllers");

const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// 🟢 Authentication Routes
router.post("/register", registerFarmer);
router.post("/login", loginFarmer);

// 🟢 Get All Farmers (Placeholder)
// router.get("/farmers", (req, res) => {
//     res.send("Fetching all farmers...");
// });

// 🟢 Farmer Personal Details Routes
router.get("/farmer/:farmer_id/personal-details", getPersonalDetails);
router.put("/farmer/:farmer_id/personal-details", updatePersonalDetails);

// 🟢 Farmer Farm Details Routes
router.get("/farmer/:farmer_id/farm-details", getFarmDetails);
router.put("/farmer/:farmer_id/farm-details", updateFarmDetails);

// 🟢 Farmer Profile Photo Routes
router.get("/farmer/:farmer_id/profile-photo", getProfilePhoto);
router.post("/farmer/:farmer_id/upload-photo", upload.single("photo"), uploadProfilePhoto);
router.delete("/farmer/:farmer_id/remove-photo", removeProfilePhoto);

// 🟢 File Upload Route (For Farm Documents)
router.post("/farmer/:farmer_id/upload-file", upload.single("file"), uploadFile);

module.exports = router;
