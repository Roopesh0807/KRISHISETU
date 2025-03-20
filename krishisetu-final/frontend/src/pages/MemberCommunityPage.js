import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
//import "../styles/MemberCommunity.css";

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
    <div className="community-page">
      {showInstructions ? (
        <div className="instructions-popup">
          <p>Instructions for the community...</p>
          <ul>
            <li>Enjoy exclusive offers and reduced delivery costs.</li>
            <li>Admin can add or remove members anytime.</li>
            <li>Admin controls the delivery date and address for all members.</li>
            <li>Each member gets an individual bill, but the total order cost is shared.</li>
            <li>Your cart closes one day before delivery.</li>
            <li>Payments must be made two days before delivery.</li>
            <li>If unpaid, you can remove your cart, or the admin can remove you.</li>
          </ul>
          <button onClick={handleAgree}>OK, I Agree</button>
        </div>
      ) : (
        <>
          <h1>{community?.name}</h1>
          <p>Admin: {community?.admin_name}</p>
          <p>Address: {community?.address}</p>
          <p>Delivery Date: {community?.delivery_date}</p>
          <p>Delivery Time: {community?.delivery_time}</p>

          <div className="buttons">
            <button onClick={() => navigate(`/order/${communityId}/member/${localStorage.getItem("userId")}`)}>Order</button>
            <button onClick={() => navigate("/")}>Back to Krishisetu</button>
          </div>

          <div className="search-section">
            <input type="text" placeholder="Search members..." value={searchQuery} onChange={handleSearch} />
          </div>

          <div className="members-list">
            {filteredMembers.map((member, index) => (
              <div key={member.id || index} className="member">
                <p>{member.name}</p>
                <p>{member.phone}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MemberCommunityPage;
