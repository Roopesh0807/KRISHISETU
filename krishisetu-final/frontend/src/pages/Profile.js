// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { 
//   FiEdit, 
//   FiSave, 
//   FiX, 
//   FiUpload, 
//   FiTrash2, 
//   FiUser, 
//   FiHome, 
//   FiChevronRight,
//   FiChevronLeft,
//   FiPhone,
//   FiCreditCard,
//   FiMapPin,
//   FiDroplet,
//   FiCrop,
//   FiTool
// } from "react-icons/fi";
// import "../styles/FarmerProfile.css";

// const FarmerProfile = () => {
//   const { farmer_id } = useParams();
//   const [activeTab, setActiveTab] = useState("personal");
//   const [profilePhoto, setProfilePhoto] = useState(null);
//   const [editMode, setEditMode] = useState({ personal: false, farm: false });
//   const [loading, setLoading] = useState(true);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

//   // Form data state
//   const [formData, setFormData] = useState({
//     personal: {
//       dob: "",
//       gender: "",
//       contact_no: "",
//       aadhaar_no: "",
//       residential_address: "",
//       bank_account_no: "",
//       ifsc_code: "",
//       bank_branch: "",
//       upi_id: "",
//     },
//     farm: {
//       farm_address: "",
//       farm_size: "",
//       crops_grown: "",
//       farming_method: "",
//       soil_type: "",
//       water_sources: "",
//       farm_equipment: "",
//       land_ownership_proof: null,
//       certification: null,
//       land_lease_agreement: null,
//       farm_photographs: null,
//     },
//     basicInfo: {
//       name: "",
//       email: "",
//       contact_no: ""
//     }
//   });

//   // Toggle sidebar
//   const toggleSidebar = () => {
//     setSidebarCollapsed(!sidebarCollapsed);
//   };

//   // Fetch farmer data
//   useEffect(() => {
//     if (!farmer_id) return;

//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Make parallel requests to get all data
//         const [basicRes, personalRes, farmRes, photoRes] = await Promise.all([
//           axios.get(`http://localhost:5000/api/farmer/${farmer_id}/basic`),
//           axios.get(`http://localhost:5000/api/farmer/${farmer_id}/personal-details`),
//           axios.get(`http://localhost:5000/api/farmer/${farmer_id}/farm-details`),
//           axios.get(`http://localhost:5000/api/farmer/${farmer_id}/profile-photo`, {
//             validateStatus: (status) => status < 500
//           })
//         ]);

//         // Process responses
//         setFormData({
//           basicInfo: {
//             name: basicRes.data.full_name || `${basicRes.data.first_name} ${basicRes.data.last_name}`,
//             email: basicRes.data.email,
//             contact_no: basicRes.data.phone_number
//           },
//           personal: {
//             ...personalRes.data,
//             name: basicRes.data.full_name || `${basicRes.data.first_name} ${basicRes.data.last_name}`,
//             contact_no: personalRes.data.contact_no || basicRes.data.phone_number
//           },
//           farm: farmRes.data
//         });

//         // Handle photo response
//         if (photoRes.status === 200 && photoRes.data.profile_photo) {
//           setProfilePhoto(`http://localhost:5000/uploads/${photoRes.data.profile_photo}`);
//         }

//       } catch (error) {
//         console.error("Fetch error:", error);
//         alert('Error loading farmer data. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [farmer_id]);


//   // Handle form field changes
//   const handleChange = (section, e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [section]: { ...prev[section], [name]: value }
//     }));

//     if (name === "ifsc_code" && value.length === 11) {
//       fetchBranchDetails(value);
//     }
//   };

//   // Fetch bank branch details
//   const fetchBranchDetails = async (ifsc) => {
//     try {
//       const { data } = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
//       setFormData(prev => ({
//         ...prev,
//         personal: { ...prev.personal, bank_branch: data.BRANCH || "Branch Not Found" }
//       }));
//     } catch (error) {
//       console.error("Invalid IFSC Code", error);
//       setFormData(prev => ({
//         ...prev,
//         personal: { ...prev.personal, bank_branch: "Invalid IFSC Code" }
//       }));
//     }
//   };

//   // Handle file uploads
//   const handleFileUpload = async (section, field, e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       const formData = new FormData();
//       formData.append('file', file);
      
//       const res = await axios.post(
//         `http://localhost:5000/api/farmer/${farmer_id}/upload-file`, 
//         formData, 
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         }
//       );

//       setFormData(prev => ({
//         ...prev,
//         [section]: { ...prev[section], [field]: res.data.fileUrl }
//       }));
//     } catch (error) {
//       console.error("Error uploading file", error);
//     }
//   };

//   // Handle profile photo change
//   const handlePhotoChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       const formData = new FormData();
//       formData.append('photo', file);
      
//       const res = await axios.post(
//         `http://localhost:5000/api/farmer/${farmer_id}/upload-photo`, 
//         formData, 
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         }
//       );

//       setProfilePhoto(`http://localhost:5000/uploads/${res.data.profile_photo}`);
//     } catch (error) {
//       console.error("Error uploading photo", error);
//     }
//   };
//   // Remove profile photo
//   const handleRemovePhoto = async () => {
//     try {
//       await axios.delete(`http://localhost:5000/api/farmer/${farmer_id}/remove-photo`);
//       setProfilePhoto(null);
//     } catch (error) {
//       console.error("Error removing photo", error);
//     }
//   };


//   // Handle form submission
//   const handleSubmit = async (section, e) => {
//     e.preventDefault();
//     try {
//       if (section === 'personal') {
//         await axios.put(
//           `http://localhost:5000/api/farmer/${farmer_id}/personal-details`, 
//           formData.personal
//         );
//       } else if (section === 'farm') {
//         await axios.put(
//           `http://localhost:5000/api/farmer/${farmer_id}/farm-details`, 
//           formData.farm
//         );
//       }
      
//       setEditMode(prev => ({ ...prev, [section]: false }));
//       alert(`${section === 'personal' ? 'Personal' : 'Farm'} details updated successfully!`);
//     } catch (error) {
//       console.error(`Error updating ${section} details:`, error);
//       alert(`Error updating ${section} details. Please try again.`);
//     }
//   };
//   // Loading state
//   if (loading) {
//     return (
//       <div className="farmer-profile-loading-overlay">
//         <div className="farmer-profile-loading-spinner"></div>
//         <p>Loading farmer data...</p>
//       </div>
//     );
//   }

//   // Helper functions
//   const formatLabel = (key) => {
//     return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
//   };

//   const isFileField = (key) => {
//     return key.includes('_proof') || key.includes('_agreement') || 
//            key === 'certification' || key === 'farm_photographs';
//   };

//   const getFieldIcon = (key) => {
//     switch(key) {
//       case 'contact_no': return <FiPhone className="farmer-profile-field-icon" />;
//       case 'aadhaar_no': return <FiUser className="farmer-profile-field-icon" />;
//       case 'residential_address': 
//       case 'farm_address': return <FiMapPin className="farmer-profile-field-icon" />;
//       case 'bank_account_no': 
//       case 'ifsc_code': 
//       case 'bank_branch': 
//       case 'upi_id': return <FiCreditCard className="farmer-profile-field-icon" />;
//       case 'water_sources': return <FiDroplet className="farmer-profile-field-icon" />;
//       case 'crops_grown': return <FiCrop className="farmer-profile-field-icon" />;
//       case 'farm_equipment': return <FiTool className="farmer-profile-field-icon" />;
//       default: return <FiUser className="farmer-profile-field-icon" />;
//     }
//   };

//   const renderFormField = (section, key, value) => {
//     if (key === 'gender') {
//       return (
//         <select
//           name={key}
//           value={value}
//           onChange={(e) => handleChange(section, e)}
//           required
//           className="farmer-profile-form-input"
//         >
//           <option value="">Select Gender</option>
//           <option value="Male">Male</option>
//           <option value="Female">Female</option>
//           <option value="Other">Other</option>
//         </select>
//       );
//     } else if (key === 'residential_address' || key === 'farm_address') {
//       return (
//         <textarea
//           name={key}
//           value={value}
//           onChange={(e) => handleChange(section, e)}
//           required
//           className="farmer-profile-form-textarea"
//         />
//       );
//     } else if (key === 'dob') {
//       return (
//         <input
//           type="date"
//           name={key}
//           value={value}
//           onChange={(e) => handleChange(section, e)}
//           required
//           className="farmer-profile-form-input"
//         />
//       );
//     } else {
//       return (
//         <input
//           type="text"
//           name={key}
//           value={value}
//           onChange={(e) => handleChange(section, e)}
//           required
//           disabled={key === 'bank_branch'}
//           className="farmer-profile-form-input"
//         />
//       );
//     }
//   };

//   return (
//     <div className={`farmer-profile-container ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
//       {/* Header Section */}
//       <div className="farmer-profile-header">
//         <div className="farmer-profile-header-content">
//           <h1 className="farmer-profile-title">
//             <span className="farmer-profile-title-highlight">Farmer</span> Profile
//           </h1>
//           <button 
//             className="farmer-profile-sidebar-toggle-btn"
//             onClick={toggleSidebar}
//           >
//             {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
//             <span className="farmer-profile-sr-only">{sidebarCollapsed ? "Expand" : "Collapse"} Sidebar</span>
//           </button>
//         </div>
        
//         <div className="farmer-profile-tabs">
//           <button
//             className={`farmer-profile-tab ${activeTab === 'personal' ? 'farmer-profile-tab-active' : ''}`}
//             onClick={() => setActiveTab('personal')}
//           >
//             <FiUser className="farmer-profile-tab-icon" />
//             <span>Personal Details</span>
//           </button>
//           <button
//             className={`farmer-profile-tab ${activeTab === 'farm' ? 'farmer-profile-tab-active' : ''}`}
//             onClick={() => setActiveTab('farm')}
//           >
//             <FiHome className="farmer-profile-tab-icon" />
//             <span>Farm Details</span>
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="farmer-profile-content-wrapper">
//         {/* Profile Photo Section */}
//         <div className="farmer-profile-photo-section">
//           <div className="farmer-profile-photo-card">
//             <div className="farmer-profile-photo-container">
//               {profilePhoto ? (
//                 <img src={profilePhoto} alt="Profile" className="farmer-profile-photo" />
//               ) : (
//                 <div className="farmer-profile-photo-placeholder">
//                   <FiUser size={48} />
//                 </div>
//               )}
//             </div>
//             <div className="farmer-profile-user-info">
//               <h3>{formData.basicInfo.name}</h3>
//               <p><FiUser /> {formData.basicInfo.email}</p>
//               <p><FiPhone /> {formData.basicInfo.contact_no}</p>
//             </div>
//             <div className="farmer-profile-photo-actions">
//               <input
//                 type="file"
//                 id="farmer-profile-photo-upload"
//                 onChange={handlePhotoChange}
//                 accept="image/*"
//                 hidden
//               />
//               <label htmlFor="farmer-profile-photo-upload" className="farmer-profile-photo-action-btn farmer-profile-upload-btn">
//                 <FiUpload /> {profilePhoto ? 'Change Photo' : 'Upload Photo'}
//               </label>
//               {profilePhoto && (
//                 <button 
//                   className="farmer-profile-photo-action-btn farmer-profile-remove-btn"
//                   onClick={handleRemovePhoto}
//                 >
//                   <FiTrash2 /> Remove
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Details Section */}
//         <div className="farmer-profile-details-section">
//           {activeTab === 'personal' ? (
//             <div className="farmer-profile-details-card">
//               <div className="farmer-profile-card-header">
//                 <h2>Personal Information</h2>
//                 {!editMode.personal ? (
//                   <button 
//                     className="farmer-profile-edit-btn"
//                     onClick={() => setEditMode({...editMode, personal: true})}
//                   >
//                     <FiEdit /> Edit
//                   </button>
//                 ) : null}
//               </div>

