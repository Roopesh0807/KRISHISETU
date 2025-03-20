import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
//import "../styles/CommunityPage.css";

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

  return (
    <div className="community-page">
      <h1>{community?.name}</h1>
      <p>Admin: {community?.admin_name}</p>
      <p>Address: {community?.address}</p>
      <p>Delivery Date: {community?.delivery_date}</p>
      <p>Delivery Time: {community?.delivery_time}</p>

      <div className="buttons">
        <button onClick={() => navigate("/order-page")}>Order</button>
        <button onClick={() => navigate("/")}>Back to Krishisetu</button>
        {isAdmin && (
          <button onClick={() => navigate(`/community/${communityId}/add-member`)}>
            Add Member
          </button>
        )}
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="members-list">
        {filteredMembers.map((member) => (
          <div key={member.id} className="member">
            <p>{member.name}</p>
            <p>{member.phone}</p>
            {isAdmin && (
              <button onClick={() => handleRemoveMember(member.id)}>Remove</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const handleRemoveMember = (memberId) => {
  // Example: Send a request to remove a member from the community
  fetch(`/api/remove-member/${memberId}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Member removed successfully");
        // Optionally refresh state
      } else {
        alert("Error removing member");
      }
    })
    .catch((error) => console.error("Error:", error));
};



export default CommunityPage;