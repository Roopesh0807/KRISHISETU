// // // // // // // import React, { useState, useEffect, useRef, useCallback } from "react";
// // // // // // // import { useParams, useNavigate, Link } from "react-router-dom";
// // // // // // // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // // // // // // import { faSpinner } from "@fortawesome/free-solid-svg-icons";
// // // // // // // import { io } from 'socket.io-client';
// // // // // // // import FarmerChatWindow from "./FarmerChatWindow";
// // // // // // // import "./FarmerChatList.css";
// // // // // // // import {
// // // // // // //   faListAlt,
// // // // // // //   faShoppingCart
// // // // // // // } from '@fortawesome/free-solid-svg-icons';


// // // // // // // const FarmerChatList = () => {
// // // // // // //   const { farmerId } = useParams();
// // // // // // //   const navigate = useNavigate();
// // // // // // //   const [bargainSessions, setBargainSessions] = useState([]);
// // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // //   const [selectedSession, setSelectedSession] = useState(null);
// // // // // // //   const socket = useRef(null);
// // // // // // //   const reconnectAttempts = useRef(0);
// // // // // // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // // // // // //   const [newMessages, setNewMessages] = useState({});
// // // // // // //   const [searchTerm, setSearchTerm] = useState("");


// // // // // // //    // Helper functions to extract info from message content
// // // // // // //    const extractProductName = (content) => {
// // // // // // //     if (!content) return 'Product';
// // // // // // //     const match = content.match(/You selected (.+?) \(/);
// // // // // // //     return match ? match[1] : 'Product';
// // // // // // //   };

// // // // // // //   const extractQuantity = (content) => {
// // // // // // //     if (!content) return 0;
// // // // // // //     const match = content.match(/\((\d+)kg\)/);
// // // // // // //     return match ? parseInt(match[1], 10) : 0;
// // // // // // //   };

// // // // // // //   const extractPrice = (content) => {
// // // // // // //     if (!content) return 0;
// // // // // // //     const match = content.match(/₹(\d+)/);
// // // // // // //     return match ? parseInt(match[1], 10) : 0;
// // // // // // //   };
// // // // // // //   // Get token from farmer's localStorage with validation
// // // // // // //   const getToken = () => {
// // // // // // //     try {
// // // // // // //       const farmerData = localStorage.getItem("farmer");
// // // // // // //       if (!farmerData) {
// // // // // // //         navigate("/loginPage");
// // // // // // //         return null;
// // // // // // //       }

// // // // // // //       const parsedData = JSON.parse(farmerData);
// // // // // // //       if (!parsedData?.token) {
// // // // // // //         navigate("/loginPage");
// // // // // // //         return null;
// // // // // // //       }

// // // // // // //       // Verify token structure
// // // // // // //       const decoded = JSON.parse(atob(parsedData.token.split('.')[1]));
// // // // // // //       if (!decoded?.farmer_id) {
// // // // // // //         console.error("Token missing farmer_id");
// // // // // // //         navigate("/loginPage");
// // // // // // //         return null;
// // // // // // //       }
// // // // // // //       return parsedData.token;
// // // // // // //     } catch (e) {
// // // // // // //       console.error("Token parsing error:", e);
// // // // // // //       navigate("/loginPage");
// // // // // // //       return null;
// // // // // // //     }
// // // // // // //   };


// // // // // // //   // Helper function to normalize session data
// // // // // // //   const normalizeSession = (session) => {
// // // // // // //     if (!session) {
// // // // // // //       console.error("Attempted to normalize undefined session");
// // // // // // //       return null;
// // // // // // //     }
// // // // // // //     const defaultSession = {
// // // // // // //       bargain_id: '',
// // // // // // //       consumer_id: '',
// // // // // // //       consumer_name: 'Unknown Consumer',
// // // // // // //       product_name: 'Unknown Product',
// // // // // // //       quantity: 0,
// // // // // // //       current_price: 0,
// // // // // // //       initial_price: 0,
// // // // // // //       status: 'pending',
// // // // // // //       last_message: null,
// // // // // // //       unread_count: 0,
// // // // // // //       updated_at: new Date().toISOString()
// // // // // // //     };
  
// // // // // // //     // Safely merge the incoming session with defaults
// // // // // // //     const normalized = { ...defaultSession };
// // // // // // //     for (const key in session) {
// // // // // // //       if (session[key] !== undefined && session[key] !== null) {
// // // // // // //         normalized[key] = session[key];
// // // // // // //       }
// // // // // // //     }
  
// // // // // // //     // Special handling for consumer name
// // // // // // //     if (!normalized.consumer_name && 
// // // // // // //         (session.first_name || session.last_name)) {
// // // // // // //       normalized.consumer_name = 
// // // // // // //         `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
// // // // // // //         defaultSession.consumer_name;
// // // // // // //     }
  
// // // // // // //     return normalized;
// // // // // // //   };
// // // // // // //  // Update your fetchSessions function
// // // // // // // //  const fetchSessions = useCallback(async () => {
// // // // // // // //   try {
// // // // // // // //     const token = getToken();
// // // // // // // //     if (!token) return;

// // // // // // // //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
// // // // // // // //     const farmerId = decodedToken.farmer_id;
// // // // // // // //     const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;

// // // // // // // //     const response = await fetch(apiUrl, {
// // // // // // // //       headers: {
// // // // // // // //         'Authorization': `Bearer ${token}`,
// // // // // // // //         'Accept': 'application/json',
// // // // // // // //         'Content-Type': 'application/json'
// // // // // // // //       },
// // // // // // // //       credentials: 'include'
// // // // // // // //     });

// // // // // // // //     if (!response.ok) {
// // // // // // // //       throw new Error(`HTTP error! status: ${response.status}`);
// // // // // // // //     }

// // // // // // // //     const data = await response.json();
// // // // // // // //     console.log("API Response:", data); // Debug log
    
// // // // // // // //     setBargainSessions(prev => {
// // // // // // // //       // Create a map of existing sessions for reference
// // // // // // // //       const existingMap = new Map(prev.map(s => [s.bargain_id, s]));

// // // // // // // //       // Transform API data to match your UI requirements
// // // // // // // //       const apiSessions = Array.isArray(data) ? data.map(session => ({
// // // // // // // //         bargain_id: session.bargain_id.toString(),
// // // // // // // //         consumer_id: session.consumer_id,
// // // // // // // //         consumer_name: session.consumer_name || `Consumer ${session.consumer_id}`,
// // // // // // // //         product_name: session.product_name || 'Unknown Product',
// // // // // // // //         quantity: session.quantity || 0,
// // // // // // // //         current_price: session.current_price || 0,
// // // // // // // //         initial_price: session.initial_price || 0,
// // // // // // // //         status: session.status || 'pending',
// // // // // // // //         last_message: session.last_message || null,
// // // // // // // //         unread_count: session.unread_count || 0,
// // // // // // // //         updated_at: session.updated_at || session.created_at || new Date().toISOString()
// // // // // // // //       })) : [];

// // // // // // // //       // Merge with existing sessions
// // // // // // // //       const mergedSessions = [
// // // // // // // //         ...apiSessions,
// // // // // // // //         ...Array.from(existingMap.values()).filter(
// // // // // // // //           existing => !apiSessions.some(s => s.bargain_id === existing.bargain_id)
// // // // // // // //         )
// // // // // // // //       ];

// // // // // // // //       return mergedSessions.sort((a, b) => 
// // // // // // // //         new Date(b.updated_at) - new Date(a.updated_at)
// // // // // // // //       );
// // // // // // // //     });

// // // // // // // //   } catch (error) {
// // // // // // // //     console.error("Error fetching sessions:", error);
// // // // // // // //     if (error.message.includes("401")) {
// // // // // // // //       navigate("/loginPage");
// // // // // // // //     }
// // // // // // // //   } finally {
// // // // // // // //     setLoading(false);
// // // // // // // //   }
// // // // // // // // }, [navigate]);

// // // // // // // const fetchSessions = useCallback(async () => {
// // // // // // //   try {
// // // // // // //     const token = getToken();
// // // // // // //     if (!token) {
// // // // // // //       console.warn("No token available - redirecting to login");
// // // // // // //       navigate("/loginPage");
// // // // // // //       return;
// // // // // // //     }

// // // // // // //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
// // // // // // //     const farmerId = decodedToken.farmer_id;
// // // // // // //     console.log(`Fetching sessions for farmer: ${farmerId}`);

// // // // // // //     const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;
// // // // // // //     console.log("API Endpoint:", apiUrl);

// // // // // // //     const response = await fetch(apiUrl, {
// // // // // // //       headers: {
// // // // // // //         'Authorization': `Bearer ${token}`,
// // // // // // //         'Accept': 'application/json',
// // // // // // //         'Content-Type': 'application/json'
// // // // // // //       },
// // // // // // //       credentials: 'include',
// // // // // // //       signal: AbortSignal.timeout(10000) // 10 second timeout
// // // // // // //     });

// // // // // // //     console.log("Response Status:", response.status);
    
// // // // // // //     if (!response.ok) {
// // // // // // //       const errorText = await response.text();
// // // // // // //       console.error("API Error Response:", errorText);
// // // // // // //       throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
// // // // // // //     }

// // // // // // //     const responseData = await response.json();
// // // // // // //     console.log("Raw API Data:", responseData);

// // // // // // //     // Validate and normalize the response data
// // // // // // //     const validatedSessions = Array.isArray(responseData) 
// // // // // // //       ? responseData
// // // // // // //           .map(session => ({
// // // // // // //             bargain_id: session.bargain_id?.toString() || '',
// // // // // // //             consumer_id: session.consumer_id || '',
// // // // // // //             consumer_name: session.consumer_name || 
// // // // // // //                          `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
// // // // // // //                          `Consumer ${session.consumer_id || 'Unknown'}`,
// // // // // // //             product_name: session.product_name || 'Unknown Product',
// // // // // // //             quantity: Number(session.quantity) || 0,
// // // // // // //             current_price: Number(session.current_price) || 0,
// // // // // // //             initial_price: Number(session.initial_price) || 0,
// // // // // // //             status: session.status || 'pending',
// // // // // // //             last_message: session.last_message || null,
// // // // // // //             unread_count: Number(session.unread_count) || 0,
// // // // // // //             updated_at: session.updated_at || new Date().toISOString()
// // // // // // //           }))
// // // // // // //           .filter(session => {
// // // // // // //             const isValid = session.bargain_id && session.consumer_id;
// // // // // // //             if (!isValid) {
// // // // // // //               console.warn("Invalid session filtered out:", session);
// // // // // // //             }
// // // // // // //             return isValid;
// // // // // // //           })
// // // // // // //       : [];

// // // // // // //     // Group sessions by consumer and keep only the most recent one
// // // // // // //     const groupedSessions = validatedSessions.reduce((acc, session) => {
// // // // // // //       const existingSession = acc.find(s => s.consumer_id === session.consumer_id);
      
// // // // // // //       if (existingSession) {
// // // // // // //         // Replace if this session is more recent
// // // // // // //         if (new Date(session.updated_at) > new Date(existingSession.updated_at)) {
// // // // // // //           const index = acc.indexOf(existingSession);
// // // // // // //           acc[index] = session;
// // // // // // //         }
// // // // // // //         // Sum unread counts
// // // // // // //         existingSession.unread_count += session.unread_count;
// // // // // // //       } else {
// // // // // // //         acc.push(session);
// // // // // // //       }
      
// // // // // // //       return acc;
// // // // // // //     }, []);

// // // // // // //     console.log("Grouped Sessions:", groupedSessions);
// // // // // // //     setBargainSessions(groupedSessions.sort((a, b) => 
// // // // // // //       new Date(b.updated_at) - new Date(a.updated_at)
// // // // // // //     ));

// // // // // // //   } catch (error) {
// // // // // // //     console.error("Failed to fetch sessions:", error);
    
// // // // // // //     if (error.name === 'AbortError') {
// // // // // // //       console.warn("Request timed out");
// // // // // // //       // Optionally show timeout message to user
// // // // // // //     } else if (error.message.includes("401")) {
// // // // // // //       navigate("/loginPage");
// // // // // // //     } else {
// // // // // // //       // Show generic error to user if needed
// // // // // // //       setBargainSessions([]); // Clear any existing sessions on error
// // // // // // //     }
// // // // // // //   } finally {
// // // // // // //     setLoading(false);
// // // // // // //   }
// // // // // // // }, [navigate]);
// // // // // // //   // Initial fetch and periodic refresh
// // // // // // //   useEffect(() => {
// // // // // // //     fetchSessions();
// // // // // // //     const interval = setInterval(fetchSessions, 10000);
// // // // // // //     return () => clearInterval(interval);
// // // // // // //   }, [fetchSessions]);



// // // // // // //     // WebSocket connection management
// // // // // // //  const initializeSocketConnection = useCallback(() => {
// // // // // // //   const token = getToken();
// // // // // // //   if (!token) {
// // // // // // //     console.error("No token available - redirecting to login");
// // // // // // //     navigate("/loginPage");
// // // // // // //     return;
// // // // // // //   }

// // // // // // //   try {
// // // // // // //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
// // // // // // //     const farmerId = decodedToken.farmer_id;

// // // // // // //     // Close existing connection if any
// // // // // // //     if (socket.current) {
// // // // // // //       console.log("Disconnecting existing socket connection");
// // // // // // //       socket.current.off();
// // // // // // //       socket.current.disconnect();
// // // // // // //       socket.current = null;
// // // // // // //     }

// // // // // // //     console.log("Initializing new socket connection for farmer list");
// // // // // // //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // // // // // //       auth: { token },
// // // // // // //       query: { 
// // // // // // //         userType: 'farmer',
// // // // // // //         farmerId 
// // // // // // //       },
// // // // // // //       transports: ['websocket', 'polling'],
// // // // // // //       reconnection: true,
// // // // // // //       reconnectionAttempts: 5,
// // // // // // //       reconnectionDelay: 1000,
// // // // // // //       reconnectionDelayMax: 10000,
// // // // // // //       timeout: 20000,
// // // // // // //       secure: process.env.NODE_ENV === 'production',
// // // // // // //       rejectUnauthorized: false,
// // // // // // //       extraHeaders: { 
// // // // // // //         Authorization: `Bearer ${token}`,
// // // // // // //         'X-Farmer-ID': farmerId
// // // // // // //       }
// // // // // // //     });
    
// // // // // // //     // Connection events - Standardized with chat window
// // // // // // //     socket.current.on('connect', () => {
// // // // // // //       console.log("Socket connected successfully");
// // // // // // //       setConnectionStatus("connected");
// // // // // // //       reconnectAttempts.current = 0;
// // // // // // //       fetchSessions();
// // // // // // //     });

// // // // // // //     socket.current.on('connect_error', (err) => {
// // // // // // //       console.error("Socket connection error:", err.message);
// // // // // // //       setConnectionStatus("error");
      
// // // // // // //       const maxAttempts = 5;
// // // // // // //       if (reconnectAttempts.current < maxAttempts) {
// // // // // // //         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// // // // // // //         reconnectAttempts.current += 1;
// // // // // // //         console.log(`Attempting reconnect #${reconnectAttempts.current} in ${delay}ms`);
// // // // // // //         setTimeout(() => initializeSocketConnection(), delay);
// // // // // // //       } else {
// // // // // // //         console.error("Max reconnection attempts reached");
// // // // // // //       }
// // // // // // //     });

// // // // // // //     socket.current.on('disconnect', (reason) => {
// // // // // // //       console.log("Socket disconnected. Reason:", reason);
// // // // // // //       setConnectionStatus("disconnected");
      
// // // // // // //       if (reason === "io server disconnect") {
// // // // // // //         setTimeout(() => initializeSocketConnection(), 1000);
// // // // // // //       }
// // // // // // //     });

// // // // // // //     // Application events - Use the same event names as chat window
// // // // // // //     socket.current.on('bargainMessage', (message) => {
// // // // // // //       console.log("New message received:", message);
// // // // // // //       fetchSessions(); // Refresh the list
// // // // // // //     });

// // // // // // //     socket.current.on('bargainStatusUpdate', (data) => {
// // // // // // //       console.log("Status update received:", data);
// // // // // // //       fetchSessions(); // Refresh the list
// // // // // // //     });

// // // // // // //     socket.current.on('error', (error) => {
// // // // // // //       console.error("Socket error:", error);
// // // // // // //       setConnectionStatus("error");
// // // // // // //     });

// // // // // // //   } catch (error) {
// // // // // // //     console.error("Socket initialization error:", error);
// // // // // // //     setConnectionStatus("error");
// // // // // // //     setTimeout(() => initializeSocketConnection(), 5000);
// // // // // // //   }

// // // // // // //   return () => {
// // // // // // //     if (socket.current) {
// // // // // // //       console.log("Cleaning up socket connection");
// // // // // // //       socket.current.off();
// // // // // // //       socket.current.disconnect();
// // // // // // //     }
// // // // // // //   };
// // // // // // // }, [navigate, fetchSessions]);


// // // // // // //       // Initialize socket connection
// // // // // // //   useEffect(() => {
// // // // // // //     initializeSocketConnection();
// // // // // // //     return () => {
// // // // // // //       if (socket.current) {
// // // // // // //         socket.current.disconnect();
// // // // // // //       }
// // // // // // //     };
// // // // // // //   }, [initializeSocketConnection]);
// // // // // // //   const validateSession = (session) => {
// // // // // // //     if (!session) return false;
    
// // // // // // //     const requiredFields = [
// // // // // // //       'bargain_id',
// // // // // // //       'consumer_id',
// // // // // // //       'consumer_name',
// // // // // // //       'product_name',
// // // // // // //       'status',
// // // // // // //       'updated_at'
// // // // // // //     ];
    
// // // // // // //     return requiredFields.every(field => {
// // // // // // //       const isValid = session[field] !== undefined && session[field] !== null;
// // // // // // //       if (!isValid) {
// // // // // // //         console.warn(`Missing required field: ${field} in session:`, session);
// // // // // // //       }
// // // // // // //       return isValid;
// // // // // // //     });
// // // // // // //   };

// // // // // // //   const handleSessionSelect = (session) => {
// // // // // // //     if (!validateSession(session)) {
// // // // // // //       console.error("Invalid session data:", session);
// // // // // // //       return;
// // // // // // //     }
  
// // // // // // //     // Prepare consumer and product data for the chat window
// // // // // // //     const consumerData = {
// // // // // // //       first_name: session.consumer_name.split(' ')[0],
// // // // // // //       last_name: session.consumer_name.split(' ').slice(1).join(' ') || '',
// // // // // // //       phone_number: session.consumer_phone || 'Not available',
// // // // // // //       location: session.consumer_location || 'Not specified'
// // // // // // //     };
  
// // // // // // //     const productData = {
// // // // // // //       produce_name: session.product_name,
// // // // // // //       quantity: session.quantity,
// // // // // // //       price_per_kg: session.initial_price,
// // // // // // //       current_offer: session.current_price,
// // // // // // //       product_id: session.product_id || `temp-${session.bargain_id}`
// // // // // // //     };
  
// // // // // // //     // Navigate to chat window with state
// // // // // // //     navigate(`/farmer/bargain/${session.bargain_id}`, {
// // // // // // //       state: {
// // // // // // //         consumer: consumerData,
// // // // // // //         product: productData,
// // // // // // //         initialPrice: session.current_price
// // // // // // //       }
// // // // // // //     });
  
// // // // // // //     // Clear any new messages for this session
// // // // // // //     setNewMessages(prev => {
// // // // // // //       const updated = { ...prev };
// // // // // // //       delete updated[session.bargain_id];
// // // // // // //       return updated;
// // // // // // //     });
// // // // // // //   };

// // // // // // //   const formatTime = (timestamp) => {
// // // // // // //     if (!timestamp) return "";
// // // // // // //     const date = new Date(timestamp);
// // // // // // //     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// // // // // // //   };

// // // // // // //   const formatDate = (timestamp) => {
// // // // // // //     if (!timestamp) return "";
// // // // // // //     const today = new Date();
// // // // // // //     const date = new Date(timestamp);
    
// // // // // // //     if (date.toDateString() === today.toDateString()) {
// // // // // // //       return formatTime(timestamp);
// // // // // // //     } else if (date.getFullYear() === today.getFullYear()) {
// // // // // // //       return date.toLocaleDateString([], { month: "short", day: "numeric" });
// // // // // // //     } else {
// // // // // // //       return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const filteredSessions = bargainSessions
// // // // // // //   .filter(session => {
// // // // // // //     const isValid = validateSession(session);
// // // // // // //     if (!isValid) {
// // // // // // //       console.warn("Invalid session filtered out:", session);
// // // // // // //     }
// // // // // // //     return isValid;
// // // // // // //   })
// // // // // // //   .filter(session => {
// // // // // // //     try {
// // // // // // //       const search = searchTerm.toLowerCase();
// // // // // // //       return (
// // // // // // //         session.consumer_name.toLowerCase().includes(search) ||
// // // // // // //         session.product_name.toLowerCase().includes(search)
// // // // // // //       );
// // // // // // //     } catch (error) {
// // // // // // //       console.error("Error filtering session:", error, session);
// // // // // // //       return false;
// // // // // // //     }
// // // // // // //   });

// // // // // // //   useEffect(() => {
// // // // // // //     console.log("Current bargain sessions:", bargainSessions);
// // // // // // //   }, [bargainSessions]);

// // // // // // //   if (loading) {
// // // // // // //     return (
// // // // // // //       <div className="loading-container">
// // // // // // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // // // // //         <p>Loading bargain requests...</p>
// // // // // // //       </div>
// // // // // // //     );
// // // // // // //   }

// // // // // // //   return (
// // // // // // //     <div className="farmer-chat-app">
// // // // // // //       {/* Sidebar */}
// // // // // // //       <div className="chat-sidebar">
// // // // // // //         <div className="sidebar-header">
// // // // // // //           <h2>Bargain Requests</h2>
// // // // // // //           <div className="connection-status">
// // // // // // //   <span className={`status-dot ${connectionStatus}`} />
// // // // // // //   {connectionStatus === 'connected' ? 'Online' : 
// // // // // // //    connectionStatus === 'connecting' ? 'Connecting...' : 
// // // // // // //    connectionStatus === 'error' ? 'Connection Error' : 'Offline'}
// // // // // // //   {connectionStatus !== 'connected' && (
// // // // // // //     <button onClick={initializeSocketConnection} className="reconnect-btn">
// // // // // // //       Reconnect
// // // // // // //     </button>
// // // // // // //   )}
// // // // // // // </div>
// // // // // // //         </div>
        
// // // // // // //         {/* Add the new action buttons here */}
// // // // // // //         <div className="action-buttons">
// // // // // // //   <Link to="/farmer-orders" className="action-button">
// // // // // // //     <FontAwesomeIcon icon={faListAlt} />
// // // // // // //     <span>View Orders</span>
// // // // // // //   </Link>
// // // // // // //   {/* <Link to="/view-cart" className="action-button">
// // // // // // //     <FontAwesomeIcon icon={faShoppingCart} />
// // // // // // //     <span>View Cart</span>
// // // // // // //   </Link> */}
// // // // // // // </div>

// // // // // // //         <div className="search-bar">
// // // // // // //           <input
// // // // // // //             type="text"
// // // // // // //             placeholder="Search by consumer or product..."
// // // // // // //             value={searchTerm}
// // // // // // //             onChange={(e) => setSearchTerm(e.target.value)}
// // // // // // //           />
// // // // // // //         </div>
  
// // // // // // //         <div className="session-list">
// // // // // // //           {filteredSessions.length === 0 ? (
// // // // // // //             <div className="empty-state">
// // // // // // //               {searchTerm ? (
// // // // // // //                 <p>No matching requests found</p>
// // // // // // //               ) : (
// // // // // // //                 <p>No active bargain requests</p>
// // // // // // //               )}
// // // // // // //             </div>
// // // // // // //           ) : (
// // // // // // //             filteredSessions.map((session) => (
// // // // // // //               <div
// // // // // // //               key={`session-${session.bargain_id }`}
// // // // // // //                 className={`session-card ${farmerId === session.bargain_id ? "active" : ""}`}
// // // // // // //                 onClick={() => handleSessionSelect(session)}
// // // // // // //               >
// // // // // // //                 <div className="consumer-avatar">
// // // // // // //                   {session.consumer_name.charAt(0).toUpperCase()}
// // // // // // //                 </div>
                
// // // // // // //                 <div className="session-content">
// // // // // // //                   <div className="session-header">
// // // // // // //                     <h3>{session.consumer_name}</h3>
// // // // // // //                     <span className="session-time">
// // // // // // //                       {formatDate(session.updated_at)}
// // // // // // //                     </span>
// // // // // // //                   </div>
                  
// // // // // // //                   <div className="session-preview">
                    
// // // // // // //                   <p className="message-preview">
// // // // // // //                     {session.last_message?.content || "You received a bargain message"}
// // // // // // //                   </p>

// // // // // // //                   <span className="session-time">
// // // // // // //                     {formatDate(session.last_message?.timestamp || session.updated_at)}
// // // // // // //                   </span>

// // // // // // //                   </div>
// // // // // // //                 </div>
                
// // // // // // //                 {newMessages[session.bargain_id] && (
// // // // // // //                   <div className="unread-badge">
// // // // // // //                     {newMessages[session.bargain_id]}
// // // // // // //                   </div>
// // // // // // //                 )}
                
// // // // // // //                 {session.status === 'pending' && (
// // // // // // //                   <div className="status-indicator pending" />
// // // // // // //                 )}
// // // // // // //               </div>
// // // // // // //             ))
// // // // // // //           )}
// // // // // // //         </div>
// // // // // // //       </div>
  
// // // // // // //       {/* Chat Window */}
// // // // // // //       <div className="chat-window-container">
// // // // // // //         {selectedSession ? (
// // // // // // //           <FarmerChatWindow
// // // // // // //             bargainId={selectedSession.bargain_id}
// // // // // // //             socket={socket.current}
// // // // // // //             connectionStatus={connectionStatus}
// // // // // // //             initialSession={selectedSession}
// // // // // // //             onBack={() => {
// // // // // // //               setSelectedSession(null);
// // // // // // //               navigate("/farmer/bargain");
// // // // // // //             }}
// // // // // // //           />
// // // // // // //         ) : (
// // // // // // //           <div className="empty-chat-window">
// // // // // // //             <div className="empty-content">
// // // // // // //               <h3>Select a bargain request</h3>
// // // // // // //               <p>Choose a conversation from the sidebar to start bargaining</p>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         )}
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };
// // // // // // // export default FarmerChatList;
// // // // // // import React, { useState, useEffect, useRef, useCallback } from "react";
// // // // // // import { useParams, useNavigate, Link } from "react-router-dom";
// // // // // // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // // // // // import { faSpinner } from "@fortawesome/free-solid-svg-icons";
// // // // // // import { io } from 'socket.io-client';
// // // // // // import FarmerChatWindow from "./FarmerChatWindow";
// // // // // // import "./FarmerChatList.css";
// // // // // // import {
// // // // // //   faListAlt,
// // // // // //   faShoppingCart
// // // // // // } from '@fortawesome/free-solid-svg-icons';


// // // // // // const FarmerChatList = () => {
// // // // // //   const { farmerId } = useParams();
// // // // // //   const navigate = useNavigate();
// // // // // //   const [bargainSessions, setBargainSessions] = useState([]);
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [selectedSession, setSelectedSession] = useState(null);
// // // // // //   const socket = useRef(null);
// // // // // //   const reconnectAttempts = useRef(0);
// // // // // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // // // // //   const [newMessages, setNewMessages] = useState({});
// // // // // //   const [searchTerm, setSearchTerm] = useState("");


// // // // // //    // Helper functions to extract info from message content
// // // // // //    const extractProductName = (content) => {
// // // // // //     if (!content) return 'Product';
// // // // // //     const match = content.match(/You selected (.+?) \(/);
// // // // // //     return match ? match[1] : 'Product';
// // // // // //   };

// // // // // //   const extractQuantity = (content) => {
// // // // // //     if (!content) return 0;
// // // // // //     const match = content.match(/\((\d+)kg\)/);
// // // // // //     return match ? parseInt(match[1], 10) : 0;
// // // // // //   };

// // // // // //   const extractPrice = (content) => {
// // // // // //     if (!content) return 0;
// // // // // //     const match = content.match(/₹(\d+)/);
// // // // // //     return match ? parseInt(match[1], 10) : 0;
// // // // // //   };
// // // // // //   // Get token from farmer's localStorage with validation
// // // // // //   const getToken = () => {
// // // // // //     try {
// // // // // //       const farmerData = localStorage.getItem("farmer");
// // // // // //       if (!farmerData) {
// // // // // //         navigate("/loginPage");
// // // // // //         return null;
// // // // // //       }

// // // // // //       const parsedData = JSON.parse(farmerData);
// // // // // //       if (!parsedData?.token) {
// // // // // //         navigate("/loginPage");
// // // // // //         return null;
// // // // // //       }

// // // // // //       // Verify token structure
// // // // // //       const decoded = JSON.parse(atob(parsedData.token.split('.')[1]));
// // // // // //       if (!decoded?.farmer_id) {
// // // // // //         console.error("Token missing farmer_id");
// // // // // //         navigate("/loginPage");
// // // // // //         return null;
// // // // // //       }
// // // // // //       return parsedData.token;
// // // // // //     } catch (e) {
// // // // // //       console.error("Token parsing error:", e);
// // // // // //       navigate("/loginPage");
// // // // // //       return null;
// // // // // //     }
// // // // // //   };


// // // // // //   // Helper function to normalize session data
// // // // // //   const normalizeSession = (session) => {
// // // // // //     if (!session) {
// // // // // //       console.error("Attempted to normalize undefined session");
// // // // // //       return null;
// // // // // //     }
// // // // // //     const defaultSession = {
// // // // // //       bargain_id: '',
// // // // // //       consumer_id: '',
// // // // // //       consumer_name: 'Unknown Consumer',
// // // // // //       product_name: 'Unknown Product',
// // // // // //       quantity: 0,
// // // // // //       current_price: 0,
// // // // // //       initial_price: 0,
// // // // // //       status: 'pending',
// // // // // //       last_message: null,
// // // // // //       unread_count: 0,
// // // // // //       updated_at: new Date().toISOString()
// // // // // //     };
  
// // // // // //     // Safely merge the incoming session with defaults
// // // // // //     const normalized = { ...defaultSession };
// // // // // //     for (const key in session) {
// // // // // //       if (session[key] !== undefined && session[key] !== null) {
// // // // // //         normalized[key] = session[key];
// // // // // //       }
// // // // // //     }
  
// // // // // //     // Special handling for consumer name
// // // // // //     if (!normalized.consumer_name && 
// // // // // //         (session.first_name || session.last_name)) {
// // // // // //       normalized.consumer_name = 
// // // // // //         `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
// // // // // //         defaultSession.consumer_name;
// // // // // //     }
  
// // // // // //     return normalized;
// // // // // //   };
// // // // // //  // Update your fetchSessions function
// // // // // // //  const fetchSessions = useCallback(async () => {
// // // // // // //   try {
// // // // // // //     const token = getToken();
// // // // // // //     if (!token) return;

// // // // // // //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
// // // // // // //     const farmerId = decodedToken.farmer_id;
// // // // // // //     const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;

// // // // // // //     const response = await fetch(apiUrl, {
// // // // // // //       headers: {
// // // // // // //         'Authorization': `Bearer ${token}`,
// // // // // // //         'Accept': 'application/json',
// // // // // // //         'Content-Type': 'application/json'
// // // // // // //       },
// // // // // // //       credentials: 'include'
// // // // // // //     });

// // // // // // //     if (!response.ok) {
// // // // // // //       throw new Error(`HTTP error! status: ${response.status}`);
// // // // // // //     }

// // // // // // //     const data = await response.json();
// // // // // // //     console.log("API Response:", data); // Debug log
    
// // // // // // //     setBargainSessions(prev => {
// // // // // // //       // Create a map of existing sessions for reference
// // // // // // //       const existingMap = new Map(prev.map(s => [s.bargain_id, s]));

// // // // // // //       // Transform API data to match your UI requirements
// // // // // // //       const apiSessions = Array.isArray(data) ? data.map(session => ({
// // // // // // //         bargain_id: session.bargain_id.toString(),
// // // // // // //         consumer_id: session.consumer_id,
// // // // // // //         consumer_name: session.consumer_name || `Consumer ${session.consumer_id}`,
// // // // // // //         product_name: session.product_name || 'Unknown Product',
// // // // // // //         quantity: session.quantity || 0,
// // // // // // //         current_price: session.current_price || 0,
// // // // // // //         initial_price: session.initial_price || 0,
// // // // // // //         status: session.status || 'pending',
// // // // // // //         last_message: session.last_message || null,
// // // // // // //         unread_count: session.unread_count || 0,
// // // // // // //         updated_at: session.updated_at || session.created_at || new Date().toISOString()
// // // // // // //       })) : [];

// // // // // // //       // Merge with existing sessions
// // // // // // //       const mergedSessions = [
// // // // // // //         ...apiSessions,
// // // // // // //         ...Array.from(existingMap.values()).filter(
// // // // // // //           existing => !apiSessions.some(s => s.bargain_id === existing.bargain_id)
// // // // // // //         )
// // // // // // //       ];

// // // // // // //       return mergedSessions.sort((a, b) => 
// // // // // // //         new Date(b.updated_at) - new Date(a.updated_at)
// // // // // // //       );
// // // // // // //     });

// // // // // // //   } catch (error) {
// // // // // // //     console.error("Error fetching sessions:", error);
// // // // // // //     if (error.message.includes("401")) {
// // // // // // //       navigate("/loginPage");
// // // // // // //     }
// // // // // // //   } finally {
// // // // // // //     setLoading(false);
// // // // // // //   }
// // // // // // // }, [navigate]);

// // // // // // const fetchSessions = useCallback(async () => {
// // // // // //   try {
// // // // // //     const token = getToken();
// // // // // //     if (!token) {
// // // // // //       console.warn("No token available - redirecting to login");
// // // // // //       navigate("/loginPage");
// // // // // //       return;
// // // // // //     }

// // // // // //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
// // // // // //     const farmerId = decodedToken.farmer_id;
// // // // // //     console.log(`Fetching sessions for farmer: ${farmerId}`);

// // // // // //     const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;
// // // // // //     console.log("API Endpoint:", apiUrl);

// // // // // //     const response = await fetch(apiUrl, {
// // // // // //       headers: {
// // // // // //         'Authorization': `Bearer ${token}`,
// // // // // //         'Accept': 'application/json',
// // // // // //         'Content-Type': 'application/json'
// // // // // //       },
// // // // // //       credentials: 'include',
// // // // // //       signal: AbortSignal.timeout(10000) // 10 second timeout
// // // // // //     });

// // // // // //     console.log("Response Status:", response.status);
    
// // // // // //     if (!response.ok) {
// // // // // //       const errorText = await response.text();
// // // // // //       console.error("API Error Response:", errorText);
// // // // // //       throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
// // // // // //     }

// // // // // //     const responseData = await response.json();
// // // // // //     console.log("Raw API Data:", responseData);

// // // // // //     // Validate and normalize the response data
// // // // // //     const validatedSessions = Array.isArray(responseData) 
// // // // // //       ? responseData
// // // // // //           .map(session => ({
// // // // // //             bargain_id: session.bargain_id?.toString() || '',
// // // // // //             consumer_id: session.consumer_id || '',
// // // // // //             consumer_name: session.consumer_name || 
// // // // // //                          `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
// // // // // //                          `Consumer ${session.consumer_id || 'Unknown'}`,
// // // // // //             product_name: session.product_name || 'Unknown Product',
// // // // // //             quantity: Number(session.quantity) || 0,
// // // // // //             current_price: Number(session.current_price) || 0,
// // // // // //             initial_price: Number(session.initial_price) || 0,
// // // // // //             status: session.status || 'pending',
// // // // // //             last_message: session.last_message || null,
// // // // // //             unread_count: Number(session.unread_count) || 0,
// // // // // //             updated_at: session.updated_at || new Date().toISOString()
// // // // // //           }))
// // // // // //           .filter(session => {
// // // // // //             const isValid = session.bargain_id && session.consumer_id;
// // // // // //             if (!isValid) {
// // // // // //               console.warn("Invalid session filtered out:", session);
// // // // // //             }
// // // // // //             return isValid;
// // // // // //           })
// // // // // //       : [];

// // // // // //     // Group sessions by consumer and keep only the most recent one
// // // // // //     const groupedSessions = validatedSessions.reduce((acc, session) => {
// // // // // //       const existingSession = acc.find(s => s.consumer_id === session.consumer_id);
      