//               {!editMode.personal ? (
//                 <div className="farmer-profile-details-grid">
//                   {Object.entries(formData.personal).map(([key, value]) => (
//                     <div className="farmer-profile-detail-item" key={key}>
//                       <label className="farmer-profile-detail-label">
//                         {getFieldIcon(key)}
//                         {formatLabel(key)}
//                       </label>
//                       <div className={`farmer-profile-detail-value ${value ? '' : 'farmer-profile-empty'}`}>
//                         {value || 'Not provided'}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <form onSubmit={(e) => handleSubmit('personal', e)} className="farmer-profile-edit-form">
//                   <div className="farmer-profile-form-grid">
//                     {Object.entries(formData.personal).map(([key, value]) => (
//                       <div className="farmer-profile-form-group" key={key}>
//                         <label>
//                           {getFieldIcon(key)}
//                           {formatLabel(key)}
//                         </label>
//                         {renderFormField('personal', key, value)}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="farmer-profile-form-actions">
//                     <button
//                       type="button"
//                       className="farmer-profile-cancel-btn"
//                       onClick={() => setEditMode({...editMode, personal: false})}
//                     >
//                       <FiX /> Cancel
//                     </button>
//                     <button type="submit" className="farmer-profile-save-btn">
//                       <FiSave /> Save Changes
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           ) : (
//             <div className="farmer-profile-details-card">
//               <div className="farmer-profile-card-header">
//                 <h2>Farm Information</h2>
//                 {!editMode.farm ? (
//                   <button 
//                     className="farmer-profile-edit-btn"
//                     onClick={() => setEditMode({...editMode, farm: true})}
//                   >
//                     <FiEdit /> Edit
//                   </button>
//                 ) : null}
//               </div>

//               {!editMode.farm ? (
//                 <div className="farmer-profile-details-grid">
//                   {Object.entries(formData.farm).map(([key, value]) => (
//                     <div className="farmer-profile-detail-item" key={key}>
//                       <label className="farmer-profile-detail-label">
//                         {getFieldIcon(key)}
//                         {formatLabel(key)}
//                       </label>
//                       <div className={`farmer-profile-detail-value ${isFileField(key) ? (value ? 'farmer-profile-uploaded' : 'farmer-profile-not-uploaded') : ''} ${value ? '' : 'farmer-profile-empty'}`}>
//                         {isFileField(key) ? (value ? 'Uploaded' : 'Not uploaded') : (value || 'Not provided')}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <form onSubmit={(e) => handleSubmit('farm', e)} className="farmer-profile-edit-form">
//                   <div className="farmer-profile-form-grid">
//                     {Object.entries(formData.farm).map(([key, value]) => (
//                       <div className="farmer-profile-form-group" key={key}>
//                         <label>
//                           {getFieldIcon(key)}
//                           {formatLabel(key)}
//                         </label>
//                         {isFileField(key) ? (
//                           <div className="farmer-profile-file-upload-group">
//                             <input
//                               type="file"
//                               id={key}
//                               onChange={(e) => handleFileUpload('farm', key, e)}
//                               hidden
//                             />
//                             <label htmlFor={key} className="farmer-profile-file-upload-btn">
//                               <FiUpload /> Choose File
//                             </label>
//                             {value && <span className="farmer-profile-file-name">{value}</span>}
//                           </div>
//                         ) : (
//                           renderFormField('farm', key, value)
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="farmer-profile-form-actions">
//                     <button
//                       type="button"
//                       className="farmer-profile-cancel-btn"
//                       onClick={() => setEditMode({...editMode, farm: false})}
//                     >
//                       <FiX /> Cancel
//                     </button>
//                     <button type="submit" className="farmer-profile-save-btn">
//                       <FiSave /> Save Changes
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FarmerProfile;




// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { 
//   FiEdit, 
//   FiSave, 
//   FiX, 
//   FiUpload, 
//   FiTrash2, 
//   FiUser, 
//   FiHome, 
//   FiChevronRight,
//   FiChevronLeft,
//   FiPhone,
//   FiCreditCard,
//   FiMapPin,
//   FiDroplet,
//   FiCrop,
//   FiTool
// } from "react-icons/fi";
// import "../styles/FarmerProfile.css";

// const FarmerProfile = () => {
//   const { farmer_id } = useParams();
//   const [activeTab, setActiveTab] = useState("personal");
//   const [profilePhoto, setProfilePhoto] = useState(null);
//   const [editMode, setEditMode] = useState({ personal: false, farm: false });
//   const [loading, setLoading] = useState(true);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

//   // Form data state
//   const [formData, setFormData] = useState({
//     personal: {
//       dob: "",
//       gender: "",
//       contact_no: "",
//       aadhaar_no: "",
//       residential_address: "",
//       bank_account_no: "",
//       ifsc_code: "",
//       bank_branch: "",
//       upi_id: "",
//     },
//     farm: {
//       farm_address: "",
//       farm_size: "",
//       crops_grown: "",
//       farming_method: "",
//       soil_type: "",
//       water_sources: "",
//       farm_equipment: "",
//       land_ownership_proof: null,
//       certification: null,
//       land_lease_agreement: null,
//       farm_photographs: null,
//     },
//     basicInfo: {
//       name: "",
//       email: "",
//       contact_no: ""
//     }
//   });

//   // Toggle sidebar
//   const toggleSidebar = () => {
//     setSidebarCollapsed(!sidebarCollapsed);
//   };

//   // Fetch farmer data
//   useEffect(() => {
//     if (!farmer_id) return;

//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         const response = await axios.get(
//           `http://localhost:5000/api/farmerprofile/${farmer_id}`,
//           {
//             headers: {
//               'Authorization': `Bearer ${localStorage.getItem('farmer')?.token || ''}`
//             }
//           }
//         );
        

        
//         const farmerData = response.data;

//         // Set basic info
//         const basicInfo = {
//           name: farmerData.full_name,
//           email: farmerData.email,
//           contact_no: farmerData.phone_number
//         };

//         // Set personal details (with fallbacks)
//         const personal = farmerData.personal ? {
//           dob: farmerData.personal.dob || "",
//           gender: farmerData.personal.gender || "",
//           contact_no: farmerData.personal.contact_no || farmerData.phone_number,
//           aadhaar_no: farmerData.personal.aadhaar_no || "",
//           residential_address: farmerData.personal.residential_address || "",
//           bank_account_no: farmerData.personal.bank_account_no || "",
//           ifsc_code: farmerData.personal.ifsc_code || "",
//           upi_id: farmerData.personal.upi_id || "",
//           bank_branch: "",
//           profile_photo: farmerData.personal.profile_photo || null
//         } : {
//           dob: "",
//           gender: "",
//           contact_no: farmerData.phone_number,
//           aadhaar_no: "",
//           residential_address: "",
//           bank_account_no: "",
//           ifsc_code: "",
//           upi_id: "",
//           bank_branch: "",
//           profile_photo: null
//         };

//         // Set farm details (with fallbacks)
//         const farm = farmerData.farm ? {
//           farm_address: farmerData.farm.farm_address || "",
//           farm_size: farmerData.farm.farm_size || "",
//           crops_grown: farmerData.farm.crops_grown || "",
//           farming_method: farmerData.farm.farming_method || "",
//           soil_type: farmerData.farm.soil_type || "",
//           water_sources: farmerData.farm.water_sources || "",
//           farm_equipment: farmerData.farm.farm_equipment || "",
//           land_ownership_proof: farmerData.farm.land_ownership_proof_pdf || null,
//           certification: farmerData.farm.certification_pdf || null,
//           land_lease_agreement: farmerData.farm.land_lease_agreement_pdf || null,
//           farm_photographs: farmerData.farm.farm_photographs_pdf || null
//         } : {
//           farm_address: "",
//           farm_size: "",
//           crops_grown: "",
//           farming_method: "",
//           soil_type: "",
//           water_sources: "",
//           farm_equipment: "",
//           land_ownership_proof: null,
//           certification: null,
//           land_lease_agreement: null,
//           farm_photographs: null
//         };

//         setFormData({
//           basicInfo,
//           personal,
//           farm
//         });

//         // Handle profile photo
//         if (personal.profile_photo) {
//           setProfilePhoto(`http://localhost:5000/uploads/${personal.profile_photo}`);
//         }

//         // Fetch bank branch details if IFSC is available
//         if (personal.ifsc_code && personal.ifsc_code.length === 11) {
//           fetchBranchDetails(personal.ifsc_code);
//         }

//       } catch (error) {
//         console.error("Fetch error:", error);
//         alert('Error loading farmer data. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [farmer_id]);

//   // Fetch bank branch details
//   const fetchBranchDetails = async (ifsc) => {
//     try {
//       const { data } = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
//       setFormData(prev => ({
//         ...prev,
//         personal: { ...prev.personal, bank_branch: data.BRANCH || "Branch Not Found" }
//       }));
//     } catch (error) {
//       console.error("Invalid IFSC Code", error);
//       setFormData(prev => ({
//         ...prev,
//         personal: { ...prev.personal, bank_branch: "Invalid IFSC Code" }
//       }));
//     }
//   };

//   // Handle form field changes
//   const handleChange = (section, e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [section]: { ...prev[section], [name]: value }
//     }));

//     if (name === "ifsc_code" && value.length === 11) {
//       fetchBranchDetails(value);
//     }
//   };


//   // Handle file uploads
//   const handleFileUpload = async (section, field, e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       const formData = new FormData();
//       formData.append('file', file);
      
//       const res = await axios.post(
//         `http://localhost:5000/api/farmerprofile/${farmer_id}/file`, 
//         formData, 
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         }
//       );

//       setFormData(prev => ({
//         ...prev,
//         [section]: { ...prev[section], [field]: res.data.fileUrl }
//       }));
//     } catch (error) {
//       console.error("Error uploading file", error);
//     }
//   };

//   // Handle profile photo change
//   // Handle profile photo change
//   const handlePhotoChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       const formData = new FormData();
//       formData.append('photo', file);
      
//       const res = await axios.post(
//         `http://localhost:5000/api/farmerprofile/${farmer_id}/photo`, 
//         formData, 
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         }
//       );

//       setProfilePhoto(`http://localhost:5000/uploads/${res.data.profile_photo}`);
//     } catch (error) {
//       console.error("Error uploading photo", error);
//     }
//   };

//   // Remove profile photo
//   const handleRemovePhoto = async () => {
//     try {
//       await axios.delete(`http://localhost:5000/api/farmerprofile/${farmer_id}/photo`);
//       setProfilePhoto(null);
//     } catch (error) {
//       console.error("Error removing photo", error);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (section, e) => {
//     e.preventDefault();
//     try {
//       const endpoint = section === 'personal' ? 'personal' : 'farm';
//       await axios.put(
//         `http://localhost:5000/api/farmerprofile/${farmer_id}/${endpoint}`, 
//         formData[section]
//       );
      
//       setEditMode(prev => ({ ...prev, [section]: false }));
//       alert(`${section === 'personal' ? 'Personal' : 'Farm'} details updated successfully!`);
//     } catch (error) {
//       console.error(`Error updating ${section} details:`, error);
//       alert(`Error updating ${section} details. Please try again.`);
//     }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="farmer-profile-loading-overlay">
//         <div className="farmer-profile-loading-spinner"></div>
//         <p>Loading farmer data...</p>
//       </div>
//     );
//   }

//   // Helper functions
//   const formatLabel = (key) => {
//     return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
//   };

//   const isFileField = (key) => {
//     return key.includes('_proof') || key.includes('_agreement') || 
//            key === 'certification' || key === 'farm_photographs';
//   };

//   const getFieldIcon = (key) => {
//     switch(key) {
//       case 'contact_no': return <FiPhone className="farmer-profile-field-icon" />;
//       case 'aadhaar_no': return <FiUser className="farmer-profile-field-icon" />;
//       case 'residential_address': 
//       case 'farm_address': return <FiMapPin className="farmer-profile-field-icon" />;
//       case 'bank_account_no': 
//       case 'ifsc_code': 
//       case 'bank_branch': 
//       case 'upi_id': return <FiCreditCard className="farmer-profile-field-icon" />;
//       case 'water_sources': return <FiDroplet className="farmer-profile-field-icon" />;
//       case 'crops_grown': return <FiCrop className="farmer-profile-field-icon" />;
//       case 'farm_equipment': return <FiTool className="farmer-profile-field-icon" />;
//       default: return <FiUser className="farmer-profile-field-icon" />;
//     }
//   };

//   const renderFormField = (section, key, value) => {
//     if (key === 'gender') {
//       return (
//         <select
//           name={key}
//           value={value}
//           onChange={(e) => handleChange(section, e)}
//           required
//           className="farmer-profile-form-input"
//         >
//           <option value="">Select Gender</option>
//           <option value="Male">Male</option>
//           <option value="Female">Female</option>
//           <option value="Other">Other</option>
//         </select>
//       );
//     } else if (key === 'residential_address' || key === 'farm_address') {
//       return (
//         <textarea
//           name={key}
//           value={value}
//           onChange={(e) => handleChange(section, e)}
//           required
//           className="farmer-profile-form-textarea"
//         />
//       );
//     } else if (key === 'dob') {
//       return (
//         <input
//           type="date"
//           name={key}
//           value={value}
//           onChange={(e) => handleChange(section, e)}
//           required
//           className="farmer-profile-form-input"
//         />
//       );
//     } else {
//       return (
//         <input
//           type="text"
//           name={key}
//           value={value}
//           onChange={(e) => handleChange(section, e)}
//           required
//           disabled={key === 'bank_branch'}
//           className="farmer-profile-form-input"
//         />
//       );
//     }
//   };

//   return (
//     <div className={`farmer-profile-container ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
//       {/* Header Section */}
//       <div className="farmer-profile-header">
//         <div className="farmer-profile-header-content">
//           <h1 className="farmer-profile-title">
//             <span className="farmer-profile-title-highlight">Farmer</span> Profile
//           </h1>
//           <button 
//             className="farmer-profile-sidebar-toggle-btn"
//             onClick={toggleSidebar}
//           >
//             {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
//             <span className="farmer-profile-sr-only">{sidebarCollapsed ? "Expand" : "Collapse"} Sidebar</span>
//           </button>
//         </div>
        
//         <div className="farmer-profile-tabs">
//           <button
//             className={`farmer-profile-tab ${activeTab === 'personal' ? 'farmer-profile-tab-active' : ''}`}
//             onClick={() => setActiveTab('personal')}
//           >
//             <FiUser className="farmer-profile-tab-icon" />
//             <span>Personal Details</span>
//           </button>
//           <button
//             className={`farmer-profile-tab ${activeTab === 'farm' ? 'farmer-profile-tab-active' : ''}`}
//             onClick={() => setActiveTab('farm')}
//           >
//             <FiHome className="farmer-profile-tab-icon" />
//             <span>Farm Details</span>
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="farmer-profile-content-wrapper">
//         {/* Profile Photo Section */}
//         <div className="farmer-profile-photo-section">
//           <div className="farmer-profile-photo-card">
//             <div className="farmer-profile-photo-container">
//               {profilePhoto ? (
//                 <img src={profilePhoto} alt="Profile" className="farmer-profile-photo" />
//               ) : (
//                 <div className="farmer-profile-photo-placeholder">
//                   <FiUser size={48} />
//                 </div>
//               )}
//             </div>
//             <div className="farmer-profile-user-info">
//               <h3>{formData.basicInfo.name}</h3>
//               <p><FiUser /> {formData.basicInfo.email}</p>
//               <p><FiPhone /> {formData.basicInfo.contact_no}</p>
//             </div>
//             <div className="farmer-profile-photo-actions">
//               <input
//                 type="file"
//                 id="farmer-profile-photo-upload"
//                 onChange={handlePhotoChange}
//                 accept="image/*"
//                 hidden
//               />
//               <label htmlFor="farmer-profile-photo-upload" className="farmer-profile-photo-action-btn farmer-profile-upload-btn">
//                 <FiUpload /> {profilePhoto ? 'Change Photo' : 'Upload Photo'}
//               </label>
//               {profilePhoto && (
//                 <button 
//                   className="farmer-profile-photo-action-btn farmer-profile-remove-btn"
//                   onClick={handleRemovePhoto}
//                 >
//                   <FiTrash2 /> Remove
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Details Section */}
//         <div className="farmer-profile-details-section">
//           {activeTab === 'personal' ? (
//             <div className="farmer-profile-details-card">
//               <div className="farmer-profile-card-header">
//                 <h2>Personal Information</h2>
//                 {!editMode.personal ? (
//                   <button 
//                     className="farmer-profile-edit-btn"
//                     onClick={() => setEditMode({...editMode, personal: true})}
//                   >
//                     <FiEdit /> Edit
//                   </button>
//                 ) : null}
//               </div>

//               {!editMode.personal ? (
//                 <div className="farmer-profile-details-grid">
//                   {Object.entries(formData.personal).map(([key, value]) => (
//                     <div className="farmer-profile-detail-item" key={key}>
//                       <label className="farmer-profile-detail-label">
//                         {getFieldIcon(key)}
//                         {formatLabel(key)}
//                       </label>
//                       <div className={`farmer-profile-detail-value ${value ? '' : 'farmer-profile-empty'}`}>
//                         {value || 'Not provided'}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <form onSubmit={(e) => handleSubmit('personal', e)} className="farmer-profile-edit-form">
//                   <div className="farmer-profile-form-grid">
//                     {Object.entries(formData.personal).map(([key, value]) => (
//                       <div className="farmer-profile-form-group" key={key}>
//                         <label>
//                           {getFieldIcon(key)}
//                           {formatLabel(key)}
//                         </label>
//                         {renderFormField('personal', key, value)}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="farmer-profile-form-actions">
//                     <button
//                       type="button"
//                       className="farmer-profile-cancel-btn"
//                       onClick={() => setEditMode({...editMode, personal: false})}
//                     >
//                       <FiX /> Cancel
//                     </button>
//                     <button type="submit" className="farmer-profile-save-btn">
//                       <FiSave /> Save Changes
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           ) : (
//             <div className="farmer-profile-details-card">
//               <div className="farmer-profile-card-header">
//                 <h2>Farm Information</h2>
//                 {!editMode.farm ? (
//                   <button 
//                     className="farmer-profile-edit-btn"
//                     onClick={() => setEditMode({...editMode, farm: true})}
//                   >
//                     <FiEdit /> Edit
//                   </button>
//                 ) : null}
//               </div>

//               {!editMode.farm ? (
//                 <div className="farmer-profile-details-grid">
//                   {Object.entries(formData.farm).map(([key, value]) => (
//                     <div className="farmer-profile-detail-item" key={key}>
//                       <label className="farmer-profile-detail-label">
//                         {getFieldIcon(key)}
//                         {formatLabel(key)}
//                       </label>
//                       <div className={`farmer-profile-detail-value ${isFileField(key) ? (value ? 'farmer-profile-uploaded' : 'farmer-profile-not-uploaded') : ''} ${value ? '' : 'farmer-profile-empty'}`}>
//                         {isFileField(key) ? (value ? 'Uploaded' : 'Not uploaded') : (value || 'Not provided')}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <form onSubmit={(e) => handleSubmit('farm', e)} className="farmer-profile-edit-form">
//                   <div className="farmer-profile-form-grid">
//                     {Object.entries(formData.farm).map(([key, value]) => (
//                       <div className="farmer-profile-form-group" key={key}>
//                         <label>
//                           {getFieldIcon(key)}
//                           {formatLabel(key)}
//                         </label>
//                         {isFileField(key) ? (
//                           <div className="farmer-profile-file-upload-group">
//                             <input
//                               type="file"
//                               id={key}
//                               onChange={(e) => handleFileUpload('farm', key, e)}
//                               hidden
//                             />
//                             <label htmlFor={key} className="farmer-profile-file-upload-btn">
//                               <FiUpload /> Choose File
//                             </label>
//                             {value && <span className="farmer-profile-file-name">{value}</span>}
//                           </div>
//                         ) : (
//                           renderFormField('farm', key, value)
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="farmer-profile-form-actions">
//                     <button
//                       type="button"
//                       className="farmer-profile-cancel-btn"
//                       onClick={() => setEditMode({...editMode, farm: false})}
//                     >
//                       <FiX /> Cancel
//                     </button>
//                     <button type="submit" className="farmer-profile-save-btn">
//                       <FiSave /> Save Changes
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FarmerProfile;

import { useAuth } from "../context/AuthContext";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  FiEdit, 
  FiSave, 
  FiX, 
  FiUpload, 
  FiTrash2, 
  FiUser, 
  FiHome,
  FiChevronRight,
  FiChevronLeft,
  FiPhone,
  FiCreditCard,
  FiMapPin,
  FiDroplet,
  FiCrop,
  FiTool
} from "react-icons/fi";
import "../styles/FarmerProfile.css";

const FarmerProfile = () => {
  const { farmer } = useAuth(); // Add this line inside your compon
  const { farmer_id } = useParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [profilePhoto, setProfilePhoto] = useState(null); // Added this line
  const [editMode, setEditMode] = useState({ personal: false, farm: false });
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // Form data state
  const [formData, setFormData] = useState({
    personal: {
      dob: "",
      gender: "",
      contact_no: "",
      aadhaar_no: "",
      residential_address: "",
      bank_account_no: "",
      ifsc_code: "",
      bank_branch: "",
      upi_id: "",
    },
    farm: {
      farm_address: "",
      farm_size: "",
      crops_grown: "",
      farming_method: "",
      soil_type: "",
      water_sources: "",
      farm_equipment: "",
      land_ownership_proof: null,
      certification: null,
      land_lease_agreement: null,
      farm_photographs: null,
    },
    basicInfo: {
      name: "",
      email: "",
      contact_no: ""
    }
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fetch farmer data
  useEffect(() => {
    if (!farmer_id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch farmer profile data
        const response = await axios.get(`http://localhost:5000/api/farmerprofile/${farmer_id}`,
          {
            withCredentials: true, // This sends cookies with the request
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}` // Alternative if using localStorage
            }
          }
        );
        const farmerData = response.data;

        // Set basic info
        const basicInfo = {
          name: farmerData.full_name,
          email: farmerData.email,
          contact_no: farmerData.phone_number
        };

        // Set personal details (with fallbacks)
        const personal = farmerData.personal ? {
          dob: farmerData.personal.dob || "",
          gender: farmerData.personal.gender || "",
          contact_no: farmerData.personal.contact_no || farmerData.phone_number,
          aadhaar_no: farmerData.personal.aadhaar_no || "",
          residential_address: farmerData.personal.residential_address || "",
          bank_account_no: farmerData.personal.bank_account_no || "",
          ifsc_code: farmerData.personal.ifsc_code || "",
          upi_id: farmerData.personal.upi_id || "",
          bank_branch: "",
          profile_photo: farmerData.personal.profile_photo || null
        } : {
          dob: "",
          gender: "",
          contact_no: farmerData.phone_number,
          aadhaar_no: "",
          residential_address: "",
          bank_account_no: "",
          ifsc_code: "",
          upi_id: "",
          bank_branch: "",
          profile_photo: null
        };

        // Set farm details (with fallbacks)
        const farm = farmerData.farm ? {
          farm_address: farmerData.farm.farm_address || "",
          farm_size: farmerData.farm.farm_size || "",
          crops_grown: farmerData.farm.crops_grown || "",
          farming_method: farmerData.farm.farming_method || "",
          soil_type: farmerData.farm.soil_type || "",
          water_sources: farmerData.farm.water_sources || "",
          farm_equipment: farmerData.farm.farm_equipment || "",
          land_ownership_proof: farmerData.farm.land_ownership_proof_pdf || null,
          certification: farmerData.farm.certification_pdf || null,
          land_lease_agreement: farmerData.farm.land_lease_agreement_pdf || null,
          farm_photographs: farmerData.farm.farm_photographs_pdf || null
        } : {
          farm_address: "",
          farm_size: "",
          crops_grown: "",
          farming_method: "",
          soil_type: "",
          water_sources: "",
          farm_equipment: "",
          land_ownership_proof: null,
          certification: null,
          land_lease_agreement: null,
          farm_photographs: null
        };

        setFormData({
          basicInfo,
          personal,
          farm
        });

        // Handle profile photo
        if (personal.profile_photo) {
          setProfilePhoto(`http://localhost:5000/uploads/${personal.profile_photo}`);
        }

        // Fetch bank branch details if IFSC is available
        if (personal.ifsc_code && personal.ifsc_code.length === 11) {
          fetchBranchDetails(personal.ifsc_code);
        }

      } catch (error) {
        console.error("Fetch error:", error);
        alert('Error loading farmer data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [farmer_id]);

  // Fetch bank branch details
  const fetchBranchDetails = async (ifsc) => {
    try {
      const { data } = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
      setFormData(prev => ({
        ...prev,
        personal: { ...prev.personal, bank_branch: data.BRANCH || "Branch Not Found" }
      }));
    } catch (error) {
      console.error("Invalid IFSC Code", error);
      setFormData(prev => ({
        ...prev,
        personal: { ...prev.personal, bank_branch: "Invalid IFSC Code" }
      }));
    }
  };

  // Handle form field changes
  const handleChange = (section, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [name]: value }
    }));

    if (name === "ifsc_code" && value.length === 11) {
      fetchBranchDetails(value);
    }
  };

  // Handle file uploads
  const handleFileUpload = async (section, field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axios.post(
        `http://localhost:5000/api/farmerprofile/${farmer_id}/file`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: res.data.fileUrl }
      }));
    } catch (error) {
      console.error("Error uploading file", error);
    }
  };

  // Handle profile photo change
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const res = await axios.post(
        `http://localhost:5000/api/farmerprofile/${farmer_id}/photo`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setProfilePhoto(`http://localhost:5000/uploads/${res.data.profile_photo}`);
    } catch (error) {
      console.error("Error uploading photo", error);
    }
  };

  // Remove profile photo
  const handleRemovePhoto = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/farmerprofile/${farmer_id}/photo`);
      setProfilePhoto(null);
    } catch (error) {
      console.error("Error removing photo", error);
    }
  };

  // Handle form submission

  const handleSubmit = async (section, e) => {
    e.preventDefault();
    try {
      // Debug: Check what tokens are available
      console.log('Context farmer token:', farmer?.token);
      console.log('LocalStorage token:', localStorage.getItem('farmerToken'));
      
      const token = farmer?.token || localStorage.getItem('farmerToken');
      
      if (!token) {
        console.error('No token found');
        alert('Your session has expired. Please login again.');
        // Optional: Redirect to login
        // navigate('/login');
        return;
      }
  
      // Debug: Verify the token before sending
      console.log('Using token:', token);
  
      const { data } = await axios.put(
        `http://localhost:5000/api/farmerprofile/${farmer_id}/${section}`,
        formData[section],
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Update response:', data);
      // ... rest of your success handling
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      // ... rest of your error handling
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="farmer-profile-loading-overlay">
        <div className="farmer-profile-loading-spinner"></div>
        <p>Loading farmer data...</p>
      </div>
    );
  }

  // Helper functions
  const formatLabel = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isFileField = (key) => {
    return key.includes('_proof') || key.includes('_agreement') || 
           key === 'certification' || key === 'farm_photographs';
  };

  const getFieldIcon = (key) => {
    switch(key) {
      case 'contact_no': return <FiPhone className="farmer-profile-field-icon" />;
      case 'aadhaar_no': return <FiUser className="farmer-profile-field-icon" />;
      case 'residential_address': 
      case 'farm_address': return <FiMapPin className="farmer-profile-field-icon" />;
      case 'bank_account_no': 
      case 'ifsc_code': 
      case 'bank_branch': 
      case 'upi_id': return <FiCreditCard className="farmer-profile-field-icon" />;
      case 'water_sources': return <FiDroplet className="farmer-profile-field-icon" />;
      case 'crops_grown': return <FiCrop className="farmer-profile-field-icon" />;
      case 'farm_equipment': return <FiTool className="farmer-profile-field-icon" />;
      default: return <FiUser className="farmer-profile-field-icon" />;
    }
  };

  const renderFormField = (section, key, value) => {
    if (key === 'gender') {
      return (
        <select
          name={key}
          value={value}
          onChange={(e) => handleChange(section, e)}
          required
          className="farmer-profile-form-input"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      );
    } else if (key === 'residential_address' || key === 'farm_address') {
      return (
        <textarea
          name={key}
          value={value}
          onChange={(e) => handleChange(section, e)}
          required
          className="farmer-profile-form-textarea"
        />
      );
    } else if (key === 'dob') {
      return (
        <input
          type="date"
          name={key}
          value={value}
          onChange={(e) => handleChange(section, e)}
          required
          className="farmer-profile-form-input"
        />
      );
    } else {
      return (
        <input
          type="text"
          name={key}
          value={value}
          onChange={(e) => handleChange(section, e)}
          required
          disabled={key === 'bank_branch'}
          className="farmer-profile-form-input"
        />
      );
    }
  };

  return (
    <div className={`farmer-profile-container ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Header Section */}
      <div className="farmer-profile-header">
        <div className="farmer-profile-header-content">
          <h1 className="farmer-profile-title">
            <span className="farmer-profile-title-highlight">Farmer</span> Profile
          </h1>
          <button 
            className="farmer-profile-sidebar-toggle-btn"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            <span className="farmer-profile-sr-only">{sidebarCollapsed ? "Expand" : "Collapse"} Sidebar</span>
          </button>
        </div>
        
        <div className="farmer-profile-tabs">
          <button
            className={`farmer-profile-tab ${activeTab === 'personal' ? 'farmer-profile-tab-active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <FiUser className="farmer-profile-tab-icon" />
            <span>Personal Details</span>
          </button>
          <button
            className={`farmer-profile-tab ${activeTab === 'farm' ? 'farmer-profile-tab-active' : ''}`}
            onClick={() => setActiveTab('farm')}
          >
            <FiHome className="farmer-profile-tab-icon" />
            <span>Farm Details</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="farmer-profile-content-wrapper">
        {/* Profile Photo Section */}
        <div className="farmer-profile-photo-section">
          <div className="farmer-profile-photo-card">
            <div className="farmer-profile-photo-container">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="farmer-profile-photo" />
              ) : (
                <div className="farmer-profile-photo-placeholder">
                  <FiUser size={48} />
                </div>
              )}
            </div>
            <div className="farmer-profile-user-info">
              <h3>{formData.basicInfo.name}</h3>
              <p><FiUser /> {formData.basicInfo.email}</p>
              <p><FiPhone /> {formData.basicInfo.contact_no}</p>
            </div>
            <div className="farmer-profile-photo-actions">
              <input
                type="file"
                id="farmer-profile-photo-upload"
                onChange={handlePhotoChange}
                accept="image/*"
                hidden
              />
              <label htmlFor="farmer-profile-photo-upload" className="farmer-profile-photo-action-btn farmer-profile-upload-btn">
                <FiUpload /> {profilePhoto ? 'Change Photo' : 'Upload Photo'}
              </label>
              {profilePhoto && (
                <button 
                  className="farmer-profile-photo-action-btn farmer-profile-remove-btn"
                  onClick={handleRemovePhoto}
                >
                  <FiTrash2 /> Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="farmer-profile-details-section">
          {activeTab === 'personal' ? (
            <div className="farmer-profile-details-card">
              <div className="farmer-profile-card-header">
                <h2>Personal Information</h2>
                {!editMode.personal ? (
                  <button 
                    className="farmer-profile-edit-btn"
                    onClick={() => setEditMode({...editMode, personal: true})}
                  >
                    <FiEdit /> Edit
                  </button>
                ) : null}
              </div>

              {!editMode.personal ? (
                <div className="farmer-profile-details-grid">
                  {Object.entries(formData.personal).map(([key, value]) => (
                    <div className="farmer-profile-detail-item" key={key}>
                      <label className="farmer-profile-detail-label">
                        {getFieldIcon(key)}
                        {formatLabel(key)}
                      </label>
                      <div className={`farmer-profile-detail-value ${value ? '' : 'farmer-profile-empty'}`}>
                        {value || 'Not provided'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={(e) => handleSubmit('personal', e)} className="farmer-profile-edit-form">
                  <div className="farmer-profile-form-grid">
                    {Object.entries(formData.personal).map(([key, value]) => (
                      <div className="farmer-profile-form-group" key={key}>
                        <label>
                          {getFieldIcon(key)}
                          {formatLabel(key)}
                        </label>
                        {renderFormField('personal', key, value)}
                      </div>
                    ))}
                  </div>
                  <div className="farmer-profile-form-actions">
                    <button
                      type="button"
                      className="farmer-profile-cancel-btn"
                      onClick={() => setEditMode({...editMode, personal: false})}
                    >
                      <FiX /> Cancel
                    </button>
                    <button type="submit" className="farmer-profile-save-btn">
                      <FiSave /> Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="farmer-profile-details-card">
              <div className="farmer-profile-card-header">
                <h2>Farm Information</h2>
                {!editMode.farm ? (
                  <button 
                    className="farmer-profile-edit-btn"
                    onClick={() => setEditMode({...editMode, farm: true})}
                  >
                    <FiEdit /> Edit
                  </button>
                ) : null}
              </div>

              {!editMode.farm ? (
                <div className="farmer-profile-details-grid">
                  {Object.entries(formData.farm).map(([key, value]) => (
                    <div className="farmer-profile-detail-item" key={key}>
                      <label className="farmer-profile-detail-label">
                        {getFieldIcon(key)}
                        {formatLabel(key)}
                      </label>
                      <div className={`farmer-profile-detail-value ${isFileField(key) ? (value ? 'farmer-profile-uploaded' : 'farmer-profile-not-uploaded') : ''} ${value ? '' : 'farmer-profile-empty'}`}>
                        {isFileField(key) ? (value ? 'Uploaded' : 'Not uploaded') : (value || 'Not provided')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={(e) => handleSubmit('farm', e)} className="farmer-profile-edit-form">
                  <div className="farmer-profile-form-grid">
                    {Object.entries(formData.farm).map(([key, value]) => (
                      <div className="farmer-profile-form-group" key={key}>
                        <label>
                          {getFieldIcon(key)}
                          {formatLabel(key)}
                        </label>
                        {isFileField(key) ? (
                          <div className="farmer-profile-file-upload-group">
                            <input
                              type="file"
                              id={key}
                              onChange={(e) => handleFileUpload('farm', key, e)}
                              hidden
                            />
                            <label htmlFor={key} className="farmer-profile-file-upload-btn">
                              <FiUpload /> Choose File
                            </label>
                            {value && <span className="farmer-profile-file-name">{value}</span>}
                          </div>
                        ) : (
                          renderFormField('farm', key, value)
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="farmer-profile-form-actions">
                    <button
                      type="button"
                      className="farmer-profile-cancel-btn"
                      onClick={() => setEditMode({...editMode, farm: false})}
                    >
                      <FiX /> Cancel
                    </button>
                    <button type="submit" className="farmer-profile-save-btn">
                      <FiSave /> Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;