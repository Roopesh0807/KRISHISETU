const mongoose = require("mongoose");

const FarmDetailsSchema = new mongoose.Schema({
    farmer_id: { type: String, required: true, unique: true }, // Link to Farmer
    farm_address: String,
    farm_size: String,
    crops_grown: String,
    farming_method: String,
    soil_type: String,
    water_sources: String,
    farm_equipment: String,
    land_ownership_proof_pdf: String,
    certification_pdf: String,
    land_lease_agreement_pdf: String,
    farm_photographs_pdf: String
});

module.exports = mongoose.model("FarmDetails", FarmDetailsSchema);