// // // // // //       if (existingSession) {
// // // // // //         // Replace if this session is more recent
// // // // // //         if (new Date(session.updated_at) > new Date(existingSession.updated_at)) {
// // // // // //           const index = acc.indexOf(existingSession);
// // // // // //           acc[index] = session;
// // // // // //         }
// // // // // //         // Sum unread counts
// // // // // //         existingSession.unread_count += session.unread_count;
// // // // // //       } else {
// // // // // //         acc.push(session);
// // // // // //       }
      
// // // // // //       return acc;
// // // // // //     }, []);

// // // // // //     console.log("Grouped Sessions:", groupedSessions);
// // // // // //     setBargainSessions(groupedSessions.sort((a, b) => 
// // // // // //       new Date(b.updated_at) - new Date(a.updated_at)
// // // // // //     ));

// // // // // //   } catch (error) {
// // // // // //     console.error("Failed to fetch sessions:", error);
    
// // // // // //     if (error.name === 'AbortError') {
// // // // // //       console.warn("Request timed out");
// // // // // //       // Optionally show timeout message to user
// // // // // //     } else if (error.message.includes("401")) {
// // // // // //       navigate("/loginPage");
// // // // // //     } else {
// // // // // //       // Show generic error to user if needed
// // // // // //       setBargainSessions([]); // Clear any existing sessions on error
// // // // // //     }
// // // // // //   } finally {
// // // // // //     setLoading(false);
// // // // // //   }
// // // // // // }, [navigate]);
// // // // // //   // Initial fetch and periodic refresh
// // // // // //   useEffect(() => {
// // // // // //     fetchSessions();
// // // // // //     const interval = setInterval(fetchSessions, 10000);
// // // // // //     return () => clearInterval(interval);
// // // // // //   }, [fetchSessions]);



// // // // // //     // WebSocket connection management
// // // // // //     const initializeSocketConnection = useCallback(() => {
// // // // // //       const token = getToken();
// // // // // //       if (!token) {
// // // // // //         console.error("No token available - redirecting to login");
// // // // // //         navigate("/loginPage");
// // // // // //         return;
// // // // // //       }
    
// // // // // //       try {
// // // // // //         const decodedToken = JSON.parse(atob(token.split(".")[1]));
// // // // // //         const farmerId = decodedToken.farmer_id;
    
// // // // // //         // Close existing connection if any
// // // // // //         if (socket.current) {
// // // // // //           console.log("Disconnecting existing socket connection");
// // // // // //           socket.current.off(); // Remove all listeners
// // // // // //           socket.current.disconnect();
// // // // // //           socket.current = null;
// // // // // //         }
    
// // // // // //         console.log("Initializing new socket connection");
// // // // // //         // socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // // // // //         //   auth: { token },
// // // // // //         //   query: { farmerId },
// // // // // //         //   transports: ['websocket'],
// // // // // //         //   reconnection: true,
// // // // // //         //   reconnectionAttempts: Infinity,
// // // // // //         //   reconnectionDelay: 1000,
// // // // // //         //   reconnectionDelayMax: 5000,
// // // // // //         //   randomizationFactor: 0.5,
// // // // // //         //   timeout: 20000,
// // // // // //         //   withCredentials: true,
// // // // // //         //   extraHeaders: { 
// // // // // //         //     Authorization: `Bearer ${token}`,
// // // // // //         //     'X-Farmer-ID': farmerId
// // // // // //         //   }
// // // // // //         // });
// // // // // //         socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// // // // // //   auth: { token },
// // // // // //   query: { 
// // // // // //     userType: 'farmer',
// // // // // //     farmerId 
// // // // // //   },
// // // // // //   transports: ['websocket'],
// // // // // //   withCredentials: true,
// // // // // //   extraHeaders: { 
// // // // // //     Authorization: `Bearer ${token}`,
// // // // // //     'X-Farmer-ID': farmerId
// // // // // //   }
// // // // // // });

        
// // // // // //         // Connection events
// // // // // //         socket.current.on('connect', () => {
// // // // // //           console.log("Socket connected successfully");
// // // // // //           setConnectionStatus("connected");
// // // // // //           reconnectAttempts.current = 0;
// // // // // //           // Fetch latest sessions after connection
// // // // // //           fetchSessions();
// // // // // //         });
    
// // // // // //         socket.current.on('connect_error', (err) => {
// // // // // //           console.error("Socket connection error:", err.message);
// // // // // //           setConnectionStatus("error");
          
// // // // // //           // Exponential backoff for reconnection
// // // // // //           const maxAttempts = 10;
// // // // // //           if (reconnectAttempts.current < maxAttempts) {
// // // // // //             const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// // // // // //             reconnectAttempts.current += 1;
// // // // // //             console.log(`Attempting reconnect #${reconnectAttempts.current} in ${delay}ms`);
// // // // // //             setTimeout(() => initializeSocketConnection(), delay);
// // // // // //           } else {
// // // // // //             console.error("Max reconnection attempts reached");
// // // // // //           }
// // // // // //         });
    
// // // // // //         socket.current.on('disconnect', (reason) => {
// // // // // //           console.log("Socket disconnected. Reason:", reason);
// // // // // //           setConnectionStatus("disconnected");
          
// // // // // //           if (reason === "io server disconnect") {
// // // // // //             // Server explicitly disconnected, try to reconnect
// // // // // //             console.log("Server initiated disconnect - attempting reconnect");
// // // // // //             setTimeout(() => initializeSocketConnection(), 1000);
// // // // // //           }
// // // // // //         });
    
// // // // // //         // Application events
// // // // // //         socket.current.on('newBargain', (session) => {
// // // // // //           console.log("New bargain session received:", session);
// // // // // //           setBargainSessions(prev => [
// // // // // //             normalizeSession(session),
// // // // // //             ...prev
// // // // // //           ]);
// // // // // //         });
    
// // // // // //         socket.current.on('priceUpdate', (data) => {
// // // // // //           console.log("Price update received:", data);
// // // // // //           setBargainSessions(prev => 
// // // // // //             prev.map(session => 
// // // // // //               session.bargain_id === data.bargain_id 
// // // // // //                 ? { 
// // // // // //                     ...session, 
// // // // // //                     current_price: data.newPrice,
// // // // // //                     updated_at: new Date().toISOString()
// // // // // //                   } 
// // // // // //                 : session
// // // // // //             )
// // // // // //           );
// // // // // //         });
    
// // // // // //         socket.current.on('bargainStatusUpdate', (data) => {
// // // // // //           console.log("Status update received:", data);
// // // // // //           setBargainSessions(prev => 
// // // // // //             prev.map(session => 
// // // // // //               session.bargain_id === data.bargain_id 
// // // // // //                 ? { 
// // // // // //                     ...session, 
// // // // // //                     status: data.status,
// // // // // //                     updated_at: new Date().toISOString()
// // // // // //                   } 
// // // // // //                 : session
// // // // // //             )
// // // // // //           );
// // // // // //         });
    
// // // // // //         // socket.current.on('bargainMessage', (message) => {
// // // // // //         //   console.log("Raw message:", message); // Debug log
// // // // // //         //   setBargainSessions(prev => {
// // // // // //         //     const existingIndex = prev.findIndex(
// // // // // //         //       s => s.bargain_id === message.bargainId || s.bargain_id === message.bargain_id
// // // // // //         //     );
        
// // // // // //         //     const newSession = {
// // // // // //         //       bargain_id: message.bargainId || message.bargain_id,
// // // // // //         //       consumer_id: message.consumer_id,
// // // // // //         //       consumer_name: message.consumer_name || `Consumer ${message.consumer_id}`,
// // // // // //         //       product_name: extractProductName(message.message?.content) || 'Product',
// // // // // //         //       quantity: extractQuantity(message.message?.content) || 0,
// // // // // //         //       current_price: extractPrice(message.message?.content) || 0,
// // // // // //         //       initial_price: extractPrice(message.message?.content) || 0,
// // // // // //         //       status: 'pending',
// // // // // //         //       last_message: {
// // // // // //         //         content: message.message?.content,
// // // // // //         //         timestamp: message.message?.timestamp || new Date().toISOString(),
// // // // // //         //         sender_type: message.senderType
// // // // // //         //       },
// // // // // //         //       unread_count: 1,
// // // // // //         //       updated_at: new Date().toISOString()
// // // // // //         //     };
        
// // // // // //         //     if (existingIndex >= 0) {
// // // // // //         //       const updated = [...prev];
// // // // // //         //       updated[existingIndex] = {
// // // // // //         //         ...updated[existingIndex],
// // // // // //         //         ...newSession,
// // // // // //         //         unread_count: (updated[existingIndex].unread_count || 0) + 1
// // // // // //         //       };
// // // // // //         //       return updated;
// // // // // //         //     } else {
// // // // // //         //       return [newSession, ...prev];
// // // // // //         //     }
// // // // // //         //   });
// // // // // //         // });
    
// // // // // //         socket.current.on('bargainMessage', (message) => {
// // // // // //           setBargainSessions(prev => {
// // // // // //             const existingIndex = prev.findIndex(s => s.bargain_id === message.bargainId);
            
// // // // // //             const newSessionData = {
// // // // // //               bargain_id: message.bargainId,
// // // // // //               consumer_id: message.consumer_id,
// // // // // //               consumer_name: message.consumer_name || `Consumer ${message.consumer_id}`,
// // // // // //               product_name: extractProductName(message.message?.content) || 'Product',
// // // // // //               quantity: extractQuantity(message.message?.content) || 0,
// // // // // //               current_price: extractPrice(message.message?.content) || 0,
// // // // // //               initial_price: extractPrice(message.message?.content) || 0,
// // // // // //               status: 'pending',
// // // // // //               last_message: {
// // // // // //                 content: message.message?.content,
// // // // // //                 timestamp: message.message?.timestamp || new Date().toISOString(),
// // // // // //                 sender_type: message.senderType
// // // // // //               },
// // // // // //               updated_at: new Date().toISOString(),
// // // // // //               unread_count: 1
// // // // // //             };
        
// // // // // //             if (existingIndex >= 0) {
// // // // // //               const updated = [...prev];
// // // // // //               updated[existingIndex] = {
// // // // // //                 ...updated[existingIndex],
// // // // // //                 ...newSessionData,
// // // // // //                 unread_count: (updated[existingIndex].unread_count || 0) + 1
// // // // // //               };
// // // // // //               return updated;
// // // // // //             } else {
// // // // // //               return [newSessionData, ...prev];
// // // // // //             }
// // // // // //           });
// // // // // //         });

// // // // // //         socket.current.on('error', (error) => {
// // // // // //           console.error("Socket error:", error);
// // // // // //           setConnectionStatus("error");
// // // // // //         });
    
// // // // // //       } catch (error) {
// // // // // //         console.error("Socket initialization error:", error);
// // // // // //         setConnectionStatus("error");
// // // // // //         setTimeout(() => initializeSocketConnection(), 5000);
// // // // // //       }
    
// // // // // //       return () => {
// // // // // //         if (socket.current) {
// // // // // //           console.log("Cleaning up socket connection");
// // // // // //           socket.current.off();
// // // // // //           socket.current.disconnect();
// // // // // //         }
// // // // // //       };
// // // // // //     }, [navigate, fetchSessions]);
    


// // // // // //       // Initialize socket connection
// // // // // //   useEffect(() => {
// // // // // //     initializeSocketConnection();
// // // // // //     return () => {
// // // // // //       if (socket.current) {
// // // // // //         socket.current.disconnect();
// // // // // //       }
// // // // // //     };
// // // // // //   }, [initializeSocketConnection]);
// // // // // //   const validateSession = (session) => {
// // // // // //     if (!session) return false;
    
// // // // // //     const requiredFields = [
// // // // // //       'bargain_id',
// // // // // //       'consumer_id',
// // // // // //       'consumer_name',
// // // // // //       'product_name',
// // // // // //       'status',
// // // // // //       'updated_at'
// // // // // //     ];
    
// // // // // //     return requiredFields.every(field => {
// // // // // //       const isValid = session[field] !== undefined && session[field] !== null;
// // // // // //       if (!isValid) {
// // // // // //         console.warn(`Missing required field: ${field} in session:`, session);
// // // // // //       }
// // // // // //       return isValid;
// // // // // //     });
// // // // // //   };

// // // // // //   const handleSessionSelect = (session) => {
// // // // // //     if (!validateSession(session)) {
// // // // // //       console.error("Invalid session data:", session);
// // // // // //       return;
// // // // // //     }
  
// // // // // //     // Prepare consumer and product data for the chat window
// // // // // //     const consumerData = {
// // // // // //       first_name: session.consumer_name.split(' ')[0],
// // // // // //       last_name: session.consumer_name.split(' ').slice(1).join(' ') || '',
// // // // // //       phone_number: session.consumer_phone || 'Not available',
// // // // // //       location: session.consumer_location || 'Not specified'
// // // // // //     };
  
// // // // // //     const productData = {
// // // // // //       produce_name: session.product_name,
// // // // // //       quantity: session.quantity,
// // // // // //       price_per_kg: session.initial_price,
// // // // // //       current_offer: session.current_price,
// // // // // //       product_id: session.product_id || `temp-${session.bargain_id}`
// // // // // //     };
  
// // // // // //     // Navigate to chat window with state
// // // // // //     navigate(`/farmer/bargain/${session.bargain_id}`, {
// // // // // //       state: {
// // // // // //         consumer: consumerData,
// // // // // //         product: productData,
// // // // // //         initialPrice: session.current_price
// // // // // //       }
// // // // // //     });
  
// // // // // //     // Clear any new messages for this session
// // // // // //     setNewMessages(prev => {
// // // // // //       const updated = { ...prev };
// // // // // //       delete updated[session.bargain_id];
// // // // // //       return updated;
// // // // // //     });
// // // // // //   };

// // // // // //   const formatTime = (timestamp) => {
// // // // // //     if (!timestamp) return "";
// // // // // //     const date = new Date(timestamp);
// // // // // //     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// // // // // //   };

// // // // // //   const formatDate = (timestamp) => {
// // // // // //     if (!timestamp) return "";
// // // // // //     const today = new Date();
// // // // // //     const date = new Date(timestamp);
    
// // // // // //     if (date.toDateString() === today.toDateString()) {
// // // // // //       return formatTime(timestamp);
// // // // // //     } else if (date.getFullYear() === today.getFullYear()) {
// // // // // //       return date.toLocaleDateString([], { month: "short", day: "numeric" });
// // // // // //     } else {
// // // // // //       return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
// // // // // //     }
// // // // // //   };

// // // // // //   const filteredSessions = bargainSessions
// // // // // //   .filter(session => {
// // // // // //     const isValid = validateSession(session);
// // // // // //     if (!isValid) {
// // // // // //       console.warn("Invalid session filtered out:", session);
// // // // // //     }
// // // // // //     return isValid;
// // // // // //   })
// // // // // //   .filter(session => {
// // // // // //     try {
// // // // // //       const search = searchTerm.toLowerCase();
// // // // // //       return (
// // // // // //         session.consumer_name.toLowerCase().includes(search) ||
// // // // // //         session.product_name.toLowerCase().includes(search)
// // // // // //       );
// // // // // //     } catch (error) {
// // // // // //       console.error("Error filtering session:", error, session);
// // // // // //       return false;
// // // // // //     }
// // // // // //   });

// // // // // //   useEffect(() => {
// // // // // //     console.log("Current bargain sessions:", bargainSessions);
// // // // // //   }, [bargainSessions]);

// // // // // //   if (loading) {
// // // // // //     return (
// // // // // //       <div className="loading-container">
// // // // // //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // // // //         <p>Loading bargain requests...</p>
// // // // // //       </div>
// // // // // //     );
// // // // // //   }

// // // // // //   return (
// // // // // //     <div className="farmer-chat-app">
// // // // // //       {/* Sidebar */}
// // // // // //       <div className="chat-sidebar">
// // // // // //         <div className="sidebar-header">
// // // // // //           <h2>Bargain Requests</h2>
// // // // // //           {/* <div className="connection-status">
// // // // // //               <span className={`status-dot ${connectionStatus}`} />
// // // // // //               {connectionStatus === 'connected' ? 'Online' : 
// // // // // //               connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
// // // // // //               {connectionStatus !== 'connected' && (
// // // // // //                 <button onClick={initializeSocketConnection}>Reconnect</button>
// // // // // //               )}
// // // // // //             </div> */}
// // // // // //         </div>
        
// // // // // //         {/* Add the new action buttons here */}
// // // // // //         <div className="action-buttons">
// // // // // //   <Link to="/farmer-orders" className="action-button">
// // // // // //     <FontAwesomeIcon icon={faListAlt} />
// // // // // //     <span>View Orders</span>
// // // // // //   </Link>
// // // // // //   {/* <Link to="/view-cart" className="action-button">
// // // // // //     <FontAwesomeIcon icon={faShoppingCart} />
// // // // // //     <span>View Cart</span>
// // // // // //   </Link> */}
// // // // // // </div>

// // // // // //         <div className="search-bar">
// // // // // //           <input
// // // // // //             type="text"
// // // // // //             placeholder="Search by consumer or product..."
// // // // // //             value={searchTerm}
// // // // // //             onChange={(e) => setSearchTerm(e.target.value)}
// // // // // //           />
// // // // // //         </div>
  
// // // // // //         <div className="session-list">
// // // // // //           {filteredSessions.length === 0 ? (
// // // // // //             <div className="empty-state">
// // // // // //               {searchTerm ? (
// // // // // //                 <p>No matching requests found</p>
// // // // // //               ) : (
// // // // // //                 <p>No active bargain requests</p>
// // // // // //               )}
// // // // // //             </div>
// // // // // //           ) : (
// // // // // //             filteredSessions.map((session) => (
// // // // // //               <div
// // // // // //               key={`session-${session.bargain_id }`}
// // // // // //                 className={`session-card ${farmerId === session.bargain_id ? "active" : ""}`}
// // // // // //                 onClick={() => handleSessionSelect(session)}
// // // // // //               >
// // // // // //                 <div className="consumer-avatar">
// // // // // //                   {session.consumer_name.charAt(0).toUpperCase()}
// // // // // //                 </div>
                
// // // // // //                 <div className="session-content">
// // // // // //                   <div className="session-header">
// // // // // //                     <h3>{session.consumer_name}</h3>
// // // // // //                     <span className="session-time">
// // // // // //                       {formatDate(session.updated_at)}
// // // // // //                     </span>
// // // // // //                   </div>
                  
// // // // // //                   <div className="session-preview">
                    
// // // // // //                   <p className="message-preview">
// // // // // //                     {session.last_message?.content || "You received a bargain message"}
// // // // // //                   </p>

// // // // // //                   <span className="session-time">
// // // // // //                     {formatDate(session.last_message?.timestamp || session.updated_at)}
// // // // // //                   </span>

// // // // // //                   </div>
// // // // // //                 </div>
                
// // // // // //                 {newMessages[session.bargain_id] && (
// // // // // //                   <div className="unread-badge">
// // // // // //                     {newMessages[session.bargain_id]}
// // // // // //                   </div>
// // // // // //                 )}
                
// // // // // //                 {session.status === 'pending' && (
// // // // // //                   <div className="status-indicator pending" />
// // // // // //                 )}
// // // // // //               </div>
// // // // // //             ))
// // // // // //           )}
// // // // // //         </div>
// // // // // //       </div>
  
// // // // // //       {/* Chat Window */}
// // // // // //       <div className="chat-window-container">
// // // // // //         {selectedSession ? (
// // // // // //           <FarmerChatWindow
// // // // // //             bargainId={selectedSession.bargain_id}
// // // // // //             socket={socket.current}
// // // // // //             connectionStatus={connectionStatus}
// // // // // //             initialSession={selectedSession}
// // // // // //             onBack={() => {
// // // // // //               setSelectedSession(null);
// // // // // //               navigate("/farmer/bargain");
// // // // // //             }}
// // // // // //           />
// // // // // //         ) : (
// // // // // //           <div className="empty-chat-window">
// // // // // //             <div className="empty-content">
// // // // // //               <h3>Select a bargain request</h3>
// // // // // //               <p>Choose a conversation from the sidebar to start bargaining</p>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         )}
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };
// // // // // // export default FarmerChatList;import React, { useState, useEffect, useRef, useCallback } from "react";
// // // // // import { useParams, useNavigate, Link } from "react-router-dom";
// // // // // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // // // // import { faSpinner } from "@fortawesome/free-solid-svg-icons";
// // // // // import { io } from 'socket.io-client';
// // // // // import FarmerChatWindow from "./FarmerChatWindow";
// // // // // import "./FarmerChatList.css";
// // // // // import {
// // // // //   faListAlt,
// // // // //   faShoppingCart
// // // // // } from '@fortawesome/free-solid-svg-icons';


// // // // // const FarmerChatList = () => {
// // // // //   const { farmerId } = useParams();
// // // // //   const navigate = useNavigate();
// // // // //   const [bargainSessions, setBargainSessions] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [selectedSession, setSelectedSession] = useState(null);
// // // // //   const socket = useRef(null);
// // // // //   const reconnectAttempts = useRef(0);
// // // // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // // // //   const [newMessages, setNewMessages] = useState({});
// // // // //   const [searchTerm, setSearchTerm] = useState("");


// // // // //    // Helper functions to extract info from message content
// // // // //    const extractProductName = (content) => {
// // // // //     if (!content) return 'Product';
// // // // //     const match = content.match(/You selected (.+?) \(/);
// // // // //     return match ? match[1] : 'Product';
// // // // //   };

// // // // //   const extractQuantity = (content) => {
// // // // //     if (!content) return 0;
// // // // //     const match = content.match(/\((\d+)kg\)/);
// // // // //     return match ? parseInt(match[1], 10) : 0;
// // // // //   };

// // // // //   const extractPrice = (content) => {
// // // // //     if (!content) return 0;
// // // // //     const match = content.match(/₹(\d+)/);
// // // // //     return match ? parseInt(match[1], 10) : 0;
// // // // //   };

// // // // //   // Get token from farmer's localStorage with validation
// // // // //   const getToken = () => {
// // // // //     try {
// // // // //       const farmerData = localStorage.getItem("farmer");
// // // // //       if (!farmerData) {
// // // // //         navigate("/loginPage");
// // // // //         return null;
// // // // //       }

// // // // //       const parsedData = JSON.parse(farmerData);
// // // // //       if (!parsedData?.token) {
// // // // //         navigate("/loginPage");
// // // // //         return null;
// // // // //       }

// // // // //       // Verify token structure
// // // // //       const decoded = JSON.parse(atob(parsedData.token.split('.')[1]));
// // // // //       if (!decoded?.farmer_id) {
// // // // //         console.error("Token missing farmer_id");
// // // // //         navigate("/loginPage");
// // // // //         return null;
// // // // //       }
// // // // //       return parsedData.token;
// // // // //     } catch (e) {
// // // // //       console.error("Token parsing error:", e);
// // // // //       navigate("/loginPage");
// // // // //       return null;
// // // // //     }
// // // // //   };


// // // // //   // Helper function to normalize session data
// // // // //   const normalizeSession = (session) => {
// // // // //     if (!session) {
// // // // //       console.error("Attempted to normalize undefined session");
// // // // //       return null;
// // // // //     }
// // // // //     const defaultSession = {
// // // // //       bargain_id: '',
// // // // //       consumer_id: '',
// // // // //       consumer_name: 'Unknown Consumer',
// // // // //       product_name: 'Unknown Product',
// // // // //       quantity: 0,
// // // // //       current_price: 0,
// // // // //       initial_price: 0,
// // // // //       status: 'pending',
// // // // //       last_message: null,
// // // // //       unread_count: 0,
// // // // //       updated_at: new Date().toISOString()
// // // // //     };
  
// // // // //     // Safely merge the incoming session with defaults
// // // // //     const normalized = { ...defaultSession };
// // // // //     for (const key in session) {
// // // // //       if (session[key] !== undefined && session[key] !== null) {
// // // // //         normalized[key] = session[key];
// // // // //       }
// // // // //     }
  
// // // // //     // Special handling for consumer name
// // // // //     if (!normalized.consumer_name && 
// // // // //         (session.first_name || session.last_name)) {
// // // // //       normalized.consumer_name = 
// // // // //         `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
// // // // //         defaultSession.consumer_name;
// // // // //     }
  
// // // // //     return normalized;
// // // // //   };

// // // // // const fetchSessions = useCallback(async () => {
// // // // //   try {
// // // // //     const token = getToken();
// // // // //     if (!token) {
// // // // //       console.warn("No token available - redirecting to login");
// // // // //       navigate("/loginPage");
// // // // //       return;
// // // // //     }

// // // // //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
// // // // //     const farmerId = decodedToken.farmer_id;
// // // // //     console.log(`Fetching sessions for farmer: ${farmerId}`);

// // // // //     const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;
// // // // //     console.log("API Endpoint:", apiUrl);

// // // // //     const response = await fetch(apiUrl, {
// // // // //       headers: {
// // // // //         'Authorization': `Bearer ${token}`,
// // // // //         'Accept': 'application/json',
// // // // //         'Content-Type': 'application/json'
// // // // //       },
// // // // //       credentials: 'include',
// // // // //       signal: AbortSignal.timeout(10000) // 10 second timeout
// // // // //     });

// // // // //     console.log("Response Status:", response.status);
    
// // // // //     if (!response.ok) {
// // // // //       const errorText = await response.text();
// // // // //       console.error("API Error Response:", errorText);
// // // // //       throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
// // // // //     }

// // // // //     const responseData = await response.json();
// // // // //     console.log("Raw API Data:", responseData);

// // // // //     // Validate and normalize the response data
// // // // //     const validatedSessions = Array.isArray(responseData) 
// // // // //       ? responseData
// // // // //           .map(session => ({
// // // // //             bargain_id: session.bargain_id?.toString() || '',
// // // // //             consumer_id: session.consumer_id || '',
// // // // //             consumer_name: session.consumer_name || 
// // // // //                          `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
// // // // //                          `Consumer ${session.consumer_id || 'Unknown'}`,
// // // // //             product_name: session.product_name || 'Unknown Product',
// // // // //             quantity: Number(session.quantity) || 0,
// // // // //             current_price: Number(session.current_price) || 0,
// // // // //             initial_price: Number(session.initial_price) || 0,
// // // // //             status: session.status || 'pending',
// // // // //             last_message: session.last_message || null,
// // // // //             unread_count: Number(session.unread_count) || 0,
// // // // //             updated_at: session.updated_at || new Date().toISOString()
// // // // //           }))
// // // // //           .filter(session => {
// // // // //             const isValid = session.bargain_id && session.consumer_id;
// // // // //             if (!isValid) {
// // // // //               console.warn("Invalid session filtered out:", session);
// // // // //             }
// // // // //             return isValid;
// // // // //           })
// // // // //       : [];

// // // // //     // Group sessions by consumer and keep only the most recent one
// // // // //     const groupedSessions = validatedSessions.reduce((acc, session) => {
// // // // //       const existingSession = acc.find(s => s.consumer_id === session.consumer_id);
// // // // //       if (existingSession) {
// // // // //         // Replace if this session is more recent
// // // // //         if (new Date(session.updated_at) > new Date(existingSession.updated_at)) {
// // // // //           const index = acc.indexOf(existingSession);
// // // // //           acc[index] = session;
// // // // //         }
// // // // //         // Sum unread counts
// // // // //         existingSession.unread_count += session.unread_count;
// // // // //       } else {
// // // // //         acc.push(session);
// // // // //       }
// // // // //       return acc;
// // // // //     }, []);
    
// // // // //     setBargainSessions(groupedSessions.sort((a, b) => 
// // // // //       new Date(b.updated_at) - new Date(a.updated_at)
// // // // //     ));
    
// // // // //     console.log("Normalized and grouped sessions:", groupedSessions);

// // // // //   } catch (error) {
// // // // //     console.error("Failed to fetch sessions:", error);
// // // // //     if (error.name === 'AbortError') {
// // // // //       console.warn("Request timed out");
// // // // //     } else if (error.message.includes("401")) {
// // // // //       navigate("/loginPage");
// // // // //     } else {
// // // // //       setBargainSessions([]);
// // // // //     }
// // // // //   } finally {
// // // // //     setLoading(false);
// // // // //   }
// // // // // }, [navigate]);


// // // // //   useEffect(() => {
// // // // //     fetchSessions();
// // // // //     const interval = setInterval(fetchSessions, 10000);
// // // // //     return () => clearInterval(interval);
// // // // //   }, [fetchSessions]);

// // // // //   const initializeSocketConnection = useCallback(() => {
// // // // //     const token = getToken();
// // // // //     if (!token) {
// // // // //       console.error("No token available - redirecting to login");
// // // // //       setConnectionStatus("disconnected");
// // // // //       return;
// // // // //     }

// // // // //     if (socket.current) {
// // // // //       socket.current.removeAllListeners();
// // // // //       socket.current.disconnect();
// // // // //       socket.current = null;
// // // // //     }

// // // // //     const socketOptions = {
// // // // //       auth: { token },
// // // // //       query: { farmerId: farmerId },
// // // // //       transports: ['websocket', 'polling'],
// // // // //       reconnection: true,
// // // // //       reconnectionAttempts: 5,
// // // // //       reconnectionDelay: 1000,
// // // // //       reconnectionDelayMax: 10000,
// // // // //       timeout: 20000,
// // // // //       secure: process.env.NODE_ENV === 'production',
// // // // //       rejectUnauthorized: false,
// // // // //       extraHeaders: {
// // // // //         Authorization: `Bearer ${token}`
// // // // //       }
// // // // //     };
    
// // // // //     console.log("Initializing socket connection for farmer...");
// // // // //     socket.current = io(
// // // // //       process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
// // // // //       socketOptions
// // // // //     );

// // // // //     socket.current.on('connect', () => {
// // // // //       console.log("Socket connected successfully");
// // // // //       setConnectionStatus("connected");
// // // // //       reconnectAttempts.current = 0;
// // // // //     });

// // // // //     socket.current.on('connect_error', (error) => {
// // // // //       console.error('Socket connection error:', error);
// // // // //       setConnectionStatus("error");
// // // // //     });

// // // // //     socket.current.on('disconnect', (reason) => {
// // // // //       console.log('Socket disconnected:', reason);
// // // // //       setConnectionStatus("disconnected");
      
// // // // //       if (reason === 'io server disconnect') {
// // // // //         setTimeout(() => {
// // // // //           if (reconnectAttempts.current < 5) {
// // // // //             reconnectAttempts.current += 1;
// // // // //             initializeSocketConnection();
// // // // //           }
// // // // //         }, 1000);
// // // // //       }
// // // // //     });

// // // // //     socket.current.on('newBargainMessage', (message) => {
// // // // //       console.log("New bargain message received:", message);
// // // // //       setNewMessages(prev => ({
// // // // //         ...prev,
// // // // //         [message.bargain_id]: (prev[message.bargain_id] || 0) + 1
// // // // //       }));
// // // // //       setBargainSessions(prevSessions => {
// // // // //         const updatedSessions = prevSessions.map(session => {
// // // // //           if (session.bargain_id === message.bargain_id) {
// // // // //             return {
// // // // //               ...session,
// // // // //               last_message: { content: message.message_content, timestamp: message.created_at },
// // // // //               updated_at: message.created_at,
// // // // //               unread_count: (session.unread_count || 0) + 1
// // // // //             };
// // // // //           }
// // // // //           return session;
// // // // //         });
// // // // //         const sessionExists = updatedSessions.some(s => s.bargain_id === message.bargain_id);
// // // // //         if (!sessionExists && message.bargain_id) {
// // // // //           fetchSessions();
// // // // //         }
// // // // //         return updatedSessions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
// // // // //       });
// // // // //     });

// // // // //     socket.current.on('bargainStatusUpdate', ({ bargain_id, status, currentPrice }) => {
// // // // //       console.log(`Bargain ${bargain_id} status updated to ${status}`);
// // // // //       setBargainSessions(prevSessions => {
// // // // //         const updatedSessions = prevSessions.map(session => {
// // // // //           if (session.bargain_id === bargain_id) {
// // // // //             return { ...session, status, current_price: currentPrice };
// // // // //           }
// // // // //           return session;
// // // // //         });
// // // // //         return updatedSessions;
// // // // //       });
// // // // //     });

// // // // //     socket.current.on('bargainRemoved', ({ bargain_id }) => {
// // // // //       console.log(`Bargain ${bargain_id} removed`);
// // // // //       setBargainSessions(prevSessions => prevSessions.filter(session => session.bargain_id !== bargain_id));
// // // // //     });

// // // // //     return () => {
// // // // //       if (socket.current) {
// // // // //         socket.current.disconnect();
// // // // //       }
// // // // //     };
// // // // //   }, [farmerId, navigate, fetchSessions]);

// // // // //   useEffect(() => {
// // // // //     initializeSocketConnection();
// // // // //   }, [initializeSocketConnection]);

// // // // //   // Handle session selection
// // // // //   const handleSessionClick = (session) => {
// // // // //     setSelectedSession(session);
// // // // //     setNewMessages(prev => ({ ...prev, [session.bargain_id]: 0 }));
// // // // //     navigate(`/farmer/bargain/${session.bargain_id}`, { state: { initialSession: session } });
// // // // //   };
  
// // // // //   const filteredSessions = searchTerm 
// // // // //   ? bargainSessions.filter(session =>
// // // // //       session.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// // // // //       session.consumer_name?.toLowerCase().includes(searchTerm.toLowerCase())
// // // // //     )
// // // // //   : bargainSessions;

// // // // //   return (
// // // // //     <div className="bargain-container">
// // // // //       {/* Sidebar for chat list */}
// // // // //       <div className="bargain-sidebar">
// // // // //         <div className="bargain-header">
// // // // //           <h2 className="header-title">
// // // // //             <FontAwesomeIcon icon={faListAlt} /> Bargain Requests
// // // // //           </h2>
// // // // //           <Link to="/farmer-dashboard" className="cart-icon-link">
// // // // //             <FontAwesomeIcon icon={faShoppingCart} />
// // // // //           </Link>
// // // // //         </div>

// // // // //         <div className="search-bar">
// // // // //           <input
// // // // //             type="text"
// // // // //             placeholder="Search products or consumers..."
// // // // //             value={searchTerm}
// // // // //             onChange={(e) => setSearchTerm(e.target.value)}
// // // // //           />
// // // // //         </div>

// // // // //         <div className="bargain-list">
// // // // //           {loading ? (
// // // // //             <div className="loading-spinner">
// // // // //               <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // // //               <p>Loading sessions...</p>
// // // // //             </div>
// // // // //           ) : filteredSessions.length === 0 ? (
// // // // //             <div className="no-requests-msg">
// // // // //               <h3>No Bargain Requests</h3>
// // // // //               <p>You have not received any bargain requests yet.</p>
// // // // //             </div>
// // // // //           ) : (
// // // // //             filteredSessions.map((session) => (
// // // // //               <div 
// // // // //                 key={session.bargain_id}
// // // // //                 className={`session-item ${selectedSession?.bargain_id === session.bargain_id ? 'active' : ''}`}
// // // // //                 onClick={() => handleSessionClick(session)}
// // // // //               >
// // // // //                 <div className="session-info">
// // // // //                   <div className="profile-photo placeholder">
// // // // //                     {session.consumer_name.charAt(0)}
// // // // //                   </div>
// // // // //                   <div className="session-details">
// // // // //                     <p className="consumer-name">{session.consumer_name}</p>
                    
// // // // //                     {/* NEW: Display Bargaining Details */}
// // // // //                     <p className="bargain-details">
// // // // //                       <span className="product-name">{session.product_name}</span>
// // // // //                       <br/>
// // // // //                       <span className="prices">Base: ₹{session.initial_price} | Current: ₹{session.current_price}</span>
// // // // //                       <br/>
// // // // //                       <span className={`status-text status-${session.status}`}>{session.status.toUpperCase()}</span>
// // // // //                     </p>
// // // // //                   </div>
// // // // //                 </div>
                
// // // // //                 {newMessages[session.bargain_id] && (
// // // // //                   <div className="unread-badge">
// // // // //                     {newMessages[session.bargain_id]}
// // // // //                   </div>
// // // // //                 )}
                
// // // // //                 {session.status === 'pending' && (
// // // // //                   <div className="status-indicator pending" />
// // // // //                 )}
// // // // //               </div>
// // // // //             ))
// // // // //           )}
// // // // //         </div>
// // // // //       </div>
  
// // // // //       {/* Chat Window */}
// // // // //       <div className="chat-window-container">
// // // // //         {selectedSession ? (
// // // // //           <FarmerChatWindow
// // // // //             bargainId={selectedSession.bargain_id}
// // // // //             socket={socket.current}
// // // // //             connectionStatus={connectionStatus}
// // // // //             initialSession={selectedSession}
// // // // //             onBack={() => {
// // // // //               setSelectedSession(null);
// // // // //               navigate("/farmer/bargain");
// // // // //             }}
// // // // //           />
// // // // //         ) : (
// // // // //           <div className="empty-chat-window">
// // // // //             <div className="empty-content">
// // // // //               <h3>Select a bargain request</h3>
// // // // //               <p>Choose a conversation from the sidebar to start bargaining</p>
// // // // //             </div>
// // // // //           </div>
// // // // //         )}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default FarmerChatList;
// // // // import React, { useState, useEffect, useRef, useCallback } from "react";
// // // // import { useParams, useNavigate, Link } from "react-router-dom";
// // // // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // // // import { faSpinner } from "@fortawesome/free-solid-svg-icons";
// // // // import { io } from 'socket.io-client';
// // // // import FarmerChatWindow from "./FarmerChatWindow";
// // // // import "./FarmerChatList.css";
// // // // import {
// // // //   faListAlt,
// // // //   faShoppingCart
// // // // } from '@fortawesome/free-solid-svg-icons';


// // // // const FarmerChatList = () => {
// // // //   const { farmerId } = useParams();
// // // //   const navigate = useNavigate();
// // // //   const [bargainSessions, setBargainSessions] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [selectedSession, setSelectedSession] = useState(null);
// // // //   const socket = useRef(null);
// // // //   const reconnectAttempts = useRef(0);
// // // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // // //   const [newMessages, setNewMessages] = useState({});
// // // //   const [searchTerm, setSearchTerm] = useState("");


// // // //    // Helper functions to extract info from message content
// // // //    const extractProductName = (content) => {
// // // //     if (!content) return 'Product';
// // // //     const match = content.match(/You selected (.+?) \(/);
// // // //     return match ? match[1] : 'Product';
// // // //   };

// // // //   const extractQuantity = (content) => {
// // // //     if (!content) return 0;
// // // //     const match = content.match(/\((\d+)kg\)/);
// // // //     return match ? parseInt(match[1], 10) : 0;
// // // //   };

// // // //   const extractPrice = (content) => {
// // // //     if (!content) return 0;
// // // //     const match = content.match(/₹(\d+)/);
// // // //     return match ? parseInt(match[1], 10) : 0;
// // // //   };

// // // //   // Get token from farmer's localStorage with validation
// // // //   const getToken = () => {
// // // //     try {
// // // //       const farmerData = localStorage.getItem("farmer");
// // // //       if (!farmerData) {
// // // //         navigate("/loginPage");
// // // //         return null;
// // // //       }

// // // //       const parsedData = JSON.parse(farmerData);
// // // //       if (!parsedData?.token) {
// // // //         navigate("/loginPage");
// // // //         return null;
// // // //       }

// // // //       // Verify token structure
// // // //       const decoded = JSON.parse(atob(parsedData.token.split('.')[1]));
// // // //       if (!decoded?.farmer_id) {
// // // //         console.error("Token missing farmer_id");
// // // //         navigate("/loginPage");
// // // //         return null;
// // // //       }
// // // //       return parsedData.token;
// // // //     } catch (e) {
// // // //       console.error("Token parsing error:", e);
// // // //       navigate("/loginPage");
// // // //       return null;
// // // //     }
// // // //   };


// // // //   // Helper function to normalize session data
// // // //   const normalizeSession = (session) => {
// // // //     if (!session) {
// // // //       console.error("Attempted to normalize undefined session");
// // // //       return null;
// // // //     }
// // // //     const defaultSession = {
// // // //       bargain_id: '',
// // // //       consumer_id: '',
// // // //       consumer_name: 'Unknown Consumer',
// // // //       product_name: 'Unknown Product',
// // // //       quantity: 0,
// // // //       current_price: 0,
// // // //       initial_price: 0,
// // // //       status: 'pending',
// // // //       last_message: null,
// // // //       unread_count: 0,
// // // //       updated_at: new Date().toISOString()
// // // //     };
  
// // // //     // Safely merge the incoming session with defaults
// // // //     const normalized = { ...defaultSession };
// // // //     for (const key in session) {
// // // //       if (session[key] !== undefined && session[key] !== null) {
// // // //         normalized[key] = session[key];
// // // //       }
// // // //     }
  
// // // //     // Special handling for consumer name
// // // //     if (!normalized.consumer_name && 
// // // //         (session.first_name || session.last_name)) {
// // // //       normalized.consumer_name = 
// // // //         `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
// // // //         defaultSession.consumer_name;
// // // //     }
  
// // // //     return normalized;
// // // //   };

// // // // const fetchSessions = useCallback(async () => {
// // // //   try {
// // // //     const token = getToken();
// // // //     if (!token) {
// // // //       console.warn("No token available - redirecting to login");
// // // //       navigate("/loginPage");
// // // //       return;
// // // //     }

// // // //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
// // // //     const farmerId = decodedToken.farmer_id;
// // // //     console.log(`Fetching sessions for farmer: ${farmerId}`);

// // // //     const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;
// // // //     console.log("API Endpoint:", apiUrl);

// // // //     const response = await fetch(apiUrl, {
// // // //       headers: {
// // // //         'Authorization': `Bearer ${token}`,
// // // //         'Accept': 'application/json',
// // // //         'Content-Type': 'application/json'
// // // //       },
// // // //       credentials: 'include',
// // // //       signal: AbortSignal.timeout(10000) // 10 second timeout
// // // //     });

// // // //     console.log("Response Status:", response.status);
    
// // // //     if (!response.ok) {
// // // //       const errorText = await response.text();
// // // //       console.error("API Error Response:", errorText);
// // // //       throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
// // // //     }

// // // //     const responseData = await response.json();
// // // //     console.log("Raw API Data:", responseData);

// // // //     // Validate and normalize the response data
// // // //     const validatedSessions = Array.isArray(responseData) 
// // // //       ? responseData
// // // //           .map(session => ({
// // // //             bargain_id: session.bargain_id?.toString() || '',
// // // //             consumer_id: session.consumer_id || '',
// // // //             consumer_name: session.consumer_name || 
// // // //                          `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
// // // //                          `Consumer ${session.consumer_id || 'Unknown'}`,
// // // //             product_name: session.product_name || 'Unknown Product',
// // // //             quantity: Number(session.quantity) || 0,
// // // //             current_price: Number(session.current_price) || 0,
// // // //             initial_price: Number(session.initial_price) || 0,
// // // //             status: session.status || 'pending',
// // // //             last_message: session.last_message || null,
// // // //             unread_count: Number(session.unread_count) || 0,
// // // //             updated_at: session.updated_at || new Date().toISOString()
// // // //           }))
// // // //           .filter(session => {
// // // //             const isValid = session.bargain_id && session.consumer_id;
// // // //             if (!isValid) {
// // // //               console.warn("Invalid session filtered out:", session);
// // // //             }
// // // //             return isValid;
// // // //           })
// // // //       : [];

// // // //     // Group sessions by consumer and keep only the most recent one
// // // //     const groupedSessions = validatedSessions.reduce((acc, session) => {
// // // //       const existingSession = acc.find(s => s.consumer_id === session.consumer_id);
// // // //       if (existingSession) {
// // // //         // Replace if this session is more recent
// // // //         if (new Date(session.updated_at) > new Date(existingSession.updated_at)) {
// // // //           const index = acc.indexOf(existingSession);
// // // //           acc[index] = session;
// // // //         }
// // // //         // Sum unread counts
// // // //         existingSession.unread_count += session.unread_count;
// // // //       } else {
// // // //         acc.push(session);
// // // //       }
// // // //       return acc;
// // // //     }, []);
    
// // // //     setBargainSessions(groupedSessions.sort((a, b) => 
// // // //       new Date(b.updated_at) - new Date(a.updated_at)
// // // //     ));
    
// // // //     console.log("Normalized and grouped sessions:", groupedSessions);

// // // //   } catch (error) {
// // // //     console.error("Failed to fetch sessions:", error);
// // // //     if (error.name === 'AbortError') {
// // // //       console.warn("Request timed out");
// // // //     } else if (error.message.includes("401")) {
// // // //       navigate("/loginPage");
// // // //     } else {
// // // //       setBargainSessions([]);
// // // //     }
// // // //   } finally {
// // // //     setLoading(false);
// // // //   }
// // // // }, [navigate]);


// // // //   useEffect(() => {
// // // //     fetchSessions();
// // // //     const interval = setInterval(fetchSessions, 10000);
// // // //     return () => clearInterval(interval);
// // // //   }, [fetchSessions]);

// // // //   const initializeSocketConnection = useCallback(() => {
// // // //     const token = getToken();
// // // //     if (!token) {
// // // //       console.error("No token available - redirecting to login");
// // // //       setConnectionStatus("disconnected");
// // // //       return;
// // // //     }

// // // //     if (socket.current) {
// // // //       socket.current.removeAllListeners();
// // // //       socket.current.disconnect();
// // // //       socket.current = null;
// // // //     }

// // // //     const socketOptions = {
// // // //       auth: { token },
// // // //       query: { farmerId: farmerId },
// // // //       transports: ['websocket', 'polling'],
// // // //       reconnection: true,
// // // //       reconnectionAttempts: 5,
// // // //       reconnectionDelay: 1000,
// // // //       reconnectionDelayMax: 10000,
// // // //       timeout: 20000,
// // // //       secure: process.env.NODE_ENV === 'production',
// // // //       rejectUnauthorized: false,
// // // //       extraHeaders: {
// // // //         Authorization: `Bearer ${token}`
// // // //       }
// // // //     };
    
// // // //     console.log("Initializing socket connection for farmer...");
// // // //     socket.current = io(
// // // //       process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
// // // //       socketOptions
// // // //     );

// // // //     socket.current.on('connect', () => {
// // // //       console.log("Socket connected successfully");
// // // //       setConnectionStatus("connected");
// // // //       reconnectAttempts.current = 0;
// // // //     });

// // // //     socket.current.on('connect_error', (error) => {
// // // //       console.error('Socket connection error:', error);
// // // //       setConnectionStatus("error");
// // // //     });

// // // //     socket.current.on('disconnect', (reason) => {
// // // //       console.log('Socket disconnected:', reason);
// // // //       setConnectionStatus("disconnected");
      
// // // //       if (reason === 'io server disconnect') {
// // // //         setTimeout(() => {
// // // //           if (reconnectAttempts.current < 5) {
// // // //             reconnectAttempts.current += 1;
// // // //             initializeSocketConnection();
// // // //           }
// // // //         }, 1000);
// // // //       }
// // // //     });

// // // //     socket.current.on('newBargainMessage', (message) => {
// // // //       console.log("New bargain message received:", message);
// // // //       setNewMessages(prev => ({
// // // //         ...prev,
// // // //         [message.bargain_id]: (prev[message.bargain_id] || 0) + 1
// // // //       }));
// // // //       setBargainSessions(prevSessions => {
// // // //         const updatedSessions = prevSessions.map(session => {
// // // //           if (session.bargain_id === message.bargain_id) {
// // // //             return {
// // // //               ...session,
// // // //               last_message: { content: message.message_content, timestamp: message.created_at },
// // // //               updated_at: message.created_at,
// // // //               unread_count: (session.unread_count || 0) + 1
// // // //             };
// // // //           }
// // // //           return session;
// // // //         });
// // // //         const sessionExists = updatedSessions.some(s => s.bargain_id === message.bargain_id);
// // // //         if (!sessionExists && message.bargain_id) {
// // // //           fetchSessions();
// // // //         }
// // // //         return updatedSessions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
// // // //       });
// // // //     });

// // // //     socket.current.on('bargainStatusUpdate', ({ bargain_id, status, currentPrice }) => {
// // // //       console.log(`Bargain ${bargain_id} status updated to ${status}`);
// // // //       setBargainSessions(prevSessions => {
// // // //         const updatedSessions = prevSessions.map(session => {
// // // //           if (session.bargain_id === bargain_id) {
// // // //             return { ...session, status, current_price: currentPrice };
// // // //           }
// // // //           return session;
// // // //         });
// // // //         return updatedSessions;
// // // //       });
// // // //     });

// // // //     socket.current.on('bargainRemoved', ({ bargain_id }) => {
// // // //       console.log(`Bargain ${bargain_id} removed`);
// // // //       setBargainSessions(prevSessions => prevSessions.filter(session => session.bargain_id !== bargain_id));
// // // //     });

// // // //     return () => {
// // // //       if (socket.current) {
// // // //         socket.current.disconnect();
// // // //       }
// // // //     };
// // // //   }, [farmerId, navigate, fetchSessions]);

// // // //   useEffect(() => {
// // // //     initializeSocketConnection();
// // // //   }, [initializeSocketConnection]);

// // // //   // Handle session selection
// // // //   const handleSessionClick = (session) => {
// // // //     setSelectedSession(session);
// // // //     setNewMessages(prev => ({ ...prev, [session.bargain_id]: 0 }));
// // // //     navigate(`/farmer/bargain/${session.bargain_id}`, { state: { initialSession: session } });
// // // //   };
  
// // // //   const filteredSessions = searchTerm 
// // // //   ? bargainSessions.filter(session =>
// // // //       session.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// // // //       session.consumer_name?.toLowerCase().includes(searchTerm.toLowerCase())
// // // //     )
// // // //   : bargainSessions;

// // // //   return (
// // // //     <div className="bargain-container">
// // // //       {/* Sidebar for chat list */}
// // // //       <div className="bargain-sidebar">
// // // //         <div className="bargain-header">
// // // //           <h2 className="header-title">
// // // //             <FontAwesomeIcon icon={faListAlt} /> Bargain Requests
// // // //           </h2>
// // // //           <Link to="/farmer-dashboard" className="cart-icon-link">
// // // //             <FontAwesomeIcon icon={faShoppingCart} />
// // // //           </Link>
// // // //         </div>

// // // //         <div className="search-bar">
// // // //           <input
// // // //             type="text"
// // // //             placeholder="Search products or consumers..."
// // // //             value={searchTerm}
// // // //             onChange={(e) => setSearchTerm(e.target.value)}
// // // //           />
// // // //         </div>

// // // //         <div className="bargain-list">
// // // //           {loading ? (
// // // //             <div className="loading-spinner">
// // // //               <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// // // //               <p>Loading sessions...</p>
// // // //             </div>
// // // //           ) : filteredSessions.length === 0 ? (
// // // //             <div className="no-requests-msg">
// // // //               <h3>No Bargain Requests</h3>
// // // //               <p>You have not received any bargain requests yet.</p>
// // // //             </div>
// // // //           ) : (
// // // //             filteredSessions.map((session) => (
// // // //               <div 
// // // //                 key={session.bargain_id}
// // // //                 className={`session-item ${selectedSession?.bargain_id === session.bargain_id ? 'active' : ''}`}
// // // //                 onClick={() => handleSessionClick(session)}
// // // //               >
// // // //                 <div className="session-info">
// // // //                   <div className="profile-photo placeholder">
// // // //                     {session.consumer_name.charAt(0)}
// // // //                   </div>
// // // //                   <div className="session-details">
// // // //                     <p className="consumer-name">{session.consumer_name}</p>
                    
// // // //                     {/* NEW: Display Bargaining Details */}
// // // //                     <p className="bargain-details">
// // // //                       <span className="product-name">{session.product_name}</span>
// // // //                       <br/>
// // // //                       <span className="prices">Base: ₹{session.initial_price} | Current: ₹{session.current_price}</span>
// // // //                       <br/>
// // // //                       <span className={`status-text status-${session.status}`}>{session.status.toUpperCase()}</span>
// // // //                     </p>
// // // //                   </div>
// // // //                 </div>
                
// // // //                 {newMessages[session.bargain_id] && (
// // // //                   <div className="unread-badge">
// // // //                     {newMessages[session.bargain_id]}
// // // //                   </div>
// // // //                 )}
                
// // // //                 {session.status === 'pending' && (
// // // //                   <div className="status-indicator pending" />
// // // //                 )}
// // // //               </div>
// // // //             ))
// // // //           )}
// // // //         </div>
// // // //       </div>
  
// // // //       {/* Chat Window */}
// // // //       <div className="chat-window-container">
// // // //         {selectedSession ? (
// // // //           <FarmerChatWindow
// // // //             bargainId={selectedSession.bargain_id}
// // // //             socket={socket.current}
// // // //             connectionStatus={connectionStatus}
// // // //             initialSession={selectedSession}
// // // //             onBack={() => {
// // // //               setSelectedSession(null);
// // // //               navigate("/farmer/bargain");
// // // //             }}
// // // //           />
// // // //         ) : (
// // // //           <div className="empty-chat-window">
// // // //             <div className="empty-content">
// // // //               <h3>Select a bargain request</h3>
// // // //               <p>Choose a conversation from the sidebar to start bargaining</p>
// // // //             </div>
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default FarmerChatList;
// // // import React, { useState, useEffect, useRef, useCallback } from "react";
// // // import { useParams, useNavigate, Link } from "react-router-dom";
// // // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // // import { faSpinner, faListAlt, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
// // // import { io } from 'socket.io-client';
// // // import FarmerChatWindow from "./FarmerChatWindow";
// // // import "./FarmerChatList.css";

// // // const FarmerChatList = () => {
// // //   const { farmerId } = useParams();
// // //   const navigate = useNavigate();
// // //   const [bargainSessions, setBargainSessions] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [selectedSession, setSelectedSession] = useState(null);
// // //   const socket = useRef(null);
// // //   const reconnectAttempts = useRef(0);
// // //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// // //   const [newMessages, setNewMessages] = useState({});
// // //   const [searchTerm, setSearchTerm] = useState("");

// // //   const getToken = () => {
// // //     try {
// // //       const farmerData = localStorage.getItem("farmer");
// // //       if (!farmerData) {
// // //         navigate("/loginPage");
// // //         return null;
// // //       }
// // //       const parsedData = JSON.parse(farmerData);
// // //       if (!parsedData?.token) {
// // //         navigate("/loginPage");
// // //         return null;
// // //       }
// // //       const decoded = JSON.parse(atob(parsedData.token.split('.')[1]));
// // //       if (!decoded?.farmer_id) {
// // //         console.error("Token missing farmer_id");
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

