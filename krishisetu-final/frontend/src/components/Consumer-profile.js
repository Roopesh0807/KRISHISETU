import React, { useState } from "react";
import "./ConsumerProfile.css";

const ConsumerProfile = () => {
  const [profile, setProfile] = useState({
    name: "your name",
    mobile: "your phone number",
    email: "your email",
    address: "your address",
    photo: "",
    preferredPaymentMethod: "payment method",
    subscriptionMethod: ["week", "day", "month"],
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubscriptionChange = (e) => {
    const { value, checked } = e.target;
    let updatedSubscriptions = [...profile.subscriptionMethod];
    if (checked) {
      updatedSubscriptions.push(value);
    } else {
      updatedSubscriptions = updatedSubscriptions.filter((item) => item !== value);
    }
    setProfile({ ...profile, subscriptionMethod: updatedSubscriptions });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfile({ ...profile, photo: "" });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="profile-container">
      <h2>Consumer Profile</h2>
      <div className="profile-photo">
        {profile.photo ? (
          <div className="photo-container">
            <img src={profile.photo} alt="Profile" className="photo-preview" />
          </div>
        ) : (
          <div className="photo-placeholder">No Image</div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          id="photo-upload"
          style={{ display: "none" }}
        />
        <div className="photo-buttons">
          <label htmlFor="photo-upload" className="upload-photo-btn">
            {profile.photo ? "Change Photo" : "Add Photo"}
          </label>
          {profile.photo && (
            <button className="remove-photo-btn" onClick={handleRemovePhoto}>
              Remove Photo
            </button>
          )}
        </div>
      </div>
      <div className="profile-fields">
        <label>Name:</label>
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        ) : (
          <p>{profile.name}</p>
        )}

        <label>Phone Number:</label>
        {isEditing ? (
          <input
            type="text"
            name="mobile"
            value={profile.mobile}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        ) : (
          <p>{profile.mobile}</p>
        )}

        <label>Email Address:</label>
        {isEditing ? (
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            placeholder="Enter your email address"
          />
        ) : (
          <p>{profile.email}</p>
        )}

        <label>Residential Address:</label>
        {isEditing ? (
          <input
            type="text"
            name="address"
            value={profile.address}
            onChange={handleChange}
            placeholder="Enter your address"
          />
        ) : (
          <p>{profile.address}</p>
        )}

        <label>Preferred Payment Method:</label>
        {isEditing ? (
          <select
            name="preferredPaymentMethod"
            value={profile.preferredPaymentMethod}
            onChange={handleChange}
          >
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="UPI">UPI</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
          </select>
        ) : (
          <p>{profile.preferredPaymentMethod}</p>
        )}

        <label>Subscription Method:</label>
        {isEditing ? (
          <div className="subscription-method">
            <label>
              <input
                type="checkbox"
                name="subscriptionMethod"
                value="Daily"
                checked={profile.subscriptionMethod.includes("Daily")}
                onChange={handleSubscriptionChange}
              />
              Daily
            </label>
            <label>
              <input
                type="checkbox"
                name="subscriptionMethod"
                value="Weekly"
                checked={profile.subscriptionMethod.includes("Weekly")}
                onChange={handleSubscriptionChange}
              />
              Weekly
            </label>
            <label>
              <input
                type="checkbox"
                name="subscriptionMethod"
                value="Monthly"
                checked={profile.subscriptionMethod.includes("Monthly")}
                onChange={handleSubscriptionChange}
              />
              Monthly
            </label>
          </div>
        ) : (
          <p>{profile.subscriptionMethod.join(", ")}</p>
        )}
      </div>
      <button onClick={toggleEdit} className="edit-save-btn">
        {isEditing ? "Save" : "Edit"}
      </button>
    </div>
  );
};

export default ConsumerProfile;