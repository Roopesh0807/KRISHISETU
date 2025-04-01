// // import React, { useState, useEffect } from "react";
// // import { useParams, useNavigate, useLocation } from "react-router-dom";
// // import Navbar3 from "../components/Navbar3.js"; // Import Navbar3
// // // import "../styles/MemberCommunity.css";

// // function MemberCommunityPage() {
// //   const { communityId } = useParams();
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const [community, setCommunity] = useState(null);
// //   const [members, setMembers] = useState([]);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [showInstructions, setShowInstructions] = useState(false);
// //   const [loggedInMember, setLoggedInMember] = useState(null); // State for logged-in member details

// //   useEffect(() => {
// //     if (location.state?.showInstructions) {
// //       setShowInstructions(true);
// //     }
// //   }, [location.state]);

// //   useEffect(() => {
// //     fetch(`http://localhost:5000/api/community/${communityId}`)
// //       .then((response) => response.json())
// //       .then((data) => setCommunity(data))
// //       .catch((error) => console.error("Error fetching community details:", error));
// //   }, [communityId]);

// //   useEffect(() => {
// //     fetch(`http://localhost:5000/api/community/${communityId}/members`)
// //       .then((response) => response.json())
// //       .then((data) => {
// //         console.log("Fetched members:", data); // Debugging: Log fetched members

// //         // Filter out the admin from the members list
// //         const filteredMembers = data.filter(
// //           (member) => String(member.member_id) !== String(community?.admin_id)
// //         );

// //         setMembers(filteredMembers);

// //         // Step 3: Identify the logged-in member using memberId and userEmail
// //         const loggedInMemberId = localStorage.getItem("memberId");
// //         const loggedInUserEmail = localStorage.getItem("userEmail");

// //         console.log("Logged-in member ID from localStorage:", loggedInMemberId);
// //         console.log("Logged-in user email from localStorage:", loggedInUserEmail);

// //         if (!loggedInMemberId && !loggedInUserEmail) {
// //           console.error("memberId and userEmail are undefined in localStorage");
// //           return;
// //         }

// //         // Find the logged-in member in the fetched members list
// //         const loggedInMember = data.find(
// //           (member) =>
// //             (loggedInMemberId && String(member.member_id) === String(loggedInMemberId)) ||
// //             (loggedInUserEmail && member.email === loggedInUserEmail)
// //         );

// //         console.log("Logged-in member:", loggedInMember);

// //         if (loggedInMember) {
// //           setLoggedInMember(loggedInMember); // Set the logged-in member in state
// //         } else {
// //           console.error("Logged-in member not found in the fetched members list.");
// //         }
// //       })
// //       .catch((error) => console.error("Error fetching community members:", error));
// //   }, [communityId, community?.admin_id]); // Add community?.admin_id as a dependency

// //   const handleSearch = (e) => {
// //     setSearchQuery(e.target.value);
// //   };

// //   const handleAgree = () => {
// //     setShowInstructions(false);
// //   };

// //   // Filter members based on search query
// //   const filteredMembers = members.filter((member) =>
// //     member.name.toLowerCase().includes(searchQuery.toLowerCase())
// //   );

// //   return (
// //     <div className="krishi-member-community-page">
// //       {/* Navbar3 Integrated */}
// //       <Navbar3 />

// //       {showInstructions ? (
// //         <div className="krishi-instructions-popup">
// //           <h2>Welcome to Your Community!</h2>
// //           <p>Here’s how it works:</p>
// //           <ul>
// //             <li>Enjoy exclusive offers and reduced delivery costs.</li>
// //             <li>Admin can add or remove members anytime.</li>
// //             <li>Admin controls the delivery date and address for all members.</li>
// //             <li>Each member gets an individual bill, but the total order cost is shared.</li>
// //             <li>Your cart closes one day before delivery.</li>
// //             <li>Payments must be made two days before delivery.</li>
// //             <li>If unpaid, you can remove your cart, or the admin can remove you.</li>
// //           </ul>
// //           <button onClick={handleAgree} className="krishi-agree-button">OK, I Agree</button>
// //         </div>
// //       ) : (
// //         <div className="krishi-main-content">
// //           {/* Community Details Section */}
// //           <div className="krishi-community-details">
// //             <h1>{community?.name}</h1>
// //             <p><strong>Admin:</strong> {community?.admin_name}</p>
// //             <p><strong>Address:</strong> {community?.address}</p>
// //             <p><strong>Delivery Date:</strong> {community?.delivery_date}</p>
// //             <p><strong>Delivery Time:</strong> {community?.delivery_time}</p>
// //           </div>

// //           {/* Personal Details Section */}
// //           {loggedInMember && (
// //             <div className="krishi-personal-details">
// //               <h2>Your Details</h2>
// //               <div className="krishi-member-card">
// //                 <p><strong>{loggedInMember.name}</strong></p>
// //                 <p>{loggedInMember.phone}</p>
// //                 <p>{loggedInMember.email}</p>
// //               </div>
// //             </div>
// //           )}

// //           {/* Action Buttons */}
// //           <div className="krishi-action-buttons">
// //           <button
// //   onClick={() => {
// //     const loggedInMemberId = localStorage.getItem("memberId");
// //     if (loggedInMemberId) {
// //       navigate(`/order/${communityId}/member/${loggedInMemberId}`);
// //     } else {
// //       console.error("Logged-in member not found");
// //       alert("You are not a member of this community. Please join the community first.");
// //     }
// //   }}
// //   className="krishi-order-button"
// // >
// //   Place Order
// // </button>
// //             <button onClick={() => navigate("/")} className="krishi-back-button">
// //               Back to Krishisetu
// //             </button>
// //           </div>

// //           {/* Search Section */}
// //           <div className="krishi-search-section">
// //             <input
// //               type="text"
// //               placeholder="Search members..."
// //               value={searchQuery}
// //               onChange={handleSearch}
// //               className="krishi-search-input"
// //             />
// //           </div>

// //           {/* Other Members Section */}
// //           <div className="krishi-other-members">
// //             <h2>Other Members</h2>
// //             <div className="krishi-members-list">
// //               {filteredMembers
// //                 .filter(
// //                   (member) =>
// //                     member.member_id !== localStorage.getItem("memberId") &&
// //                     member.email !== localStorage.getItem("userEmail")
// //                 )
// //                 .map((member, index) => (
// //                   <div key={member.member_id || index} className="krishi-member-card">
// //                     <p><strong>{member.name}</strong></p>
// //                     <p>{member.phone}</p>
// //                   </div>
// //                 ))}
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default MemberCommunityPage;
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import Navbar3 from "../components/Navbar3.js";

// function MemberCommunityPage() {
//   const { communityId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [community, setCommunity] = useState(null);
//   const [members, setMembers] = useState([]);
//   const [showInstructions, setShowInstructions] = useState(false);
//   const [loggedInMember, setLoggedInMember] = useState(null);

//   useEffect(() => {
//     if (location.state?.showInstructions) {
//       setShowInstructions(true);
//     }
//   }, [location.state]);

//   useEffect(() => {
//     fetch(`http://localhost:5000/api/community/${communityId}`)
//       .then((response) => response.json())
//       .then((data) => setCommunity(data))
//       .catch((error) => console.error("Error fetching community details:", error));
//   }, [communityId]);

//   useEffect(() => {
//     fetch(`http://localhost:5000/api/community/${communityId}/members`)
//       .then((response) => response.json())
//       .then((data) => {
//         const filteredMembers = data.filter(
//           (member) => String(member.member_id) !== String(community?.admin_id)
//         );
//         setMembers(filteredMembers);

//         const loggedInMemberId = localStorage.getItem("memberId");
//         const loggedInUserEmail = localStorage.getItem("userEmail");

//         if (!loggedInMemberId && !loggedInUserEmail) {
//           console.error("memberId and userEmail are undefined in localStorage");
//           return;
//         }

//         const loggedInMember = data.find(
//           (member) =>
//             (loggedInMemberId && String(member.member_id) === String(loggedInMemberId)) ||
//             (loggedInUserEmail && member.email === loggedInUserEmail)
//         );

//         if (loggedInMember) {
//           setLoggedInMember(loggedInMember);
//         } else {
//           console.error("Logged-in member not found in the fetched members list.");
//         }
//       })
//       .catch((error) => console.error("Error fetching community members:", error));
//   }, [communityId, community?.admin_id, setMembers]);

//   const handleAgree = () => {
//     setShowInstructions(false);
//   };

//   return (
//     <div className="krishi-member-community-page">
//       <Navbar3 />

//       {showInstructions ? (
//         <div className="krishi-instructions-popup">
//           <h2>Welcome to Your Community!</h2>
//           <p>Here’s how it works:</p>
//           <ul>
//             <li>Enjoy exclusive offers and reduced delivery costs.</li>
//             <li>Admin can add or remove members anytime.</li>
//             <li>Admin controls the delivery date and address for all members.</li>
//             <li>Each member gets an individual bill, but the total order cost is shared.</li>
//             <li>Your cart closes one day before delivery.</li>
//             <li>Payments must be made two days before delivery.</li>
//             <li>If unpaid, you can remove your cart, or the admin can remove you.</li>
//           </ul>
//           <button onClick={handleAgree} className="krishi-agree-button">OK, I Agree</button>
//         </div>
//       ) : (
//         <div className="krishi-main-content">
//           <div className="krishi-community-details">
//             <h1>{community?.name}</h1>
//             <p><strong>Admin:</strong> {community?.admin_name}</p>
//             <p><strong>Address:</strong> {community?.address}</p>
//             <p><strong>Delivery Date:</strong> {community?.delivery_date}</p>
//             <p><strong>Delivery Time:</strong> {community?.delivery_time}</p>
//           </div>

//           {loggedInMember && (
//             <div className="krishi-personal-details">
//               <h2>Your Details</h2>
//               <div className="krishi-member-card">
//                 <p><strong>{loggedInMember.name}</strong></p>
//                 <p>{loggedInMember.phone}</p>
//                 <p>{loggedInMember.email}</p>
//               </div>
//             </div>
//           )}

//           <div className="krishi-members-list">
//             <h2>Community Members</h2>
//             {members.map((member) => (
//               <div key={member.member_id} className="krishi-member-card">
//                 <p><strong>{member.name}</strong></p>
//                 <p>{member.email}</p>
//                 <p>{member.phone}</p>
//               </div>
//             ))}
//           </div>

//           <div className="krishi-action-buttons">
//             <button
//               onClick={() => {
//                 const loggedInMemberId = localStorage.getItem("memberId");
//                 console.log("Retrieved memberId from localStorage:", loggedInMemberId); // Debugging
//                 if (loggedInMemberId) {
//                   navigate(`/order/${communityId}/member/${loggedInMemberId}`);
//                 } else {
//                   console.error("Logged-in member not found");
//                   alert("You are not a member of this community. Please join the community first.");
//                 }
//               }}
//               className="krishi-order-button"
//             >
//               Place Order
//             </button>
//             <button onClick={() => navigate(`/consumer-dashboard`)} className="krishi-back-button">
//               Back to Dashboard
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MemberCommunityPage;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js";
import "../styles/MemberCommunity.css"; // New CSS file for styling

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

  useEffect(() => {
    if (location.state?.showInstructions) {
      setShowInstructions(true);
    }
  }, [location.state]);

  // useEffect(() => {
  //   const fetchCommunityDetails = async () => {
  //     try {
  //       const response = await fetch(`http://localhost:5000/api/community/${communityId}`);
  //       if (!response.ok) throw new Error("Failed to fetch community details");
  //       const data = await response.json();
  //       setCommunity(data);
  //     } catch (err) {
  //       console.error("Error fetching community details:", err);
  //       setError(err.message);
  //     }
  //   };

  //   const fetchMembers = async () => {
  //     try {
  //       const response = await fetch(`http://localhost:5000/api/community/${communityId}/members`);
  //       if (!response.ok) throw new Error("Failed to fetch members");
  //       const data = await response.json();
        
  //       const filteredMembers = data.filter(
  //         member => String(member.member_id) !== String(community?.admin_id)
  //       );
  //       setMembers(filteredMembers);

  //       const loggedInMemberId = localStorage.getItem("memberId");
  //       const loggedInUserEmail = localStorage.getItem("userEmail");

  //       const foundMember = data.find(
  //         member =>
  //           (loggedInMemberId && String(member.member_id) === String(loggedInMemberId)) ||
  //           (loggedInUserEmail && member.email === loggedInUserEmail)
  //       );

  //       if (foundMember) {
  //         setLoggedInMember(foundMember);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching members:", err);
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCommunityDetails();
  //   fetchMembers();
  // }, [communityId, community?.admin_id]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch community details
        const communityRes = await fetch(
          `http://localhost:5000/api/community/${communityId}`
        );
        if (!communityRes.ok) throw new Error("Failed to fetch community details");
        const communityData = await communityRes.json();
        setCommunity(communityData.data || communityData);

        // Fetch members
        const membersRes = await fetch(
          `http://localhost:5000/api/community/${communityId}/members`
        );
        if (!membersRes.ok) throw new Error("Failed to fetch members");
        const membersData = await membersRes.json();
        
        // Filter out admin if needed (the controller might already do this)
        setMembers(Array.isArray(membersData) ? membersData : []);

        // Find logged in member
        const loggedInMemberId = localStorage.getItem("memberId");
        const loggedInUserEmail = localStorage.getItem("userEmail");
        
        const foundMember = membersData.find(
          member =>
            (loggedInMemberId && String(member.id) === String(loggedInMemberId)) ||
            (loggedInUserEmail && member.member_email === loggedInUserEmail)
        );
        
        if (foundMember) {
          setLoggedInMember(foundMember);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId]);

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
            <h1>{community?.community_name}</h1>
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
                  navigate(`/order/${communityId}/member/${loggedInMember.member_id}`);
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
    <h3>{member.name}</h3>
    <p className="phone">
      {member.phone ? `Phone: ••••••${member.phone.slice(-2)}` : "Phone not available"}
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


// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import Navbar3 from "../components/Navbar3.js";

// function MemberCommunityPage() {
//   const { communityId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [community, setCommunity] = useState(null);
//   const [members, setMembers] = useState([]);
//   const [showInstructions, setShowInstructions] = useState(false);
//   const [loggedInMember, setLoggedInMember] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (location.state?.showInstructions) {
//       setShowInstructions(true);
//     }
//   }, [location.state]);

//   useEffect(() => {
//     // Fetch community details
//     fetch(`http://localhost:5000/api/community/${communityId}`)
//       .then((response) => response.json())
//       .then((data) => setCommunity(data))
//       .catch((error) => console.error("Error fetching community details:", error));
//   }, [communityId]);

//   useEffect(() => {
//     // Fetch community members
//     fetch(`http://localhost:5000/api/community/${communityId}/members`)
//       .then((response) => response.json())
//       .then((data) => {
//         // Filter out admin from members list
//         const filteredMembers = data.filter(
//           (member) => member.consumer_id !== community?.admin_id
//         );
//         setMembers(filteredMembers);

//         // Identify the logged-in member
//         const loggedInUserId = localStorage.getItem("userId");
//         const loggedInUserEmail = localStorage.getItem("userEmail");
        
//         const foundMember = data.find((member) => 
//           (loggedInUserId && member.consumer_id === parseInt(loggedInUserId)) ||
//           (loggedInUserEmail && member.email === loggedInUserEmail)
//         );

//         if (foundMember) {
//           setLoggedInMember(foundMember);
//           localStorage.setItem("memberId", foundMember.member_id);
//         }
        
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching community members:", error);
//         setLoading(false);
//       });
//   }, [communityId, community?.admin_id]);

//   const handleAgree = () => {
//     setShowInstructions(false);
//   };

//   const handlePlaceOrder = () => {
//     if (!loggedInMember?.member_id) {
//       alert("You are not a member of this community. Please join the community first.");
//       return;
//     }
//     navigate(`/order/${communityId}/member/${loggedInMember.member_id}`);
//   };

//   // Mask phone number - show only last 2 digits
//   const maskPhoneNumber = (phone) => {
//     if (!phone) return "";
//     return phone.replace(/\d(?=\d{2})/g, "*");
//   };

//   if (loading) {
//     return <div>Loading community data...</div>;
//   }

//   return (
//     <div className="krishi-member-community-page">
//       <Navbar3 />

//       {showInstructions ? (
//         <div className="krishi-instructions-popup">
//           <h2>Welcome to Your Community!</h2>
//           <p>Here's how it works:</p>
//           <ul>
//             <li>Enjoy exclusive offers and reduced delivery costs.</li>
//             <li>Admin can add or remove members anytime.</li>
//             <li>Admin controls the delivery date and address for all members.</li>
//             <li>Each member gets an individual bill, but the total order cost is shared.</li>
//             <li>Your cart closes one day before delivery.</li>
//             <li>Payments must be made two days before delivery.</li>
//             <li>If unpaid, you can remove your cart, or the admin can remove you.</li>
//           </ul>
//           <button onClick={handleAgree} className="krishi-agree-button">
//             OK, I Agree
//           </button>
//         </div>
//       ) : (
//         <div className="krishi-main-content">
//           {/* Community Details Section */}
//           <div className="krishi-community-section">
//             <h1>{community?.community_name}</h1>
//             <div className="krishi-community-details">
//               <p><strong>Admin:</strong> {community?.admin_name}</p>
//               <p><strong>Address:</strong> {community?.address}</p>
//               <p><strong>Delivery Date:</strong> {new Date(community?.delivery_date).toLocaleDateString()}</p>
//               <p><strong>Delivery Time:</strong> {community?.delivery_time}</p>
//             </div>
//           </div>

//           {/* Logged-in Member Section */}
//           {loggedInMember && (
//             <div className="krishi-personal-section">
//               <h2>Your Details</h2>
//               <div className="krishi-member-card">
//                 <p><strong>{loggedInMember.member_name}</strong></p>
//                 <p>Phone: {maskPhoneNumber(loggedInMember.phone_number)}</p>
//                 <p>Email: {loggedInMember.member_email}</p>
//               </div>
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="krishi-action-buttons">
//             <button onClick={handlePlaceOrder} className="krishi-order-button">
//               Place Order
//             </button>
//             <button onClick={() => navigate("/consumer-dashboard")} className="krishi-back-button">
//               Back to Dashboard
//             </button>
//           </div>

//           {/* Other Members Section */}
//           <div className="krishi-members-section">
//             <h2>Community Members</h2>
//             <div className="krishi-members-list">
//               {members
//                 .filter(member => member.consumer_id !== loggedInMember?.consumer_id)
//                 .map((member) => (
//                   <div key={member.member_id} className="krishi-member-card">
//                     <p><strong>{member.member_name}</strong></p>
//                     <p>Phone: {maskPhoneNumber(member.phone_number)}</p>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MemberCommunityPage;