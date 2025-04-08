
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// import defaultProfilePhoto from '../path/to/local/default-profile.png'; // Add a local default image
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
  FiTool,
  FiFile
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
      dob: "",
      gender: "",
      contact_no: "",
      aadhaar_no: "",
      residential_address: "",
      bank_account_no: "",
      ifsc_code: "",
      bank_branch: "",
      upi_id: "",
      profile_photo: null,
      aadhaar_proof: null,
      bank_proof: null
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
        
        const response = await axios.get(
          `http://localhost:5000/api/farmerprofile/${farmer_id}`,
          {
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        
        const farmerData = response.data;

        // Set basic info
        const basicInfo = {
          name: farmerData.full_name || `${farmerData.first_name} ${farmerData.last_name}`,
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
          bank_branch: farmerData.personal.bank_branch || "",
          profile_photo: farmerData.personal.profile_photo || null,
          aadhaar_proof: farmerData.personal.aadhaar_proof || null,
          bank_proof: farmerData.personal.bank_proof || null
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
          profile_photo: null,
          aadhaar_proof: null,
          bank_proof: null
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
          land_ownership_proof: farmerData.farm.land_ownership_proof || null,
          certification: farmerData.farm.certification || null,
          land_lease_agreement: farmerData.farm.land_lease_agreement || null,
          farm_photographs: farmerData.farm.farm_photographs || null
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
          farm:farmerData.farm || {}
        });

        // Handle profile photo
        if (personal.profile_photo) {
          setProfilePhoto(`http://localhost:5000${personal.profile_photo}?t=${Date.now()}`);
        }

        // Fetch bank branch details if IFSC is available
        if (personal.ifsc_code && personal.ifsc_code.length === 11 && !personal.bank_branch) {
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
      formData.append('field', field);
      
      const res = await axios.post(
        `http://localhost:5000/api/farmerprofile/${farmer_id}/upload-file`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Ensure the response contains the filename
      const filename = res.data.filename || res.data.fileUrl;
      if (!filename) {
        throw new Error('No filename returned from server');
      }

      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: filename }
      }));

      // If profile photo was uploaded, update the profile photo state
      if (field === 'profile_photo') {
        setProfilePhoto(`http://localhost:5000/uploads/${filename}`);
      }

      alert('File uploaded successfully!');
    } catch (error) {
      console.error("Error uploading file", error);
      alert('Error uploading file. Please try again.');
    }
  };


  // Show preview immediately
  const reader = new FileReader();
  reader.onload = (e) => {
    setProfilePhoto(e.target.result); // Set as base64 temporarily
  };
  // reader.readAsDataURL(file);
  // Handle profile photo change
  // const handlePhotoChange = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;
  
  //   try {
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     formData.append('field', 'profile_photo');
      
  //     const res = await axios.post(
  //       `http://localhost:5000/api/farmerprofile/${farmer_id}/upload-file`, 
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`
  //         }
  //       }
  //     );
  //     console.log('Upload response:', res.data); // Add this line
  //     const filename = res.data.filename || res.data.fileUrl;
  //     if (!filename) {
  //       throw new Error('No filename returned from server');
  //     }
  
  //     setProfilePhoto(`http://localhost:5000/uploads/${filename}`);
  //     setFormData(prev => ({
  //       ...prev,
  //       personal: { ...prev.personal, profile_photo: filename }
  //     }));
  
  //     alert('Profile photo uploaded successfully!');
  //   } catch (error) {
  //     console.error('Error uploading file:', error);
  //     alert('Error uploading profile photo. Please try again.');
  //   }
  // };

  // Handle profile photo change - Fixed version
// Update the handlePhotoChange function in FarmerProfile.js
const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Show immediate preview
  const reader = new FileReader();
  reader.onload = (e) => {
    setProfilePhoto(e.target.result);
  };
  reader.readAsDataURL(file);

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', 'profile_photo');
    
    const res = await axios.post(
      `http://localhost:5000/api/farmerprofile/${farmer_id}/upload-file`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    // Update with the server URL
    setProfilePhoto(`http://localhost:5000${res.data.filePath}?t=${Date.now()}`);
    setFormData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        profile_photo: res.data.filePath
      }
    }));

    alert('Profile photo uploaded successfully!');
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Error uploading profile photo. Please try again.');
    setProfilePhoto(null);
  }
};

// Update the remove photo function
const handleRemovePhoto = async () => {
  try {
    await axios.delete(
      `http://localhost:5000/api/farmerprofile/${farmer_id}/remove-file`, 
      {
        data: { field: 'profile_photo' },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    setProfilePhoto(null);
    setFormData(prev => ({
      ...prev,
      personal: { ...prev.personal, profile_photo: null }
    }));
    alert('Profile photo removed successfully!');
  } catch (error) {
    console.error("Error removing photo", error);
    alert('Error removing photo. Please try again.');
  }
};

  // Remove file
  const handleRemoveFile = async (section, field) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/farmerprofile/${farmer_id}/remove-file`, 
        {
          data: { field },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: null }
      }));
      
      alert('File removed successfully!');
    } catch (error) {
      console.error("Error removing file", error);
      alert('Error removing file. Please try again.');
    }
  };

  // Handle form submission
const handleSubmit = async (section, e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const dataToSend = formData[section];
    
    // Remove file fields if they're null (we handle files separately)
    Object.keys(dataToSend).forEach(key => {
      if (isFileField(key) && dataToSend[key] === null) {
        delete dataToSend[key];
      }
    });

    await axios.put(
      `http://localhost:5000/api/farmerprofile/${farmer_id}/${section}`,
      dataToSend,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

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
           key === 'certification' || key === 'farm_photographs' || 
           key === 'profile_photo' || key === 'aadhaar_proof' || 
           key === 'bank_proof';
  };

  const getFieldIcon = (key) => {
    switch(key) {
      case 'contact_no': return <FiPhone className="farmer-profile-field-icon" />;
      case 'aadhaar_no': 
      case 'aadhaar_proof': return <FiUser className="farmer-profile-field-icon" />;
      case 'residential_address': 
      case 'farm_address': return <FiMapPin className="farmer-profile-field-icon" />;
      case 'bank_account_no': 
      case 'ifsc_code': 
      case 'bank_branch': 
      case 'upi_id': 
      case 'bank_proof': return <FiCreditCard className="farmer-profile-field-icon" />;
      case 'water_sources': return <FiDroplet className="farmer-profile-field-icon" />;
      case 'crops_grown': return <FiCrop className="farmer-profile-field-icon" />;
      case 'farm_equipment': return <FiTool className="farmer-profile-field-icon" />;
      case 'land_ownership_proof':
      case 'certification':
      case 'land_lease_agreement':
      case 'farm_photographs': return <FiFile className="farmer-profile-field-icon" />;
      default: return <FiUser className="farmer-profile-field-icon" />;
    }
  };

  const renderFormField = (section, key, value) => {
    if (key === 'gender') {
      return (
        <select
          name={key}
          value={value || ''}
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
          value={value || ''}
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
          value={value || ''}
          onChange={(e) => handleChange(section, e)}
          required
          className="farmer-profile-form-input"
        />
      );
    } else if (isFileField(key)) {
      return (
        <div className="farmer-profile-file-upload-group">
          <input
            type="file"
            id={`${section}-${key}`}
            onChange={(e) => handleFileUpload(section, key, e)}
            accept={key === 'profile_photo' ? 'image/*' : '.pdf,.doc,.docx,.jpg,.jpeg,.png'}
            hidden
          />
          <label htmlFor={`${section}-${key}`} className="farmer-profile-file-upload-btn">
            <FiUpload /> Choose File
          </label>
          {value && (
            <span className="farmer-profile-file-name">
              {typeof value === 'string' ? (
                <a 
                  href={`http://localhost:5000${value}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="farmer-profile-file-link"
                >
                  View {key.replace('_', ' ')}
                </a>
              ) : 'Uploaded file'}
              <button 
                type="button" 
                className="farmer-profile-file-remove-btn"
                onClick={() => handleRemoveFile(section, key)}
              >
                <FiTrash2 />
              </button>
            </span>
          )}
        </div>
      );
    } else {
      return (
        <input
          type="text"
          name={key}
          value={value || ''}
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
                <img 
               src={`/uploads/farmer-documents/${profilePhoto}`}
                alt="Profile"
                className="farmer-profile-photo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-profile.png'; // Local fallback
                }}
              />              
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
                    key !== 'profile_photo' && (
                      <div className="farmer-profile-detail-item" key={key}>
                        <label className="farmer-profile-detail-label">
                          {getFieldIcon(key)}
                          {formatLabel(key)}
                        </label>
                        <div className={`farmer-profile-detail-value ${isFileField(key) ? (value ? 'farmer-profile-uploaded' : 'farmer-profile-not-uploaded') : ''} ${value ? '' : 'farmer-profile-empty'}`}>
                          {isFileField(key) ? (
                            value ? (
                              <a 
                                href={`http://localhost:5000/uploads/${value}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="farmer-profile-file-link"
                              >
                                View File
                              </a>
                            ) : 'Not uploaded'
                          ) : (value || 'Not provided')}
                        </div>
                      </div>
                    )
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
                        {isFileField(key) ? (
                          value ? (
                            <a 
                              href={`http://localhost:5000/uploads/${value}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="farmer-profile-file-link"
                            >
                              View File
                            </a>
                          ) : 'Not uploaded'
                        ) : (value || 'Not provided')}
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
                        {renderFormField('farm', key, value)}
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




// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// // import defaultProfilePhoto from "F:/Project/KRISHISETU/krishisetu-final/frontend/src/assets/profilePhotoUpload"; // Add a local default image
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
//   FiTool,
//   FiFile,
//   FiDownload
// } from "react-icons/fi";
// import "../styles/FarmerProfile.css";


// const FILE_BASE_URL = 'http://localhost:5000/uploads/farmer-documents';

// const FarmerProfile = () => {
//   const { farmer_id } = useParams();
//   const [activeTab, setActiveTab] = useState("personal");
//   const [profilePhoto, setProfilePhoto] = useState(defaultProfilePhoto);
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
//       profile_photo: null,
//       aadhaar_proof: null,
//       bank_proof: null
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
//             withCredentials: true,
//             headers: {
//               'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//           }
//         );
        
        
//         const farmerData = response.data;

//         // Set basic info
//         const basicInfo = {
//           name: farmerData.full_name || `${farmerData.first_name} ${farmerData.last_name}`,
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
//           bank_branch: farmerData.personal.bank_branch || "",
//           profile_photo: farmerData.personal.profile_photo || null,
//           aadhaar_proof: farmerData.personal.aadhaar_proof || null,
//           bank_proof: farmerData.personal.bank_proof || null
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
//           profile_photo: null,
//           aadhaar_proof: null,
//           bank_proof: null
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
//           land_ownership_proof: farmerData.farm.land_ownership_proof || null,
//           certification: farmerData.farm.certification || null,
//           land_lease_agreement: farmerData.farm.land_lease_agreement || null,
//           farm_photographs: farmerData.farm.farm_photographs || null
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
//           farm:farmerData.farm || {}
//         });

//         // Handle profile photo
//         if (personal.profile_photo) {
//           setProfilePhoto(`http://localhost:5000${personal.profile_photo}?t=${Date.now()}`);
//         }

//         // Fetch bank branch details if IFSC is available
//         if (personal.ifsc_code && personal.ifsc_code.length === 11 && !personal.bank_branch) {
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
//       formData.append('field', field);
      
//       const res = await axios.post(
//         `http://localhost:5000/api/farmerprofile/${farmer_id}/upload-file`, 
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         }
//       );

//       // Ensure the response contains the filename
//       const filename = res.data.filename || res.data.fileUrl;
//       if (!filename) {
//         throw new Error('No filename returned from server');
//       }

//       setFormData(prev => ({
//         ...prev,
//         [section]: { ...prev[section], [field]: filename }
//       }));

//       // If profile photo was uploaded, update the profile photo state
//       if (field === 'profile_photo') {
//         setProfilePhoto(`http://localhost:5000/uploads/${filename}`);
//       }

//       alert('File uploaded successfully!');
//     } catch (error) {
//       console.error("Error uploading file", error);
//       alert('Error uploading file. Please try again.');
//     }
//   };


//   // Show preview immediately
//   const reader = new FileReader();
//   reader.onload = (e) => {
//     setProfilePhoto(e.target.result); // Set as base64 temporarily
//   };
//   // reader.readAsDataURL(file);
//   // Handle profile photo change
//   // const handlePhotoChange = async (e) => {
//   //   const file = e.target.files[0];
//   //   if (!file) return;
  
//   //   try {
//   //     const formData = new FormData();
//   //     formData.append('file', file);
//   //     formData.append('field', 'profile_photo');
      
//   //     const res = await axios.post(
//   //       `http://localhost:5000/api/farmerprofile/${farmer_id}/upload-file`, 
//   //       formData,
//   //       {
//   //         headers: {
//   //           'Content-Type': 'multipart/form-data',
//   //           'Authorization': `Bearer ${localStorage.getItem('token')}`
//   //         }
//   //       }
//   //     );
//   //     console.log('Upload response:', res.data); // Add this line
//   //     const filename = res.data.filename || res.data.fileUrl;
//   //     if (!filename) {
//   //       throw new Error('No filename returned from server');
//   //     }
  
//   //     setProfilePhoto(`http://localhost:5000/uploads/${filename}`);
//   //     setFormData(prev => ({
//   //       ...prev,
//   //       personal: { ...prev.personal, profile_photo: filename }
//   //     }));
  
//   //     alert('Profile photo uploaded successfully!');
//   //   } catch (error) {
//   //     console.error('Error uploading file:', error);
//   //     alert('Error uploading profile photo. Please try again.');
//   //   }
//   // };

//   // Handle profile photo change - Fixed version
// // Update the handlePhotoChange function in FarmerProfile.js
// const handlePhotoChange = async (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   // Show immediate preview
//   const reader = new FileReader();
//   reader.onload = (e) => {
//     setProfilePhoto(e.target.result);
//   };
//   reader.readAsDataURL(file);

//   try {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('field', 'profile_photo');
    
//     const res = await axios.post(
//       `http://localhost:5000/api/farmerprofile/${farmer_id}/upload-file`,
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       }
//     );

//     // Update with the server URL
//     setProfilePhoto(`http://localhost:5000${res.data.filePath}?t=${Date.now()}`);
//     setFormData(prev => ({
//       ...prev,
//       personal: {
//         ...prev.personal,
//         profile_photo: res.data.filePath
//       }
//     }));

//     alert('Profile photo uploaded successfully!');
//   } catch (error) {
//     console.error('Upload failed:', error);
//     alert('Error uploading profile photo. Please try again.');
//     setProfilePhoto(null);
//   }
// };

// // Update the remove photo function
// const handleRemovePhoto = async () => {
//   try {
//     await axios.delete(
//       `http://localhost:5000/api/farmerprofile/${farmer_id}/remove-file`, 
//       {
//         data: { field: 'profile_photo' },
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       }
//     );
//     setProfilePhoto(null);
//     setFormData(prev => ({
//       ...prev,
//       personal: { ...prev.personal, profile_photo: null }
//     }));
//     alert('Profile photo removed successfully!');
//   } catch (error) {
//     console.error("Error removing photo", error);
//     alert('Error removing photo. Please try again.');
//   }
// };

//   // Remove file
//   const handleRemoveFile = async (section, field) => {
//     try {
//       await axios.delete(
//         `http://localhost:5000/api/farmerprofile/${farmer_id}/remove-file`, 
//         {
//           data: { field },
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         }
//       );
      
//       setFormData(prev => ({
//         ...prev,
//         [section]: { ...prev[section], [field]: null }
//       }));
      
//       alert('File removed successfully!');
//     } catch (error) {
//       console.error("Error removing file", error);
//       alert('Error removing file. Please try again.');
//     }
//   };

//   // Handle form submission
// const handleSubmit = async (section, e) => {
//   e.preventDefault();
//   try {
//     const token = localStorage.getItem('token');
//     const dataToSend = formData[section];
    
//     // Remove file fields if they're null (we handle files separately)
//     Object.keys(dataToSend).forEach(key => {
//       if (isFileField(key) && dataToSend[key] === null) {
//         delete dataToSend[key];
//       }
//     });

//     await axios.put(
//       `http://localhost:5000/api/farmerprofile/${farmer_id}/${section}`,
//       dataToSend,
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     setEditMode(prev => ({ ...prev, [section]: false }));
//     alert(`${section === 'personal' ? 'Personal' : 'Farm'} details updated successfully!`);
//   } catch (error) {
//     console.error(`Error updating ${section} details:`, error);
//     alert(`Error updating ${section} details. Please try again.`);
//   }
// };

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
//            key === 'certification' || key === 'farm_photographs' || 
//            key === 'profile_photo' || key === 'aadhaar_proof' || 
//            key === 'bank_proof';
//   };

//   const getFieldIcon = (key) => {
//     switch(key) {
//       case 'contact_no': return <FiPhone className="farmer-profile-field-icon" />;
//       case 'aadhaar_no': 
//       case 'aadhaar_proof': return <FiUser className="farmer-profile-field-icon" />;
//       case 'residential_address': 
//       case 'farm_address': return <FiMapPin className="farmer-profile-field-icon" />;
//       case 'bank_account_no': 
//       case 'ifsc_code': 
//       case 'bank_branch': 
//       case 'upi_id': 
//       case 'bank_proof': return <FiCreditCard className="farmer-profile-field-icon" />;
//       case 'water_sources': return <FiDroplet className="farmer-profile-field-icon" />;
//       case 'crops_grown': return <FiCrop className="farmer-profile-field-icon" />;
//       case 'farm_equipment': return <FiTool className="farmer-profile-field-icon" />;
//       case 'land_ownership_proof':
//       case 'certification':
//       case 'land_lease_agreement':
//       case 'farm_photographs': return <FiFile className="farmer-profile-field-icon" />;
//       default: return <FiUser className="farmer-profile-field-icon" />;
//     }
//   };

//   const renderFormField = (section, key, value) => {
//     if (key === 'gender') {
//       return (
//         <select
//           name={key}
//           value={value || ''}
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
//           value={value || ''}
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
//           value={value || ''}
//           onChange={(e) => handleChange(section, e)}
//           required
//           className="farmer-profile-form-input"
//         />
//       );
//     } else if (isFileField(key)) {
//       return (
//         <div className="farmer-profile-file-upload-group">
//           <input
//             type="file"
//             id={`${section}-${key}`}
//             onChange={(e) => handleFileUpload(section, key, e)}
//             accept={key === 'profile_photo' ? 'image/*' : '.pdf,.doc,.docx,.jpg,.jpeg,.png'}
//             hidden
//           />
//           <label htmlFor={`${section}-${key}`} className="farmer-profile-file-upload-btn">
//             <FiUpload /> Choose File
//           </label>
//           {value && (
//             <span className="farmer-profile-file-name">
//               {typeof value === 'string' ? (
//                 <a 
//                   href={`http://localhost:5000${value}`} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className="farmer-profile-file-link"
//                 >
//                   View {key.replace('_', ' ')}
//                 </a>
//               ) : 'Uploaded file'}
//               <button 
//                 type="button" 
//                 className="farmer-profile-file-remove-btn"
//                 onClick={() => handleRemoveFile(section, key)}
//               >
//                 <FiTrash2 />
//               </button>
//             </span>
//           )}
//         </div>
//       );
//     } else {
//       return (
//         <input
//           type="text"
//           name={key}
//           value={value || ''}
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
//                 <img 
//                   src={profilePhoto} 
//                   alt="Profile" 
//                   className="farmer-profile-photo"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.src = 'https://via.placeholder.com/150?text=No+Photo'; // new reliable fallback
//                   }}
//                 />
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
//                     key !== 'profile_photo' && (
//                       <div className="farmer-profile-detail-item" key={key}>
//                         <label className="farmer-profile-detail-label">
//                           {getFieldIcon(key)}
//                           {formatLabel(key)}
//                         </label>
//                         <div className={`farmer-profile-detail-value ${isFileField(key) ? (value ? 'farmer-profile-uploaded' : 'farmer-profile-not-uploaded') : ''} ${value ? '' : 'farmer-profile-empty'}`}>
//                           {isFileField(key) ? (
//                             value ? (
//                               <a 
//                                 href={`http://localhost:5000/uploads/${value}`} 
//                                 target="_blank" 
//                                 rel="noopener noreferrer"
//                                 className="farmer-profile-file-link"
//                               >
//                                 View File
//                               </a>
//                             ) : 'Not uploaded'
//                           ) : (value || 'Not provided')}
//                         </div>
//                       </div>
//                     )
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
//                         {isFileField(key) ? (
//                           value ? (
//                             <a 
//                               href={`http://localhost:5000/uploads/${value}`} 
//                               target="_blank" 
//                               rel="noopener noreferrer"
//                               className="farmer-profile-file-link"
//                             >
//                               View File
//                             </a>
//                           ) : 'Not uploaded'
//                         ) : (value || 'Not provided')}
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
//                         {renderFormField('farm', key, value)}
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