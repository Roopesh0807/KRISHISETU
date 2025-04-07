// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faRupeeSign, faSpinner } from "@fortawesome/free-solid-svg-icons";
// import { io } from 'socket.io-client';
// import FarmerChatWindow from "./FarmerChatWindow";
// import "./FarmerChatList.css";

// const FarmerChatList = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [bargainSessions, setBargainSessions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSession, setSelectedSession] = useState(null);
//   const socket = useRef(null);
//   const reconnectAttempts = useRef(0);
//   const [connectionStatus, setConnectionStatus] = useState("connecting");
//   const [newMessages, setNewMessages] = useState({});
//   const [searchTerm, setSearchTerm] = useState("");

//   // Get token from farmer's localStorage
//   const getToken = () => {
//     const farmerData = localStorage.getItem("farmer");
//     if (!farmerData) return null;
    
//     const { token } = JSON.parse(farmerData);
    
//     // Verify token structure
//     try {
//       const decoded = JSON.parse(atob(token.split('.')[1]));
//       if (!decoded.farmer_id) {
//         console.error("Token missing farmer_id");
//         return null;
//       }
//       return token;
//     } catch (e) {
//       console.error("Invalid token structure");
//       return null;
//     }
//   };

//   // WebSocket connection management
//   const initializeSocketConnection = useCallback(() => {
//     const token = getToken();
//     if (!token) {
//       console.error("Missing token for WebSocket connection");
//       return;
//     }

//     const decodedToken = JSON.parse(atob(token.split(".")[1]));
//     const farmerId = decodedToken.farmer_id;

//     // Close existing connection if any
//     if (socket.current) {
//       socket.current.disconnect();
//       socket.current = null;
//     }

//     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
//       auth: { token },
//       query: { farmerId },
//       transports: ['websocket'],
//       withCredentials: true,
//       extraHeaders: { Authorization: `Bearer ${token}` }
//     });
    
//     // Connection events
//     socket.current.on('connect', () => {
//       console.log("Socket connected");
//       setConnectionStatus("connected");
//       reconnectAttempts.current = 0;
//     });

//     socket.current.on('connect_error', (err) => {
//       console.error("Connection error:", err.message);
//       setConnectionStatus("error");
      
//       const maxAttempts = 5;
//       if (reconnectAttempts.current < maxAttempts) {
//         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
//         reconnectAttempts.current += 1;
//         setTimeout(() => initializeSocketConnection(), delay);
//       }
//     });

//     socket.current.on('disconnect', (reason) => {
//       console.log("Socket disconnected:", reason);
//       setConnectionStatus("disconnected");
//     });

//     // Application events
//     socket.current.on('newBargain', (session) => {
//       setBargainSessions(prev => [session, ...prev]);
//     });

//     socket.current.on('priceUpdate', (data) => {
//       setBargainSessions(prev => 
//         prev.map(session => 
//           session.bargain_id === data.bargain_id 
//             ? { ...session, current_price: data.newPrice } 
//             : session
//         )
//       );
//     });

//     socket.current.on('bargainStatusUpdate', (data) => {
//       setBargainSessions(prev => 
//         prev.map(session => 
//           session.bargain_id === data.bargain_id 
//             ? { ...session, status: data.status } 
//             : session
//         )
//       );
//     });

//     // Inside initializeSocketConnection()
//           socket.current.on('newMessage', (message) => {
//             console.log('New message received:', message); // Debug log
            
//             // setBargainSessions(prevSessions => {
//             //   return prevSessions.map(session => {
//             //     if (session.bargain_id === message.bargain_id) {
//             //       // Update last message and unread count
//             //       return {
//             //         ...session,
//             //         last_message: message,
//             //         unread_count: (session.unread_count || 0) + 1,
//             //         updated_at: new Date().toISOString()
//             //       };
//             //     }
//             //     return session;
//             //   });
//             // });
//             setBargainSessions(prev => {
//               const updated = prev.map(session => {
//                 if (session.bargain_id === message.bargain_id) {
//                   return {
//                     ...session,
//                     last_message: message,
//                     unread_count: (session.unread_count || 0) + 1,
//                     updated_at: new Date().toISOString(),
//                   };
//                 }
//                 return session;
//               });
//               return updated.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
//             });
            

//             // Also update newMessages state for badge count
//             setNewMessages(prev => ({
//               ...prev,
//               [message.bargain_id]: (prev[message.bargain_id] || 0) + 1
//             }));
//           });

//     socket.current.on('error', (error) => {
//       console.error("Socket error:", error);
//     });

//     return () => {
//       if (socket.current) {
//         socket.current.disconnect();
//       }
//     };
//   }, []);

//   // Fetch active bargain sessions
//   const fetchSessions = useCallback(async () => {
//     try {
//       const token = getToken();
//       if (!token) {
//         navigate("/loginPage");
//         return;
//       }
  
//       // Debug token information
//       console.group("Token Debugging");
//       console.log("Raw Token:", token);
//       try {
//         const decodedToken = JSON.parse(atob(token.split(".")[1]));
//         console.log("Decoded Token:", decodedToken);
//         console.log("Farmer ID:", decodedToken.farmer_id);
//         console.log("Token Expiry:", new Date(decodedToken.exp * 1000));
//       } catch (decodeError) {
//         console.error("Token Decoding Error:", decodeError);
//       }
//       console.groupEnd();
  
//       const decodedToken = JSON.parse(atob(token.split(".")[1]));
//       const farmerId = decodedToken.farmer_id;
//       const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;
//       console.log("Making request to:", apiUrl);
  
//       const response = await fetch(apiUrl, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         },
//         credentials: 'include' // Important if using cookies
//       });
  
//       console.group("Response Debugging");
//       console.log("HTTP Status:", response.status);
//       console.log("Response Headers:", Object.fromEntries(response.headers.entries()));
      
//       const responseText = await response.text();
//       console.log("Raw Response:", responseText);
  
//       try {
//         const data = responseText ? JSON.parse(responseText) : null;
//         console.log("Parsed JSON:", data);
        
//         if (!response.ok) {
//           console.error("API Error Response:", data);
//           throw new Error(data?.message || `HTTP error! status: ${response.status}`);
//         }
  
//         setBargainSessions(data || []);
//         return data;
//       } catch (parseError) {
//         console.error("JSON Parse Error:", parseError);
//         throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
//       } finally {
//         console.groupEnd();
//       }
//     } catch (error) {
//       console.group("Fetch Error");
//       console.error("Error Details:", error);
      
//       if (error.message.includes("JSON")) {
//         console.error("The server returned non-JSON content. Possible issues:");
//         console.error("- Incorrect API endpoint");
//         console.error("- Server-side error returning HTML");
//         console.error("- Missing Content-Type header in response");
//       }
      
//       console.groupEnd();
      
//       // Show user-friendly error message
//       if (error.message.includes("401")) {
//         navigate("/loginPage");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [navigate]);

//   // Initial fetch and periodic refresh
//   useEffect(() => {
//     fetchSessions();
//     const interval = setInterval(fetchSessions, 10000);
//     return () => clearInterval(interval);
//   }, [fetchSessions]);

//   // Initialize socket connection
//   useEffect(() => {
//     initializeSocketConnection();
//     return () => {
//       if (socket.current) {
//         socket.current.disconnect();
//       }
//     };
//   }, [initializeSocketConnection]);

//   const handleSessionSelect = (session) => {
//     setSelectedSession(session);
//     navigate(`/farmer/bargain/${session.bargain_id}`);
//     setNewMessages(prev => {
//       const updated = { ...prev };
//       delete updated[session.bargain_id];
//       return updated;
//     });
//   };

//   const formatTime = (timestamp) => {
//     if (!timestamp) return "";
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   const formatDate = (timestamp) => {
//     const today = new Date();
//     const date = new Date(timestamp);
    
//     if (date.toDateString() === today.toDateString()) {
//       return formatTime(timestamp);
//     } else if (date.getFullYear() === today.getFullYear()) {
//       return date.toLocaleDateString([], { month: "short", day: "numeric" });
//     } else {
//       return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
//     }
//   };

//   // const filteredSessions = bargainSessions.filter(session =>
//   //   session.consumer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //   session.product_name.toLowerCase().includes(searchTerm.toLowerCase())
//   // );
//  // Update your filteredSessions function to handle undefined/null values
//     const filteredSessions = bargainSessions.filter(session => {
//       const consumerName = session?.consumer_name || '';
//       const productName = session?.product_name || '';
//       return (
//         consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         productName.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     });

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//         <p>Loading bargain requests...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="farmer-chat-app">
//       {/* Sidebar */}
//       <div className="chat-sidebar">
//         <div className="sidebar-header">
//           <h2>Bargain Requests</h2>
//           <div className="connection-status">
//             <span className={`status-dot ${connectionStatus}`} />
//             {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
//           </div>
//         </div>
        
//         <div className="search-bar">
//           <input
//             type="text"
//             placeholder="Search by consumer or product..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className="session-list">
//           {filteredSessions.length === 0 ? (
//             <div className="empty-state">
//               {searchTerm ? (
//                 <p>No matching requests found</p>
//               ) : (
//                 <p>No active bargain requests</p>
//               )}
//             </div>
//           ) : (
//             filteredSessions.map((session) => (
//               <div
//                 key={session.bargain_id}
//                 className={`session-card ${id === session.bargain_id ? "active" : ""}`}
//                 onClick={() => handleSessionSelect(session)}
//               >
//                 <div className="consumer-avatar">
//                   {session.consumer_name.charAt(0).toUpperCase()}
//                 </div>
                
//                 <div className="session-content">
//                   <div className="session-header">
//                     <h3>{session.consumer_name}</h3>
//                     <span className="session-time">
//                       {formatDate(session.updated_at || session.created_at)}
//                     </span>
//                   </div>
                  
//                   <div className="session-details">
//                     <p className="product-info">
//                       <strong>{session.product_name}</strong> ({session.quantity}kg)
//                     </p>
//                     <p className="price-info">
//                       <FontAwesomeIcon icon={faRupeeSign} />
//                       {session.current_price || session.initial_price}/kg
//                     </p>
//                   </div>
                  
//                   <div className="session-preview">
//                     {session.last_message && (
//                       <p className="message-preview">
//                         {session.last_message.content.length > 30
//                           ? `${session.last_message.content.substring(0, 30)}...`
//                           : session.last_message.content}
//                       </p>
//                     )}
//                   </div>
//                 </div>
                
//                 {newMessages[session.bargain_id] && (
//                   <div className="unread-badge">
//                     {newMessages[session.bargain_id]}
//                   </div>
//                 )}
                
//                 {session.status === 'pending' && (
//                   <div className="status-indicator pending" />
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Chat Window */}
//       <div className="chat-window-container">
//         {selectedSession ? (
//           <FarmerChatWindow
//             bargainId={selectedSession.bargain_id}
//             socket={socket.current}
//             connectionStatus={connectionStatus}
//             initialSession={selectedSession}
//             onBack={() => {
//               setSelectedSession(null);
//               navigate("/farmer/bargain");
//             }}
//           />
//         ) : (
//           <div className="empty-chat-window">
//             <div className="empty-content">
//               <h3>Select a bargain request</h3>
//               <p>Choose a conversation from the sidebar to start bargaining</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FarmerChatList;
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRupeeSign, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { io } from 'socket.io-client';
import FarmerChatWindow from "./FarmerChatWindow";
import "./FarmerChatList.css";

const FarmerChatList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bargainSessions, setBargainSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const socket = useRef(null);
  const reconnectAttempts = useRef(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [newMessages, setNewMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Get token from farmer's localStorage with validation
  const getToken = () => {
    try {
      const farmerData = localStorage.getItem("farmer");
      if (!farmerData) {
        navigate("/loginPage");
        return null;
      }

      const parsedData = JSON.parse(farmerData);
      if (!parsedData?.token) {
        navigate("/loginPage");
        return null;
      }

      // Verify token structure
      const decoded = JSON.parse(atob(parsedData.token.split('.')[1]));
      if (!decoded?.farmer_id) {
        console.error("Token missing farmer_id");
        navigate("/loginPage");
        return null;
      }
      return parsedData.token;
    } catch (e) {
      console.error("Token parsing error:", e);
      navigate("/loginPage");
      return null;
    }
  };

  // WebSocket connection management
  const initializeSocketConnection = useCallback(() => {
    const token = getToken();
    if (!token) return;

    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const farmerId = decodedToken.farmer_id;

    // Close existing connection if any
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }

    socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
      auth: { token },
      query: { farmerId },
      transports: ['websocket'],
      withCredentials: true,
      extraHeaders: { Authorization: `Bearer ${token}` }
    });
    
    // Connection events
    socket.current.on('connect', () => {
      console.log("Socket connected");
      setConnectionStatus("connected");
      reconnectAttempts.current = 0;
    });

    socket.current.on('connect_error', (err) => {
      console.error("Connection error:", err.message);
      setConnectionStatus("error");
      
      const maxAttempts = 5;
      if (reconnectAttempts.current < maxAttempts) {
        const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
        reconnectAttempts.current += 1;
        setTimeout(() => initializeSocketConnection(), delay);
      }
    });

    socket.current.on('disconnect', (reason) => {
      console.log("Socket disconnected:", reason);
      setConnectionStatus("disconnected");
    });

    // Application events
    socket.current.on('newBargain', (session) => {
      setBargainSessions(prev => [session, ...prev]);
    });

    socket.current.on('priceUpdate', (data) => {
      setBargainSessions(prev => 
        prev.map(session => 
          session.bargain_id === data.bargain_id 
            ? { ...session, current_price: data.newPrice } 
            : session
        )
      );
    });

    socket.current.on('bargainStatusUpdate', (data) => {
      setBargainSessions(prev => 
        prev.map(session => 
          session.bargain_id === data.bargain_id 
            ? { ...session, status: data.status } 
            : session
        )
      );
    });

    socket.current.on('newMessage', (message) => {
      setBargainSessions(prev => {
        const updated = prev.map(session => {
          if (session.bargain_id === message.bargain_id) {
            return {
              ...session,
              last_message: message,
              unread_count: (session.unread_count || 0) + 1,
              updated_at: new Date().toISOString(),
            };
          }
          return session;
        });
        return updated.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      });

      setNewMessages(prev => ({
        ...prev,
        [message.bargain_id]: (prev[message.bargain_id] || 0) + 1
      }));
    });

    socket.current.on('error', (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [navigate]);

  // Fetch active bargain sessions with enhanced error handling
  // const fetchSessions = useCallback(async () => {
  //   try {
  //     const token = getToken();
  //     if (!token) return;

  //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
  //     const farmerId = decodedToken.farmer_id;
  //     const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;

  //     const response = await fetch(apiUrl, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Accept': 'application/json',
  //         'Content-Type': 'application/json'
  //       },
  //       credentials: 'include'
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
      
  //     // Validate and normalize session data
  //     const validatedSessions = Array.isArray(data) 
  //       ? data.map(session => ({
  //           bargain_id: session.bargain_id || '',
  //           consumer_name: session.consumer_name || 'Unknown Consumer',
  //           product_name: session.product_name || 'Unknown Product',
  //           quantity: session.quantity || 0,
  //           current_price: session.current_price || session.initial_price || 0,
  //           initial_price: session.initial_price || 0,
  //           status: session.status || 'pending',
  //           created_at: session.created_at || new Date().toISOString(),
  //           updated_at: session.updated_at || session.created_at || new Date().toISOString(),
  //           last_message: session.last_message || null,
  //           unread_count: session.unread_count || 0
  //         }))
  //       : [];

  //     setBargainSessions(validatedSessions);
  //   } catch (error) {
  //     console.error("Error fetching sessions:", error);
  //     if (error.message.includes("401")) {
  //       navigate("/loginPage");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [navigate]);
  const fetchSessions = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
  
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const farmerId = decodedToken.farmer_id;
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;
  
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Map the API response to your expected format
      const validatedSessions = Array.isArray(data) 
        ? data.map(session => ({
            bargain_id: session.latest_bargain_id || '',
            consumer_name: `${session.first_name || ''} ${session.last_name || ''}`.trim() || 'Unknown Consumer',
            consumer_id: session.consumer_id || '',
            updated_at: session.last_updated || new Date().toISOString(),
            // Add any other required fields with defaults
            product_name: 'Product Name', // You'll need to get this from your API
            quantity: 0, // Default value
            current_price: 0, // Default value
            initial_price: 0, // Default value
            status: 'pending', // Default value
            last_message: null, // Default value
            unread_count: 0 // Default value
          }))
        : [];
  
      setBargainSessions(validatedSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      if (error.message.includes("401")) {
        navigate("/loginPage");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Initialize socket connection
  useEffect(() => {
    initializeSocketConnection();
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [initializeSocketConnection]);

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    navigate(`/farmer/bargain/${session.bargain_id}`);
    setNewMessages(prev => {
      const updated = { ...prev };
      delete updated[session.bargain_id];
      return updated;
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const today = new Date();
    const date = new Date(timestamp);
    
    if (date.toDateString() === today.toDateString()) {
      return formatTime(timestamp);
    } else if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } else {
      return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
    }
  };

  const filteredSessions = bargainSessions.filter(session => {
    const consumerName = session.consumer_name.toLowerCase();
    const productName = session.product_name.toLowerCase();
    return (
      consumerName.includes(searchTerm.toLowerCase()) ||
      productName.includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading bargain requests...</p>
      </div>
    );
  }

  return (
    <div className="farmer-chat-app">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Bargain Requests</h2>
          <div className="connection-status">
            <span className={`status-dot ${connectionStatus}`} />
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </div>
        </div>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by consumer or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
  
        <div className="session-list">
          {filteredSessions.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <p>No matching requests found</p>
              ) : (
                <p>No active bargain requests</p>
              )}
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.bargain_id}
                className={`session-card ${id === session.bargain_id ? "active" : ""}`}
                onClick={() => handleSessionSelect(session)}
              >
                <div className="consumer-avatar">
                  {session.consumer_name.charAt(0).toUpperCase()}
                </div>
                
                <div className="session-content">
                  <div className="session-header">
                    <h3>{session.consumer_name}</h3>
                    <span className="session-time">
                      {formatDate(session.updated_at)}
                    </span>
                  </div>
                  
                  {/* <div className="session-details">
                    <p className="product-info">
                      <strong>{session.product_name}</strong> ({session.quantity}kg)
                    </p>
                    <p className="price-info">
                      <FontAwesomeIcon icon={faRupeeSign} />
                      {session.current_price}/kg
                    </p>
                  </div>
                   */}
                  <div className="session-preview">
                    
                      <p className="message-preview">
                        you, recieved a bargain message
                      </p>
                    
                  </div>
                </div>
                
                {newMessages[session.bargain_id] && (
                  <div className="unread-badge">
                    {newMessages[session.bargain_id]}
                  </div>
                )}
                
                {session.status === 'pending' && (
                  <div className="status-indicator pending" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
  
      {/* Chat Window */}
      <div className="chat-window-container">
        {selectedSession ? (
          <FarmerChatWindow
            bargainId={selectedSession.bargain_id}
            socket={socket.current}
            connectionStatus={connectionStatus}
            initialSession={selectedSession}
            onBack={() => {
              setSelectedSession(null);
              navigate("/farmer/bargain");
            }}
          />
        ) : (
          <div className="empty-chat-window">
            <div className="empty-content">
              <h3>Select a bargain request</h3>
              <p>Choose a conversation from the sidebar to start bargaining</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default FarmerChatList;