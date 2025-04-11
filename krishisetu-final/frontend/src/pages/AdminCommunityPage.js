import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Navbar3 from "../components/Navbar3.js";
import { 
  FaEdit, 
  FaUserPlus, 
  FaShoppingBasket, 
  FaUserMinus, 
  FaSearch, 
  FaArrowLeft, 
  FaCrown,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaUsersSlash
} from "react-icons/fa";
import "../styles/AdminCommunityPage.css";

function AdminCommunityPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMember, setNewMember] = useState({ name: "", email: "", phone: "" });
  const [editDetails, setEditDetails] = useState({ address: "", deliveryDate: "", deliveryTime: "" });
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { consumer } = useAuth();
// Add this state
const [communityStatus, setCommunityStatus] = useState({
  isFrozen: false,
  hoursUntilFreeze: 0,
  deliveryDate: '',
  deliveryTime: ''
});

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [communityRes, membersRes] = await Promise.all([
          fetch(`http://localhost:5000/api/community/${communityId}`,{
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }),
          fetch(`http://localhost:5000/api/community/${communityId}/members`,{
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          })
        ]);

        const [communityData, membersData] = await Promise.all([
          communityRes.json(),
          membersRes.json()
        ]);

        if (!communityRes.ok) throw new Error(communityData.message || "Failed to fetch community");
        if (!membersRes.ok) throw new Error("Failed to fetch members");

        setCommunity(communityData.data);
        setMembers(membersData);
        setEditDetails({
          address: communityData.data.address || "",
          deliveryDate: communityData.data.delivery_date || "",
          deliveryTime: communityData.data.delivery_time || ""
        });

      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityData();
  }, [communityId]);

  // Add this useEffect to check community status
useEffect(() => {
  const fetchCommunityStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/community/${communityId}/status`, {
          headers: { 
            'Authorization': `Bearer ${consumer.token}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setCommunityStatus({
          isFrozen: data.isFrozen,
          hoursUntilFreeze: data.hoursUntilFreeze,
          deliveryDate: data.deliveryDate,
          deliveryTime: data.deliveryTime
        });
      }
    } catch (error) {
      console.error("Error fetching community status:", error);
    }
  };

  fetchCommunityStatus();
}, [communityId]);

// Add this component to display freeze status
const FreezeStatusBanner = () => {
  if (communityStatus.isFrozen) {
    return (
      <div className="krishi-freeze-banner frozen">
        <strong>Community Frozen:</strong> No new members can be added. 
        Delivery scheduled for {communityStatus.deliveryDate} at {communityStatus.deliveryTime}
      </div>
    );
  } else if (communityStatus.hoursUntilFreeze > 0) {
    return (
      <div className="krishi-freeze-banner warning">
        <strong>Community will freeze in {communityStatus.hoursUntilFreeze} hours.</strong> 
        After that, no new members can be added until after delivery.
      </div>
    );
  }
  return null;
};

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.phone) {
      alert("Please fill all fields before adding a member.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/community/${communityId}/add-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
          'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify({ 
          communityId, 
          name: newMember.name,
          email: newMember.email,
          phone: newMember.phone,
        }),
      });


      
      const data = await response.json();
      if (response.ok) {
        alert("Member added successfully!");

        // Store the member ID in localStorage if the added member is the current user
        if (newMember.email === consumer.email) {
          localStorage.setItem("memberId", data.memberId);
          localStorage.setItem("currentCommunityId", communityId);
        }

        // Fetch updated members list
        const updatedMembersResponse = await fetch(
         ` http://localhost:5000/api/community/${communityId}/members`,{
          headers: { 
            'Authorization': `Bearer ${consumer.token}`
          },
         }
        );
        const updatedMembers = await updatedMembersResponse.json();

        // Filter out the admin from the updated members list
        const filteredMembers = updatedMembers.filter(
          (member) => member.consumer_id !== community?.admin_id
        );

        // Update the state with the filtered members list
         // Update the state with the filtered members list
         setMembers(filteredMembers.map((member, index) => ({
          id: member.id || member.member_id || index,
          name: member.name,
          phone: member.phone,
          email: member.member_email || member.email,
          consumer_id: member.consumer_id
        })));

        // Reset the form
        setNewMember({ name: "", email: "", phone: "" });
        setShowAddMemberForm(false);
      } else {
        alert(data.error || "Error adding member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("An error occurred while adding the member.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/community/${communityId}/remove-member/${memberId}`,
          {
            method: "DELETE",
            headers: { 
              'Authorization': `Bearer ${consumer.token}`,
              'Content-Type': 'application/json' // Recommended to include
            }
          }
      );

      if (!response.ok) throw new Error(await response.text());

      setMembers(members.filter(member => member.id !== memberId));
      alert("Member removed successfully!");
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member: " + error.message);
    }
  };

  const handleUpdateDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/community/${communityId}/update-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" ,
           'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify(editDetails),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Community details updated successfully!");
        setCommunity({ ...community, ...editDetails });
        setShowEditForm(false);
      } else {
        alert(data.error || "Error updating community details");
      }
    } catch (error) {
      console.error("Error updating community details:", error);
      alert("An error occurred while updating community details.");
    }
  };

  if (isLoading) {
    return (
      <div className="krishi-adcom-loading">
        <Navbar3 />
        <div className="krishi-adcom-loading-content">
          <div className="krishi-adcom-spinner"></div>
          <p>Loading community details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="krishi-adcom-error">
        <Navbar3 />
        <div className="krishi-adcom-error-content">
          <h2>Error Loading Community</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="krishi-adcom-not-found">
        <Navbar3 />
        <div className="krishi-adcom-not-found-content">
          <h2>Community Not Found</h2>
          <p>The requested community does not exist or you don't have access.</p>
          <button onClick={() => navigate("/consumer-dashboard")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="krishi-adcom-container">
      <Navbar3 />
      
      <div className="krishi-adcom-content">
        {/* Community Header */}
        <div className="krishi-adcom-header">
          <div className="krishi-adcom-header-content">
            <div className="krishi-adcom-title-wrapper">
              <h1 className="krishi-adcom-title">{community.name}</h1>
              <span className="krishi-adcom-admin-badge">
                <FaCrown /> Admin
              </span>
            </div>
            
            <FreezeStatusBanner />
            
            <div className="krishi-adcom-meta-grid">
              <div className="krishi-adcom-meta-item">
                <div className="krishi-adcom-meta-icon">
                  <FaCrown />
                </div>
                <div className="krishi-adcom-meta-text">
                  <span>Admin</span>
                  <strong>{community.admin_name}</strong>
                </div>
              </div>
              
              <div className="krishi-adcom-meta-item">
                <div className="krishi-adcom-meta-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="krishi-adcom-meta-text">
                  <span>Address</span>
                  <strong>{community.address || "Not specified"}</strong>
                </div>
              </div>
              
              <div className="krishi-adcom-meta-item">
                <div className="krishi-adcom-meta-icon">
                  <FaCalendarAlt />
                </div>
                <div className="krishi-adcom-meta-text">
                  <span>Delivery</span>
                  <strong>
                    {community.delivery_date || "Not set"} at {community.delivery_time || "Not set"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
          
          <div className="krishi-adcom-header-actions">
            <button 
              onClick={() => setShowEditForm(!showEditForm)} 
              className="krishi-adcom-action-btn"
            >
              <FaEdit /> {showEditForm ? "Cancel" : "Edit Details"}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {showEditForm && (
          <div className="krishi-adcom-edit-form">
            <h3>Edit Community Details</h3>
            <div className="krishi-adcom-form-group">
              <label>Address</label>
              <input
                type="text"
                value={editDetails.address}
                onChange={(e) => setEditDetails({ ...editDetails, address: e.target.value })}
              />
            </div>
            
            <div className="krishi-adcom-form-row">
              <div className="krishi-adcom-form-group">
                <label>Delivery Date</label>
                <input
                  type="date"
                  value={editDetails.deliveryDate}
                  onChange={(e) => setEditDetails({ ...editDetails, deliveryDate: e.target.value })}
                />
              </div>
              
              <div className="krishi-adcom-form-group">
                <label>Delivery Time</label>
                <input
                  type="time"
                  value={editDetails.deliveryTime}
                  onChange={(e) => setEditDetails({ ...editDetails, deliveryTime: e.target.value })}
                />
              </div>
            </div>
            
            <div className="krishi-adcom-form-actions">
              <button 
                onClick={handleUpdateDetails}
                className="krishi-adcom-primary-btn"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Members Section */}
        <div className="krishi-adcom-members-section">
          <div className="krishi-adcom-section-header">
            <h2>Community Members</h2>
            <div className="krishi-adcom-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          {filteredMembers.length > 0 ? (
            <div className="krishi-adcom-members-grid">
              {filteredMembers.map((member) => (
                <div key={member.id} className="krishi-adcom-member-card">
                  <div className="krishi-adcom-member-avatar">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="krishi-adcom-member-details">
                    <h3>{member.name}</h3>
                    <p><FaPhone /> {member.phone}</p>
                    {member.email && <p><FaEnvelope /> {member.email}</p>}
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="krishi-adcom-remove-btn"
                  >
                    <FaUserMinus /> Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="krishi-adcom-no-members">
              <FaUsersSlash />
              <p>No members found matching your search</p>
            </div>
          )}
          
          {/* Add Member Form */}
          <div className="krishi-adcom-add-member-section">
            <button 
              onClick={() => setShowAddMemberForm(!showAddMemberForm)}
              className="krishi-adcom-add-member-toggle"
            >
              <FaUserPlus /> {showAddMemberForm ? "Cancel" : "Add New Member"}
            </button>
            
            {showAddMemberForm && (
              <div className="krishi-adcom-add-member-form">
                <h3>Add New Member</h3>
                <div className="krishi-adcom-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter member's full name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                
                <div className="krishi-adcom-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter member's email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
                
                <div className="krishi-adcom-form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="Enter member's phone"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  />
                </div>
                
                <button 
                  onClick={handleAddMember}
                  className="krishi-adcom-primary-btn"
                >
                  Add Member
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="krishi-adcom-global-actions">
          <button 
            onClick={() => navigate(`/order/${communityId}`)}
            className="krishi-adcom-action-btn krishi-adcom-action-primary"
          >
            <FaShoppingBasket /> Place Community Order
          </button>
          
          <button 
            onClick={() => navigate("/consumer-dashboard")}
            className="krishi-adcom-action-btn"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminCommunityPage;