

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js";
import { useAuth } from '../context/AuthContext';
import "../styles/MemberCommunity.css";

function MemberCommunityPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [loggedInMember, setLoggedInMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { consumer } = useAuth();

  useEffect(() => {
    if (location.state?.showInstructions) {
      setShowInstructions(true);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch community details
        const communityRes = await fetch(
          `http://localhost:5000/api/community/${communityId}`,{
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        if (!communityRes.ok) throw new Error("Failed to fetch community details");
        const communityData = await communityRes.json();
        setCommunity(communityData.data || communityData);

        // Fetch members
        const membersRes = await fetch(
          `http://localhost:5000/api/community/${communityId}/members`,{
            headers: { 
              'Authorization': `Bearer ${consumer.token}`
            },
          }
        );
        if (!membersRes.ok) throw new Error("Failed to fetch members");
        const membersData = await membersRes.json();
        
        setMembers(Array.isArray(membersData) ? membersData : []);

        // Find logged in member - check by consumer_id or email
        const currentUserConsumerId = consumer?.consumer_id;
        const currentUserEmail = consumer?.email;
        
        const foundMember = membersData.find(
          member => 
            (currentUserConsumerId && member.consumer_id === currentUserConsumerId) ||
            (currentUserEmail && (member.member_email || member.email) === currentUserEmail)
        );
        
        if (foundMember) {
          setLoggedInMember(foundMember);
          localStorage.setItem("memberId", foundMember.id || foundMember.member_id);
          localStorage.setItem("currentCommunityId", communityId);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId,consumer]);

  const handleAgree = () => {
    setShowInstructions(false);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="member-community-container">
      <Navbar3 />

      {showInstructions ? (
        <div className="instructions-modal">
          <div className="instructions-content">
            <h2>Welcome to Your Community!</h2>
            <p>Here's how it works:</p>
            <ul>
              <li>Enjoy exclusive offers and reduced delivery costs.</li>
              <li>Admin controls the delivery date and address for all members.</li>
              <li>Each member gets an individual bill.</li>
              <li>Your cart closes one day before delivery.</li>
            </ul>
            <button onClick={handleAgree} className="agree-btn">
              OK, I Agree
            </button>
          </div>
        </div>
      ) : (
        <div className="community-content">
          <div className="community-header">
            <h1>{community?.community_name || community?.name}</h1>
            <div className="community-info">
              <p><span className="info-label">Admin:</span> {community?.admin_name}</p>
              <p><span className="info-label">Address:</span> {community?.address || "Not specified"}</p>
              <p><span className="info-label">Delivery Date:</span> {community?.delivery_date || "Not scheduled"}</p>
              <p><span className="info-label">Delivery Time:</span> {community?.delivery_time || "Not scheduled"}</p>
            </div>
          </div>

          <div className="action-buttons">
            <button
              onClick={() => {
                if (loggedInMember) {
                  navigate(`/community/${communityId}/member/${loggedInMember.id || loggedInMember.member_id}`);
                } else {
                  alert("You are not a member of this community. Please join first.");
                }
              }}
              className="order-btn"
            >
              Your Community Cart
            </button>
            <button 
              onClick={() => navigate("/community-home")} 
              className="back-btn"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="members-section">
            <h2>Community Members</h2>
            <div className="members-grid">
              {members.map((member) => (
                <div key={member.id || member.member_id} className="member-card">
                  <h3>{member.name || member.member_name}</h3>
                  <p className="phone">
                    {member.phone || member.phone_number 
                      ? `Phone: ••••••${(member.phone || member.phone_number).slice(-2)}` 
                      : "Phone not available"}
                  </p>
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