// // //   const normalizeSession = (session) => {
// // //     if (!session) {
// // //       console.error("Attempted to normalize undefined session");
// // //       return null;
// // //     }
// // //     const defaultSession = {
// // //       bargain_id: '',
// // //       consumer_id: '',
// // //       consumer_name: 'Unknown Consumer',
// // //       product_name: 'Unknown Product',
// // //       quantity: 0,
// // //       current_price: 0,
// // //       initial_price: 0,
// // //       status: 'pending',
// // //       last_message: null,
// // //       unread_count: 0,
// // //       updated_at: new Date().toISOString()
// // //     };
// // //     const normalized = { ...defaultSession };
// // //     for (const key in session) {
// // //       if (session[key] !== undefined && session[key] !== null) {
// // //         normalized[key] = session[key];
// // //       }
// // //     }
// // //     if (!normalized.consumer_name && (session.first_name || session.last_name)) {
// // //       normalized.consumer_name = `${session.first_name || ''} ${session.last_name || ''}`.trim() || defaultSession.consumer_name;
// // //     }
// // //     return normalized;
// // //   };

// // //   const groupSessionsByConsumer = (sessions) => {
// // //     const grouped = {};
// // //     sessions.forEach(session => {
// // //       if (!grouped[session.consumer_id]) {
// // //         grouped[session.consumer_id] = {
// // //           consumer_id: session.consumer_id,
// // //           consumer_name: session.consumer_name,
// // //           sessions: [],
// // //           unread_count: 0,
// // //           last_updated: session.updated_at
// // //         };
// // //       }
// // //       grouped[session.consumer_id].sessions.push(session);
// // //       grouped[session.consumer_id].unread_count += session.unread_count || 0;
// // //       if (new Date(session.updated_at) > new Date(grouped[session.consumer_id].last_updated)) {
// // //         grouped[session.consumer_id].last_updated = session.updated_at;
// // //       }
// // //     });
// // //     return Object.values(grouped).map(group => ({
// // //       ...group,
// // //       sessions: group.sessions.sort((a, b) => {
// // //         // Sort by current price descending for the same product
// // //         if (a.product_name === b.product_name) {
// // //           return b.current_price - a.current_price;
// // //         }
// // //         return new Date(b.updated_at) - new Date(a.updated_at);
// // //       })
// // //     })).sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
// // //   };

// // //   const fetchSessions = useCallback(async () => {
// // //     try {
// // //       const token = getToken();
// // //       if (!token) {
// // //         navigate("/loginPage");
// // //         return;
// // //       }
// // //       const decodedToken = JSON.parse(atob(token.split(".")[1]));
// // //       const farmerId = decodedToken.farmer_id;
// // //       const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;
// // //       const response = await fetch(apiUrl, {
// // //         headers: {
// // //           'Authorization': `Bearer ${token}`,
// // //           'Accept': 'application/json',
// // //           'Content-Type': 'application/json'
// // //         },
// // //         credentials: 'include',
// // //         signal: AbortSignal.timeout(10000)
// // //       });
// // //       if (!response.ok) {
// // //         const errorText = await response.text();
// // //         throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
// // //       }
// // //       const responseData = await response.json();
// // //       const validatedSessions = Array.isArray(responseData)
// // //         ? responseData.map(session => ({
// // //             bargain_id: session.bargain_id?.toString() || '',
// // //             consumer_id: session.consumer_id || '',
// // //             consumer_name: session.consumer_name || `${session.first_name || ''} ${session.last_name || ''}`.trim() || `Consumer ${session.consumer_id || 'Unknown'}`,
// // //             product_name: session.product_name || 'Unknown Product',
// // //             quantity: Number(session.quantity) || 0,
// // //             current_price: Number(session.current_price) || 0,
// // //             initial_price: Number(session.initial_price) || 0,
// // //             status: session.status || 'pending',
// // //             last_message: session.last_message || null,
// // //             unread_count: Number(session.unread_count) || 0,
// // //             updated_at: session.updated_at || new Date().toISOString()
// // //           }))
// // //           .filter(session => session.bargain_id && session.consumer_id)
// // //         : [];
// // //       setBargainSessions(validatedSessions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
// // //     } catch (error) {
// // //       console.error("Failed to fetch sessions:", error);
// // //       if (error.name === 'AbortError' || error.message.includes("401")) {
// // //         navigate("/loginPage");
// // //       }
// // //       setBargainSessions([]);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [navigate]);

// // //   useEffect(() => {
// // //     fetchSessions();
// // //     const interval = setInterval(fetchSessions, 10000);
// // //     return () => clearInterval(interval);
// // //   }, [fetchSessions]);

// // //   const initializeSocketConnection = useCallback(() => {
// // //     const token = getToken();
// // //     if (!token) {
// // //       setConnectionStatus("disconnected");
// // //       return;
// // //     }
// // //     if (socket.current) {
// // //       socket.current.removeAllListeners();
// // //       socket.current.disconnect();
// // //       socket.current = null;
// // //     }
// // //     const socketOptions = {
// // //       auth: { token },
// // //       query: { farmerId: farmerId },
// // //       transports: ['websocket', 'polling'],
// // //       reconnection: true,
// // //       reconnectionAttempts: 5,
// // //       reconnectionDelay: 1000,
// // //       reconnectionDelayMax: 10000,
// // //       timeout: 20000,
// // //       secure: process.env.NODE_ENV === 'production',
// // //       rejectUnauthorized: false,
// // //       extraHeaders: { Authorization: `Bearer ${token}` }
// // //     };
// // //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", socketOptions);
// // //     socket.current.on('connect', () => { setConnectionStatus("connected"); reconnectAttempts.current = 0; });
// // //     socket.current.on('connect_error', () => { setConnectionStatus("error"); });
// // //     socket.current.on('disconnect', (reason) => {
// // //       setConnectionStatus("disconnected");
// // //       if (reason === 'io server disconnect') {
// // //         setTimeout(() => {
// // //           if (reconnectAttempts.current < 5) {
// // //             reconnectAttempts.current += 1;
// // //             initializeSocketConnection();
// // //           }
// // //         }, 1000);
// // //       }
// // //     });
// // //     socket.current.on('newBargainMessage', (message) => {
// // //       setNewMessages(prev => ({ ...prev, [message.bargain_id]: (prev[message.bargain_id] || 0) + 1 }));
// // //       setBargainSessions(prevSessions => {
// // //         const updatedSessions = prevSessions.map(session => {
// // //           if (session.bargain_id === message.bargain_id) {
// // //             return { ...session, last_message: { content: message.message_content, timestamp: message.created_at }, updated_at: message.created_at, unread_count: (session.unread_count || 0) + 1 };
// // //           }
// // //           return session;
// // //         });
// // //         const sessionExists = updatedSessions.some(s => s.bargain_id === message.bargain_id);
// // //         if (!sessionExists && message.bargain_id) {
// // //           fetchSessions();
// // //         }
// // //         return updatedSessions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
// // //       });
// // //     });
// // //     socket.current.on('bargainStatusUpdate', ({ bargain_id, status, currentPrice }) => {
// // //       setBargainSessions(prevSessions => {
// // //         const updatedSessions = prevSessions.map(session => {
// // //           if (session.bargain_id === bargain_id) {
// // //             return { ...session, status, current_price: currentPrice };
// // //           }
// // //           return session;
// // //         });
// // //         return updatedSessions;
// // //       });
// // //     });
// // //     socket.current.on('bargainRemoved', ({ bargain_id }) => {
// // //       setBargainSessions(prevSessions => prevSessions.filter(session => session.bargain_id !== bargain_id));
// // //     });
// // //     return () => { if (socket.current) { socket.current.disconnect(); } };
// // //   }, [farmerId, navigate, fetchSessions]);

// // //   useEffect(() => {
// // //     initializeSocketConnection();
// // //   }, [initializeSocketConnection]);

// // //   const handleSessionClick = (session) => {
// // //     setSelectedSession(session);
// // //     setNewMessages(prev => ({ ...prev, [session.bargain_id]: 0 }));
// // //     navigate(`/farmer/bargain/${session.bargain_id}`, { state: { initialSession: session } });
// // //   };
  
// // //   const filteredSessions = searchTerm ? bargainSessions.filter(session =>
// // //     session.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// // //     session.consumer_name?.toLowerCase().includes(searchTerm.toLowerCase())
// // //   ) : bargainSessions;

// // //   const groupedSessions = groupSessionsByConsumer(filteredSessions);

// // //   const getBargainSuggestion = (session) => {
// // //     const isGoodOffer = session.current_price >= session.initial_price * 0.9;
// // //     if (session.status === 'pending' || session.status === 'countered') {
// // //       if (isGoodOffer) {
// // //         return <span style={{ color: 'green', fontWeight: 'bold' }}>This is a good offer!</span>;
// // //       } else {
// // //         return <span style={{ color: 'orange' }}>Counter with a slightly higher price.</span>;
// // //       }
// // //     }
// // //     return null;
// // //   };

// // //   return (
// // //     <div className="bargain-container">
// // //       <div className="bargain-sidebar">
// // //         <div className="bargain-header">
// // //           <h2 className="header-title"><FontAwesomeIcon icon={faListAlt} /> Bargain Requests</h2>
// // //           <Link to="/farmer-dashboard" className="cart-icon-link"><FontAwesomeIcon icon={faShoppingCart} /></Link>
// // //         </div>
// // //         <div className="search-bar">
// // //           <input type="text" placeholder="Search products or consumers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
// // //         </div>
// // //         <div className="bargain-list">
// // //           {loading ? (
// // //             <div className="loading-spinner">
// // //               <FontAwesomeIcon icon={faSpinner} spin size="2x" /><p>Loading sessions...</p>
// // //             </div>
// // //           ) : groupedSessions.length === 0 ? (
// // //             <div className="no-requests-msg">
// // //               <h3>No Bargain Requests</h3><p>You have not received any bargain requests yet.</p>
// // //             </div>
// // //           ) : (
// // //             groupedSessions.map((group) => {
// // //               const latestSession = group.sessions[0];
// // //               const productCount = group.sessions.length;
// // //               const statusText = latestSession.status.toUpperCase();
// // //               return (
// // //                 <div key={group.consumer_id} className={`session-item ${selectedSession?.bargain_id === latestSession.bargain_id ? 'active' : ''}`} onClick={() => handleSessionClick(latestSession)}>
// // //                   <div className="session-info">
// // //                     <div className="profile-photo placeholder">{group.consumer_name.charAt(0)}</div>
// // //                     <div className="session-details">
// // //                       <p className="consumer-name">{group.consumer_name}</p>
// // //                       <p className="bargain-details">
// // //                         <span className="product-name">
// // //                           <strong>{latestSession.product_name}</strong>
// // //                           {productCount > 1 && ` (+${productCount - 1} more)`}
// // //                         </span>
// // //                         <br />
// // //                         <span className="prices">Base: ₹{latestSession.initial_price} | Current: ₹{latestSession.current_price}</span>
// // //                         <br />
// // //                         <span className={`status-text status-${latestSession.status}`}>Status: <strong>{statusText}</strong></span>
// // //                         <br />
// // //                         {getBargainSuggestion(latestSession)}
// // //                       </p>
// // //                     </div>
// // //                   </div>
// // //                   {group.unread_count > 0 && (<div className="unread-badge">{group.unread_count}</div>)}
// // //                   {latestSession.status === 'pending' && (<div className="status-indicator pending" />)}
// // //                 </div>
// // //               );
// // //             })
// // //           )}
// // //         </div>
// // //       </div>
// // //       <div className="chat-window-container">
// // //         {selectedSession ? (
// // //           <FarmerChatWindow
// // //             bargainId={selectedSession.bargain_id}
// // //             socket={socket.current}
// // //             connectionStatus={connectionStatus}
// // //             initialSession={selectedSession}
// // //             onBack={() => { setSelectedSession(null); navigate("/farmer/bargain"); }}
// // //           />
// // //         ) : (
// // //           <div className="empty-chat-window">
// // //             <div className="empty-content">
// // //               <h3>Select a bargain request</h3>
// // //               <p>Choose a conversation from the sidebar to start bargaining</p>
// // //             </div>
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default FarmerChatList;
// // import React, { useState, useEffect, useRef, useCallback } from "react";
// // import { useParams, useNavigate, Link } from "react-router-dom";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { faSpinner, faListAlt, faShoppingCart, faLeaf } from "@fortawesome/free-solid-svg-icons";
// // import { io } from 'socket.io-client';
// // import FarmerChatWindow from "./FarmerChatWindow";
// // import "./FarmerChatList.css";
// // import axios from "axios"; // Added axios to make API calls

// // const FarmerChatList = () => {
// //   const { farmerId } = useParams();
// //   const navigate = useNavigate();
// //   const [bargainSessions, setBargainSessions] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedSession, setSelectedSession] = useState(null);
// //   const socket = useRef(null);
// //   const reconnectAttempts = useRef(0);
// //   const [connectionStatus, setConnectionStatus] = useState("connecting");
// //   const [newMessages, setNewMessages] = useState({});
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [consumerProfilePhotos, setConsumerProfilePhotos] = useState({}); // Added state for consumer photos

// //   // Helper functions to extract info from message content
// //   const extractProductName = (content) => {
// //     if (!content) return 'Product';
// //     const match = content.match(/You selected (.+?) \(/);
// //     return match ? match[1] : 'Product';
// //   };

// //   const extractQuantity = (content) => {
// //     if (!content) return 0;
// //     const match = content.match(/\((\d+)kg\)/);
// //     return match ? parseInt(match[1], 10) : 0;
// //   };

// //   const extractPrice = (content) => {
// //     if (!content) return 0;
// //     const match = content.match(/₹(\d+)/);
// //     return match ? parseInt(match[1], 10) : 0;
// //   };

// //   // NEW: Function to fetch consumer profile photos
// //   const fetchConsumerProfilePhoto = useCallback(async (consumerId) => {
// //     try {
// //       const token = getToken();
// //       if (!token) return null;

// //       const response = await axios.get(
// //         `http://localhost:5000/api/consumerprofile/${consumerId}/personal`,
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       if (response.data?.profile_photo) {
// //         const photoUrl = response.data.profile_photo.startsWith('http')
// //           ? response.data.profile_photo
// //           : `http://localhost:5000${response.data.profile_photo}`;
        
// //         setConsumerProfilePhotos(prev => ({
// //           ...prev,
// //           [consumerId]: photoUrl
// //         }));
        
// //         return photoUrl;
// //       }
// //       return null;
// //     } catch (error) {
// //       console.error(`Error fetching profile photo for consumer ${consumerId}:`, error);
// //       return null;
// //     }
// //   }, []);

// //   // Get token from farmer's localStorage with validation
// //   const getToken = () => {
// //     try {
// //       const farmerData = localStorage.getItem("farmer");
// //       if (!farmerData) {
// //         navigate("/loginPage");
// //         return null;
// //       }

// //       const parsedData = JSON.parse(farmerData);
// //       if (!parsedData?.token) {
// //         navigate("/loginPage");
// //         return null;
// //       }

// //       // Verify token structure
// //       const decoded = JSON.parse(atob(parsedData.token.split('.')[1]));
// //       if (!decoded?.farmer_id) {
// //         console.error("Token missing farmer_id");
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


// //   // Helper function to normalize session data
// //   const normalizeSession = (session) => {
// //     if (!session) {
// //       console.error("Attempted to normalize undefined session");
// //       return null;
// //     }
// //     const defaultSession = {
// //       bargain_id: '',
// //       consumer_id: '',
// //       consumer_name: 'Unknown Consumer',
// //       product_name: 'Unknown Product',
// //       quantity: 0,
// //       current_price: 0,
// //       initial_price: 0,
// //       status: 'pending',
// //       last_message: null,
// //       unread_count: 0,
// //       updated_at: new Date().toISOString()
// //     };
  
// //     // Safely merge the incoming session with defaults
// //     const normalized = { ...defaultSession };
// //     for (const key in session) {
// //       if (session[key] !== undefined && session[key] !== null) {
// //         normalized[key] = session[key];
// //       }
// //     }
  
// //     // Special handling for consumer name
// //     if (!normalized.consumer_name && 
// //         (session.first_name || session.last_name)) {
// //       normalized.consumer_name = 
// //         `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
// //         defaultSession.consumer_name;
// //     }
  
// //     return normalized;
// //   };

// //   const fetchSessions = useCallback(async () => {
// //     try {
// //       const token = getToken();
// //       if (!token) {
// //         console.warn("No token available - redirecting to login");
// //         navigate("/loginPage");
// //         return;
// //       }

// //       const decodedToken = JSON.parse(atob(token.split(".")[1]));
// //       const farmerId = decodedToken.farmer_id;
// //       console.log(`Fetching sessions for farmer: ${farmerId}`);

// //       const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;
// //       console.log("API Endpoint:", apiUrl);

// //       const response = await fetch(apiUrl, {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Accept': 'application/json',
// //           'Content-Type': 'application/json'
// //         },
// //         credentials: 'include',
// //         signal: AbortSignal.timeout(10000) // 10 second timeout
// //       });

// //       console.log("Response Status:", response.status);
    
// //       if (!response.ok) {
// //         const errorText = await response.text();
// //         console.error("API Error Response:", errorText);
// //         throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
// //       }

// //       const responseData = await response.json();
// //       console.log("Raw API Data:", responseData);

// //       // Validate and normalize the response data
// //       const validatedSessions = Array.isArray(responseData) 
// //         ? responseData
// //             .map(session => ({
// //               bargain_id: session.bargain_id?.toString() || '',
// //               consumer_id: session.consumer_id || '',
// //               consumer_name: session.consumer_name || 
// //                            `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
// //                            `Consumer ${session.consumer_id || 'Unknown'}`,
// //               product_name: session.product_name || 'Unknown Product',
// //               quantity: Number(session.quantity) || 0,
// //               current_price: Number(session.current_price) || 0,
// //               initial_price: Number(session.initial_price) || 0,
// //               status: session.status || 'pending',
// //               last_message: session.last_message || null,
// //               unread_count: Number(session.unread_count) || 0,
// //               updated_at: session.updated_at || new Date().toISOString()
// //             }))
// //             .filter(session => {
// //               const isValid = session.bargain_id && session.consumer_id;
// //               if (!isValid) {
// //                 console.warn("Invalid session filtered out:", session);
// //               }
// //               return isValid;
// //             })
// //         : [];

// //       // Group sessions by consumer and keep only the most recent one
// //       const groupedSessions = validatedSessions.reduce((acc, session) => {
// //         const existingSession = acc.find(s => s.consumer_id === session.consumer_id);
        
// //         if (existingSession) {
// //           if (new Date(session.updated_at) > new Date(existingSession.updated_at)) {
// //             const index = acc.indexOf(existingSession);
// //             acc[index] = session;
// //           }
// //           existingSession.unread_count += session.unread_count;
// //         } else {
// //           acc.push(session);
// //         }
        
// //         return acc;
// //       }, []);

// //       console.log("Grouped Sessions:", groupedSessions);
// //       setBargainSessions(groupedSessions.sort((a, b) => 
// //         new Date(b.updated_at) - new Date(a.updated_at)
// //       ));

// //     } catch (error) {
// //       console.error("Failed to fetch sessions:", error);
      
// //       if (error.name === 'AbortError') {
// //         console.warn("Request timed out");
// //       } else if (error.message.includes("401")) {
// //         navigate("/loginPage");
// //       } else {
// //         setBargainSessions([]);
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [navigate]);

