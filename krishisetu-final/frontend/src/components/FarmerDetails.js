import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import axios from "axios";
import "./farmerDetails.css";

import Farmer from "../assets/farmer.jpeg"; // Adjust the path if needed

const FarmerDetails = () => {
  const { farmer_id } = useParams(); // Get farmer_id from URL
  const navigate = useNavigate(); // ✅ Initialize useNavigate
  const [farmer, setFarmer] = useState(null);

  useEffect(() => {
    // Fetch details of the individual farmer
    axios
      .get(`http://localhost:5000/farmer/${farmer_id}`) // Ensure correct API endpoint
      .then((response) => setFarmer(response.data))
      .catch((error) => console.error("Error fetching farmer details:", error));
  }, [farmer_id]);

  if (!farmer) return <p>Loading farmer details...</p>;

  return (
    <div className="farmer-details-page">
      <div className="farmer-profile-card">
        <div className="farmer-info">
          <img src={Farmer} alt="Farmer" className="farmer-image" />
          <div className="farmer-details">
            <p><strong>Farmer ID:</strong> {farmer.farmer_id}</p>
            <p><strong>Farmer Name:</strong> {farmer.farmer_name}</p>
            <p><strong>Farming Method:</strong> {farmer.produce_type}</p>
            <p><strong>Ratings:</strong> {farmer.ratings} ⭐</p>
          </div>
        </div>

        {/* Produce Details */}
        <table className="produce-table">
          <thead>
            <tr>
              <th>Produce</th>
              <th>Type</th>
              <th>Price (₹/kg)</th>
              <th>Availability (kg)</th>
            </tr>
          </thead>
          <tbody>
            {farmer.products.map((product) => (
              <tr key={product.product_id}>
                <td>{product.produce_name}</td>
                <td>{product.produce_type}</td>
                <td>₹{product.price_per_kg}</td>
                <td>{product.availability}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Action Buttons */}
        <div className="farmer-buttons">
          <button
            onClick={() => navigate(`/consumer-dashboard`)}
            className="farmer-button"
          >
            Back to dashboard
          </button>
          <button
            onClick={() => navigate(`/bargain/${farmer.farmer_id}`)}
            className="farmer-button"
          >
            Bargain Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmerDetails;
