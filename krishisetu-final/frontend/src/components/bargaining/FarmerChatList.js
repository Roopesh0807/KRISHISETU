import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { io } from 'socket.io-client';
import FarmerChatWindow from "./FarmerChatWindow";
import "./FarmerChatList.css";
import {
  faListAlt,
  faShoppingCart
} from '@fortawesome/free-solid-svg-icons';


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


  // Helper function to normalize session data
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
  
    // Safely merge the incoming session with defaults
    const normalized = { ...defaultSession };
    for (const key in session) {
      if (session[key] !== undefined && session[key] !== null) {
        normalized[key] = session[key];
      }
    }
  
    // Special handling for consumer name
    if (!normalized.consumer_name && 
        (session.first_name || session.last_name)) {
      normalized.consumer_name = 
        `${session.first_name || ''} ${session.last_name || ''}`.trim() || 
        defaultSession.consumer_name;
    }
  
    return normalized;
  };
 // Update your fetchSessions function
//  const fetchSessions = useCallback(async () => {
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
//     console.log("API Response:", data); // Debug log
    
//     setBargainSessions(prev => {
//       // Create a map of existing sessions for reference
//       const existingMap = new Map(prev.map(s => [s.bargain_id, s]));

//       // Transform API data to match your UI requirements
//       const apiSessions = Array.isArray(data) ? data.map(session => ({
//         bargain_id: session.bargain_id.toString(),
//         consumer_id: session.consumer_id,
//         consumer_name: session.consumer_name || `Consumer ${session.consumer_id}`,
//         product_name: session.product_name || 'Unknown Product',
//         quantity: session.quantity || 0,
//         current_price: session.current_price || 0,
//         initial_price: session.initial_price || 0,
//         status: session.status || 'pending',
//         last_message: session.last_message || null,
//         unread_count: session.unread_count || 0,
//         updated_at: session.updated_at || session.created_at || new Date().toISOString()
//       })) : [];

//       // Merge with existing sessions
//       const mergedSessions = [
//         ...apiSessions,
//         ...Array.from(existingMap.values()).filter(
//           existing => !apiSessions.some(s => s.bargain_id === existing.bargain_id)
//         )
//       ];

//       return mergedSessions.sort((a, b) => 
//         new Date(b.updated_at) - new Date(a.updated_at)
//       );
//     });

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
    if (!token) {
      console.warn("No token available - redirecting to login");
      navigate("/loginPage");
      return;
    }

    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const farmerId = decodedToken.farmer_id;
    console.log(`Fetching sessions for farmer: ${farmerId}`);

    const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/farmers/${farmerId}/sessions`;
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
          .filter(session => {
            const isValid = session.bargain_id && session.consumer_id;
            if (!isValid) {
              console.warn("Invalid session filtered out:", session);
            }
            return isValid;
          })
      : [];

    // Group sessions by consumer and keep only the most recent one
    const groupedSessions = validatedSessions.reduce((acc, session) => {
      const existingSession = acc.find(s => s.consumer_id === session.consumer_id);
      
      if (existingSession) {
        // Replace if this session is more recent
        if (new Date(session.updated_at) > new Date(existingSession.updated_at)) {
          const index = acc.indexOf(existingSession);
          acc[index] = session;
        }
        // Sum unread counts
        existingSession.unread_count += session.unread_count;
      } else {
        acc.push(session);
      }
      
      return acc;
    }, []);

    console.log("Grouped Sessions:", groupedSessions);
    setBargainSessions(groupedSessions.sort((a, b) => 
      new Date(b.updated_at) - new Date(a.updated_at)
    ));

  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    
    if (error.name === 'AbortError') {
      console.warn("Request timed out");
      // Optionally show timeout message to user
    } else if (error.message.includes("401")) {
      navigate("/loginPage");
    } else {
      // Show generic error to user if needed
      setBargainSessions([]); // Clear any existing sessions on error
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
        const farmerId = decodedToken.farmer_id;
    
        // Close existing connection if any
        if (socket.current) {
          console.log("Disconnecting existing socket connection");
          socket.current.off(); // Remove all listeners
          socket.current.disconnect();
          socket.current = null;
        }
    
        console.log("Initializing new socket connection");
        socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
          auth: { token },
          query: { farmerId },
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
            'X-Farmer-ID': farmerId
          }
        });
        
        // Connection events
        socket.current.on('connect', () => {
          console.log("Socket connected successfully");
          setConnectionStatus("connected");
          reconnectAttempts.current = 0;
          // Fetch latest sessions after connection
          fetchSessions();
        });
    
        socket.current.on('connect_error', (err) => {
          console.error("Socket connection error:", err.message);
          setConnectionStatus("error");
          
          // Exponential backoff for reconnection
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
            // Server explicitly disconnected, try to reconnect
            console.log("Server initiated disconnect - attempting reconnect");
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
    
        // socket.current.on('bargainMessage', (message) => {
        //   console.log("Raw message:", message); // Debug log
        //   setBargainSessions(prev => {
        //     const existingIndex = prev.findIndex(
        //       s => s.bargain_id === message.bargainId || s.bargain_id === message.bargain_id
        //     );
        
        //     const newSession = {
        //       bargain_id: message.bargainId || message.bargain_id,
        //       consumer_id: message.consumer_id,
        //       consumer_name: message.consumer_name || `Consumer ${message.consumer_id}`,
        //       product_name: extractProductName(message.message?.content) || 'Product',
        //       quantity: extractQuantity(message.message?.content) || 0,
        //       current_price: extractPrice(message.message?.content) || 0,
        //       initial_price: extractPrice(message.message?.content) || 0,
        //       status: 'pending',
        //       last_message: {
        //         content: message.message?.content,
        //         timestamp: message.message?.timestamp || new Date().toISOString(),
        //         sender_type: message.senderType
        //       },
        //       unread_count: 1,
        //       updated_at: new Date().toISOString()
        //     };
        
        //     if (existingIndex >= 0) {
        //       const updated = [...prev];
        //       updated[existingIndex] = {
        //         ...updated[existingIndex],
        //         ...newSession,
        //         unread_count: (updated[existingIndex].unread_count || 0) + 1
        //       };
        //       return updated;
        //     } else {
        //       return [newSession, ...prev];
        //     }
        //   });
        // });
    
        socket.current.on('bargainMessage', (message) => {
          setBargainSessions(prev => {
            const existingIndex = prev.findIndex(s => s.bargain_id === message.bargainId);
            
            const newSessionData = {
              bargain_id: message.bargainId,
              consumer_id: message.consumer_id,
              consumer_name: message.consumer_name || `Consumer ${message.consumer_id}`,
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
      'consumer_id',
      'consumer_name',
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
    if (!validateSession(session)) {
      console.error("Invalid session data:", session);
      return;
    }
  
    // Prepare consumer and product data for the chat window
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
  
    // Navigate to chat window with state
    navigate(`/farmer/bargain/${session.bargain_id}`, {
      state: {
        consumer: consumerData,
        product: productData,
        initialPrice: session.current_price
      }
    });
  
    // Clear any new messages for this session
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
        session.consumer_name.toLowerCase().includes(search) ||
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
    <div className="farmer-chat-app">
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
        
        {/* Add the new action buttons here */}
        <div className="action-buttons">
  <Link to="/farmer-orders" className="action-button">
    <FontAwesomeIcon icon={faListAlt} />
    <span>View Orders</span>
  </Link>
  {/* <Link to="/view-cart" className="action-button">
    <FontAwesomeIcon icon={faShoppingCart} />
    <span>View Cart</span>
  </Link> */}
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
              key={`session-${session.bargain_id }`}
                className={`session-card ${farmerId === session.bargain_id ? "active" : ""}`}
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