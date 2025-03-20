import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js"; // Import Navbar3
import "../styles/MemberCommunity.css";

function MemberCommunityPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (location.state?.showInstructions) {
      setShowInstructions(true);
    }
  }, [location.state]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/community/${communityId}`)
      .then((response) => response.json())
      .then((data) => setCommunity(data))
      .catch((error) => console.error("Error fetching community details:", error));
  }, [communityId]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/community/${communityId}/members`)
      .then((response) => response.json())
      .then((data) => setMembers(data))
      .catch((error) => console.error("Error fetching community members:", error));
  }, [communityId]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAgree = () => {
    setShowInstructions(false);
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="krishi-member-community-page">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      {showInstructions ? (
        <div className="krishi-instructions-popup">
          <h2>Welcome to Your Community!</h2>
          <p>Here’s how it works:</p>
          <ul>
            <li>Enjoy exclusive offers and reduced delivery costs.</li>
            <li>Admin can add or remove members anytime.</li>
            <li>Admin controls the delivery date and address for all members.</li>
            <li>Each member gets an individual bill, but the total order cost is shared.</li>
            <li>Your cart closes one day before delivery.</li>
            <li>Payments must be made two days before delivery.</li>
            <li>If unpaid, you can remove your cart, or the admin can remove you.</li>
          </ul>
          <button onClick={handleAgree} className="krishi-agree-button">OK, I Agree</button>
        </div>
      ) : (
        <div className="krishi-main-content">
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
            <button
              onClick={() => navigate(`/order/${communityId}/member/${localStorage.getItem("userId")}`)}
              className="krishi-order-button"
            >
              Place Order
            </button>
            <button onClick={() => navigate("/")} className="krishi-back-button">
              Back to Krishisetu
            </button>
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
            {filteredMembers.map((member, index) => (
              <div key={member.id || index} className="krishi-member-card">
                <p><strong>{member.name}</strong></p>
                <p>{member.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberCommunityPage;