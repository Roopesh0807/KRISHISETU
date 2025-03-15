import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ConsumerProfile.css";

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
  // const [ removePhoto, handleRemovePhoto] = useState(null);
  // const [selectedFile, setSelectedFile] = useState(null);
  useEffect(() => {
    console.log("Consumer ID in useEffect:", consumer_id);

    if (!consumer_id) {
      setError("Consumer ID is missing.");
      setLoading(false);
      return;
    }
  
    const fetchProfile = async () => {
      try {
        console.log("Fetching Profile for:", consumer_id);  // ✅ Debugging Log
  
        const response = await fetch(`http://localhost:5000/api/consumer/${consumer_id}`);
        console.log("Response Status:", response.status);  // ✅ Debugging Log
  
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Fetched Data:", data);  // ✅ Debugging Log
  
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
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }
  
      const data = await response.json();
      console.log("Photo uploaded successfully:", data);
  
      // **Force React to Fetch the New Image**
      setProfile((prevProfile) => ({
        ...prevProfile,
        photo: `http://localhost:5000${data.filePath}?t=${Date.now()}`, // Force refresh
      }));
  
      // **Reset the file input so React detects the same file again**
      e.target.value = null;
  
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };
  
  // const handleProfileUpdate = async (userId, profileData, file) => {
  //   const formData = new FormData();
  
  //   // Append profile data
  //   for (const key in profileData) {
  //     formData.append(key, profileData[key]);
  //   }
  
  //   // Append the file if it exists
  //   if (file) {
  //     formData.append("photo", file);
  //   }
  
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/consumer/${userId}`, {
  //       method: "PUT",
  //       body: formData,
  //     });
  
  //     if (!response.ok) {
  //       throw new Error("Failed to update profile");
  //     }
  
  //     const data = await response.json();
  //     console.log("Profile updated successfully:", data);
  //     setProfile(data); // Update the profile state with the response
  //   } catch (error) {
  //     console.error("Error updating profile:", error);
  //   }
  // };
  
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  
  //   const profileData = {
  //     address: profile.address,
  //     pincode: profile.pincode,
  //     location: profile.location,
  //     preferred_payment_method: profile.preferred_payment_method,
  //     subscription_method: profile.subscription_method,
  //   };
  
  //   // Define the file variable (e.g., get it from a file input)
  //   const fileInput = document.getElementById("photo-upload");
  //   const file = fileInput?.files[0]; // Use optional chaining to avoid errors
  
  //   if (file) {
  //     await handleProfileUpdate(consumer_id, profileData, file);
  //   } else {
  //     console.error("No file selected.");
  //   }
  // };

  const removePhoto = async () => {
    try {
      const response = await fetch(`http://localhost:5000/remove-photo/${profile.consumer_id}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        setProfile({ ...profile, photo: null }); // Update state
        alert("Photo removed successfully");
      } else {
        alert("Failed to remove photo");
      }
    } catch (error) {
      console.error("Error removing photo:", error);
      alert("Something went wrong");
    }
  };
  
  
  
  const saveProfile = async () => {
    try {
        // Ensure consumer_id exists before making a request
        if (!consumer_id) {
            console.error("Consumer ID is missing");
            setError("Consumer ID is missing");
            return;
        }

        const {
            address = "",
            pincode = "",
            location: profileLocation = "",
            preferred_payment_method = "",
            subscription_method = "",
            photoFile, // This should be a File object (from file input)
        } = profile;

        // 🔹 Create FormData to send image along with other fields
        const formData = new FormData();
        formData.append("address", address);
        formData.append("pincode", pincode);
        formData.append("location", profileLocation);
        formData.append("preferred_payment_method", preferred_payment_method);
        formData.append("subscription_method", subscription_method);

        if (photoFile) {
            formData.append("photo", photoFile); // ✅ Append the image file if provided
        }

        // 🔹 Making the PUT request to update the consumer profile
        const response = await fetch(`http://localhost:5000/api/consumerprofile/${consumer_id}`, {
            method: "PUT",
            body: formData, // ✅ Send as FormData (not JSON)
        });

        // Handling non-successful responses
        if (!response.ok) {
            const errorMessage = await response.text(); // Fetch error message from response
            throw new Error(`Failed to update profile: ${errorMessage}`);
        }

        // Success message
        alert("Profile updated successfully!");

        // ✅ Fetch the updated profile and update state
        const updatedProfile = await response.json();
        setProfile(updatedProfile); // Ensure you have a `setProfile` function for updating state
    } catch (err) {
        console.error("Error updating profile:", err);
        setError(err.message); // Ensure `setError` state exists to show errors in the UI
    }
};



  // Handle save button click
  const handleSave = () => {
    saveProfile();
    setIsEditing(false); // Exit edit mode after saving
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="profile-container">
      <h2>Consumer Profile</h2>
      <div className="profile-photo">
      {profile.photo ? (
    <img 
    src={profile.photo ? `${profile.photo}?t=${Date.now()}` : "/default-avatar.png"} 
    alt="Profile"
    style={{
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "3px solid #007bff"
    }}
  />
  
    
     
) : (
  <div className="photo-placeholder">No Image</div>
)}

     <input
  type="file"
  accept="image/*"
  onChange={handlePhotoUpload} // Ensure this is correctly linked
  id="photo-upload"
  style={{ display: "none" }}
/>

        <div className="photo-buttons">
          <label htmlFor="photo-upload" className="upload-photo-btn">
            {profile.photo ? "Change Photo" : "Add Photo"}
          </label>
          {profile.photo && (
           <button onClick={removePhoto} className="btn btn-danger">
           Remove Photo
         </button>
         
          )}
        </div>
      </div>
      <div className="profile-fields">
        <div>
          <label>Name:</label>
          {isEditing ? (
            <input type="text" name="name" value={profile.name} onChange={handleChange} placeholder="Enter your name" />
          ) : (
            <p>{profile.name}</p>
          )}
        </div>
        <div>
          <label>Mobile Number:</label>
          {isEditing ? (
            <input type="text" name="mobile_number" value={profile.phone_number} onChange={handleChange} placeholder="Enter your mobile number" />
          ) : (
            <p>{profile.phone_number}</p>
          )}
        </div>
        <div>
          <label>Email:</label>
          {isEditing ? (
            <input type="email" name="email" value={profile.email} onChange={handleChange} placeholder="Enter your email" />
          ) : (
            <p>{profile.email}</p>
          )}
        </div>
        <div>
          <label>Address:</label>
          {isEditing ? (
            <input type="text" name="address" value={profile.address} onChange={handleChange} placeholder="Enter your address" />
          ) : (
            <p>{profile.address}</p>
          )}
        </div>
        <div>
          <label>Pincode:</label>
          {isEditing ? (
            <input type="text" name="pincode" value={profile.pincode} onChange={handleChange} placeholder="Enter your pincode" maxLength="6" />
          ) : (
            <p>{profile.pincode}</p>
          )}
        </div>
        <div>
          <label>Location:</label>
          <p>{profile.location}</p>
        </div>
        <div>
          <label>Preferred Payment Method:</label>
          {isEditing ? (
            <select name="preferred_payment_method" value={profile.preferred_payment_method} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="UPI">UPI</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
          ) : (
            <p>{profile.preferred_payment_method}</p>
          )}
        </div>
        <div>
          <label>Subscription Method:</label>
          {isEditing ? (
            <select name="subscription_method" value={profile.subscription_method} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          ) : (
            <p>{profile.subscription_method}</p>
          )}
        </div>
      </div>
      <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className="edit-save-btn">
        {isEditing ? "Save" : "Edit"}
      </button>
    </div>
  );
};

export default ConsumerProfile;
