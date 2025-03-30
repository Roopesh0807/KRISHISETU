// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Navbar3 from '../components/Navbar3.js'; // Import Navbar3
// import '../styles/HomePage.css';

// function HomePage() {
//   const navigate = useNavigate();
//   const [communities, setCommunities] = useState([]); // State to store communities
//   const [password, setPassword] = useState(''); // State for password input
//   const [selectedCommunity, setSelectedCommunity] = useState(null); // State to track selected community

//   // Fetch communities the consumer is part of
//   useEffect(() => {
//     const consumerId = localStorage.getItem('consumerId'); // Get logged-in consumer ID
//     console.log('Logged-in consumer ID:', consumerId); // Debugging: Log consumer ID
//     if (consumerId) {
//       fetch(`http://localhost:5000/api/community/consumer/${consumerId}/communities`)
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error('Failed to fetch communities');
//           }
//           return response.json();
//         })
//         .then((data) => {
//           console.log('Fetched communities:', data); // Debugging: Log fetched communities
//           setCommunities(data);
//         })
//         .catch((error) => {
//           console.error('Error fetching communities:', error);
//           alert('Failed to fetch communities. Please try again later.');
//         });
//     }
//   }, []);

//   // Navigate to the appropriate community page
//   const navigateToCommunityPage = (community) => {
//     if (community.isAdmin) {
//       // Navigate to admin community page
//       navigate(`/community-page/${community.community_id}/admin`);
//     } else {
//       // Navigate to member community page
//       navigate(`/community-page/${community.community_id}/member`);
//     }
//   };

//   // Handle community click
//   const handleCommunityClick = (community) => {
//     if (community.requiresPassword && !community.isMember) {
//       // If the community requires a password and the user is not a member, show password input
//       setSelectedCommunity(community);
//     } else {
//       // If no password is required or the user is already a member, navigate to the community page
//       navigateToCommunityPage(community);
//     }
//   };

//   // Handle password submission
//   const handlePasswordSubmit = async () => {
//     if (!selectedCommunity || !password) {
//       alert('Please enter a password.');
//       return;
//     }

//     const consumerId = localStorage.getItem('consumerId'); // Get logged-in consumer ID

//     try {
//       // Verify community access
//       const response = await fetch('http://localhost:5000/api/community/verify-access', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           communityName: selectedCommunity.community_name,
//           password,
//           consumerId,
//         }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         // Access granted, navigate to the appropriate community page
//         if (data.isAdmin) {
//           navigate(`/community-page/${data.community_id}/admin`);
//         } else {
//           navigate(`/community-page/${data.community_id}/member`);
//         }
//       } else {
//         alert(data.error || 'Access denied');
//       }
//     } catch (error) {
//       console.error('Error verifying access:', error);
//       alert('An error occurred. Please try again.');
//     }
//   };

//   return (
//     <div className="krishi-home-page">
//       {/* Navbar3 Integrated */}
//       <Navbar3 />

//       {/* Hero Section */}
//       <div className="krishi-hero-section">
//         <div className="krishi-hero-content">
//           <h1>Welcome to KrishiSetu</h1>
//           <p className="krishi-subtitle">Empowering Farmers, Connecting Communities</p>
//           <div className="krishi-button-container">
//             <button onClick={() => navigate('/join-community')} className="krishi-cta-button">
//               Join a Community
//             </button>
//             <button onClick={() => navigate('/create-community')} className="krishi-cta-button">
//               Create a Community
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Communities Section */}
//       <div className="krishi-communities-section">
//         <h2>Your Communities</h2>
//         {communities.length > 0 ? (
//           <div className="krishi-communities-grid">
//             {communities.map((community) => (
//               <div
//                 key={community.community_id}
//                 className="krishi-community-card"
//                 onClick={() => handleCommunityClick(community)}
//               >
//                 <h3>{community.community_name}</h3>
//                 <p>{community.description}</p>
//                 {community.isAdmin && <span className="krishi-admin-badge">Admin</span>}
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p>You are not part of any communities yet. Join or create one!</p>
//         )}
//       </div>

//       {/* Password Modal */}
//       {selectedCommunity && (
//         <div className="krishi-password-modal">
//           <div className="krishi-password-modal-content">
//             <h3>Enter Password for {selectedCommunity.community_name}</h3>
//             <input
//               type="password"
//               placeholder="Enter password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             <button onClick={handlePasswordSubmit}>Submit</button>
//             <button onClick={() => setSelectedCommunity(null)}>Cancel</button>
//           </div>
//         </div>
//       )}

//       {/* Features Section */}
//       <div className="krishi-features-section">
//         <h2>Why Choose KrishiSetu?</h2>
//         <div className="krishi-features-grid">
//           <div className="krishi-feature-card">
//             <div className="krishi-feature-icon">
//               <i className="fas fa-tractor"></i> {/* Font Awesome icon */}
//             </div>
//             <h3>Farm-to-Table</h3>
//             <p>Directly connect with farmers and get fresh produce at your doorstep.</p>
//           </div>
//           <div className="krishi-feature-card">
//             <div className="krishi-feature-icon">
//               <i className="fas fa-hand-holding-usd"></i> {/* Font Awesome icon */}
//             </div>
//             <h3>Fair Pricing</h3>
//             <p>Transparent pricing ensures farmers get their fair share.</p>
//           </div>
//           <div className="krishi-feature-card">
//             <div className="krishi-feature-icon">
//               <i className="fas fa-users"></i> {/* Font Awesome icon */}
//             </div>
//             <h3>Community Support</h3>
//             <p>Join a network of farmers and consumers working together.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default HomePage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar3 from '../components/Navbar3.js'; // Import Navbar3
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]); // State to store communities
  const [password, setPassword] = useState(''); // State for password input
  const [selectedCommunity, setSelectedCommunity] = useState(null); // State to track selected community

  // Fetch communities the consumer is part of
  useEffect(() => {
    const consumerId = localStorage.getItem('consumerId'); // Get logged-in consumer ID
    console.log('Logged-in consumer ID:', consumerId); // Debugging: Log consumer ID
    if (consumerId) {
      fetch(`http://localhost:5000/api/community/consumer/${consumerId}/communities`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch communities');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Fetched communities:', data); // Debugging: Log fetched communities
          setCommunities(data);
        })
        .catch((error) => {
          console.error('Error fetching communities:', error);
          alert('Failed to fetch communities. Please try again later.');
        });
    }
  }, []);

  // Handle community click
  const handleCommunityClick = (community) => {
    // Always show the password popup, regardless of whether the user is an admin or member
    setSelectedCommunity(community);
  };

  // Handle password submission
  const handlePasswordSubmit = async () => {
    if (!selectedCommunity || !password) {
      alert('Please enter a password.');
      return;
    }

    const consumerId = localStorage.getItem('consumerId'); // Get logged-in consumer ID

    try {
      // Verify community access
      const response = await fetch('http://localhost:5000/api/community/verify-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityName: selectedCommunity.community_name,
          password,
          consumerId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Access granted, navigate to the appropriate community page
        if (data.isAdmin) {
          navigate(`/community-page/${data.community_id}/admin`);
        } else {
          navigate(`/community-page/${data.community_id}/member`);
        }
      } else {
        alert(data.error || 'Access denied');
      }
    } catch (error) {
      console.error('Error verifying access:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="krishi-home-page">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      {/* Hero Section */}
      <div className="krishi-hero-section">
        <div className="krishi-hero-content">
          <h1>Welcome to KrishiSetu</h1>
          <p className="krishi-subtitle">Empowering Farmers, Connecting Communities</p>
          <div className="krishi-button-container">
            <button onClick={() => navigate('/join-community')} className="krishi-cta-button">
              Join a Community
            </button>
            <button onClick={() => navigate('/create-community')} className="krishi-cta-button">
              Create a Community
            </button>
          </div>
        </div>
      </div>

      {/* Communities Section */}
      <div className="krishi-communities-section">
        <h2>Your Communities</h2>
        {communities.length > 0 ? (
          <div className="krishi-communities-grid">
            {communities.map((community) => (
              <div
                key={community.community_id}
                className="krishi-community-card"
                onClick={() => handleCommunityClick(community)}
              >
                <h3>{community.community_name}</h3>
                {community.isAdmin ? (
                  <span className="krishi-admin-badge">Admin</span>
                ) : (
                  <span className="krishi-member-badge">Member</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>You are not part of any communities yet. Join or create one!</p>
        )}
      </div>

      {/* Password Modal */}
      {selectedCommunity && (
        <div className="krishi-password-modal">
          <div className="krishi-password-modal-content">
            <h3>Enter Password for {selectedCommunity.community_name}</h3>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handlePasswordSubmit}>Submit</button>
            <button onClick={() => setSelectedCommunity(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="krishi-features-section">
        <h2>Why Choose KrishiSetu?</h2>
        <div className="krishi-features-grid">
          <div className="krishi-feature-card">
            <div className="krishi-feature-icon">
              <i className="fas fa-tractor"></i> {/* Font Awesome icon */}
            </div>
            <h3>Farm-to-Table</h3>
            <p>Directly connect with farmers and get fresh produce at your doorstep.</p>
          </div>
          <div className="krishi-feature-card">
            <div className="krishi-feature-icon">
              <i className="fas fa-hand-holding-usd"></i> {/* Font Awesome icon */}
            </div>
            <h3>Fair Pricing</h3>
            <p>Transparent pricing ensures farmers get their fair share.</p>
          </div>
          <div className="krishi-feature-card">
            <div className="krishi-feature-icon">
              <i className="fas fa-users"></i> {/* Font Awesome icon */}
            </div>
            <h3>Community Support</h3>
            <p>Join a network of farmers and consumers working together.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;