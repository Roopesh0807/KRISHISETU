import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js"; // Import Navbar3
// import "../styles/MemberCommunity.css";

function MemberCommunityPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [loggedInMember, setLoggedInMember] = useState(null); // State for logged-in member details

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
      .then((data) => {
        console.log("Fetched members:", data); // Debugging: Log fetched members
  
        // Filter out the admin from the members list
        const filteredMembers = data.filter(
          (member) => String(member.consumer_id) !== String(community?.admin_id)
        );
  
        setMembers(filteredMembers);
  
        // Step 3: Identify the logged-in member using consumerId or email
        const loggedInUserId = localStorage.getItem("consumerId");
        const loggedInUserEmail = localStorage.getItem("userEmail");
  
        console.log("Logged-in user ID from localStorage:", loggedInUserId);
        console.log("Logged-in user email from localStorage:", loggedInUserEmail);
  
        if (!loggedInUserId && !loggedInUserEmail) {
          console.error("consumerId and userEmail are undefined in localStorage");
          return;
        }
  
        // Find the logged-in member in the fetched members list
        let loggedInMember = data.find(
          (member) => loggedInUserId && String(member.consumer_id) === String(loggedInUserId)
        );
  
        // If logged-in member is not found by consumerId, try fetching by email
        if (!loggedInMember && loggedInUserEmail) {
          fetch(`http://localhost:5000/api/member/email/${loggedInUserEmail}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to fetch member by email");
              }
              return response.json();
            })
            .then((memberData) => {
              console.log("Logged-in member details fetched by email:", memberData);
              setLoggedInMember(memberData); // Set the logged-in member in state
            })
            .catch((error) => {
              console.error("Error fetching member by email:", error);
            });
        } else if (loggedInMember) {
          setLoggedInMember(loggedInMember); // Set the logged-in member in state
        } else {
          console.error("Logged-in member not found in the fetched members list.");
        }
      })
      .catch((error) => console.error("Error fetching community members:", error));
  }, [communityId, community?.admin_id]); // Add community?.admin_id as a dependency

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAgree = () => {
    setShowInstructions(false);
  };

  // Filter members based on search query
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

          {/* Personal Details Section */}
          {loggedInMember && (
            <div className="krishi-personal-details">
              <h2>Your Details</h2>
              <div className="krishi-member-card">
                <p><strong>{loggedInMember.name}</strong></p>
                <p>{loggedInMember.phone}</p>
                <p>{loggedInMember.email}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="krishi-action-buttons">
            <button
              onClick={() => {
                if (loggedInMember) {
                  // Navigate to the order page for the logged-in member
                  navigate(`/order/${communityId}/member/${loggedInMember.member_id}`);
                } else {
                  console.error("Logged-in member not found");
                  alert("You are not a member of this community. Please join the community first.");
                }
              }}
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

          {/* Other Members Section */}
          <div className="krishi-other-members">
            <h2>Other Members</h2>
            <div className="krishi-members-list">
              {filteredMembers
                .filter(
                  (member) =>
                    member.consumer_id !== localStorage.getItem("consumerId") &&
                    member.email !== localStorage.getItem("userEmail")
                )
                .map((member, index) => (
                  <div key={member.member_id || index} className="krishi-member-card">
                    <p><strong>{member.name}</strong></p>
                    <p>{member.phone}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberCommunityPage;