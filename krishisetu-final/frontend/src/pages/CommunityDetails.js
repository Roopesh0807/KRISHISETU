import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar3 from '../components/Navbar3.js'; // Import Navbar3
import "../styles/CommunityDetails.css";

function CommunityDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [saved, setSaved] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [communityId, setCommunityId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.showInstructions) {
      setShowInstructions(true);
    }
    if (location.state?.communityId) {
      setCommunityId(location.state.communityId);
    }
  }, [location.state]);

  const handleAgree = () => {
    setShowInstructions(false);
  };

  const handleSave = async () => {
    if (!communityId) {
      alert("Community ID is missing.");
      return;
    }

    if (!address || !deliveryDate || !deliveryTime) {
      alert("Please fill in all fields.");
      return;
    }

    // Validate if the selected date and time are in the future
    const selectedDateTime = new Date(`${deliveryDate}T${deliveryTime}`);
    const currentDateTime = new Date();

    if (selectedDateTime <= currentDateTime) {
      setError("Please select a future date and time for delivery.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/community/${communityId}/update-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, deliveryDate, deliveryTime }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Community details saved successfully!");
        setSaved(true);
        setError('');
      } else {
        alert(data.error || "Error saving community details");
      }
    } catch (error) {
      console.error("Error saving community details:", error);
      alert("An error occurred while saving community details.");
    }
  };

  const handleViewCommunity = async () => {
    if (!communityId) {
      alert("Community ID is missing.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/community/${communityId}/`);
      const data = await response.json();

      if (response.ok) {
        const adminId = data.admin_id;
        const userId = localStorage.getItem("userId");

        if (userId && userId.toString() === adminId.toString()) {
          navigate(`/community-page/${communityId}/admin`);
        } else {
          navigate(`/community-page/${communityId}/member`);
        }
      } else {
        alert(data.error || "Error fetching community details");
      }
    } catch (error) {
      console.error("Error fetching community details:", error);
      alert("An error occurred while fetching community details.");
    }
  };

  return (
    <div className="krishi-community-details">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      {showInstructions ? (
        <div className="krishi-instructions-popup">
          <h2>Welcome to Your Community!</h2>
          <p>Here’s how it works:</p>
          <ul>
            <li>You manage the group, adding/removing members.</li>
            <li>You set and control the delivery date and address.</li>
            <li>Each member gets a separate bill, with a shared total.</li>
            <li>Cart closes one day before delivery.</li>
            <li>Payments must be completed two days before delivery.</li>
            <li>If a member delays payment, you can remove them.</li>
          </ul>
          <button onClick={handleAgree} className="krishi-agree-button">OK, I Agree</button>
        </div>
      ) : (
        <div className="krishi-form-container">
          <h2>Community Details</h2>
          <div className="krishi-input-group">
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="krishi-input"
            />
            <input
              type="date"
              value={deliveryDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="krishi-input"
            />
            <input
              type="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="krishi-input"
            />
          </div>
          {error && <p className="krishi-error-message">{error}</p>}
          <button onClick={handleSave} className="krishi-save-button">Save</button>
          {saved && (
            <button onClick={handleViewCommunity} className="krishi-view-button">
              View Community
            </button>
          )}
        </div>
      )}

      {/* Krishisetu Branding Element */}
      <div className="krishi-branding">
        <img src="./src/assets/logo.png" alt="Krishisetu Logo" />
        <p>Empowering Communities, One Order at a Time</p>
      </div>
    </div>
  );
}

export default CommunityDetails;