// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Navbar3 from '../components/Navbar3.js'; // Import Navbar3
// import '../styles/JoinCommunity.css';

// function JoinCommunity() {
//   const [communityName, setCommunityName] = useState('');
//   const [password, setPassword] = useState('');
//   const [userEmail, setUserEmail] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleJoin = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/api/community/join", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ communityName, password, userEmail }),
//       });
  
//       const data = await response.json();
//       console.log("Backend response:", data); // Debugging
  
//       if (response.ok) {
//         // Store the memberId and userEmail in localStorage
//         if (data.memberId) {
//           localStorage.setItem("memberId", data.memberId); // Ensure the API returns memberId
//           localStorage.setItem("userEmail", userEmail); // Store userEmail for reference
//           console.log("Stored memberId in localStorage:", data.memberId); // Debugging
//         } else {
//           console.error("memberId not found in the API response");
//         }
  
//         // Redirect to the member community page
//         navigate(`/community-page/${data.communityId}/member`, {
//           state: { showInstructions: true, communityId: data.communityId },
//         });
//       } else {
//         setError(data.error || "Error joining community");
//       }
//     } catch (error) {
//       console.error("Error joining community:", error);
//       alert("An error occurred while joining the community.");
//     }
//   };

//   return (
//     <div className="krishi-join-community">
//       {/* Navbar3 Integrated */}
//       <Navbar3 />

//       <div className="krishi-form-container">
//         <h1>Join a Community</h1>
//         <p className="krishi-subtitle">Connect with your community and start ordering together!</p>
//         <div className="krishi-input-group">
//           <input
//             type="text"
//             placeholder="Community Name"
//             value={communityName}
//             onChange={(e) => setCommunityName(e.target.value)}
//             className="krishi-input"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="krishi-input"
//           />
//           <input
//             type="email"
//             placeholder="Your Email"
//             value={userEmail}
//             onChange={(e) => setUserEmail(e.target.value)}
//             className="krishi-input"
//           />
//         </div>
//         {error && <p className="krishi-error-message">{error}</p>}
//         <button onClick={handleJoin} className="krishi-join-button">
//           Join Community
//         </button>
//       </div>
//     </div>
//   );
// }

// export default JoinCommunity;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar3 from '../components/Navbar3.js';
import { useAuth } from '../context/AuthContext';
import '../styles/JoinCommunity.css';

