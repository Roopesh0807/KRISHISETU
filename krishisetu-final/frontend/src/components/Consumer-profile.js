import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ConsumerProfile.css";
import { useAuth } from '../context/AuthContext';


const ConsumerProfile = () => {
  const { consumer_id } = useParams();
  const [profile, setProfile] = useState({
    consumer_id: "",
    name: "",
    phone_number: "",
    email: "",
    address: "",
    pincode: "",
    location: "",
    photo: "",
    preferred_payment_method: "",
    subscription_method: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { consumer } = useAuth();
  useEffect(() => {
    if (!consumer_id) {
      setError("Consumer ID is missing.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/consumer/${consumer_id}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${consumer?.token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }

        const data = await response.json();
        setProfile({
          ...data,
          subscription_method: data.subscription_method || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [consumer_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));

    if (name === "pincode" && value.length === 6) {
      fetchLocationFromPincode(value);
    }
  };

  const fetchLocationFromPincode = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      if (data[0].Status === "Success") {
        setProfile((prevProfile) => ({
          ...prevProfile,
          location: data[0].PostOffice[0].District,
        }));
      }
    } catch (err) {
      console.error("Error fetching location:", err);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
  
    if (!file) {
      console.error("No file selected.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch(`http://localhost:5000/api/upload/${consumer_id}`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${consumer?.token}`
        }
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }
  
      const data = await response.json();
      setProfile((prevProfile) => ({
        ...prevProfile,
        photo: `http://localhost:5000${data.filePath}?t=${Date.now()}`,
      }));
  
      e.target.value = null;
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };
  
  const removePhoto = async () => {
    try {
       const response = await fetch(`http://localhost:5000/remove-photo/${profile.consumer_id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${consumer?.token}`,
        },
      });
  
      if (response.ok) {
        setProfile({ ...profile, photo: "" });
        alert("Photo removed successfully");
      } else {
        alert("Failed to remove photo");
      }
    } catch (error) {
      console.error("Error removing photo:", error);
      alert("Something went wrong");
    }
  };
  
  const handleSave = async () => {
    try {
      if (!consumer_id) {
        console.error("Consumer ID is missing");
        setError("Consumer ID is missing");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/consumerprofile/${consumer_id}`, {
        "Authorization": `Bearer ${consumer?.token}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${consumer?.token}`
        },
        body: JSON.stringify({
          address: profile.address,
          pincode: profile.pincode,
          location: profile.location,
          preferred_payment_method: profile.preferred_payment_method,
          subscription_method: profile.subscription_method
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to update profile: ${errorMessage}`);
      }

      const updatedData = await response.json();
      setProfile(prevProfile => ({
        ...prevProfile,
        address: updatedData.address || prevProfile.address,
        pincode: updatedData.pincode || prevProfile.pincode,
        location: updatedData.location || prevProfile.location,
        preferred_payment_method: updatedData.preferred_payment_method || prevProfile.preferred_payment_method,
        subscription_method: updatedData.subscription_method || prevProfile.subscription_method
      }));
      
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="ks-profile-loading">
      <div className="ks-spinner"></div>
      <p>Loading profile...</p>
    </div>
  );
  
  if (error) return (
    <div className="ks-profile-error">
      <div className="ks-error-icon">!</div>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="ks-profile-container">
      <div className="ks-profile-card">
        <div className="ks-profile-header">
          <div className="ks-profile-header-content">
            <h2 className="ks-profile-title">
              <i className="fas fa-user-circle ks-title-icon"></i>
              Consumer Profile
            </h2>
            <p className="ks-profile-subtitle">Manage your account details</p>
          </div>
          <div className="ks-profile-actions">
            <button 
              onClick={isEditing ? handleSave : () => setIsEditing(true)} 
              className={`ks-profile-action-btn ${isEditing ? 'ks-save-btn' : 'ks-edit-btn'}`}
            >
              {isEditing ? (
                <>
                  <i className="fas fa-save"></i> Save Changes
                </>
              ) : (
                <>
                  <i className="fas fa-edit"></i> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        <div className="ks-profile-content">
          <div className="ks-profile-photo-section">
            <div className="ks-profile-avatar-wrapper">
              {profile.photo ? (
                <img 
                  src={`${profile.photo}?t=${Date.now()}`}
                  alt="Profile"
                  className="ks-profile-avatar"
                />
              ) : (
                <div className="ks-profile-avatar-placeholder">
                  <i className="fas fa-user-circle ks-default-avatar-icon"></i>
                </div>
              )}
              {isEditing && (
                <label htmlFor="ks-photo-upload" className="ks-profile-avatar-edit">
                  <i className="fas fa-camera"></i>
                </label>
              )}
            </div>
            
            {isEditing && (
              <div className="ks-profile-photo-actions">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  id="ks-photo-upload"
                  className="ks-photo-upload-input"
                />
                <label htmlFor="ks-photo-upload" className="ks-photo-upload-btn">
                  <i className="fas fa-camera"></i> {profile.photo ? "Change Photo" : "Upload Photo"}
                </label>
                {profile.photo && (
                  <button onClick={removePhoto} className="ks-photo-remove-btn">
                    <i className="fas fa-trash"></i> Remove
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="ks-profile-details">
            <div className="ks-profile-detail-group">
              <div className="ks-profile-section-header">
                <i className="fas fa-user ks-section-icon"></i>
                <h3 className="ks-profile-section-title">Personal Information</h3>
              </div>
              <div className="ks-profile-grid">
                <div className="ks-profile-field">
                  <label className="ks-profile-label">
                    <i className="fas fa-signature ks-field-icon"></i> Full Name
                  </label>
                  <div className="ks-profile-value">{profile.name || "Not provided"}</div>
                </div>

                <div className="ks-profile-field">
                  <label className="ks-profile-label">
                    <i className="fas fa-mobile-alt ks-field-icon"></i> Mobile Number
                  </label>
                  <div className="ks-profile-value">{profile.phone_number || "Not provided"}</div>
                </div>

                <div className="ks-profile-field">
                  <label className="ks-profile-label">
                    <i className="fas fa-envelope ks-field-icon"></i> Email Address
                  </label>
                  <div className="ks-profile-value">{profile.email || "Not provided"}</div>
                </div>
              </div>
            </div>

            <div className="ks-profile-detail-group">
              <div className="ks-profile-section-header">
                <i className="fas fa-map-marker-alt ks-section-icon"></i>
                <h3 className="ks-profile-section-title">Address Information</h3>
              </div>
              <div className="ks-profile-grid">
                <div className="ks-profile-field">
                  <label className="ks-profile-label">
                    <i className="fas fa-home ks-field-icon"></i> Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address" 
                      value={profile.address} 
                      onChange={handleChange} 
                      className="ks-profile-textarea"
                      placeholder="Enter your address" 
                      rows="3"
                    />
                  ) : (
                    <div className="ks-profile-value">{profile.address || "Not provided"}</div>
                  )}
                </div>

                <div className="ks-profile-field">
                  <label className="ks-profile-label">
                    <i className="fas fa-map-pin ks-field-icon"></i> Pincode
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="pincode" 
                      value={profile.pincode} 
                      onChange={handleChange} 
                      className="ks-profile-input"
                      placeholder="Enter your pincode" 
                      maxLength="6"
                    />
                  ) : (
                    <div className="ks-profile-value">{profile.pincode || "Not provided"}</div>
                  )}
                </div>

                <div className="ks-profile-field">
                  <label className="ks-profile-label">
                    <i className="fas fa-city ks-field-icon"></i> Location
                  </label>
                  <div className="ks-profile-value">{profile.location || "Not provided"}</div>
                </div>
              </div>
            </div>

            <div className="ks-profile-detail-group">
              <div className="ks-profile-section-header">
                <i className="fas fa-cog ks-section-icon"></i>
                <h3 className="ks-profile-section-title">Preferences</h3>
              </div>
              <div className="ks-profile-grid">
                <div className="ks-profile-field">
                  <label className="ks-profile-label">
                    <i className="fas fa-wallet ks-field-icon"></i> Payment Method
                  </label>
                  {isEditing ? (
                    <select 
                      name="preferred_payment_method" 
                      value={profile.preferred_payment_method} 
                      onChange={handleChange}
                      className="ks-profile-select"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                    </select>
                  ) : (
                    <div className="ks-profile-value">{profile.preferred_payment_method || "Not specified"}</div>
                  )}
                </div>

                <div className="ks-profile-field">
                  <label className="ks-profile-label">
                    <i className="fas fa-calendar-check ks-field-icon"></i> Subscription
                  </label>
                  {isEditing ? (
                    <select 
                      name="subscription_method" 
                      value={profile.subscription_method} 
                      onChange={handleChange}
                      className="ks-profile-select"
                    >
                      <option value="">Select Subscription</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  ) : (
                    <div className="ks-profile-value">{profile.subscription_method || "Not specified"}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerProfile;