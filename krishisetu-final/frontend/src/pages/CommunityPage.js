import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js"; // Import Navbar3
import "../styles/CommunityPage.css";

function CommunityPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch community details
  useEffect(() => {
    fetch(`http://localhost:5000/api/community/${communityId}`)
      .then((response) => response.json())
      .then((data) => {
        setCommunity(data);
        setIsAdmin(data.admin_id === localStorage.getItem("userId")); // Check if the user is the admin
      })
      .catch((error) => console.error("Error fetching community details:", error));
  }, [communityId]);

  // Fetch community members
  useEffect(() => {
    fetch(`http://localhost:5000/api/community/${communityId}/members`)
      .then((response) => response.json())
      .then((data) => setMembers(data))
      .catch((error) => console.error("Error fetching community members:", error));
  }, [communityId]);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter members based on search query
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle remove member
  const handleRemoveMember = async (memberId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/community/${communityId}/remove-member/${memberId}`,
        { method: "DELETE" }
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

  return (
    <div className="krishi-community-page">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      {/* Community Details Section */}
      <div className="krishi-community-details">
        <h1>{community?.name}</h1>
        <p><strong>Admin:</strong> {community?.admin_name}</p>
        <p><strong>Address:</strong> {community?.address}</p>
        <p><strong>Delivery Date:</strong> {community?.delivery_date}</p>
        <p><strong>Delivery Time:</strong> {community?.delivery_time}</p>
      </div>

      {/* Action Buttons */}
      <div className="krishi-action-buttons">
        <button onClick={() => navigate("/order-page")} className="krishi-order-button">
          Place Order
        </button>
        <button onClick={() => navigate("/")} className="krishi-back-button">
          Back to Krishisetu
        </button>
        {isAdmin && (
          <button
            onClick={() => navigate(`/community/${communityId}/add-member`)}
            className="krishi-add-member-button"
          >
            Add Member
          </button>
        )}
      </div>

      {/* Search Section */}
      <div className="krishi-search-section">
        <input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={handleSearch}
          className="krishi-search-input"
        />
      </div>

      {/* Members List */}
      <div className="krishi-members-list">
        {filteredMembers.map((member) => (
          <div key={member.id} className="krishi-member-card">
            <p><strong>{member.name}</strong></p>
            <p>{member.phone}</p>
            {isAdmin && (
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="krishi-remove-button"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommunityPage;