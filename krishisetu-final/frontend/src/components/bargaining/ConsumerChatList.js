// // // // import React, { useState, useEffect } from 'react';
// // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // import { useAuth } from '../../context/AuthContext';
// // // // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // // // import { faSpinner, faRupeeSign } from '@fortawesome/free-solid-svg-icons';
// // // // import './ConsumerChatList.css';

// // // // const ConsumerChatList = () => {
// // // //   const { id } = useParams();
// // // //   const navigate = useNavigate();
// // // //   const { consumer } = useAuth();
// // // //   const [farmers, setFarmers] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [selectedFarmer, setSelectedFarmer] = useState(null);
// // // //   const [searchTerm, setSearchTerm] = useState('');
// // // //   const [error, setError] = useState(null);

// // // //   useEffect(() => {
// // // //     const fetchFarmers = async () => {
// // // //       try {
// // // //         setLoading(true);
// // // //         setError(null);

// // // //         if (!consumer?.token) {
// // // //           navigate('/LoginPage');
// // // //           return;
// // // //         }

// // // //         const response = await fetch(
// // // //           `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/farmers`,
// // // //           {
// // // //             headers: {
// // // //               'Authorization': `Bearer ${consumer.token}`,
// // // //             },
// // // //             credentials: 'include'
// // // //           }
// // // //         );

// // // //         if (!response.ok) {
// // // //           throw new Error(`Request failed with status ${response.status}`);
// // // //         }

// // // //         const data = await response.json();
        
// // // //         // Transform data to match your frontend structure
// // // //         const formattedFarmers = data.map(farmer => ({
// // // //           farmer_id: farmer.farmer_id,
// // // //           farmer_name: farmer.name || 'Unknown Farmer',
// // // //           location: farmer.location || 'Unknown Location',
// // // //           rating: farmer.rating || 0,
// // // //           products: farmer.products || [],
// // // //           last_active: farmer.last_active || new Date().toISOString()
// // // //         }));

// // // //         setFarmers(formattedFarmers);
// // // //       } catch (error) {
// // // //         console.error('Fetch error:', error);
// // // //         setError(error.message);
        
// // // //         if (error.message.includes('401') || error.message.includes('Authentication')) {
// // // //           navigate('/LoginPage');
// // // //         }
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     fetchFarmers();
// // // //   }, [consumer, navigate]);

// // // //   const handleFarmerSelect = (farmer) => {
// // // //     if (!consumer?.token) {
// // // //       navigate('/LoginPage');
// // // //       return;
// // // //     }
// // // //     setSelectedFarmer(farmer);
// // // //     navigate(`/bargain/${bargainId}`);
// // // //   };

// // // //   const filteredFarmers = farmers.filter(farmer => {
// // // //     const farmerName = farmer.farmer_name.toLowerCase();
// // // //     const location = farmer.location.toLowerCase();
// // // //     return (
// // // //       farmerName.includes(searchTerm.toLowerCase()) ||
// // // //       location.includes(searchTerm.toLowerCase())
// // // //     );
// // // //   });

// // // //   const formatTime = (timestamp) => {
// // // //     if (!timestamp) return "";
// // // //     const date = new Date(timestamp);
// // // //     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// // // //   };

// // // //   if (loading) return (
// // // //     <div className="loading-container">
// // // //       <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // //       <p>Loading farmers...</p>
// // // //     </div>
// // // //   );

// // // //   if (error) return <div className="error">Error: {error}</div>;

// // // //   return (
// // // //     <div className="consumer-chat-app">
// // // //       <div className="chat-sidebar">
// // // //         <div className="sidebar-header">
// // // //           <h2>Available Farmers</h2>
// // // //         </div>
        
// // // //         <div className="search-bar">
// // // //           <input
// // // //             type="text"
// // // //             placeholder="Search by farmer or location..."
// // // //             value={searchTerm}
// // // //             onChange={(e) => setSearchTerm(e.target.value)}
// // // //           />
// // // //         </div>
  
// // // //         <div className="farmer-list">
// // // //           {filteredFarmers.length === 0 ? (
// // // //             <div className="empty-state">
// // // //               {searchTerm ? (
// // // //                 <p>No matching farmers found</p>
// // // //               ) : (
// // // //                 <p>No farmers available</p>
// // // //               )}
// // // //             </div>
// // // //           ) : (
// // // //             filteredFarmers.map((farmer) => (
// // // //               <div
// // // //                 key={farmer.farmer_id}
// // // //                 className={`farmer-card ${id === farmer.farmer_id ? "active" : ""}`}
// // // //                 onClick={() => handleFarmerSelect(farmer)}
// // // //               >
// // // //                 <div className="farmer-avatar">
// // // //                   {farmer.farmer_name.charAt(0).toUpperCase()}
// // // //                 </div>
                
// // // //                 <div className="farmer-content">
// // // //                   <div className="farmer-header">
// // // //                     <h3>{farmer.farmer_name}</h3>
// // // //                     <span className="farmer-location">
// // // //                       {farmer.location}
// // // //                     </span>
// // // //                   </div>
                  
// // // //                   <div className="farmer-details">
// // // //                     <p className="rating-info">
// // // //                       Rating: {farmer.rating}/5
// // // //                     </p>
// // // //                     <p className="products-info">
// // // //                       Products: {farmer.products.length}
// // // //                     </p>
// // // //                   </div>
// // // //                 </div>
                
// // // //                 <div className="last-active">
// // // //                   Active: {formatTime(farmer.last_active)}
// // // //                 </div>
// // // //               </div>
// // // //             ))
// // // //           )}
// // // //         </div>
// // // //       </div>
  
// // // //       <div className="chat-window-container">
// // // //         {selectedFarmer ? (
// // // //           <div className="farmer-chat-window">
// // // //             {/* This would be replaced with your actual chat component */}
// // // //             <div className="farmer-info">
// // // //               <h3>Start bargaining with {selectedFarmer.farmer_name}</h3>
// // // //               <p>Select a product to begin negotiation</p>
// // // //             </div>
// // // //           </div>
// // // //         ) : (
// // // //           <div className="empty-chat-window">
// // // //             <div className="empty-content">
// // // //               <h3>Select a farmer</h3>
// // // //               <p>Choose a farmer from the sidebar to start bargaining</p>
// // // //             </div>
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default ConsumerChatList;

// // // import React, { useState, useEffect, useRef, useCallback } from "react";
// // // import { useParams, useNavigate } from "react-router-dom";
// // // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // // import { faRupeeSign, faSpinner } from "@fortawesome/free-solid-svg-icons";
// // // import { io } from 'socket.io-client';
// // // import ConsumerChatWindow from "./ConsumerChatWindow";
// // // import "./ConsumerChatList.css";

// // // const ConsumerChatList = () => {
// // //   const { id } = useParams();
// // //   const navigate = useNavigate();
// // //   const [bargainSessions, setBargainSessions] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [selectedSession, setSelectedSession] = useState(null);
// // //   const socket = useRef(null);
// // //   const reconnectAttempts = useRef(0);
// // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // //   const [newMessages, setNewMessages] = useState({});
// // //   const [searchTerm, setSearchTerm] = useState("");

// // //   // Get token from consumer's localStorage with validation
// // //   const getToken = () => {
// // //     try {
// // //       const consumerData = localStorage.getItem("consumer");
// // //       if (!consumerData) {
// // //         navigate("/loginPage");
// // //         return null;
// // //       }

// // //       const parsedData = JSON.parse(consumerData);
// // //       if (!parsedData?.token) {
// // //         navigate("/loginPage");
// // //         return null;
// // //       }

// // //       // Verify token structure
// // //       const decoded = JSON.parse(atob(parsedData.token.split('.')[1]));
// // //       if (!decoded?.consumer_id) {
// // //         console.error("Token missing consumer_id");
// // //         navigate("/loginPage");
// // //         return null;
// // //       }
// // //       return parsedData.token;
// // //     } catch (e) {
// // //       console.error("Token parsing error:", e);
// // //       navigate("/loginPage");
// // //       return null;
// // //     }
// // //   };

// // //   // WebSocket connection management
// // //   const initializeSocketConnection = useCallback(() => {
// // //     const token = getToken();
// // //     if (!token) return;

// // //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
// // //     const consumerId = decodedToken.consumer_id;

// // //     // Close existing connection if any
// // //     if (socket.current) {
// // //       socket.current.disconnect();
// // //       socket.current = null;
// // //     }

// // //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // //       auth: { token },
// // //       query: { consumerId },
// // //       transports: ['websocket'],
// // //       withCredentials: true,
// // //       extraHeaders: { Authorization: `Bearer ${token}` }
// // //     });
    
// // //     // Connection events
// // //     socket.current.on('connect', () => {
// // //       console.log("Socket connected");
// // //       setConnectionStatus("connected");
// // //       reconnectAttempts.current = 0;
// // //     });

// // //     socket.current.on('connect_error', (err) => {
// // //       console.error("Connection error:", err.message);
// // //       setConnectionStatus("error");
      
// // //       const maxAttempts = 5;
// // //       if (reconnectAttempts.current < maxAttempts) {
// // //         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// // //         reconnectAttempts.current += 1;
// // //         setTimeout(() => initializeSocketConnection(), delay);
// // //       }
// // //     });

// // //     socket.current.on('disconnect', (reason) => {
// // //       console.log("Socket disconnected:", reason);
// // //       setConnectionStatus("disconnected");
// // //     });

// // //     // Application events
// // //     socket.current.on('priceUpdate', (data) => {
// // //       setBargainSessions(prev => 
// // //         prev.map(session => 
// // //           session.bargain_id === data.bargain_id 
// // //             ? { ...session, current_price: data.newPrice } 
// // //             : session
// // //         )
// // //       );
// // //     });

// // //     socket.current.on('bargainStatusUpdate', (data) => {
// // //       setBargainSessions(prev => 
// // //         prev.map(session => 
// // //           session.bargain_id === data.bargain_id 
// // //             ? { ...session, status: data.status } 
// // //             : session
// // //         )
// // //       );
// // //     });

// // //     socket.current.on('newMessage', (message) => {
// // //       setBargainSessions(prev => {
// // //         const updated = prev.map(session => {
// // //           if (session.bargain_id === message.bargain_id) {
// // //             return {
// // //               ...session,
// // //               last_message: message,
// // //               unread_count: (session.unread_count || 0) + 1,
// // //               updated_at: new Date().toISOString(),
// // //             };
// // //           }
// // //           return session;
// // //         });
// // //         return updated.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
// // //       });

// // //       setNewMessages(prev => ({
// // //         ...prev,
// // //         [message.bargain_id]: (prev[message.bargain_id] || 0) + 1
// // //       }));
// // //     });

// // //     socket.current.on('error', (error) => {
// // //       console.error("Socket error:", error);
// // //     });

// // //     return () => {
// // //       if (socket.current) {
// // //         socket.current.disconnect();
// // //       }
// // //     };
// // //   }, [navigate]);

// // //   // Fetch bargain sessions for the consumer
// // // // Update the fetchSessions function in ConsumerChatList.js
// // // const fetchSessions = useCallback(async () => {
// // //   try {
// // //     const token = getToken();
// // //     if (!token) return;

// // //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
// // //     const consumerId = decodedToken.consumer_id;
// // //     const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/sessions/consumers/${consumerId}`;

// // //     const response = await fetch(apiUrl, {
// // //       headers: {
// // //         'Authorization': `Bearer ${token}`,
// // //         'Accept': 'application/json',
// // //         'Content-Type': 'application/json'
// // //       },
// // //       credentials: 'include'
// // //     });

// // //     if (!response.ok) {
// // //       throw new Error(`HTTP error! status: ${response.status}`);
// // //     }

// // //     const data = await response.json();
    
// // //     // Transform the data to match our expected format
// // //     const validatedSessions = Array.isArray(data) 
// // //       ? data.map(session => ({
// // //           bargain_id: session.bargain_id,
// // //           farmer_id: session.farmer_id,
// // //           farmer_name: session.farmer_name || `Farmer ${session.farmer_id}`,
// // //           product_name: session.product_name || 'Product',
// // //           quantity: session.quantity || 1,
// // //           current_price: session.current_price || 0,
// // //           initial_price: session.initial_price || session.current_price || 0,
// // //           status: session.status || 'pending',
// // //           created_at: session.created_at,
// // //           updated_at: session.updated_at || session.created_at,
// // //           last_message: session.last_message || null,
// // //           unread_count: session.unread_count || 0
// // //         }))
// // //       : [];

// // //     setBargainSessions(validatedSessions);
// // //   } catch (error) {
// // //     console.error("Error fetching sessions:", error);
// // //     if (error.message.includes("401")) {
// // //       navigate("/loginPage");
// // //     }
// // //   } finally {
// // //     setLoading(false);
// // //   }
// // // }, [navigate]);

// // //   // Initial fetch and periodic refresh
// // //   useEffect(() => {
// // //     fetchSessions();
// // //     const interval = setInterval(fetchSessions, 10000);
// // //     return () => clearInterval(interval);
// // //   }, [fetchSessions]);

// // //   // Initialize socket connection
// // //   useEffect(() => {
// // //     initializeSocketConnection();
// // //     return () => {
// // //       if (socket.current) {
// // //         socket.current.disconnect();
// // //       }
// // //     };
// // //   }, [initializeSocketConnection]);

// // //   const handleSessionSelect = (session) => {
// // //     setSelectedSession(session);
// // //     navigate(`/consumer/bargain/${session.bargain_id}`);
// // //     setNewMessages(prev => {
// // //       const updated = { ...prev };
// // //       delete updated[session.bargain_id];
// // //       return updated;
// // //     });
// // //   };

// // //   const formatTime = (timestamp) => {
// // //     if (!timestamp) return "";
// // //     const date = new Date(timestamp);
// // //     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// // //   };

// // //   const formatDate = (timestamp) => {
// // //     if (!timestamp) return "";
// // //     const today = new Date();
// // //     const date = new Date(timestamp);
    
// // //     if (date.toDateString() === today.toDateString()) {
// // //       return formatTime(timestamp);
// // //     } else if (date.getFullYear() === today.getFullYear()) {
// // //       return date.toLocaleDateString([], { month: "short", day: "numeric" });
// // //     } else {
// // //       return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
// // //     }
// // //   };

// // //   const filteredSessions = bargainSessions.filter(session => {
// // //     const farmerName = session.farmer_name.toLowerCase();
// // //     const productName = session.product_name.toLowerCase();
// // //     return (
// // //       farmerName.includes(searchTerm.toLowerCase()) ||
// // //       productName.includes(searchTerm.toLowerCase())
// // //     );
// // //   });

// // //   if (loading) {
// // //     return (
// // //       <div className="loading-container">
// // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // //         <p>Loading bargain history...</p>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="consumer-chat-app">
// // //       {/* Sidebar */}
// // //       <div className="chat-sidebar">
// // //         <div className="sidebar-header">
// // //           <h2>Bargain History</h2>
// // //           <div className="connection-status">
// // //             <span className={`status-dot ${connectionStatus}`} />
// // //             {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
// // //           </div>
// // //         </div>
        
// // //         <div className="search-bar">
// // //           <input
// // //             type="text"
// // //             placeholder="Search by farmer or product..."
// // //             value={searchTerm}
// // //             onChange={(e) => setSearchTerm(e.target.value)}
// // //           />
// // //         </div>
  
// // //         <div className="session-list">
// // //           {filteredSessions.length === 0 ? (
// // //             <div className="empty-state">
// // //               {searchTerm ? (
// // //                 <p>No matching bargains found</p>
// // //               ) : (
// // //                 <p>No active bargain sessions</p>
// // //               )}
// // //             </div>
// // //           ) : (
// // //             filteredSessions.map((session) => (
// // //               <div
// // //                 key={session.bargain_id}
// // //                 className={`session-card ${id === session.bargain_id ? "active" : ""}`}
// // //                 onClick={() => handleSessionSelect(session)}
// // //               >
// // //                 <div className="farmer-avatar">
// // //                   {session.farmer_name.charAt(0).toUpperCase()}
// // //                 </div>
                
// // //                 <div className="session-content">
// // //                   <div className="session-header">
// // //                     <h3>{session.farmer_name}</h3>
// // //                     <span className="session-time">
// // //                       {formatDate(session.updated_at)}
// // //                     </span>
// // //                   </div>
                  
// // //                   <div className="session-details">
// // //                     <p className="product-info">
// // //                       <strong>{session.product_name}</strong> ({session.quantity}kg)
// // //                     </p>
// // //                     <p className="price-info">
// // //                       <FontAwesomeIcon icon={faRupeeSign} />
// // //                       {session.current_price}/kg
// // //                     </p>
// // //                   </div>
                  
// // //                   <div className="session-preview">
// // //                     {session.last_message ? (
// // //                       <p className="message-preview">
// // //                         {session.last_message.sender_type === 'farmer' ? 
// // //                           `${session.farmer_name}: ${session.last_message.message}` : 
// // //                           `You: ${session.last_message.message}`
// // //                         }
// // //                       </p>
// // //                     ) : (
// // //                       <p className="message-preview">No messages yet</p>
// // //                     )}
// // //                   </div>
// // //                 </div>
                
// // //                 {newMessages[session.bargain_id] && (
// // //                   <div className="unread-badge">
// // //                     {newMessages[session.bargain_id]}
// // //                   </div>
// // //                 )}
                
// // //                 {session.status === 'pending' && (
// // //                   <div className="status-indicator pending" />
// // //                 )}
// // //                 {session.status === 'accepted' && (
// // //                   <div className="status-indicator accepted" />
// // //                 )}
// // //                 {session.status === 'rejected' && (
// // //                   <div className="status-indicator rejected" />
// // //                 )}
// // //               </div>
// // //             ))
// // //           )}
// // //         </div>
// // //       </div>
  
// // //       {/* Chat Window */}
// // //       <div className="chat-window-container">
// // //         {selectedSession ? (
// // //           <ConsumerChatWindow
// // //             bargainId={selectedSession.bargain_id}
// // //             socket={socket.current}
// // //             connectionStatus={connectionStatus}
// // //             initialSession={selectedSession}
// // //             onBack={() => {
// // //               setSelectedSession(null);
// // //               navigate("/consumer/bargain");
// // //             }}
// // //           />
// // //         ) : (
// // //           <div className="empty-chat-window">
// // //             <div className="empty-content">
// // //               <h3>Select a bargain session</h3>
// // //               <p>Choose a conversation from the sidebar to view messages</p>
// // //             </div>
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default ConsumerChatList;
// // import React, { useState, useEffect, useRef, useCallback } from "react";
// // import { useParams, useNavigate } from "react-router-dom";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { faRupeeSign, faSpinner } from "@fortawesome/free-solid-svg-icons";
// // import { io } from 'socket.io-client';
// // import ConsumerChatWindow from "./ConsumerChatWindow";
// // import "./ConsumerChatList.css";

// // const ConsumerChatList = () => {
// //   const { id } = useParams();
// //   const navigate = useNavigate();
// //   const [bargainSessions, setBargainSessions] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedSession, setSelectedSession] = useState(null);
// //   const socket = useRef(null);
// //   const reconnectAttempts = useRef(0);
// //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// //   const [newMessages, setNewMessages] = useState({});
// //   const [searchTerm, setSearchTerm] = useState("");

// //   // Get token from consumer's localStorage with validation
// //   const getToken = () => {
// //     try {
// //       const consumerData = localStorage.getItem("consumer");
// //       if (!consumerData) {
// //         navigate("/loginPage");
// //         return null;
// //       }

// //       const parsedData = JSON.parse(consumerData);
// //       if (!parsedData?.token) {
// //         navigate("/loginPage");
// //         return null;
// //       }

// //       // Verify token structure
// //       const decoded = JSON.parse(atob(parsedData.token.split('.')[1]));
// //       if (!decoded?.consumer_id) {
// //         console.error("Token missing consumer_id");
// //         navigate("/loginPage");
// //         return null;
// //       }
// //       return parsedData.token;
// //     } catch (e) {
// //       console.error("Token parsing error:", e);
// //       navigate("/loginPage");
// //       return null;
// //     }
// //   };

// //   // WebSocket connection management
// //   const initializeSocketConnection = useCallback(() => {
// //     const token = getToken();
// //     if (!token) return;

// //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
// //     const consumerId = decodedToken.consumer_id;

// //     // Close existing connection if any
// //     if (socket.current) {
// //       socket.current.disconnect();
// //       socket.current = null;
// //     }

// //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// //       auth: { token },
// //       query: { consumerId },
// //       transports: ['websocket'],
// //       withCredentials: true,
// //       extraHeaders: { Authorization: `Bearer ${token}` }
// //     });
    
// //     // Connection events
// //     socket.current.on('connect', () => {
// //       console.log("Socket connected");
// //       setConnectionStatus("connected");
// //       reconnectAttempts.current = 0;
// //     });

// //     socket.current.on('connect_error', (err) => {
// //       console.error("Connection error:", err.message);
// //       setConnectionStatus("error");
      
// //       const maxAttempts = 5;
// //       if (reconnectAttempts.current < maxAttempts) {
// //         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// //         reconnectAttempts.current += 1;
// //         setTimeout(() => initializeSocketConnection(), delay);
// //       }
// //     });

// //     socket.current.on('disconnect', (reason) => {
// //       console.log("Socket disconnected:", reason);
// //       setConnectionStatus("disconnected");
// //     });

// //     // Application events
// //     socket.current.on('priceUpdate', (data) => {
// //       setBargainSessions(prev => 
// //         prev.map(session => 
// //           session.bargain_id === data.bargain_id 
// //             ? { ...session, current_price: data.newPrice } 
// //             : session
// //         )
// //       );
// //     });

// //     socket.current.on('bargainStatusUpdate', (data) => {
// //       setBargainSessions(prev => 
// //         prev.map(session => 
// //           session.bargain_id === data.bargain_id 
// //             ? { ...session, status: data.status } 
// //             : session
// //         )
// //       );
// //     });

// //     socket.current.on('newMessage', (message) => {
// //       setBargainSessions(prev => {
// //         const updated = prev.map(session => {
// //           if (session.bargain_id === message.bargain_id) {
// //             return {
// //               ...session,
// //               last_message: message,
// //               unread_count: (session.unread_count || 0) + (message.sender_type === 'farmer' ? 1 : 0),
// //               updated_at: new Date().toISOString(),
// //             };
// //           }
// //           return session;
// //         });
// //         return updated.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
// //       });

// //       if (message.sender_type === 'farmer') {
// //         setNewMessages(prev => ({
// //           ...prev,
// //           [message.bargain_id]: (prev[message.bargain_id] || 0) + 1
// //         }));
// //       }
// //     });

// //     socket.current.on('error', (error) => {
// //       console.error("Socket error:", error);
// //     });

// //     return () => {
// //       if (socket.current) {
// //         socket.current.disconnect();
// //       }
// //     };
// //   }, [navigate]);

// //   // Fetch bargain sessions for the consumer
// //   const fetchSessions = useCallback(async () => {
// //     try {
// //       const token = getToken();
// //       if (!token) return;

// //       const decodedToken = JSON.parse(atob(token.split(".")[1]));
// //       const consumerId = decodedToken.consumer_id;
// //       const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/sessions/consumer/${consumerId}`;

// //       const response = await fetch(apiUrl, {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Accept': 'application/json',
// //           'Content-Type': 'application/json'
// //         },
// //         credentials: 'include'
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }

// //       const data = await response.json();
      
// //       // Transform the data to match frontend expectations
// //       const validatedSessions = Array.isArray(data) 
// //         ? data.map(session => ({
// //             bargain_id: session.bargain_id,
// //             farmer_id: session.farmer_id,
// //             farmer_name: session.farmer_name || `Farmer ${session.farmer_id}`,
// //             product_name: session.product_name || 'Product',
// //             quantity: session.quantity || 0,
// //             current_price: session.current_price || 0,
// //             initial_price: session.initial_price || session.current_price || 0,
// //             status: session.status || 'pending',
// //             created_at: session.created_at,
// //             updated_at: session.updated_at || session.created_at,
// //             last_message: session.last_message || null,
// //             unread_count: session.unread_count || 0
// //           }))
// //         : [];

// //       setBargainSessions(validatedSessions);
// //     } catch (error) {
// //       console.error("Error fetching sessions:", error);
// //       if (error.message.includes("401")) {
// //         navigate("/loginPage");
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [navigate]);

// //   // Initial fetch and periodic refresh
// //   useEffect(() => {
// //     fetchSessions();
// //     const interval = setInterval(fetchSessions, 10000);
// //     return () => clearInterval(interval);
// //   }, [fetchSessions]);

// //   // Initialize socket connection
// //   useEffect(() => {
// //     initializeSocketConnection();
// //     return () => {
// //       if (socket.current) {
// //         socket.current.disconnect();
// //       }
// //     };
// //   }, [initializeSocketConnection]);

// //   const handleSessionSelect = (session) => {
// //     setSelectedSession(session);
// //     navigate(`/consumer/bargain/${session.bargain_id}`);
// //     setNewMessages(prev => {
// //       const updated = { ...prev };
// //       delete updated[session.bargain_id];
// //       return updated;
// //     });
// //   };

// //   const formatTime = (timestamp) => {
// //     if (!timestamp) return "";
// //     const date = new Date(timestamp);
// //     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// //   };

// //   const formatDate = (timestamp) => {
// //     if (!timestamp) return "";
// //     const today = new Date();
// //     const date = new Date(timestamp);
    
// //     if (date.toDateString() === today.toDateString()) {
// //       return formatTime(timestamp);
// //     } else if (date.getFullYear() === today.getFullYear()) {
// //       return date.toLocaleDateString([], { month: "short", day: "numeric" });
// //     } else {
// //       return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
// //     }
// //   };

// //   const filteredSessions = bargainSessions.filter(session => {
// //     const farmerName = session.farmer_name.toLowerCase();
// //     const productName = session.product_name.toLowerCase();
// //     return (
// //       farmerName.includes(searchTerm.toLowerCase()) ||
// //       productName.includes(searchTerm.toLowerCase())
// //     );
// //   });

// //   if (loading) {
// //     return (
// //       <div className="loading-container">
// //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// //         <p>Loading bargain requests...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="consumer-chat-app">
// //       {/* Sidebar */}
// //       <div className="chat-sidebar">
// //         <div className="sidebar-header">
// //           <h2>Bargain History</h2>
// //           <div className="connection-status">
// //             <span className={`status-dot ${connectionStatus}`} />
// //             {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
// //           </div>
// //         </div>
        
// //         <div className="search-bar">
// //           <input
// //             type="text"
// //             placeholder="Search by farmer or product..."
// //             value={searchTerm}
// //             onChange={(e) => setSearchTerm(e.target.value)}
// //           />
// //         </div>
  
// //         <div className="session-list">
// //           {filteredSessions.length === 0 ? (
// //             <div className="empty-state">
// //               {searchTerm ? (
// //                 <p>No matching requests found</p>
// //               ) : (
// //                 <p>No active bargain requests</p>
// //               )}
// //             </div>
// //           ) : (
// //             filteredSessions.map((session) => (
// //               <div
// //                 key={session.bargain_id}
// //                 className={`session-card ${id === session.bargain_id ? "active" : ""}`}
// //                 onClick={() => handleSessionSelect(session)}
// //               >
// //                 <div className="farmer-avatar">
// //                   {session.farmer_name.charAt(0).toUpperCase()}
// //                 </div>
                
// //                 <div className="session-content">
// //                   <div className="session-header">
// //                     <h3>{session.farmer_name}</h3>
// //                     <span className="session-time">
// //                       {formatDate(session.updated_at)}
// //                     </span>
// //                   </div>
                  
// //                   <div className="session-details">
// //                     <p className="product-info">
// //                       <strong>{session.product_name}</strong> ({session.quantity}kg)
// //                     </p>
// //                     <p className="price-info">
// //                       <FontAwesomeIcon icon={faRupeeSign} />
// //                       {session.current_price}/kg
// //                     </p>
// //                   </div>
                  
// //                   <div className="session-preview">
// //                     {session.last_message ? (
// //                       <p className="message-preview">
// //                         {session.last_message.sender_type === 'farmer' ? 
// //                           `${session.farmer_name}: ${session.last_message.message}` : 
// //                           `You: ${session.last_message.message}`
// //                         }
// //                       </p>
// //                     ) : (
// //                       <p className="message-preview">No messages yet</p>
// //                     )}
// //                   </div>
// //                 </div>
                
// //                 {newMessages[session.bargain_id] && (
// //                   <div className="unread-badge">
// //                     {newMessages[session.bargain_id]}
// //                   </div>
// //                 )}
                
// //                 {session.status === 'pending' && (
// //                   <div className="status-indicator pending" />
// //                 )}
// //                 {session.status === 'accepted' && (
// //                   <div className="status-indicator accepted" />
// //                 )}
// //                 {session.status === 'rejected' && (
// //                   <div className="status-indicator rejected" />
// //                 )}
// //               </div>
// //             ))
// //           )}
// //         </div>
// //       </div>
  
// //       {/* Chat Window */}
// //       <div className="chat-window-container">
// //         {selectedSession ? (
// //           <ConsumerChatWindow
// //             bargainId={selectedSession.bargain_id}
// //             socket={socket.current}
// //             connectionStatus={connectionStatus}
// //             initialSession={selectedSession}
// //             onBack={() => {
// //               setSelectedSession(null);
// //               navigate("/consumer/bargain");
// //             }}
// //           />
// //         ) : (
// //           <div className="empty-chat-window">
// //             <div className="empty-content">
// //               <h3>Select a bargain request</h3>
// //               <p>Choose a conversation from the sidebar to start bargaining</p>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default ConsumerChatList;
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSpinner } from "@fortawesome/free-solid-svg-icons";
// import { io } from 'socket.io-client';
// import ConsumerChatWindow from "./ConsumerChatWindow";
// import "./ConsumerChatList.css";

// const ConsumerChatList = () => {
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

//   // Get token from consumer's localStorage
//   const getToken = () => {
//     try {
//       const consumerData = localStorage.getItem("consumer");
//       if (!consumerData) {
//         navigate("/loginPage");
//         return null;
//       }
//       const parsedData = JSON.parse(consumerData);
//       return parsedData?.token || null;
//     } catch (e) {
//       console.error("Token parsing error:", e);
//       navigate("/loginPage");
//       return null;
//     }
//   };

//   // WebSocket connection management
//   const initializeSocketConnection = useCallback(() => {
//     const token = getToken();
//     if (!token) return;

//     const decodedToken = JSON.parse(atob(token.split(".")[1]));
//     const consumerId = decodedToken.consumer_id;

//     if (socket.current) {
//       socket.current.disconnect();
//       socket.current = null;
//     }

//     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
//       auth: { token },
//       query: { consumerId },
//       transports: ['websocket'],
//       withCredentials: true,
//       extraHeaders: { Authorization: `Bearer ${token}` }
//     });
    
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

//     socket.current.on('newMessage', (message) => {
//       setBargainSessions(prev => {
//         const updated = prev.map(session => {
//           if (session.bargain_id === message.bargain_id) {
//             return {
//               ...session,
//               last_message: message,
//               unread_count: (session.unread_count || 0) + (message.sender_type === 'farmer' ? 1 : 0),
//               updated_at: new Date().toISOString(),
//             };
//           }
//           return session;
//         });
//         return updated.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
//       });

//       if (message.sender_type === 'farmer') {
//         setNewMessages(prev => ({
//           ...prev,
//           [message.bargain_id]: (prev[message.bargain_id] || 0) + 1
//         }));
//       }
//     });

//     return () => {
//       if (socket.current) {
//         socket.current.disconnect();
//       }
//     };
//   }, [navigate]);

//   // Fetch bargain sessions for the consumer
//   const fetchSessions = useCallback(async () => {
//     try {
//       const token = getToken();
//       if (!token) return;

//       const decodedToken = JSON.parse(atob(token.split(".")[1]));
//       const consumerId = decodedToken.consumer_id;
//       const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/sessions/consumer/${consumerId}`;

//       const response = await fetch(apiUrl, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         },
//         credentials: 'include'
//       });

//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//       const data = await response.json();
      
//       const validatedSessions = Array.isArray(data) 
//         ? data.map(session => ({
//             bargain_id: session.bargain_id,
//             farmer_id: session.farmer_id,
//             farmer_name: session.farmer_name,
//             farmer_initials: session.farmer_name?.charAt(0).toUpperCase() || 'F',
//             last_message: session.last_message || null,
//             updated_at: session.updated_at || session.created_at,
//             status: session.status || 'pending',
//             unread_count: session.unread_count || 0
//           }))
//         : [];

//       setBargainSessions(validatedSessions);
//     } catch (error) {
//       console.error("Error fetching sessions:", error);
//       if (error.message.includes("401")) navigate("/loginPage");
//     } finally {
//       setLoading(false);
//     }
//   }, [navigate]);

//   useEffect(() => {
//     fetchSessions();
//     const interval = setInterval(fetchSessions, 10000);
//     return () => clearInterval(interval);
//   }, [fetchSessions]);

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
//     navigate(`/consumer/bargain/${session.bargain_id}`);
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
//     if (!timestamp) return "";
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

//   const filteredSessions = bargainSessions.filter(session => {
//     const farmerName = session.farmer_name.toLowerCase();
//     return farmerName.includes(searchTerm.toLowerCase());
//   });

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//         <p>Loading bargain requests...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="consumer-chat-app">
//       <div className="chat-sidebar">
//         <div className="sidebar-header">
//           <h2>Bargain History</h2>
//           <div className="connection-status">
//             <span className={`status-dot ${connectionStatus}`} />
//             {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
//           </div>
//         </div>
        
//         <div className="search-bar">
//           <input
//             type="text"
//             placeholder="Search by farmer..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
  
//         <div className="session-list">
//           {filteredSessions.length === 0 ? (
//             <div className="empty-state">
//               {searchTerm ? "No matching requests found" : "No active bargain requests"}
//             </div>
//           ) : (
//             filteredSessions.map((session) => (
//               <div
//                 key={session.bargain_id}
//                 className={`session-card ${id === session.bargain_id ? "active" : ""}`}
//                 onClick={() => handleSessionSelect(session)}
//               >
//                 <div 
//                   className="farmer-avatar"
//                   style={{ backgroundColor: stringToColor(session.farmer_name) }}
//                 >
//                   {session.farmer_initials}
//                 </div>
                
//                 <div className="session-content">
//                   <div className="session-header">
//                     <h3>{session.farmer_name}</h3>
//                     <span className="session-time">
//                       {formatDate(session.updated_at)}
//                     </span>
//                   </div>
                  
//                   <div className="session-preview">
//                     {session.last_message ? (
//                       <p className="message-preview">
//                         {session.last_message.sender_type === 'farmer' ? 
//                           `${session.last_message.message}` : 
//                           `You: ${session.last_message.message}`
//                         }
//                       </p>
//                     ) : (
//                       <p className="message-preview">Bargain started</p>
//                     )}
//                   </div>
//                 </div>
                
//                 {newMessages[session.bargain_id] > 0 && (
//                   <div className="unread-badge">
//                     {newMessages[session.bargain_id]}
//                   </div>
//                 )}
                
//                 <div className={`status-indicator ${session.status}`} />
//               </div>
//             ))
//           )}
//         </div>
//       </div>
  
//       <div className="chat-window-container">
//         {selectedSession ? (
//           <ConsumerChatWindow
//             bargainId={selectedSession.bargain_id}
//             socket={socket.current}
//             connectionStatus={connectionStatus}
//             initialSession={selectedSession}
//             onBack={() => {
//               setSelectedSession(null);
//               navigate("/consumer/bargain");
//             }}
//           />
//         ) : (
//           <div className="empty-chat-window">
//             <div className="empty-content">
//               <h3>Select a bargain request</h3>
//               <p>Choose a conversation from the sidebar</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Helper function to generate consistent color from name
// function stringToColor(str) {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     hash = str.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   const hue = Math.abs(hash % 360);
//   return `hsl(${hue}, 70%, 50%)`;
// }

// export default ConsumerChatList;
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faListAlt, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { io } from 'socket.io-client';
import ConsumerChatWindow from "./ConsumerChatWindow";
import "./ConsumerChatList.css";

const ConsumerChatList = () => {
  const { consumerId } = useParams();
  const navigate = useNavigate();
  const [bargainSessions, setBargainSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const socket = useRef(null);
  const reconnectAttempts = useRef(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [newMessages, setNewMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Helper functions to extract info from message content
  const extractProductName = (content) => {
    if (!content) return 'Product';
    const match = content.match(/You selected (.+?) \(/);
    return match ? match[1] : 'Product';
  };

  const extractQuantity = (content) => {
    if (!content) return 0;
    const match = content.match(/\((\d+)kg\)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const extractPrice = (content) => {
    if (!content) return 0;
    const match = content.match(/₹(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Get token from consumer's localStorage with validation
  const getToken = () => {
    try {
      const consumerData = localStorage.getItem("consumer");
      if (!consumerData) {
        navigate("/loginPage");
        return null;
      }

      const parsedData = JSON.parse(consumerData);
      if (!parsedData?.token) {
        navigate("/loginPage");
        return null;
      }

      // Verify token structure
      const decoded = JSON.parse(atob(parsedData.token.split('.')[1]));
      if (!decoded?.consumer_id) {
        console.error("Token missing consumer_id");
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

  // Helper function to normalize session data
  const normalizeSession = (session) => {
    if (!session) {
      console.error("Attempted to normalize undefined session");
      return null;
    }
  
    const defaultSession = {
      bargain_id: '',
      farmer_id: '',
      farmer_name: 'Unknown Farmer',
      product_name: 'Unknown Product',
      quantity: 0,
      current_price: 0,
      initial_price: 0,
      status: 'pending',
      last_message: null,
      unread_count: 0,
      updated_at: new Date().toISOString()
    };
  
    // Safely merge the incoming session with defaults
    const normalized = { ...defaultSession };
    for (const key in session) {
      if (session[key] !== undefined && session[key] !== null) {
        normalized[key] = session[key];
      }
    }
  
    // Special handling for farmer name
    if (!normalized.farmer_name && 
        (session.first_name || session.last_name)) {
      normalized.farmer_name = 
        `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
        defaultSession.farmer_name;
    }
  
    return normalized;
  };

  const fetchSessions = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        console.warn("No token available - redirecting to login");
        navigate("/loginPage");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const consumerId = decodedToken.consumer_id;
      console.log(`Fetching sessions for consumer: ${consumerId}`);

      const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/consumers/${consumerId}/sessions`;
      console.log("API Endpoint:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log("Response Status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }

      const responseData = await response.json();
      console.log("Raw API Data:", responseData);

      // Validate and normalize the response data
      const validatedSessions = Array.isArray(responseData) 
        ? responseData
            .map(session => ({
              bargain_id: session.bargain_id?.toString() || '',
              farmer_id: session.farmer_id || '',
              farmer_name: session.farmer_name || 
                         `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
                         `Farmer ${session.farmer_id || 'Unknown'}`,
              product_name: session.product_name || 'Unknown Product',
              quantity: Number(session.quantity) || 0,
              current_price: Number(session.current_price) || 0,
              initial_price: Number(session.initial_price) || 0,
              status: session.status || 'pending',
              last_message: session.last_message || null,
              unread_count: Number(session.unread_count) || 0,
              updated_at: session.updated_at || new Date().toISOString()
            }))
            .filter(session => {
              const isValid = session.bargain_id && session.farmer_id;
              if (!isValid) {
                console.warn("Invalid session filtered out:", session);
              }
              return isValid;
            })
        : [];

      console.log("Validated Sessions:", validatedSessions);
      setBargainSessions(validatedSessions.sort((a, b) => 
        new Date(b.updated_at) - new Date(a.updated_at)
      ));

    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      
      if (error.name === 'AbortError') {
        console.warn("Request timed out");
      } else if (error.message.includes("401")) {
        navigate("/loginPage");
      } else {
        setBargainSessions([]);
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

  // WebSocket connection management
  const initializeSocketConnection = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.error("No token available - redirecting to login");
      navigate("/loginPage");
      return;
    }
  
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const consumerId = decodedToken.consumer_id;
  
      // Close existing connection if any
      if (socket.current) {
        console.log("Disconnecting existing socket connection");
        socket.current.off();
        socket.current.disconnect();
        socket.current = null;
      }
  
      console.log("Initializing new socket connection");
      socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
        auth: { token },
        query: { consumerId },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        timeout: 20000,
        withCredentials: true,
        extraHeaders: { 
          Authorization: `Bearer ${token}`,
          'X-Consumer-ID': consumerId
        }
      });
      
      // Connection events
      socket.current.on('connect', () => {
        console.log("Socket connected successfully");
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
        fetchSessions();
      });
  
      socket.current.on('connect_error', (err) => {
        console.error("Socket connection error:", err.message);
        setConnectionStatus("error");
        
        const maxAttempts = 10;
        if (reconnectAttempts.current < maxAttempts) {
          const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
          reconnectAttempts.current += 1;
          console.log(`Attempting reconnect #${reconnectAttempts.current} in ${delay}ms`);
          setTimeout(() => initializeSocketConnection(), delay);
        } else {
          console.error("Max reconnection attempts reached");
        }
      });
  
      socket.current.on('disconnect', (reason) => {
        console.log("Socket disconnected. Reason:", reason);
        setConnectionStatus("disconnected");
        
        if (reason === "io server disconnect") {
          setTimeout(() => initializeSocketConnection(), 1000);
        }
      });
  
      // Application events
      socket.current.on('newBargain', (session) => {
        console.log("New bargain session received:", session);
        setBargainSessions(prev => [
          normalizeSession(session),
          ...prev
        ]);
      });
  
      socket.current.on('priceUpdate', (data) => {
        console.log("Price update received:", data);
        setBargainSessions(prev => 
          prev.map(session => 
            session.bargain_id === data.bargain_id 
              ? { 
                  ...session, 
                  current_price: data.newPrice,
                  updated_at: new Date().toISOString()
                } 
              : session
          )
        );
      });
  
      socket.current.on('bargainStatusUpdate', (data) => {
        console.log("Status update received:", data);
        setBargainSessions(prev => 
          prev.map(session => 
            session.bargain_id === data.bargain_id 
              ? { 
                  ...session, 
                  status: data.status,
                  updated_at: new Date().toISOString()
                } 
              : session
          )
        );
      });
  
      socket.current.on('bargainMessage', (message) => {
        console.log("New message received:", message);
        setBargainSessions(prev => {
          const existingIndex = prev.findIndex(s => s.bargain_id === message.bargainId);
          
          const newSessionData = {
            bargain_id: message.bargainId,
            farmer_id: message.farmer_id,
            farmer_name: message.farmer_name || `Farmer ${message.farmer_id}`,
            product_name: extractProductName(message.message?.content) || 'Product',
            quantity: extractQuantity(message.message?.content) || 0,
            current_price: extractPrice(message.message?.content) || 0,
            initial_price: extractPrice(message.message?.content) || 0,
            status: 'pending',
            last_message: {
              content: message.message?.content,
              timestamp: message.message?.timestamp || new Date().toISOString(),
              sender_type: message.senderType
            },
            updated_at: new Date().toISOString(),
            unread_count: 1
          };
      
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              ...newSessionData,
              unread_count: (updated[existingIndex].unread_count || 0) + 1
            };
            return updated;
          } else {
            return [newSessionData, ...prev];
          }
        });
      });
  
      socket.current.on('error', (error) => {
        console.error("Socket error:", error);
        setConnectionStatus("error");
      });
  
    } catch (error) {
      console.error("Socket initialization error:", error);
      setConnectionStatus("error");
      setTimeout(() => initializeSocketConnection(), 5000);
    }
  
    return () => {
      if (socket.current) {
        console.log("Cleaning up socket connection");
        socket.current.off();
        socket.current.disconnect();
      }
    };
  }, [navigate, fetchSessions]);
  
  // Initialize socket connection
  useEffect(() => {
    initializeSocketConnection();
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [initializeSocketConnection]);

  const validateSession = (session) => {
    if (!session) return false;
    
    const requiredFields = [
      'bargain_id',
      'farmer_id',
      'farmer_name',
      'product_name',
      'status',
      'updated_at'
    ];
    
    return requiredFields.every(field => {
      const isValid = session[field] !== undefined && session[field] !== null;
      if (!isValid) {
        console.warn(`Missing required field: ${field} in session:`, session);
      }
      return isValid;
    });
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    navigate(`/consumer/bargain/${session.bargain_id}`);
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

  const filteredSessions = bargainSessions
    .filter(session => {
      const isValid = validateSession(session);
      if (!isValid) {
        console.warn("Invalid session filtered out:", session);
      }
      return isValid;
    })
    .filter(session => {
      try {
        const search = searchTerm.toLowerCase();
        return (
          session.farmer_name.toLowerCase().includes(search) ||
          session.product_name.toLowerCase().includes(search)
        );
      } catch (error) {
        console.error("Error filtering session:", error, session);
        return false;
      }
    });

  useEffect(() => {
    console.log("Current bargain sessions:", bargainSessions);
  }, [bargainSessions]);

  if (loading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading bargain requests...</p>
      </div>
    );
  }

  return (
    <div className="consumer-chat-app">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Bargain Requests</h2>
          <div className="connection-status">
            <span className={`status-dot ${connectionStatus}`} />
            {connectionStatus === 'connected' ? 'Online' : 
            connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            {connectionStatus !== 'connected' && (
              <button onClick={initializeSocketConnection}>Reconnect</button>
            )}
          </div>
        </div>
        
        <div className="action-buttons">
  <Link to="/consumer-orders" className="action-button">
    <FontAwesomeIcon icon={faListAlt} />
    <span>View Orders</span>
  </Link>
  <Link to="/bargain-cart" className="action-button">
    <FontAwesomeIcon icon={faShoppingCart} />
    <span>View Cart</span>
  </Link>
</div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by farmer or product..."
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
                key={`session-${session.bargain_id}`}
                className={`session-card ${consumerId === session.bargain_id ? "active" : ""}`}
                onClick={() => handleSessionSelect(session)}
              >
                <div className="farmer-avatar">
                  {session.farmer_name.charAt(0).toUpperCase()}
                </div>
                
                <div className="session-content">
                  <div className="session-header">
                    <h3>{session.farmer_name}</h3>
                    <span className="session-time">
                      {formatDate(session.updated_at)}
                    </span>
                  </div>
                  
                  <div className="session-preview">
                    <p className="message-preview">
                      {session.last_message?.content || "You received a bargain message"}
                    </p>

                    <span className="session-time">
                      {formatDate(session.last_message?.timestamp || session.updated_at)}
                    </span>
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
          <ConsumerChatWindow
            bargainId={selectedSession.bargain_id}
            socket={socket.current}
            connectionStatus={connectionStatus}
            initialSession={selectedSession}
            onBack={() => {
              setSelectedSession(null);
              navigate("/consumer/bargain");
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

export default ConsumerChatList;