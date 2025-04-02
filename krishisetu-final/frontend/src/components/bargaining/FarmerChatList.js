// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import FarmerChatWindow from './FarmerChatWindow';
// import './BargainingChat.css';

// const FarmerChatList = () => {
//   const { farmer_id } = useParams();
//   const navigate = useNavigate();
//   const [bargainSessions, setBargainSessions] = useState([]);
//   const [loading] = useState(true);

//   useEffect(() => {
//     const fetchSessions = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/bargain/sessions/farmer');
//         const data = await response.json();
//         setBargainSessions(data);
//       } catch (error) {
//         console.error("Error:", error);
//       }
//     };
  
//     // Fetch the initial sessions when the component mounts
//     fetchSessions();
  
//     // Polling every 5 seconds to fetch new sessions
//     const interval = setInterval(fetchSessions, 5000); // Every 5 seconds
  
//     // Cleanup polling on component unmount
//     return () => clearInterval(interval);
//   }, []);

// useEffect(() => {
//   const socket = new WebSocket('ws://localhost:5000'); // Your WebSocket server URL

//   socket.onmessage = (event) => {
//     const newSession = JSON.parse(event.data);
//     setBargainSessions((prevSessions) => [newSession, ...prevSessions]);
//   };

//   return () => socket.close();
// }, []);

//   const handleSessionSelect = (sessionId) => {
//     navigate(`/farmer/bargain/${sessionId}`);
//   };

//   if (loading) return <div className="loading">Loading bargain requests...</div>;

//   return (
//     <div className="chat-list-page">
//       <div className="chat-list">
//         <h2>Bargain Requests</h2>
//         {bargainSessions.length === 0 ? (
//           <p>No active bargain requests with consumers</p>
//         ) : (
//           <ul>
//             {bargainSessions.map(session => (
//               <li 
//                 key={session.session_id}
//                 onClick={() => handleSessionSelect(session.session_id)}
//                 className={farmer_id === session.farmer_id ? 'active' : ''}
//               >
//                 <div>
//                   <strong>Consumer: {session.consumer_name}</strong>
//                   <p>Product: {session.product_name}</p>
//                   <p>Status: {session.status}</p>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       <div className="chat-window-container">
//         {farmer_id ? (
//           <FarmerChatWindow sessionId={farmer_id} />
//         ) : (
//           <div className="welcome-message">
//             <h3>Select a bargain request to respond</h3>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FarmerChatList;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FarmerChatWindow from './FarmerChatWindow';
import './BargainingChat.css';

const FarmerChatList = () => {
  const { farmer_id } = useParams();
  const navigate = useNavigate();
  const [bargainSessions, setBargainSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlineConsumers, setOnlineConsumers] = useState(new Set());
  const [socket, setSocket] = useState(null);

  // Add authentication token if needed
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken'); // or your token storage
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/bargain/sessions/farmer', {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected an array');
        }
        
        setBargainSessions(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setError(error.message);
        setBargainSessions([]);
        
        // If unauthorized, redirect to login
        if (error.message.includes('401')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const setupWebSocket = () => {
      const ws = new WebSocket('ws://localhost:5000');

      ws.onopen = () => {
        console.log('WebSocket connected');
        setSocket(ws);
        
        // Send authentication if needed
        const token = localStorage.getItem('authToken');
        if (token) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            token: token
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'new_session') {
            setBargainSessions(prev => [message.session, ...prev]);
          } 
          else if (message.type === 'consumer_status') {
            setOnlineConsumers(prev => {
              const newSet = new Set(prev);
              if (message.isOnline) {
                newSet.add(message.consumerId);
              } else {
                newSet.delete(message.consumerId);
              }
              return newSet;
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setSocket(null);
        // Attempt to reconnect after delay
        setTimeout(setupWebSocket, 5000);
      };

      return ws;
    };

    const ws = setupWebSocket();
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const handleSessionSelect = (sessionId) => {
    navigate(`/farmer/bargain/${sessionId}`);
  };

  if (loading) return <div className="loading">Loading bargain requests...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="chat-list-page">
      <div className="chat-list">
        <h2>Bargain Requests</h2>
        {bargainSessions.length === 0 ? (
          <p>No active bargain requests with consumers</p>
        ) : (
          <ul>
            {bargainSessions.map(session => (
              <li 
                key={session.session_id}
                onClick={() => handleSessionSelect(session.session_id)}
                className={farmer_id === session.session_id ? 'active' : ''}
              >
                {/* ... rest of your JSX ... */}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chat-window-container">
        {farmer_id ? (
          <FarmerChatWindow bargainId={farmer_id} socket={socket} />
        ) : (
          <div className="welcome-message">
            <h3>Select a bargain request to respond</h3>
            <p>Click on any consumer to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerChatList;