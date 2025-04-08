import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar3 from '../components/Navbar3.js';
import { useAuth } from '../context/AuthContext';
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
  const { consumer } = useAuth();

  useEffect(() => {
    if (location.state?.showInstructions) {
      setShowInstructions(true);
    }
    if (location.state?.communityId) {
      setCommunityId(location.state.communityId);
    } else {
      console.error("Community ID is missing in location.state");
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

    const selectedDateTime = new Date(`${deliveryDate}T${deliveryTime}`);
    const currentDateTime = new Date();

    if (selectedDateTime <= currentDateTime) {
      setError("Please select a future date and time for delivery.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/community/${communityId}/update-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json",
           'Authorization': `Bearer ${consumer.token}`
         },
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
      const response = await fetch(`http://localhost:5000/api/community/${communityId}`,{
        headers: { 
          'Authorization': `Bearer ${consumer.token}`
        },
      }

      );
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Error fetching community details");
      }
  
      const communityData = data.data || data;
      const adminId = communityData.admin_id;
      const loggedInConsumerId = localStorage.getItem("consumerId");
  
      if (!adminId) {
        throw new Error("Admin ID not found in response");
      }
  
      if (!loggedInConsumerId) {
        throw new Error("Logged-in consumer ID not found");
      }
  
      if (loggedInConsumerId === adminId.toString()) {
        navigate(`/community-page/${communityId}/admin`);
      } else {
        navigate(`/community-page/${communityId}/member`);
      }
    } catch (error) {
      console.error("Error fetching community details:", error);
      alert(error.message || "An error occurred while fetching community details.");
    }
  };

  return (
    <div className="krishi-commdet-main-container">
      <Navbar3 />
      
      <div className="krishi-commdet-center-container">
        {showInstructions ? (
          <div className="krishi-commdet-instruction-card">
            <div className="krishi-commdet-instruction-header">
              <h2>Welcome to Your Community!</h2>
              <p>Here's how your Krishisetu community works:</p>
            </div>
            
            <div className="krishi-commdet-instruction-points">
              <div className="krishi-commdet-point-item">
                <div className="krishi-commdet-point-icon">
                  <i className="fas fa-users-cog"></i>
                </div>
                <div className="krishi-commdet-point-content">
                  <h3>Admin Privileges</h3>
                  <p>You manage the group, adding or removing members as needed.</p>
                </div>
              </div>
              
              <div className="krishi-commdet-point-item">
                <div className="krishi-commdet-point-icon">
                  <i className="fas fa-truck"></i>
                </div>
                <div className="krishi-commdet-point-content">
                  <h3>Delivery Control</h3>
                  <p>Set and manage the delivery schedule and location for everyone.</p>
                </div>
              </div>
              
              <div className="krishi-commdet-point-item">
                <div className="krishi-commdet-point-icon">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <div className="krishi-commdet-point-content">
                  <h3>Individual Billing</h3>
                  <p>Each member receives their own bill for transparency.</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleAgree} 
              className="krishi-commdet-primary-btn"
            >
              Got It! Let's Continue
            </button>
          </div>
        ) : (
          <div className="krishi-commdet-form-card">
            <div className="krishi-commdet-form-header">
              <h2>Community Delivery Setup</h2>
              <p>Set up your community's shared delivery information</p>
            </div>
            
            <div className="krishi-commdet-form-group">
              <div className="krishi-commdet-form-field">
                <label>Delivery Address</label>
                <input
                  type="text"
                  placeholder="Enter full delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <small>This should be a location convenient for all members</small>
              </div>
              
              <div className="krishi-commdet-datetime-fields">
                <div className="krishi-commdet-form-field">
                  <label>Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
                
                <div className="krishi-commdet-form-field">
                  <label>Delivery Time</label>
                  <input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                  />
                  <small>Choose a time when most members are available</small>
                </div>
              </div>
            </div>
            
            {error && <div className="krishi-commdet-error-message">{error}</div>}
            
            <div className="krishi-commdet-action-buttons">
              <button 
                onClick={handleSave} 
                className="krishi-commdet-primary-btn"
              >
                Save Community Details
              </button>
              
              {saved && (
                <button 
                  onClick={handleViewCommunity} 
                  className="krishi-commdet-secondary-btn"
                >
                  Go to Community Dashboard
                  <i className="fas fa-arrow-right"></i>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityDetails;