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
    city: "", // Add this
    state: "", // Add this
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
      setError("Consumer ID is missing");
      setLoading(false);
      return;
    }
  
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `http://localhost:5000/api/consumer/${consumer_id}`,
          {
            headers: {
              "Authorization": `Bearer ${consumer?.token}`
            }
          }
        );
  
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
  
        const data = await response.json();
        // Construct proper photo URL if it exists
      const photoUrl = data.photo 
      ? data.photo.startsWith('http') 
        ? data.photo 
        : `http://localhost:5000${data.photo}`
      : null;


      
        setProfile({
          consumer_id: data.consumer_id,
          first_name: data.first_name,
          last_name: data.last_name,
          name: data.full_name,
          email: data.email,
          phone_number: data.phone_number,
          address: data.address,
          pincode: data.pincode,
          location: data.location,
          city: data.city, // Add this
          state: data.state, // Add this
          photo: photoUrl,
          preferred_payment_method: data.preferred_payment_method,
          subscription_method: data.subscription_method
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    if (consumer_id) fetchProfile();
  }, [consumer_id, consumer?.token]);
  const ProfileAvatar = React.memo(({ photo, isEditing, onUploadClick }) => {
    const [imgSrc, setImgSrc] = useState(photo);
  
    useEffect(() => {
      if (photo) {
        setImgSrc(`${photo}?t=${Date.now()}`);
      } else {
        setImgSrc(null);
      }
    }, [photo]);
  
    return (
      <div className="ks-profile-avatar-wrapper">
        {imgSrc ? (
          <img 
            src={imgSrc}
            alt="Profile"
            className="ks-profile-avatar"
            onError={() => setImgSrc(null)}
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
    );
  });
  // In your main component's render:
<ProfileAvatar 
  photo={profile.photo ? `${profile.photo}?t=${Date.now()}` : null}
  isEditing={isEditing}
  onUploadClick={() => document.getElementById('ks-photo-upload').click()}
/>
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
          city: data[0].PostOffice[0].District, // Set city same as district
        state: data[0].PostOffice[0].State // Add state
        }));
      }
    } catch (err) {
      console.error("Error fetching location:", err);
    }
  };

  // const handlePhotoUpload = async (e) => {
  //   const file = e.target.files[0];
    
  //   if (!file) {
  //     setError("No file selected");
  //     return;
  //   }
  
  //   // Validate file type and size
  //   if (!file.type.startsWith('image/')) {
  //     setError("Please upload an image file (JPEG, PNG)");
  //     return;
  //   }
  
  //   if (file.size > 5 * 1024 * 1024) { // 5MB limit
  //     setError("File size should be less than 5MB");
  //     return;
  //   }
  
  //   const formData = new FormData();
  //   formData.append('photo', file); // Must match the field name in Multer
  
  //   try {
  //     setLoading(true);
  //     const response = await fetch(
  //       `http://localhost:5000/api/upload/${profile.consumer_id}`,
  //       {
  //         method: "POST",
  //         body: formData,
  //         headers: {
  //           "Authorization": `Bearer ${consumer?.token}`
  //         }
  //         // Don't set Content-Type header - let browser set it with boundary
  //       }
  //     );
  
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || "Failed to upload photo");
  //     }
  
  //     const data = await response.json();
      
  //     // Use the photoUrl from the response
  //     setProfile(prev => ({
  //       ...prev,
  //       photo: data.photoUrl
  //     }));
      
  //     setError(null);
  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     setError(error.message);
  //   } finally {
  //     setLoading(false);
  //     e.target.value = null; // Reset file input
  //   }
  // };
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('photo', file);
  
      const response = await fetch(
        `http://localhost:5000/api/upload/${profile.consumer_id}`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Authorization": `Bearer ${consumer?.token}`
          }
        }
      );
  
      if (!response.ok) throw new Error("Upload failed");
  
      const data = await response.json();
      
      // Update state optimistically without causing flicker
      setProfile(prev => ({
        ...prev,
        photo: `${data.photoUrl}?t=${Date.now()}` // Add timestamp to force refresh
      }));
  
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset input
    }
  };
  
  const removePhoto = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/remove-photo/${profile.consumer_id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${consumer?.token}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to remove photo");
      }
  
      setProfile(prev => ({ ...prev, photo: null }));
      setError(null);
    } catch (error) {
      console.error("Remove error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Prepare the updated data
      const updatedData = {
        address: profile.address,
        pincode: profile.pincode,
        location: profile.location,
        city: profile.city, // Add this
        state: profile.state, // Add this
        preferred_payment_method: profile.preferred_payment_method,
        subscription_method: profile.subscription_method
      };
  
      const response = await fetch(
        `http://localhost:5000/api/consumerprofile/${profile.consumer_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${consumer?.token}`
          },
          body: JSON.stringify(updatedData)
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
  
      // Get the full updated profile data from the server
      const updatedProfileResponse = await fetch(
        `http://localhost:5000/api/consumer/${profile.consumer_id}`,
        {
          headers: {
            "Authorization": `Bearer ${consumer?.token}`
          }
        }
      );
  
      if (!updatedProfileResponse.ok) {
        throw new Error("Failed to fetch updated profile");
      }
  
      const updatedProfileData = await updatedProfileResponse.json();
      
      // Single state update with all changes
      setProfile(prev => ({
        ...prev,
        ...updatedProfileData,
        photo: updatedProfileData.photo 
          ? updatedProfileData.photo.startsWith('http') 
            ? updatedProfileData.photo 
            : `http://localhost:5000${updatedProfileData.photo}`
          : null
      }));
  
      setIsEditing(false);
      
      // Show success feedback
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Save error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
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

 
  
  const ImageWithFallback = ({ src, alt, className, fallbackSrc }) => {
    const [imgSrc, setImgSrc] = useState(src);
  
    return (
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={() => setImgSrc(fallbackSrc || '/default-avatar.jpg')}
      />
    );
  };
  
  // Then use it in your JSX:
  <ImageWithFallback 
    src={`${profile.photo}?${Date.now()}`}
    alt="Profile"
    className="ks-profile-avatar"
    fallbackSrc="/default-avatar.jpg"
  />
  

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
      src={`${profile.photo}?${Date.now()}`} // Add timestamp to prevent caching
      alt="Profile"
      className="ks-profile-avatar"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/default-avatar.jpg'; // Fallback image
      }}
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
                <div className="ks-profile-field">
    <label className="ks-profile-label">
      <i className="fas fa-city ks-field-icon"></i> City
    </label>
    {isEditing ? (
      <input 
        type="text" 
        name="city" 
        value={profile.city} 
        onChange={handleChange} 
        className="ks-profile-input"
        placeholder="Enter your city" 
      />
    ) : (
      <div className="ks-profile-value">{profile.city || "Not provided"}</div>
    )}
  </div>

  <div className="ks-profile-field">
    <label className="ks-profile-label">
      <i className="fas fa-map-marked-alt ks-field-icon"></i> State
    </label>
    {isEditing ? (
      <input 
        type="text" 
        name="state" 
        value={profile.state} 
        onChange={handleChange} 
        className="ks-profile-input"
        placeholder="Enter your state" 
      />
    ) : (
      <div className="ks-profile-value">{profile.state || "Not provided"}</div>
    )}
 
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