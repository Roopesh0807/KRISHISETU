// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// //import axios from "axios";
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
//         // Simulated API calls - replace with actual API endpoints
//         const personalRes = { data: {
//           dob: "1990-05-15",
//           gender: "Male",
//           contact_no: "9876543210",
//           aadhaar_no: "123456789012",
//           residential_address: "123 Green Valley, Farm Town",
//           bank_account_no: "12345678901234",
//           ifsc_code: "SBIN0001234",
//           bank_branch: "Main Branch",
//           upi_id: "farmer@upi",
//         }};
        
//         const farmRes = { data: {
//           farm_address: "456 Agriculture Lane, Rural District",
//           farm_size: "5 acres",
//           crops_grown: "Wheat, Rice, Vegetables",
//           farming_method: "Organic",
//           soil_type: "Alluvial",
//           water_sources: "Well, Canal",
//           farm_equipment: "Tractor, Plow, Irrigation System",
//           land_ownership_proof: "uploaded",
//           certification: "Organic_Certificate.pdf",
//           land_lease_agreement: null,
//           farm_photographs: "farm1.jpg, farm2.jpg",
//         }};
        
//         const photoRes = { data: { photo: null }};

//         setFormData({
//           personal: personalRes.data,
//           farm: farmRes.data
//         });

//         if (photoRes.data.photo) {
//           setProfilePhoto(`http://localhost:5000/uploads/${photoRes.data.photo}`);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
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
//       // Simulated API call - replace with actual API
//       const res = { data: { BRANCH: "Main Branch" } };
//       setFormData(prev => ({
//         ...prev,
//         personal: { ...prev.personal, bank_branch: res.data.BRANCH || "Branch Not Found" }
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
//       // Simulated upload - replace with actual API call
//       console.log(`Uploading ${field}...`);
//       setFormData(prev => ({
//         ...prev,
//         [section]: { ...prev[section], [field]: file.name }
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
//       // Simulated upload - replace with actual API call
//       console.log("Uploading profile photo...");
//       const imageUrl = URL.createObjectURL(file);
//       setProfilePhoto(imageUrl);
//     } catch (error) {
//       console.error("Error uploading photo", error);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (section, e) => {
//     e.preventDefault();
//     try {
//       // Simulated API call - replace with actual API
//       console.log(`Updating ${section} details:`, formData[section]);
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
//                   onClick={() => setProfilePhoto(null)}
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
  const { farmer_id } = useParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [editMode, setEditMode] = useState({ personal: false, farm: false });
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Form data state
  const [formData, setFormData] = useState({
    personal: {
      email: "",
      contact_no: "",
      aadhaar_no: "",
      residential_address: "",
      bank_account_no: "",
      ifsc_code: "",
      upi_id: "",
      dob: "",
      gender: ""
    },
    farm: {
      farm_address: "",
      farm_size: "",
      crops_grown: "",
      farming_method: "",
      soil_type: "",
      water_sources: "",
      farm_equipment: ""
    }
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fetch farmer data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const id = farmer_id || localStorage.getItem("farmerID");
        
        if (!id) {
          console.error("No farmer ID found");
          return;
        }
        
        
        // Fetch personal details
        const personalRes = await axios.get(`http://localhost:5000/api/getpersonaldetails?farmer_id=${id}`);
        
        // Fetch farm details
        const farmRes = await axios.get(`http://localhost:5000/api/getfarmdetails?farmer_id=${id}`);

        setFormData({
          personal: {
            email: personalRes.data.email || "",
            contact_no: personalRes.data.contact_no || "",
            aadhaar_no: personalRes.data.aadhaar_no || "",
            residential_address: personalRes.data.residential_address || "",
            bank_account_no: personalRes.data.bank_account_no || "",
            ifsc_code: personalRes.data.ifsc_code || "",
            upi_id: personalRes.data.upi_id || "",
            dob: personalRes.data.dob || "",
            gender: personalRes.data.gender || ""
          },
          farm: {
            farm_address: farmRes.data.farm_address || "",
            farm_size: farmRes.data.farm_size || "",
            crops_grown: farmRes.data.crops_grown || "",
            farming_method: farmRes.data.farming_method || "",
            soil_type: farmRes.data.soil_type || "",
            water_sources: farmRes.data.water_sources || "",
            farm_equipment: farmRes.data.farm_equipment || ""
          }
        });

        // Fetch profile photo if available
        if (personalRes.data.profile_photo) {
          setProfilePhoto(`http://localhost:5000/uploads/${personalRes.data.profile_photo}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [farmer_id]);

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

  // Fetch bank branch details
  const fetchBranchDetails = async (ifsc) => {
    try {
      // This would be replaced with actual IFSC lookup API
      console.log("Fetching branch details for IFSC:", ifsc);
    } catch (error) {
      console.error("Invalid IFSC Code", error);
    }
  };

  // Handle file uploads
  const handleFileUpload = async (section, field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await axios.post(
        `http://localhost:5000/api/upload/${localStorage.getItem("farmerID")}`, 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: res.data.filePath }
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
      formData.append("file", file);
      
      const res = await axios.post(
        `http://localhost:5000/api/upload/${localStorage.getItem("farmerID")}`, 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const imageUrl = `http://localhost:5000${res.data.filePath}`;
      setProfilePhoto(imageUrl);
    } catch (error) {
      console.error("Error uploading photo", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (section, e) => {
    e.preventDefault();
    try {
      const id = localStorage.getItem("farmerID");
      const endpoint = section === "personal" 
        ? "/api/updatepersonaldetails" 
        : "/api/updatefarmdetails";
      
      await axios.post(`http://localhost:5000${endpoint}`, {
        user_id: id,
        ...formData[section]
      });

      setEditMode(prev => ({ ...prev, [section]: false }));
      alert(`${section === 'personal' ? 'Personal' : 'Farm'} details updated successfully!`);
    } catch (error) {
      console.error(`Error updating ${section} details:`, error);
      alert(`Error updating ${section} details. Please try again.`);
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
                  onClick={() => setProfilePhoto(null)}
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