import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import '../styles/JoinCommunity.css';

function JoinCommunity() {
  const [communityName, setCommunityName] = useState('');
  const [password, setPassword] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/community/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityName, password, userEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Joined community successfully!");

        // Fetch community details to check if the user is an admin
        const communityResponse = await fetch(`http://localhost:5000/api/community/${data.communityId}`);
        const communityData = await communityResponse.json();

        if (communityResponse.ok) {
          const adminId = communityData.admin_id; // Get adminId from the community details
          const userId = localStorage.getItem("userId"); // Get userId from localStorage

          // Debugging logs
          console.log("Admin ID from community data:", adminId);
          console.log("User ID from localStorage:", userId);

          // Ensure both adminId and userId are strings for comparison
          const adminIdStr = adminId.toString();
          const userIdStr = userId.toString();

          // Compare userId with adminId
          if (userIdStr === adminIdStr) {
            console.log("User is the admin. Redirecting to Admin Community Page.");
            navigate(`/community-page/${data.communityId}/admin`); // Redirect to Admin Community Page
          } else {
            console.log("User is not the admin. Redirecting to Member Community Page.");
            navigate(`/community-page/${data.communityId}/member`, {
              state: { showInstructions: true, communityId: data.communityId },
            }); // Redirect to Member Community Page
          }
        } else {
          alert("Error fetching community details after joining.");
        }
      } else {
        setError(data.error || "Error joining community");
      }
    } catch (error) {
      console.error("Error joining community:", error);
      alert("An error occurred while joining the community.");
    }
  };

  return (
    <div className="join-community">
      <input
        type="text"
        placeholder="Community Name"
        value={communityName}
        onChange={(e) => setCommunityName(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="email"
        placeholder="Your Email"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
      />
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}

export default JoinCommunity;