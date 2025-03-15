// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import "./../styles/Profile.css";

// const Profile = () => {
//   const { farmer_id } = useParams();
//   const [activeTab, setActiveTab] = useState("personal");
//   const [profilePhoto, setProfilePhoto] = useState(null);
//   const [editPersonal, setEditPersonal] = useState(false);
//   const [editFarm, setEditFarm] = useState(false);

  
//   // Personal Details State
//   const [personalDetails, setPersonalDetails] = useState({
//     dob: "",
//     gender: "",
//     contact_no: "",
//     aadhaar_no: "",
//     residential_address: "",
//     bank_account_no: "",
//     ifsc_code: "",
//     bank_branch: "",
//     upi_id: "",
//   });

//   // Farm Details State
//   const [farmDetails, setFarmDetails] = useState({
//     farm_address: "",
//     farm_size: "",
//     crops_grown: "",
//     farming_method: "",
//     soil_type: "",
//     water_sources: "",
//     farm_equipment: "",
//     land_ownership_proof_pdf: null,
//     certification_pdf: null,
//     land_lease_agreement_pdf: null,
//     farm_photographs_pdf: null,
//   });

//   console.log("Extracted farmer_id:", farmer_id);
//   useEffect(() => {
//     if (!farmer_id) {
//       console.error("No farmer_id found in URL parameters");
//       return;
//     }
  
//     axios.get(`http://localhost:5000/farmer/${farmer_id}/personal-details`)
//       .then((res) => setPersonalDetails(res.data))
//       .catch((err) => console.error("Error fetching personal details:", err));
  
//     axios.get(`http://localhost:5000/farmer/${farmer_id}/farm-details`)
//       .then((res) => setFarmDetails(res.data))
//       .catch((err) => console.error("Error fetching farm details:", err));
  
//       axios.get(`http://localhost:5000/farmer/${farmer_id}/profile-photo`)
//       .then((res) => {
//         const imageUrl = res.data.photo.startsWith("http")
//           ? res.data.photo
//           : `http://localhost:5000/uploads/${res.data.photo}`;
//         setProfilePhoto(imageUrl);
//       })
//       .catch((err) => console.error("Error fetching profile photo:", err));
    
//   }, [farmer_id]);
  
// const handlePersonalChange = (e) => {
//   const { name, value } = e.target;
//   setPersonalDetails((prevDetails) => ({ ...prevDetails, [name]: value }));

//   if (name === "ifsc_code" && value.length === 11) {
//     fetchBranchDetails(value);
//   }
// };

// const fetchBranchDetails = async (ifsc) => {
//   try {
//     const res = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
//     setPersonalDetails((prevDetails) => ({
//       ...prevDetails,
//       bank_branch: res.data.BRANCH || "Branch Not Found",
//     }));
//   } catch (error) {
//     console.error("Invalid IFSC Code", error);
//     setPersonalDetails((prevDetails) => ({
//       ...prevDetails,
//       bank_branch: "Invalid IFSC Code",
//     }));
//   }
// };


//   const handleFarmChange = (e) => {
//     const { name, value } = e.target;
//     setFarmDetails({ ...farmDetails, [name]: value });
//   };

//   const handleFileUpload = async (e, fieldName) => {
//     const file = e.target.files[0];
//     if (!file) return;
  
//     const formData = new FormData();
//     formData.append("file", file);
  
//     try {
//       const res = await axios.post(`/api/farmer/${farmer_id}/upload-file`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
  
//       // Assuming the API returns the uploaded file URL
//       setFarmDetails((prevDetails) => ({
//         ...prevDetails,
//         [fieldName]: res.data.fileUrl || file.name, // Store file URL if available
//       }));
  
//       alert("File uploaded successfully!");
//     } catch (error) {
//       console.error("Error uploading file", error);
//       alert("Failed to upload file. Please try again.");
//     }
//   };  

//   const handlePhotoChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
  
//     const formData = new FormData();
//     formData.append("photo", file);
  
//     try {
//       const res = await axios.post(`/api/farmer/${farmer_id}/upload-photo`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
  
//       if (res.data.photo) {
//         setProfilePhoto(`http://localhost:5000/uploads/${res.data.photo}`);
//       } else {
//         alert("Failed to get uploaded photo URL.");
//       }
//     } catch (error) {
//       console.error("Error uploading photo", error);
//       alert("Photo upload failed. Try again.");
//     }
//   };
  
//   const handleRemovePhoto = async () => {
//     try {
//       await axios.delete(`/api/farmer/${farmer_id}/remove-photo`);
//       setProfilePhoto(null); // Replace with a default image
//     } catch (error) {
//       console.error("Error removing photo", error);
//       alert("Failed to remove photo. Please try again.");
//     }
//   };
  


// const handlePersonalSubmit = (e) => {
//     e.preventDefault();
//     console.log("Updating data for farmer_id:", farmer_id); // Debugging

//     if (!farmer_id) {
//         alert("Farmer ID is missing!");
//         return;
//     }

//     axios.put(`/api/farmer/${farmer_id}/personal-details`, personalDetails)
//         .then(() => setEditPersonal(false))
//         .catch((err) => console.error("Error updating personal details:", err));
// };


//   const handleFarmSubmit = (e) => {
//     e.preventDefault();
//     axios.put(`/api/farmer/${farmer_id}/farm-details`, farmDetails).then(() => {
//       setEditFarm(false);
//     });
//   };

//   return (
//     <div className="profile-container">
//       <h2>Farmer Profile</h2>
//       <div className="profile-photo-section">
//         <div className="profile-photo-wrapper">
//           {profilePhoto ? (
//             <img src={profilePhoto} alt="Profile" className="profile-photo" />
//           ) : (
//             <div className="placeholder-photo">No Photo</div>
//           )}
//         </div>
//         <input type="file" id="fileInput" onChange={handlePhotoChange} accept="image/*" hidden />
//         <div className="photo-buttons">
//           {!profilePhoto ? (
//             <label htmlFor="fileInput" className="upload-btn">Upload Photo</label>
//           ) : (
//             <>
//               <label htmlFor="fileInput" className="change-btn">Change Photo</label>
//               <button className="remove-btn" onClick={handleRemovePhoto}>Remove Photo</button>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="tab-buttons">
//       <button
//           onClick={() => setActiveTab("personal")}
//           className={activeTab === "personal" ? "tab-button active" : "tab-button"}
//         >
//           Personal Details
//         </button>

//         <button
//           onClick={() => setActiveTab("farm")}
//           className={activeTab === "farm" ? "tab-button active" : "tab-button"}
//         >
//           Farm Details
//       </button>

//       </div>

//       {/* Personal Details Section */}
//       {activeTab === "personal" && (
//         <div className="profile-form">
//           <h3>Personal Details</h3>
//           {!editPersonal ? (
//             <div>
//               <p>Date of Birth: {personalDetails.dob}</p>
//               <p>Gender: {personalDetails.gender}</p>
//               <p>Contact No: {personalDetails.contact_no}</p>
//               <p>Aadhaar No: {personalDetails.aadhaar_no}</p>
//               <p>Residential Address: {personalDetails.residential_address}</p>
//               <p>IFSC Code: {personalDetails.ifsc_code}</p>
//               <p>Bank Branch: {personalDetails.bank_branch}</p>
//               <button onClick={() => setEditPersonal(true)}>Edit</button>
//             </div>
//           ) : (
//             <form onSubmit={handlePersonalSubmit}>
//               <input type="date" name="dob" value={personalDetails.dob} onChange={handlePersonalChange} required />
//               <select name="gender" value={personalDetails.gender} onChange={handlePersonalChange} required>
//                 <option value="">Select Gender</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//               </select>
//               <input type="text" name="contact_no" placeholder="Contact No" value={personalDetails.contact_no} onChange={handlePersonalChange} required />
//               <input type="text" name="aadhaar_no" placeholder="Aadhaar No" value={personalDetails.aadhaar_no} onChange={handlePersonalChange} required />
//               <textarea name="residential_address" placeholder="Residential Address" value={personalDetails.residential_address} onChange={handlePersonalChange} required />
//               <input 
//                   type="text"
//                   name="ifsc_code"
//                   placeholder="IFSC Code"
//                   value={personalDetails.ifsc_code}
//                   onChange={handlePersonalChange}
//                   onBlur={() => fetchBranchDetails(personalDetails.ifsc_code)} // Fetch on blur
//                   required
//                 />

//               <input type="text" name="bank_branch" placeholder="Bank Branch" value={personalDetails.bank_branch} disabled />
//               <button type="submit">Save</button>
//               <button type="button" onClick={() => setEditPersonal(false)}>Cancel</button>
//             </form>
//           )}
//         </div>
//       )}

//       {/* Farm Details Section */}
//       {activeTab === "farm" && (
//         <div className="profile-form">
//           <h3>Farm Details</h3>
//           {!editFarm ? (
//             <div>
//               <p>Farm Address: {farmDetails.farm_address}</p>
//               <p>Farm Size: {farmDetails.farm_size}</p>
//               <p>Crops Grown: {farmDetails.crops_grown}</p>
//               <p>Farming Method: {farmDetails.farming_method}</p>
//               <p>Soil Type: {farmDetails.soil_type}</p>
//               <p>Water Sources: {farmDetails.water_sources}</p>
//               <p>Farm Equipment: {farmDetails.farm_equipment}</p>
//               <p>Land Ownership Proof: {farmDetails.land_ownership_proof_pdf ? "Uploaded" : "Not Uploaded"}</p>
//               <p>Certification: {farmDetails.certification_pdf ? "Uploaded" : "Not Uploaded"}</p>
//               <p>Land Lease Agreement: {farmDetails.land_lease_agreement_pdf ? "Uploaded" : "Not Uploaded"}</p>
//               <p>Farm Photographs: {farmDetails.farm_photographs_pdf ? "Uploaded" : "Not Uploaded"}</p>
//               <button onClick={() => setEditFarm(true)}>Edit</button>
//             </div>
//           ) : (
//             <form onSubmit={handleFarmSubmit}>
//               <input type="text" name="farm_address" placeholder="Farm Address" value={farmDetails.farm_address} onChange={handleFarmChange} required />
//               <input type="text" name="farm_size" placeholder="Farm Size (acres)" value={farmDetails.farm_size} onChange={handleFarmChange} required />
//               <textarea name="crops_grown" placeholder="Crops Grown" value={farmDetails.crops_grown} onChange={handleFarmChange} required />
//               <input type="text" name="farming_method" placeholder="Farming Method" value={farmDetails.farming_method} onChange={handleFarmChange} required />
//               <input type="text" name="soil_type" placeholder="Soil Type" value={farmDetails.soil_type} onChange={handleFarmChange} required />
//               <input type="text" name="water_sources" placeholder="Water Sources" value={farmDetails.water_sources} onChange={handleFarmChange} required />
//               <input type="text" name="farm_equipment" placeholder="Farm Equipment" value={farmDetails.farm_equipment} onChange={handleFarmChange} required />
//               <div>
//                 <label>Land Ownership Proof:</label>
//                 <input type="file" onChange={(e) => handleFileUpload(e, "land_ownership_proof_pdf")} />
//                 {farmDetails.land_ownership_proof_pdf && <span>Uploaded</span>}
//               </div>
//               <div>
//                 <label>Certification:</label>
//                 <input type="file" onChange={(e) => handleFileUpload(e, "certification_pdf")} />
//                 {farmDetails.certification_pdf && <span>Uploaded</span>}
//               </div>
//               <div>
//                 <label>Land Lease Agreement:</label>
//                 <input type="file" onChange={(e) => handleFileUpload(e, "land_lease_agreement_pdf")} />
//                 {farmDetails.land_lease_agreement_pdf && <span>Uploaded</span>}
//               </div>
//               <div>
//                 <label>Farm Photographs:</label>
//                 <input type="file" onChange={(e) => handleFileUpload(e, "farm_photographs_pdf")} />
//                 {farmDetails.farm_photographs_pdf && <span>Uploaded</span>}
//               </div>
//               <button type="submit">Save</button>
//               <button type="button" onClick={() => setEditFarm(false)}>Cancel</button>
//             </form>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Profile;
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./../styles/Profile.css";

const FarmerProfile = ({ farmer_id }) => {
  // Personal Details State
  const [personalDetails, setPersonalDetails] = useState({
    dob: "",
    gender: "",
    contact_no: "",
    aadhaar_no: "",
    residential_address: "",
    bank_account_no: "",
    ifsc_code: "",
    bank_branch: "",
    upi_id: "",
  });

  // Farm Details State
  const [farmDetails, setFarmDetails] = useState({
    farm_address: "",
    farm_size: "",
    crops_grown: "",
    farming_method: "",
    soil_type: "",
    water_sources: "",
    farm_equipment: "",
    land_ownership_proof_pdf: null,
    certification_pdf: null,
    land_lease_agreement_pdf: null,
    farm_photographs_pdf: null,
  });

  const [, setProfilePhoto] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [editPersonal, setEditPersonal] = useState(false);
  const [editFarm, setEditFarm] = useState(false);

  // Handle Personal Details Change
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalDetails((prev) => ({ ...prev, [name]: value }));

    if (name === "ifsc_code" && value.length === 11) {
      fetchBranchDetails(value);
    }
  };

  // Fetch Bank Branch Based on IFSC Code
  const fetchBranchDetails = async (ifsc) => {
    try {
      const res = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
      setPersonalDetails((prev) => ({
        ...prev,
        bank_branch: res.data.BRANCH || "Branch Not Found",
      }));
    } catch (error) {
      console.error("Invalid IFSC Code", error);
      setPersonalDetails((prev) => ({
        ...prev,
        bank_branch: "Invalid IFSC Code",
      }));
    }
  };

  // Handle Farm Details Change
  const handleFarmChange = (e) => {
    const { name, value } = e.target;
    setFarmDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle File Upload
  // const handleFileUpload = async (e, fieldName) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const res = await axios.post(`/api/farmer/${farmer_id}/upload-file`, formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     setFarmDetails((prev) => ({
  //       ...prev,
  //       [fieldName]: res.data.fileUrl || file.name,
  //     }));

  //     alert("File uploaded successfully!");
  //   } catch (error) {
  //     console.error("Error uploading file", error);
  //     alert("Failed to upload file. Please try again.");
  //   }
  // };

  // Handle Personal Details Submit
  const handlePersonalSubmit = (e) => {
    e.preventDefault();
    if (!farmer_id) {
      alert("Farmer ID is missing!");
      return;
    }

    axios.put(`/api/farmer/${farmer_id}/personal-details`, personalDetails)
      .then(() => setEditPersonal(false))
      .catch((err) => console.error("Error updating personal details:", err));
  };

  // Handle Farm Details Submit
  const handleFarmSubmit = (e) => {
    e.preventDefault();
    axios.put(`/api/farmer/${farmer_id}/farm-details`, farmDetails)
      .then(() => setEditFarm(false))
      .catch((err) => console.error("Error updating farm details:", err));
  };

  // Fetch Data on Load
  useEffect(() => {
    if (!farmer_id) {
      console.error("No farmer_id found in URL parameters");
      return;
    }

    axios.get(`http://localhost:5000/farmer/${farmer_id}/personal-details`)
      .then((res) => setPersonalDetails(res.data))
      .catch((err) => console.error("Error fetching personal details:", err));

    axios.get(`http://localhost:5000/farmer/${farmer_id}/farm-details`)
      .then((res) => setFarmDetails(res.data))
      .catch((err) => console.error("Error fetching farm details:", err));

    axios.get(`http://localhost:5000/farmer/${farmer_id}/profile-photo`)
      .then((res) => {
        const imageUrl = res.data.photo.startsWith("http")
          ? res.data.photo
          : `http://localhost:5000/uploads/${res.data.photo}`;
        setProfilePhoto(imageUrl);
      })
      .catch((err) => console.error("Error fetching profile photo:", err));

  }, [farmer_id]);

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setActiveTab("personal")}>Personal Details</button>
        <button onClick={() => setActiveTab("farm")}>Farm Details</button>
      </div>

      {activeTab === "personal" && (
        <div className="profile-form">
          <h3>Personal Details</h3>
          {!editPersonal ? (
            <div>
              <p>Date of Birth: {personalDetails.dob}</p>
              <p>Gender: {personalDetails.gender}</p>
              <p>Contact No: {personalDetails.contact_no}</p>
              <p>Aadhaar No: {personalDetails.aadhaar_no}</p>
              <p>Residential Address: {personalDetails.residential_address}</p>
              <p>IFSC Code: {personalDetails.ifsc_code}</p>
              <p>Bank Branch: {personalDetails.bank_branch}</p>
              <button onClick={() => setEditPersonal(true)}>Edit</button>
            </div>
          ) : (
            <form onSubmit={handlePersonalSubmit}>
              <input type="date" name="dob" value={personalDetails.dob} onChange={handlePersonalChange} required />
              <select name="gender" value={personalDetails.gender} onChange={handlePersonalChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input type="text" name="contact_no" placeholder="Contact No" value={personalDetails.contact_no} onChange={handlePersonalChange} required />
              <input type="text" name="aadhaar_no" placeholder="Aadhaar No" value={personalDetails.aadhaar_no} onChange={handlePersonalChange} required />
              <textarea name="residential_address" placeholder="Residential Address" value={personalDetails.residential_address} onChange={handlePersonalChange} required />
              <input type="text" name="ifsc_code" placeholder="IFSC Code" value={personalDetails.ifsc_code} onChange={handlePersonalChange} onBlur={() => fetchBranchDetails(personalDetails.ifsc_code)} required />
              <input type="text" name="bank_branch" placeholder="Bank Branch" value={personalDetails.bank_branch} disabled />
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditPersonal(false)}>Cancel</button>
            </form>
          )}
        </div>
      )}

      {activeTab === "farm" && (
        <div className="profile-form">
          <h3>Farm Details</h3>
          {!editFarm ? (
            <div>
              <p>Farm Address: {farmDetails.farm_address}</p>
              <p>Farm Size: {farmDetails.farm_size}</p>
              <p>Crops Grown: {farmDetails.crops_grown}</p>
              <p>Farming Method: {farmDetails.farming_method}</p>
              <p>Soil Type: {farmDetails.soil_type}</p>
              <p>Water Sources: {farmDetails.water_sources}</p>
              <p>Farm Equipment: {farmDetails.farm_equipment}</p>
              <button onClick={() => setEditFarm(true)}>Edit</button>
            </div>
          ) : (
            <form onSubmit={handleFarmSubmit}>
              <input type="text" name="farm_address" placeholder="Farm Address" value={farmDetails.farm_address} onChange={handleFarmChange} required />
              <input type="text" name="farm_size" placeholder="Farm Size" value={farmDetails.farm_size} onChange={handleFarmChange} required />
              <textarea name="crops_grown" placeholder="Crops Grown" value={farmDetails.crops_grown} onChange={handleFarmChange} required />
              <input type="text" name="farming_method" placeholder="Farming Method" value={farmDetails.farming_method} onChange={handleFarmChange} required />
              <input type="text" name="soil_type" placeholder="Soil Type" value={farmDetails.soil_type} onChange={handleFarmChange} required />
              <input type="text" name="water_sources" placeholder="Water Sources" value={farmDetails.water_sources} onChange={handleFarmChange} required />
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditFarm(false)}>Cancel</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
export default FarmerProfile;