function JoinCommunity() {
  const [communityName, setCommunityName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { consumer } = useAuth();

  const handleJoin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get consumer ID from AuthContext or localStorage
      const consumerId = consumer?.consumer_id || localStorage.getItem('consumerId');
      
      if (!consumerId) {
        setError("Please login first");
        setIsLoading(false);
        return;
      }

      if (!communityName || !password) {
        setError("Community name and password are required");
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/community/join", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify({ 
          communityName, 
          password
          // No need to send email, we're using consumer_id from auth
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Store the memberId and communityId in localStorage
        localStorage.setItem("memberId", data.memberId);
        localStorage.setItem("currentCommunityId", data.communityId);

        // Redirect to the member community page
        navigate(`/community-page/${data.communityId}/member`, {
          state: { 
            showInstructions: true, 
            communityId: data.communityId,
            memberId: data.memberId
          },
        });
      } else {
        setError(data.error || "Error joining community");
      }
    } catch (error) {
      console.error("Error joining community:", error);
      setError("An error occurred while joining the community. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="krishi-join-community">
      <Navbar3 />

      <div className="krishi-form-container">
        <h1>Join a Community</h1>
        <p className="krishi-subtitle">Connect with your community and start ordering together!</p>
        
        <div className="krishi-input-group">
          <input
            type="text"
            placeholder="Community Name"
            value={communityName}
            onChange={(e) => setCommunityName(e.target.value)}
            className="krishi-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="krishi-input"
            required
          />
        </div>
        
        {error && <p className="krishi-error-message">{error}</p>}
        
        <button 
          onClick={handleJoin} 
          className="krishi-join-button"
          disabled={isLoading}
        >
          {isLoading ? 'Joining...' : 'Join Community'}
        </button>
      </div>
    </div>
  );
}

export default JoinCommunity;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Navbar3 from '../components/Navbar3.js';
// import { useAuth } from '../context/AuthContext';
// import '../styles/JoinCommunity.css';

// function JoinCommunity() {
//   const [communityName, setCommunityName] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [allAddresses, setAllAddresses] = useState([]);
//   const [selectedAddress, setSelectedAddress] = useState('');
//   const [joinMethod, setJoinMethod] = useState('name'); // 'name' or 'address'
//   const navigate = useNavigate();
//   const { consumer } = useAuth();

//   useEffect(() => {
//     if (joinMethod === 'address') {
//       fetchAllAddresses();
//     }
//   }, [joinMethod]);

//   const fetchAllAddresses = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/community/all-addresses',{
//         headers: { 
//           'Authorization': `Bearer ${consumer.token}`
//         },
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setAllAddresses(data);
//       } else {
//         setError(data.error || "Error fetching addresses");
//       }
//     } catch (error) {
//       console.error("Error fetching addresses:", error);
//       setError("An error occurred while fetching addresses.");
//     }
//   };

//   const handleJoin = async () => {
//     try {
//       const userEmail = localStorage.getItem('userEmail');
//       if (!userEmail) {
//         setError("Please login first");
//         return;
//       }

//       const joinPayload = joinMethod === 'address' ? 
//         { address: selectedAddress, password, userEmail } :
//         { communityName, password, userEmail };

//       const response = await fetch("http://localhost:5000/api/community/join", {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//            'Authorization': `Bearer ${consumer.token}`
//         },
//         body: JSON.stringify(joinPayload),
//       });
  
//       const data = await response.json();
  
//       if (response.ok) {
//         if (data.memberId) {
//           localStorage.setItem("memberId", data.memberId);
//         }
  
//         navigate(`/community-page/${data.communityId}/member`, {
//           state: { showInstructions: true, communityId: data.communityId },
//           headers: { 
//             'Authorization': `Bearer ${consumer.token}`
//           },
//         });
//       } else {
//         setError(data.error || "Error joining community");
//       }
//     } catch (error) {
//       console.error("Error joining community:", error);
//       setError("An error occurred while joining the community.");
//     }
//   };

//   return (
//     <div className="krishi-join-community">
//       <Navbar3 />

//       <div className="krishi-form-container">
//         <h1>Join a Community</h1>
//         <p className="krishi-subtitle">Connect with your community and start ordering together!</p>
        
//         <div className="krishi-join-method-toggle">
//           <button 
//             className={`krishi-toggle-button ${joinMethod === 'name' ? 'active' : ''}`}
//             onClick={() => setJoinMethod('name')}
//           >
//             Join by Name
//           </button>
//           <button 
//             className={`krishi-toggle-button ${joinMethod === 'address' ? 'active' : ''}`}
//             onClick={() => setJoinMethod('address')}
//           >
//             Join by Address
//           </button>
//         </div>

//         {joinMethod === 'name' ? (
//           <div className="krishi-input-group">
//             <input
//               type="text"
//               placeholder="Community Name"
//               value={communityName}
//               onChange={(e) => setCommunityName(e.target.value)}
//               className="krishi-input"
//               required
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="krishi-input"
//               required
//             />
//           </div>
//         ) : (
//           <div className="krishi-input-group">
//             <select
//               value={selectedAddress}
//               onChange={(e) => setSelectedAddress(e.target.value)}
//               className="krishi-input"
//               required
//             >
//               <option value="">Select an address</option>
//               {allAddresses.map((address, index) => (
//                 <option key={index} value={address}>
//                   {address}
//                 </option>
//               ))}
//             </select>
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="krishi-input"
//               required
//             />
//           </div>
//         )}
        
//         {error && <p className="krishi-error-message">{error}</p>}
//         <button onClick={handleJoin} className="krishi-join-button">
//           Join Community
//         </button>
//       </div>
//     </div>
//   );
// }

// export default JoinCommunity;