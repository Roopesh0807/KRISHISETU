import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js"; // Import Navbar3
import { FaEdit } from "react-icons/fa"; // Import Edit Icon
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

  useEffect(() => {
    fetch(`http://localhost:5000/api/community/${communityId}`)
      .then((response) => response.json())
      .then((data) => setCommunity(data))
      .catch((error) => console.error("Error fetching community details:", error));
  }, [communityId]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/community/${communityId}/members`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected data format:", data);
          return;
        }

        // Filter out the admin from the members list
        const filteredMembers = data.filter(
          (member) => member.consumer_id !== community?.admin_id
        );

        setMembers(filteredMembers.map((member, index) => ({
          id: member.id || member.member_id || index,
          name: member.name,
          phone: member.phone,
        })));
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, [communityId, community?.admin_id]); // Add community?.admin_id as a dependency

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredMembers = members.filter((member) =>
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
        headers: { "Content-Type": "application/json" },
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

        // Fetch updated members list
        const updatedMembersResponse = await fetch(
          `http://localhost:5000/api/community/${communityId}/members`
        );
        const updatedMembers = await updatedMembersResponse.json();

        // Filter out the admin from the updated members list
        const filteredMembers = updatedMembers.filter(
          (member) => member.consumer_id !== community?.admin_id
        );

        // Update the state with the filtered members list
        setMembers(filteredMembers.map((member, index) => ({
          id: member.id || member.member_id || index,
          name: member.name,
          phone: member.phone,
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
    if (!memberId || !communityId) {
      alert("Error: Member ID or Community ID is missing!");
      return;
    }

    console.log("Removing member with ID:", memberId); // Debugging line
    console.log("Community ID:", communityId); // Debugging line

    try {
      const response = await fetch(
        `http://localhost:5000/api/community/${communityId}/remove-member/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server Response Error:", errorText);
        alert("Failed to remove member: " + errorText);
        return;
      }

      alert("Member removed successfully!");
      setMembers(members.filter((member) => member.id !== memberId));
    } catch (error) {
      console.error("Error removing member:", error);
      alert("An error occurred while removing the member.");
    }
  };

  const handleUpdateDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/community/${communityId}/update-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editDetails, communityId }),
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

  return (
    <div className="krishi-admin-community-page">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      {/* Main Content */}
      <div className="krishi-main-content">
        {/* Community Details Section */}
        <div className="krishi-community-details-section">
          <div className="krishi-header">
            <h1>Community Name: {community?.name}</h1>
            <button className="krishi-edit-button" onClick={() => setShowEditForm(!showEditForm)}>
              <FaEdit /> Edit
            </button>
          </div>
          <div className="krishi-details">
            <p><strong>Admin:</strong> {community?.admin_name}</p>
            <p><strong>Address:</strong> {community?.address}</p>
            <p><strong>Delivery Date:</strong> {community?.delivery_date}</p>
            <p><strong>Delivery Time:</strong> {community?.delivery_time}</p>
          </div>

          {showEditForm && (
            <div className="krishi-edit-details-form">
              <h3>Edit Community Details</h3>
              <input
                type="text"
                placeholder="Address"
                value={editDetails.address}
                onChange={(e) => setEditDetails({ ...editDetails, address: e.target.value })}
              />
              <input
                type="date"
                value={editDetails.deliveryDate}
                onChange={(e) => setEditDetails({ ...editDetails, deliveryDate: e.target.value })}
              />
              <input
                type="time"
                value={editDetails.deliveryTime}
                onChange={(e) => setEditDetails({ ...editDetails, deliveryTime: e.target.value })}
              />
              <button onClick={handleUpdateDetails}>Update Details</button>
            </div>
          )}
        </div>

        {/* Members Section */}
        <div className="krishi-members-section">
          <div className="krishi-search-section">
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="krishi-members-list">
            {filteredMembers.map((member, index) => (
              <div key={member.id || `${member.name}-${index}`} className="krishi-member-card">
                <p><strong>{member.name}</strong></p>
                <p>{member.phone}</p>
                <button className="krishi-remove-button" onClick={() => handleRemoveMember(member.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="krishi-action-buttons">
            <button className="krishi-add-member-button" onClick={() => setShowAddMemberForm(!showAddMemberForm)}>
              {showAddMemberForm ? "Cancel" : "Add Member"}
            </button>
            <button className="krishi-order-button" onClick={() => navigate(`/order/${communityId}`)}>
              Place Order
            </button>
          </div>

          {showAddMemberForm && (
            <div className="krishi-add-member-form">
              <h3>Add New Member</h3>
              <input
                type="text"
                placeholder="Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
              />
              <button onClick={handleAddMember}>Add Member</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCommunityPage;