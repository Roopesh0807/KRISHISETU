import React, { useState, useEffect } from "react";
import axios from "axios";
import "./../styles/Profile.css";

const Profile = ({ userId }) => {
  const [profilePic, setProfilePic] = useState(null);
  
  const [formData, setFormData] = useState({
   
    email: "",
    contact: "",
    adharNo: "",
    residentialAddress: "",
    bankAccountNo: "",
    ifscCode: "",
    upiId: "",
    AdharProof:"",
    dob: "",
    gender: "",
    farmAddress: "",
    farmSize: "",
    typesOfCrops: "",
    farmingMethod: "",
    soilType: "",
    waterResources: "",
    farmEquipment: "",
    LandOwnerShipProof:"",
    photoofFarm:"",
    LandLeaseProof:"",
    certifications: "",
  });

  const [activeTab, setActiveTab] = useState("personal");
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [errors] = useState({});

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`/api/getUserDetails/${userId}`);
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);
  

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };
  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const formData = new FormData();
  //     formData.append("profilePic", file);
  //     axios.post("/api/uploadProfilePic", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     })
  //     .then(response => console.log("Uploaded successfully"))
  //     .catch(error => console.error("Upload failed", error));
  //   }
  // };
  const handleRemoveProfilePic = () => {
    setProfilePic(null);
  };

  const handleSavePersonalDetails = async () => {
    try {
      await axios.post("/api/updatepersonaldetails", {
        user_id: userId,
        email: formData.email,
        contact: formData.contact,
        identification_number: formData.adharNo,
        address: formData.residentialAddress,
        bank_account_no: formData.bankAccountNo,
        ifsc_code: formData.ifscCode,
        upi_id: formData.upiId,
        date_of_birth: formData.dob,
        gender: formData.gender,
        AdharProof: formData.AdharProof
      });
  
      setIsEditingPersonal(false);
      alert("Personal Details Updated Successfully!");
    } catch (error) {
      console.error("Error updating personal details:", error);
      alert("Failed to update personal details.");
    }
  };
  
  const handleSaveFarmDetails = async () => {
    try {
      await axios.post("/api/updatefarmdetails", {
        user_id: userId,
        farm_name: "My Farm",
        location: formData.farmAddress,
        land_size: formData.farmSize,
        farming_type: formData.farmingMethod,
        soil_type: formData.soilType,
        irrigation_method: formData.waterResources,
        types_of_crops: formData.typesOfCrops,
        farm_equipment: formData.farmEquipment,
        LandOwnerShipProof: formData.LandOwnerShipProof,
        photoofFarm: formData.photoofFarm,
        LandLeaseProof: formData.LandLeaseProof,
        certifications: formData.certifications
      });
  
      setIsEditingFarm(false);
      alert("Farm Details Updated Successfully!");
    } catch (error) {
      console.error("Error updating farm details:", error);
      alert("Failed to update farm details.");
    }
  };
  

  return (
    <div className="profile-page">
      <div className="profile-content">
        <h2>Farmer Profile</h2>

        {/* Profile Picture Section */}
        <div className="profile-pic-container">
          {!profilePic ? (
            <div className="no-photo-message">No photo uploaded</div>
          ) : (
            <img src={profilePic} alt="Profile" className="profile-img" />
          )}
        </div>

        {/* Photo Options */}
        <div className="photo-options-container">
          {!profilePic ? (
            <div className="photo-options">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                id="upload-photo"
                style={{ display: "none" }}
              />
              <label htmlFor="upload-photo" className="upload-btn">
                Upload Photo
              </label>
            </div>
          ) : (
            <div className="photo-options">
              <button onClick={handleRemoveProfilePic} className="remove-btn">
                Remove Photo
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                id="change-photo"
                style={{ display: "none" }}
              />
              <label htmlFor="change-photo" className="change-btn">
                Change Photo
              </label>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            onClick={() => setActiveTab("personal")}
            className={activeTab === "personal" ? "active" : ""}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab("farm")}
            className={activeTab === "farm" ? "active" : ""}
          >
            Farm Details
          </button>
        </div>

        {/* Personal Details Section */}
        {activeTab === "personal" && !isEditingPersonal && (
          <div className="personal-details">
            <h3>Personal Details</h3>
            <div className="details-container">
              <div className="details-box">
                <p><strong>Date of Birth:</strong> {formData.dob}</p>
                <p><strong>Gender:</strong> {formData.gender}</p>
                <p><strong>Contact No:</strong> {formData.contact}</p>
                <p><strong>Aadhar No:</strong> {formData.adharNo}</p>
                <p><strong>Adhar proof:</strong> {formData.AdharProof}</p>
                <p><strong>Residential Address:</strong> {formData.residentialAddress}</p>
                <p><strong>Bank Account No:</strong> {formData.bankAccountNo}</p>
                <p><strong>IFSC Code:</strong> {formData.ifscCode}</p>
                <p><strong>UPI ID:</strong> {formData.upiId}</p>
                <button onClick={() => setIsEditingPersonal(true)}>Edit Personal Details</button>
              </div>
            </div>
          </div>
        )}

        {/* Personal Details Form (Editable) */}
        {activeTab === "personal" && isEditingPersonal && (
          <div className="personal-details-form">
            <h3>Edit Personal Details</h3>
            <div className="details-container">
              <div className="details-box">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
                {errors.dob && <span className="error">{errors.dob}</span>}

                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="error">{errors.gender}</span>}

                <label>Contact No</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                />
                {errors.contact && <span className="error">{errors.contact}</span>}

                <label>Aadhar No</label>
                <input
                  type="text"
                  name="adharNo"
                  value={formData.adharNo}
                  onChange={handleInputChange}
                />
                {errors.adharNo && <span className="error">{errors.adharNo}</span>}

                <label>Residential Address</label>
                <textarea
                  name="residentialAddress"
                  value={formData.residentialAddress}
                  onChange={handleInputChange}
                ></textarea>
                {errors.residentialAddress && (
                  <span className="error">{errors.residentialAddress}</span>
                )}

                <label>Bank Account No</label>
                <input
                  type="text"
                  name="bankAccountNo"
                  value={formData.bankAccountNo}
                  onChange={handleInputChange}
                />
                {errors.bankAccountNo && (
                  <span className="error">{errors.bankAccountNo}</span>
                )}

                <label>IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                />
                {errors.ifscCode && <span className="error">{errors.ifscCode}</span>}

                <label>UPI ID</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                />
                {errors.upiId && <span className="error">{errors.upiId}</span>}

                <button onClick={handleSavePersonalDetails}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Farm Details Section */}
        {activeTab === "farm" && !isEditingFarm && (
          <div className="farm-details">
            <h3>Farm Details</h3>
            <div className="details-container">
              <div className="details-box">
                <p><strong>Farm Address:</strong> {formData.farmAddress}</p>
                <p><strong>Farm Size:</strong> {formData.farmSize}</p>
                <p><strong>Types of Crops Grown:</strong> {formData.typesOfCrops}</p>
                <p><strong>Farming Method:</strong> {formData.farmingMethod}</p>
                <p><strong>Soil Type:</strong> {formData.soilType}</p>
                <p><strong>Water Resources:</strong> {formData.waterResources}</p>
                <p><strong>Farm Equipment:</strong> {formData.farmEquipment}</p>
                <p><strong>Certifications:</strong> {formData.certifications}</p>
                <p><strong>Land ownership proof:</strong> {formData.LandOwnerShipProof}</p>
                <p><strong>Land lease agreement proof:</strong> {formData.LandLeaseProof}</p>
                <p><strong>photo of a farm:</strong> {formData.photoofFarm}</p>
                <button onClick={() => setIsEditingFarm(true)}>Edit Farm Details</button>
              </div>
            </div>
          </div>
        )}

        {/* Farm Details Form (Editable) */}
        {activeTab === "farm" && isEditingFarm && (
          <div className="farm-details-form">
            <h3>Edit Farm Details</h3>
            <div className="details-container">
              <div className="details-box">
                <label>Farm Address</label>
                <input
                  type="text"
                  name="farmAddress"
                  value={formData.farmAddress}
                  onChange={handleInputChange}
                />
                {errors.farmAddress && <span className="error">{errors.farmAddress}</span>}

                <label>Farm Size</label>
                <input
                  type="text"
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleInputChange}
                />
                {errors.farmSize && <span className="error">{errors.farmSize}</span>}

                <label>Types of Crops Grown</label>
                <input
                  type="text"
                  name="typesOfCrops"
                  value={formData.typesOfCrops}
                  onChange={handleInputChange}
                />
                {errors.typesOfCrops && <span className="error">{errors.typesOfCrops}</span>}

                <label>Farming Method</label>
                <input
                  type="text"
                  name="farmingMethod"
                  value={formData.farmingMethod}
                  onChange={handleInputChange}
                />
                {errors.farmingMethod && (
                  <span className="error">{errors.farmingMethod}</span>
                )}

                <label>Soil Type</label>
                <input
                  type="text"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                />
                {errors.soilType && <span className="error">{errors.soilType}</span>}

                <label>Water Resources</label>
                <input
                  type="text"
                  name="waterResources"
                  value={formData.waterResources}
                  onChange={handleInputChange}
                />
                {errors.waterResources && (
                  <span className="error">{errors.waterResources}</span>
                )}

                <label>Farm Equipment</label>
                <input
                  type="text"
                  name="farmEquipment"
                  value={formData.farmEquipment}
                  onChange={handleInputChange}
                />
                {errors.farmEquipment && (
                  <span className="error">{errors.farmEquipment}</span>
                )}

                <label>Certifications</label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                />
                {errors.certifications && (
                  <span className="error">{errors.certifications}</span>
                )}

                <button onClick={handleSaveFarmDetails}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;