// //   // Initial fetch and periodic refresh
// //   useEffect(() => {
// //     const fetchData = async () => {
// //         await fetchSessions();
// //         const uniqueConsumerIds = [...new Set(bargainSessions.map(s => s.consumer_id))];
// //         uniqueConsumerIds.forEach(consumerId => {
// //             if (!consumerProfilePhotos[consumerId]) {
// //                 fetchConsumerProfilePhoto(consumerId);
// //             }
// //         });
// //     };
// //     fetchData();
// //     const interval = setInterval(fetchData, 10000);
// //     return () => clearInterval(interval);
// //   }, [fetchSessions, fetchConsumerProfilePhoto, bargainSessions, consumerProfilePhotos]);


// //     // WebSocket connection management
// //  const initializeSocketConnection = useCallback(() => {
// //   const token = getToken();
// //   if (!token) {
// //     console.error("No token available - redirecting to login");
// //     navigate("/loginPage");
// //     return;
// //   }

// //   try {
// //     const decodedToken = JSON.parse(atob(token.split(".")[1]));
// //     const farmerId = decodedToken.farmer_id;

// //     // Close existing connection if any
// //     if (socket.current) {
// //       console.log("Disconnecting existing socket connection");
// //       socket.current.off();
// //       socket.current.disconnect();
// //       socket.current = null;
// //     }

// //     console.log("Initializing new socket connection for farmer list");
// //     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
// //       auth: { token },
// //       query: { 
// //         userType: 'farmer',
// //         farmerId 
// //       },
// //       transports: ['websocket', 'polling'],
// //       reconnection: true,
// //       reconnectionAttempts: 5,
// //       reconnectionDelay: 1000,
// //       reconnectionDelayMax: 10000,
// //       timeout: 20000,
// //       secure: process.env.NODE_ENV === 'production',
// //       rejectUnauthorized: false,
// //       extraHeaders: { 
// //         Authorization: `Bearer ${token}`,
// //         'X-Farmer-ID': farmerId
// //       }
// //     });
    
// //     // Connection events - Standardized with chat window
// //     socket.current.on('connect', () => {
// //       console.log("Socket connected successfully");
// //       setConnectionStatus("connected");
// //       reconnectAttempts.current = 0;
// //       fetchSessions();
// //     });

// //     socket.current.on('connect_error', (err) => {
// //       console.error("Socket connection error:", err.message);
// //       setConnectionStatus("error");
      
// //       const maxAttempts = 5;
// //       if (reconnectAttempts.current < maxAttempts) {
// //         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
// //         reconnectAttempts.current += 1;
// //         console.log(`Attempting reconnect #${reconnectAttempts.current} in ${delay}ms`);
// //         setTimeout(() => initializeSocketConnection(), delay);
// //       } else {
// //         console.error("Max reconnection attempts reached");
// //       }
// //     });

// //     socket.current.on('disconnect', (reason) => {
// //       console.log("Socket disconnected. Reason:", reason);
// //       setConnectionStatus("disconnected");
      
// //       if (reason === "io server disconnect") {
// //         setTimeout(() => initializeSocketConnection(), 1000);
// //       }
// //     });

// //     // Application events - Use the same event names as chat window
// //     socket.current.on('bargainMessage', (message) => {
// //       console.log("New message received:", message);
// //       fetchSessions(); // Refresh the list
// //     });

// //     socket.current.on('bargainStatusUpdate', (data) => {
// //       console.log("Status update received:", data);
// //       fetchSessions(); // Refresh the list
// //     });

// //     socket.current.on('error', (error) => {
// //       console.error("Socket error:", error);
// //       setConnectionStatus("error");
// //     });

// //   } catch (error) {
// //     console.error("Socket initialization error:", error);
// //     setConnectionStatus("error");
// //     setTimeout(() => initializeSocketConnection(), 5000);
// //   }

// //   return () => {
// //     if (socket.current) {
// //       console.log("Cleaning up socket connection");
// //       socket.current.off();
// //       socket.current.disconnect();
// //     }
// //   };
// // }, [navigate, fetchSessions]);


// //       // Initialize socket connection
// //   useEffect(() => {
// //     initializeSocketConnection();
// //     return () => {
// //       if (socket.current) {
// //         socket.current.disconnect();
// //       }
// //     };
// //   }, [initializeSocketConnection]);

// //   const validateSession = (session) => {
// //     if (!session) return false;
    
// //     const requiredFields = [
// //       'bargain_id',
// //       'consumer_id',
// //       'consumer_name',
// //       'product_name',
// //       'status',
// //       'updated_at'
// //     ];
    
// //     return requiredFields.every(field => {
// //       const isValid = session[field] !== undefined && session[field] !== null;
// //       if (!isValid) {
// //         console.warn(`Missing required field: ${field} in session:`, session);
// //       }
// //       return isValid;
// //     });
// //   };

// //   const handleSessionSelect = (session) => {
// //     if (!validateSession(session)) {
// //       console.error("Invalid session data:", session);
// //       return;
// //     }

// //     const consumerData = {
// //       first_name: session.consumer_name.split(' ')[0],
// //       last_name: session.consumer_name.split(' ').slice(1).join(' ') || '',
// //       phone_number: session.consumer_phone || 'Not available',
// //       location: session.consumer_location || 'Not specified'
// //     };
    
// //     const productData = {
// //       produce_name: session.product_name,
// //       quantity: session.quantity,
// //       price_per_kg: session.initial_price,
// //       current_offer: session.current_price,
// //       product_id: session.product_id || `temp-${session.bargain_id}`
// //     };

// //     navigate(`/farmer/bargain/${session.bargain_id}`, {
// //       state: {
// //         consumer: consumerData,
// //         product: productData,
// //         initialPrice: session.current_price
// //       }
// //     });

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
  
// //   const filteredSessions = bargainSessions
// //     .filter(session => {
// //       const isValid = validateSession(session);
// //       if (!isValid) {
// //         console.warn("Invalid session filtered out:", session);
// //       }
// //       return isValid;
// //     })
// //     .filter(session => {
// //       try {
// //         const search = searchTerm.toLowerCase();
// //         return (
// //           session.consumer_name.toLowerCase().includes(search) ||
// //           session.product_name.toLowerCase().includes(search)
// //         );
// //       } catch (error) {
// //         console.error("Error filtering session:", error, session);
// //         return false;
// //       }
// //     });

// //   useEffect(() => {
// //     console.log("Current bargain sessions:", bargainSessions);
// //   }, [bargainSessions]);

// //   const getStatusClass = (status) => {
// //     switch (status) {
// //       case 'accepted':
// //         return 'status-accepted';
// //       case 'rejected':
// //         return 'status-rejected';
// //       case 'pending':
// //       case 'countered':
// //       default:
// //         return 'status-pending';
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="loading-spinner">
// //         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
// //         <p>Loading bargain requests...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bargain-container">
// //       {/* Sidebar - Chat List */}
// //       <div className="bargain-sidebar">
// //         <div className="bargain-header">
// //           <h2 className="header-title">Bargain Requests</h2>
// //           <Link to="/farmer-dashboard">
// //             <FontAwesomeIcon icon={faLeaf} className="cart-icon-link" />
// //           </Link>
// //         </div>
// //         <div className="search-bar">
// //           <input
// //             type="text"
// //             placeholder="Search consumers or products..."
// //             value={searchTerm}
// //             onChange={(e) => setSearchTerm(e.target.value)}
// //           />
// //         </div>
// //         <div className="bargain-list">
// //           {filteredSessions.length === 0 ? (
// //             <p className="no-requests-msg">No active bargain requests.</p>
// //           ) : (
// //             filteredSessions.map((session) => (
// //               <div
// //                 key={session.bargain_id}
// //                 className={`session-item ${selectedSession?.bargain_id === session.bargain_id ? 'active' : ''}`}
// //                 onClick={() => handleSessionSelect(session)}
// //               >
// //                 <div className="session-info">
// //                   {consumerProfilePhotos[session.consumer_id] ? (
// //                       <img src={consumerProfilePhotos[session.consumer_id]} alt="Consumer Profile" className="profile-photo" />
// //                   ) : (
// //                       <div className="profile-photo placeholder">
// //                           {session.consumer_name.charAt(0)}
// //                       </div>
// //                   )}
// //                   <div className="session-details">
// //                     <p className="consumer-name">{session.consumer_name}</p>
// //                     <p className="bargain-details">
// //                       <span className="product-name">{session.product_name}</span>
// //                       <br/>
// //                       <span className="prices">
// //                         Base: ₹{session.initial_price} | Current: ₹{session.current_price}
// //                       </span>
// //                       <br/>
// //                       Status: <span className={`status-text ${getStatusClass(session.status)}`}>
// //                         {session.status}
// //                       </span>
// //                     </p>
// //                   </div>
// //                 </div>
// //                 {session.unread_count > 0 && (
// //                   <div className="unread-badge">
// //                     {session.unread_count}
// //                   </div>
// //                 )}
// //               </div>
// //             ))
// //           )}
// //         </div>
// //       </div>
  
// //       {/* Chat Window */}
// //       <div className="chat-window-container">
// //         {selectedSession ? (
// //           <FarmerChatWindow
// //             bargainId={selectedSession.bargain_id}
// //             socket={socket.current}
// //             connectionStatus={connectionStatus}
// //             initialSession={selectedSession}
// //             onBack={() => {
// //               setSelectedSession(null);
// //               navigate("/farmer/bargain");
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

// // export default FarmerChatList;
// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSpinner, faLeaf } from "@fortawesome/free-solid-svg-icons";
// import { io } from 'socket.io-client';
// import FarmerChatWindow from "./FarmerChatWindow";
// import "./FarmerChatList.css";
// import axios from "axios";

// const FarmerChatList = () => {
//   const { farmerId } = useParams();
//   const navigate = useNavigate();
//   const [bargainSessions, setBargainSessions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSession, setSelectedSession] = useState(null);
//   const socket = useRef(null);
//   const reconnectAttempts = useRef(0);
//   const [connectionStatus, setConnectionStatus] = useState("connecting");
//   const [newMessages, setNewMessages] = useState({});
//   const [searchTerm, setSearchTerm] = useState("");
//   const [consumerProfilePhotos, setConsumerProfilePhotos] = useState({}); 

//   const extractProductName = (content) => {
//     if (!content) return 'Product';
//     const match = content.match(/You selected (.+?) \(/);
//     return match ? match[1] : 'Product';
//   };

//   const extractQuantity = (content) => {
//     if (!content) return 0;
//     const match = content.match(/\((\d+)kg\)/);
//     return match ? parseInt(match[1], 10) : 0;
//   };

//   const extractPrice = (content) => {
//     if (!content) return 0;
//     const match = content.match(/₹(\d+)/);
//     return match ? parseInt(match[1], 10) : 0;
//   };

//   // NEW: Function to fetch consumer profile photos using the correct API endpoint
//   const fetchConsumerProfilePhoto = useCallback(async (consumerId) => {
//     try {
//       const token = getToken();
//       if (!token) return;

//       const apiUrl = `http://localhost:5000/api/consumer/${consumerId}`;
//       console.log(`[DEBUG] Attempting to fetch consumer profile for ID: ${consumerId} from URL: ${apiUrl}`);

//       const response = await axios.get(apiUrl, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       console.log("[DEBUG] API Response for profile photo:", response.data);

//       if (response.data?.photo) {
//         const photoUrl = response.data.photo.startsWith('http')
//           ? response.data.photo
//           : `http://localhost:5000${response.data.photo}`;
        
//         console.log(`[DEBUG] Found profile photo URL: ${photoUrl}`);
        
//         setConsumerProfilePhotos(prev => ({
//           ...prev,
//           [consumerId]: photoUrl
//         }));
//       }
//     } catch (error) {
//       console.error(`[ERROR] Error fetching profile photo for consumer ${consumerId}:`, error);
//       if (error.response) {
//         console.error("[ERROR] API Response Data:", error.response.data);
//         console.error("[ERROR] API Response Status:", error.response.status);
//       }
//     }
//   }, []);

//   const getToken = () => {
//     try {
//       const farmerData = localStorage.getItem("farmer");
//       if (!farmerData) {
//         navigate("/loginPage");
//         return null;
//       }

//       const parsedData = JSON.parse(farmerData);
//       if (!parsedData?.token) {
//         navigate("/loginPage");
//         return null;
//       }

//       const decoded = JSON.parse(atob(parsedData.token.split('.')[1]));
//       if (!decoded?.farmer_id) {
//         console.error("Token missing farmer_id");
//         navigate("/loginPage");
//         return null;
//       }
//       return parsedData.token;
//     } catch (e) {
//       console.error("Token parsing error:", e);
//       navigate("/loginPage");
//       return null;
//     }
//   };

//   const normalizeSession = (session) => {
//     if (!session) {
//       console.error("Attempted to normalize undefined session");
//       return null;
//     }
//     const defaultSession = {
//       bargain_id: '',
//       consumer_id: '',
//       consumer_name: 'Unknown Consumer',
//       product_name: 'Unknown Product',
//       quantity: 0,
//       current_price: 0,
//       initial_price: 0,
//       status: 'pending',
//       last_message: null,
//       unread_count: 0,
//       updated_at: new Date().toISOString()
//     };
  
//     const normalized = { ...defaultSession };
//     for (const key in session) {
//       if (session[key] !== undefined && session[key] !== null) {
//         normalized[key] = session[key];
//       }
//     }
  
//     if (!normalized.consumer_name && (session.first_name || session.last_name)) {
//       normalized.consumer_name = `${session.first_name || ''} ${session.last_name || ''}`.trim() || defaultSession.consumer_name;
//     }
//     return normalized;
//   };

//   const fetchSessions = useCallback(async () => {
//     try {
//       const token = getToken();
//       if (!token) {
//         console.warn("No token available - redirecting to login");
//         return;
//       }

//       const decodedToken = JSON.parse(atob(token.split(".")[1]));
//       const farmerId = decodedToken.farmer_id;
//       console.log(`Fetching sessions for farmer: ${farmerId}`);

//       const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;
//       console.log("API Endpoint:", apiUrl);

//       const response = await fetch(apiUrl, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         },
//         credentials: 'include',
//         signal: AbortSignal.timeout(10000)
//       });

//       console.log("Response Status:", response.status);
    
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("API Error Response:", errorText);
//         throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
//       }

//       const responseData = await response.json();
//       console.log("Raw API Data:", responseData);

//       const validatedSessions = Array.isArray(responseData) 
//         ? responseData
//             .map(session => ({
//               bargain_id: session.bargain_id?.toString() || '',
//               consumer_id: session.consumer_id || '',
//               consumer_name: session.consumer_name || 
//                            `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
//                            `Consumer ${session.consumer_id || 'Unknown'}`,
//               product_name: session.product_name || 'Unknown Product',
//               quantity: Number(session.quantity) || 0,
//               current_price: Number(session.current_price) || 0,
//               initial_price: Number(session.initial_price) || 0,
//               status: session.status || 'pending',
//               last_message: session.last_message || null,
//               unread_count: Number(session.unread_count) || 0,
//               updated_at: session.updated_at || new Date().toISOString()
//             }))
//             .filter(session => {
//               const isValid = session.bargain_id && session.consumer_id;
//               if (!isValid) {
//                 console.warn("Invalid session filtered out:", session);
//               }
//               return isValid;
//             })
//         : [];

//       const groupedSessions = validatedSessions.reduce((acc, session) => {
//         const existingSession = acc.find(s => s.consumer_id === session.consumer_id);
        
//         if (existingSession) {
//           if (new Date(session.updated_at) > new Date(existingSession.updated_at)) {
//             const index = acc.indexOf(existingSession);
//             acc[index] = session;
//           }
//           existingSession.unread_count += session.unread_count;
//         } else {
//           acc.push(session);
//         }
        
//         return acc;
//       }, []);

//       console.log("Grouped Sessions:", groupedSessions);
//       setBargainSessions(groupedSessions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
//     } catch (error) {
//       console.error("Failed to fetch sessions:", error);
//       if (error.name === 'AbortError') {
//         console.warn("Request timed out");
//       } else if (error.message.includes("401")) {
//         navigate("/loginPage");
//       } else {
//         setBargainSessions([]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [navigate]);

//   useEffect(() => {
//     const fetchData = async () => {
//         await fetchSessions();
//         const uniqueConsumerIds = [...new Set(bargainSessions.map(s => s.consumer_id))];
//         uniqueConsumerIds.forEach(consumerId => {
//             if (consumerId && !consumerProfilePhotos[consumerId]) {
//                 fetchConsumerProfilePhoto(consumerId);
//             }
//         });
//     };
//     fetchData();
//     const interval = setInterval(fetchData, 10000);
//     return () => clearInterval(interval);
//   }, [fetchSessions, fetchConsumerProfilePhoto, bargainSessions]);

//   const initializeSocketConnection = useCallback(() => {
//     const token = getToken();
//     if (!token) {
//       console.error("No token available - redirecting to login");
//       navigate("/loginPage");
//       return;
//     }

//     try {
//       const decodedToken = JSON.parse(atob(token.split(".")[1]));
//       const farmerId = decodedToken.farmer_id;

//       if (socket.current) {
//         console.log("Disconnecting existing socket connection");
//         socket.current.off();
//         socket.current.disconnect();
//         socket.current = null;
//       }

//       console.log("Initializing new socket connection for farmer list");
//       socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
//         auth: { token },
//         query: { 
//           userType: 'farmer',
//           farmerId 
//         },
//         transports: ['websocket', 'polling'],
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//         reconnectionDelayMax: 10000,
//         timeout: 20000,
//         secure: process.env.NODE_ENV === 'production',
//         rejectUnauthorized: false,
//         extraHeaders: { 
//           Authorization: `Bearer ${token}`,
//           'X-Farmer-ID': farmerId
//         }
//       });
      
//       socket.current.on('connect', () => {
//         console.log("Socket connected successfully");
//         setConnectionStatus("connected");
//         reconnectAttempts.current = 0;
//         fetchSessions();
//       });

//       socket.current.on('connect_error', (err) => {
//         console.error("Socket connection error:", err.message);
//         setConnectionStatus("error");
        
//         const maxAttempts = 5;
//         if (reconnectAttempts.current < maxAttempts) {
//           const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
//           reconnectAttempts.current += 1;
//           console.log(`Attempting reconnect #${reconnectAttempts.current} in ${delay}ms`);
//           setTimeout(() => initializeSocketConnection(), delay);
//         } else {
//           console.error("Max reconnection attempts reached");
//         }
//       });

//       socket.current.on('disconnect', (reason) => {
//         console.log("Socket disconnected. Reason:", reason);
//         setConnectionStatus("disconnected");
        
//         if (reason === "io server disconnect") {
//           setTimeout(() => initializeSocketConnection(), 1000);
//         }
//       });

//       socket.current.on('bargainMessage', (message) => {
//         console.log("New message received:", message);
//         fetchSessions(); 
//       });

//       socket.current.on('bargainStatusUpdate', (data) => {
//         console.log("Status update received:", data);
//         fetchSessions(); 
//       });

//       socket.current.on('error', (error) => {
//         console.error("Socket error:", error);
//         setConnectionStatus("error");
//       });

//     } catch (error) {
//       console.error("Socket initialization error:", error);
//       setConnectionStatus("error");
//       setTimeout(() => initializeSocketConnection(), 5000);
//     }

//     return () => {
//       if (socket.current) {
//         console.log("Cleaning up socket connection");
//         socket.current.off();
//         socket.current.disconnect();
//       }
//     };
//   }, [navigate, fetchSessions]);

//   useEffect(() => {
//     initializeSocketConnection();
//     return () => {
//       if (socket.current) {
//         socket.current.disconnect();
//       }
//     };
//   }, [initializeSocketConnection]);

//   const validateSession = (session) => {
//     if (!session) return false;
    
//     const requiredFields = [
//       'bargain_id',
//       'consumer_id',
//       'consumer_name',
//       'product_name',
//       'status',
//       'updated_at'
//     ];
    
//     return requiredFields.every(field => {
//       const isValid = session[field] !== undefined && session[field] !== null;
//       if (!isValid) {
//         console.warn(`Missing required field: ${field} in session:`, session);
//       }
//       return isValid;
//     });
//   };

//   const handleSessionSelect = (session) => {
//     if (!validateSession(session)) {
//       console.error("Invalid session data:", session);
//       return;
//     }

//     const consumerData = {
//       first_name: session.consumer_name.split(' ')[0],
//       last_name: session.consumer_name.split(' ').slice(1).join(' ') || '',
//       phone_number: session.consumer_phone || 'Not available',
//       location: session.consumer_location || 'Not specified'
//     };
    
//     const productData = {
//       produce_name: session.product_name,
//       quantity: session.quantity,
//       price_per_kg: session.initial_price,
//       current_offer: session.current_price,
//       product_id: session.product_id || `temp-${session.bargain_id}`
//     };

//     navigate(`/farmer/bargain/${session.bargain_id}`, {
//       state: {
//         consumer: consumerData,
//         product: productData,
//         initialPrice: session.current_price
//       }
//     });

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
  
//   const filteredSessions = bargainSessions
//     .filter(session => {
//       const isValid = validateSession(session);
//       if (!isValid) {
//         console.warn("Invalid session filtered out:", session);
//       }
//       return isValid;
//     })
//     .filter(session => {
//       try {
//         const search = searchTerm.toLowerCase();
//         return (
//           session.consumer_name.toLowerCase().includes(search) ||
//           session.product_name.toLowerCase().includes(search)
//         );
//       } catch (error) {
//         console.error("Error filtering session:", error, session);
//         return false;
//       }
//     });

//   useEffect(() => {
//     console.log("Current bargain sessions:", bargainSessions);
//   }, [bargainSessions]);

//   const getStatusClass = (status) => {
//     switch (status) {
//       case 'accepted':
//         return 'status-accepted';
//       case 'rejected':
//         return 'status-rejected';
//       case 'pending':
//       case 'countered':
//       default:
//         return 'status-pending';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="loading-spinner">
//         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//         <p>Loading bargain requests...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bargain-container">
//       <div className="bargain-sidebar">
//         <div className="bargain-header">
//           <h2 className="header-title">Bargain Requests</h2>
//           <Link to="/farmer-dashboard">
//             <FontAwesomeIcon icon={faLeaf} className="cart-icon-link" />
//           </Link>
//         </div>
//         <div className="search-bar">
//           <input
//             type="text"
//             placeholder="Search consumers or products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <div className="bargain-list">
//           {filteredSessions.length === 0 ? (
//             <p className="no-requests-msg">No active bargain requests.</p>
//           ) : (
//             filteredSessions.map((session) => (
//               <div
//                 key={session.bargain_id}
//                 className={`session-item ${selectedSession?.bargain_id === session.bargain_id ? 'active' : ''}`}
//                 onClick={() => handleSessionSelect(session)}
//               >
//                 <div className="session-info">
//                   {consumerProfilePhotos[session.consumer_id] ? (
//                       <img 
//                         src={consumerProfilePhotos[session.consumer_id]} 
//                         alt="Consumer Profile" 
//                         className="profile-photo" 
//                       />
//                   ) : (
//                       <div className="profile-photo placeholder">
//                           {session.consumer_name.charAt(0)}
//                       </div>
//                   )}
//                   <div className="session-details">
//                     <p className="consumer-name">{session.consumer_name}</p>
//                     <p className="bargain-details">
//                       <span className="product-name">{session.product_name}</span>
//                       <br/>
//                       <span className="prices">
//                         Base: ₹{session.initial_price} | Current: ₹{session.current_price}
//                       </span>
//                       <br/>
//                       Status: <span className={`status-text ${getStatusClass(session.status)}`}>
//                         {session.status}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//                 {session.unread_count > 0 && (
//                   <div className="unread-badge">
//                     {session.unread_count}
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </div>
  
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
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faLeaf, faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import { io } from 'socket.io-client';
import FarmerChatWindow from "./FarmerChatWindow";
import "./FarmerChatList.css";
import axios from "axios";

const FarmerChatList = () => {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const [bargainSessions, setBargainSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const socket = useRef(null);
  const reconnectAttempts = useRef(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [newMessages, setNewMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [consumerProfilePhotos, setConsumerProfilePhotos] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });

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

  // Function to fetch consumer profile photos
  const fetchConsumerProfilePhoto = useCallback(async (consumerId) => {
    try {
      const token = getToken();
      if (!token) return;

      const apiUrl = `${process.env.REACT_APP_BACKEND_URL}/api/consumer/${consumerId}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.photo) {
        const photoUrl = response.data.photo.startsWith('http')
          ? response.data.photo
          : `${process.env.REACT_APP_BACKEND_URL}${response.data.photo}`;
        
        setConsumerProfilePhotos(prev => ({
          ...prev,
          [consumerId]: photoUrl
        }));
      }
    } catch (error) {
      console.error(`Error fetching profile photo for consumer ${consumerId}:`, error);
    }
  }, []);

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

  const normalizeSession = (session) => {
    if (!session) {
      console.error("Attempted to normalize undefined session");
      return null;
    }
    const defaultSession = {
      bargain_id: '',
      consumer_id: '',
      consumer_name: 'Unknown Consumer',
      product_name: 'Unknown Product',
      quantity: 0,
      current_price: 0,
      initial_price: 0,
      status: 'pending',
      last_message: null,
      unread_count: 0,
      updated_at: new Date().toISOString()
    };
  
    const normalized = { ...defaultSession };
    for (const key in session) {
      if (session[key] !== undefined && session[key] !== null) {
        normalized[key] = session[key];
      }
    }
  
    if (!normalized.consumer_name && (session.first_name || session.last_name)) {
      normalized.consumer_name = `${session.first_name || ''} ${session.last_name || ''}`.trim() || defaultSession.consumer_name;
    }
    return normalized;
  };

  const fetchSessions = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        console.warn("No token available - redirecting to login");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const farmerId = decodedToken.farmer_id;

      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/bargain/farmers/${farmerId}/sessions`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        signal: AbortSignal.timeout(10000)
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }

      const responseData = await response.json();

      const validatedSessions = Array.isArray(responseData) 
        ? responseData
            .map(session => ({
              bargain_id: session.bargain_id?.toString() || '',
              consumer_id: session.consumer_id || '',
              consumer_name: session.consumer_name || 
                           `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
                           `Consumer ${session.consumer_id || 'Unknown'}`,
              product_name: session.product_name || 'Unknown Product',
              quantity: Number(session.quantity) || 0,
              current_price: Number(session.current_price) || 0,
              initial_price: Number(session.initial_price) || 0,
              status: session.status || 'pending',
              last_message: session.last_message || null,
              unread_count: Number(session.unread_count) || 0,
              updated_at: session.updated_at || new Date().toISOString()
            }))
            .filter(session => session.bargain_id && session.consumer_id)
        : [];

      const groupedSessions = validatedSessions.reduce((acc, session) => {
        const existingSession = acc.find(s => s.consumer_id === session.consumer_id);
        
        if (existingSession) {
          if (new Date(session.updated_at) > new Date(existingSession.updated_at)) {
            const index = acc.indexOf(existingSession);
            acc[index] = session;
          }
          existingSession.unread_count += session.unread_count;
        } else {
          acc.push(session);
        }
        
        return acc;
      }, []);

      setBargainSessions(groupedSessions);
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

  useEffect(() => {
    const fetchData = async () => {
        await fetchSessions();
        const uniqueConsumerIds = [...new Set(bargainSessions.map(s => s.consumer_id))];
        uniqueConsumerIds.forEach(consumerId => {
            if (consumerId && !consumerProfilePhotos[consumerId]) {
                fetchConsumerProfilePhoto(consumerId);
            }
        });
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchSessions, fetchConsumerProfilePhoto, bargainSessions]);

  const initializeSocketConnection = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.error("No token available - redirecting to login");
      navigate("/loginPage");
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const farmerId = decodedToken.farmer_id;

      if (socket.current) {
        socket.current.off();
        socket.current.disconnect();
        socket.current = null;
      }

      socket.current = io(process.env.REACT_APP_API_BASE_URL, {
        auth: { token },
        query: { 
          userType: 'farmer',
          farmerId 
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        timeout: 20000,
        secure: process.env.NODE_ENV === 'production',
        rejectUnauthorized: false,
        extraHeaders: { 
          Authorization: `Bearer ${token}`,
          'X-Farmer-ID': farmerId
        }
      });
      
      socket.current.on('connect', () => {
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
        fetchSessions();
      });

      socket.current.on('connect_error', (err) => {
        setConnectionStatus("error");
        
        const maxAttempts = 5;
        if (reconnectAttempts.current < maxAttempts) {
          const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
          reconnectAttempts.current += 1;
          setTimeout(() => initializeSocketConnection(), delay);
        }
      });

      socket.current.on('disconnect', (reason) => {
        setConnectionStatus("disconnected");
        
        if (reason === "io server disconnect") {
          setTimeout(() => initializeSocketConnection(), 1000);
        }
      });

      socket.current.on('bargainMessage', () => {
        fetchSessions();
      });

      socket.current.on('bargainStatusUpdate', () => {
        fetchSessions();
      });

      socket.current.on('error', (error) => {
        setConnectionStatus("error");
      });

    } catch (error) {
      setConnectionStatus("error");
      setTimeout(() => initializeSocketConnection(), 5000);
    }

    return () => {
      if (socket.current) {
        socket.current.off();
        socket.current.disconnect();
      }
    };
  }, [navigate, fetchSessions]);

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
      'consumer_id',
      'consumer_name',
      'product_name',
      'status',
      'updated_at'
    ];
    
    return requiredFields.every(field => {
      const isValid = session[field] !== undefined && session[field] !== null;
      return isValid;
    });
  };

  const handleSessionSelect = (session) => {
    if (!validateSession(session)) {
      console.error("Invalid session data:", session);
      return;
    }

    const consumerData = {
      first_name: session.consumer_name.split(' ')[0],
      last_name: session.consumer_name.split(' ').slice(1).join(' ') || '',
      phone_number: session.consumer_phone || 'Not available',
      location: session.consumer_location || 'Not specified'
    };
    
    const productData = {
      produce_name: session.product_name,
      quantity: session.quantity,
      price_per_kg: session.initial_price,
      current_offer: session.current_price,
      product_id: session.product_id || `temp-${session.bargain_id}`
    };

    navigate(`/farmer/bargain/${session.bargain_id}`, {
      state: {
        consumer: consumerData,
        product: productData,
        initialPrice: session.current_price
      }
    });

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

  // Request sort handler
  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon based on current sort configuration
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
  };

  // Sort and filter sessions
  const getSortedAndFilteredSessions = () => {
    const filtered = bargainSessions
      .filter(session => validateSession(session))
      .filter(session => {
        try {
          const search = searchTerm.toLowerCase();
          return (
            session.consumer_name.toLowerCase().includes(search) ||
            session.product_name.toLowerCase().includes(search)
          );
        } catch (error) {
          return false;
        }
      });

    // Group sessions by product name for special sorting
    const sessionsByProduct = {};
    filtered.forEach(session => {
      if (!sessionsByProduct[session.product_name]) {
        sessionsByProduct[session.product_name] = [];
      }
      sessionsByProduct[session.product_name].push(session);
    });

    // Apply sorting based on the selected criteria
    let sortedSessions = [];
    
    if (sortConfig.key === 'current_price') {
      // Special sorting: For same product, sort by price (highest first)
      Object.values(sessionsByProduct).forEach(productSessions => {
        const sortedProductSessions = [...productSessions].sort((a, b) => {
          if (sortConfig.direction === 'desc') {
            return b.current_price - a.current_price;
          } else {
            return a.current_price - b.current_price;
          }
        });
        sortedSessions = [...sortedSessions, ...sortedProductSessions];
      });
    } else {
      // Standard sorting for other fields
      sortedSessions = [...filtered].sort((a, b) => {
        if (sortConfig.key === 'updated_at') {
          const aDate = new Date(a[sortConfig.key]);
          const bDate = new Date(b[sortConfig.key]);
          if (sortConfig.direction === 'desc') {
            return bDate - aDate;
          } else {
            return aDate - bDate;
          }
        } else if (sortConfig.key === 'consumer_name' || sortConfig.key === 'product_name') {
          if (sortConfig.direction === 'desc') {
            return b[sortConfig.key].localeCompare(a[sortConfig.key]);
          } else {
            return a[sortConfig.key].localeCompare(b[sortConfig.key]);
          }
        } else {
          if (sortConfig.direction === 'desc') {
            return b[sortConfig.key] - a[sortConfig.key];
          } else {
            return a[sortConfig.key] - b[sortConfig.key];
          }
        }
      });
    }

    return sortedSessions;
  };

  const sortedAndFilteredSessions = getSortedAndFilteredSessions();

  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      case 'countered':
      default:
        return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading bargain requests...</p>
      </div>
    );
  }

  return (
    <div className="bargain-container">
      <div className="bargain-sidebar">
        <div className="bargain-header">
          <h2 className="header-title">Bargain Requests</h2>
          <Link to="/farmer-dashboard">
            <FontAwesomeIcon icon={faLeaf} className="cart-icon-link" />
          </Link>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search consumers or products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Sorting controls */}
        <div className="sorting-controls">
          <span>Sort by: </span>
          <button 
            className={`sort-button ${sortConfig.key === 'updated_at' ? 'active' : ''}`}
            onClick={() => requestSort('updated_at')}
          >
            Recent <FontAwesomeIcon icon={getSortIcon('updated_at')} />
          </button>
          <button 
            className={`sort-button ${sortConfig.key === 'current_price' ? 'active' : ''}`}
            onClick={() => requestSort('current_price')}
          >
            Price <FontAwesomeIcon icon={getSortIcon('current_price')} />
          </button>
          <button 
            className={`sort-button ${sortConfig.key === 'consumer_name' ? 'active' : ''}`}
            onClick={() => requestSort('consumer_name')}
          >
            Consumer <FontAwesomeIcon icon={getSortIcon('consumer_name')} />
          </button>
          <button 
            className={`sort-button ${sortConfig.key === 'product_name' ? 'active' : ''}`}
            onClick={() => requestSort('product_name')}
          >
            Product <FontAwesomeIcon icon={getSortIcon('product_name')} />
          </button>
        </div>
        
        <div className="bargain-list">
          {sortedAndFilteredSessions.length === 0 ? (
            <p className="no-requests-msg">No active bargain requests.</p>
          ) : (
            sortedAndFilteredSessions.map((session) => (
              <div
                key={session.bargain_id}
                className={`session-item ${selectedSession?.bargain_id === session.bargain_id ? 'active' : ''}`}
                onClick={() => handleSessionSelect(session)}
              >
                <div className="session-info">
                  {consumerProfilePhotos[session.consumer_id] ? (
                      <img 
                        src={consumerProfilePhotos[session.consumer_id]} 
                        alt="Consumer Profile" 
                        className="profile-photo" 
                      />
                  ) : (
                      <div className="profile-photo placeholder">
                          {session.consumer_name.charAt(0)}
                      </div>
                  )}
                  <div className="session-details">
                    <p className="consumer-name">{session.consumer_name}</p>
                    <p className="bargain-details">
                      <span className="product-name">{session.product_name}</span>
                      <br/>
                      <span className="prices">
                        Base: ₹{session.initial_price} | Current: ₹{session.current_price}
                      </span>
                      <br/>
                      Status: <span className={`status-text ${getStatusClass(session.status)}`}>
                        {session.status}
                      </span>
                      <br/>
                      <span className="time-text">
                        {formatDate(session.updated_at)}
                      </span>
                    </p>
                  </div>
                </div>
                {session.unread_count > 0 && (
                  <div className="unread-badge">
                    {session.unread_count}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
  
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