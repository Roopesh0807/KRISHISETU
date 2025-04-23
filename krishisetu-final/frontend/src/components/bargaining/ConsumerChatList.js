import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faListAlt, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { io } from 'socket.io-client';
import ConsumerChatWindow from "./ConsumerChatWindow";
import "./ConsumerChatList.css";
import axios from "axios";

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
  const [farmerProfilePhotos, setFarmerProfilePhotos] = useState({});

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
const fetchFarmerProfilePhoto = useCallback(async (farmerId) => {
  try {
    const token = getToken();
    if (!token) return null;

    const response = await axios.get(
      `http://localhost:5000/api/farmerprofile/${farmerId}/personal`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data?.profile_photo) {
      const photoUrl = response.data.profile_photo.startsWith('http')
        ? response.data.profile_photo
        : `http://localhost:5000${response.data.profile_photo}`;
      
      setFarmerProfilePhotos(prev => ({
        ...prev,
        [farmerId]: photoUrl
      }));
      
      return photoUrl;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching profile photo for farmer ${farmerId}:`, error);
    return null;
  }
}, []);
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

  const normalizeSession = (session) => {
    if (!session) {
      console.error("Attempted to normalize undefined session");
      return null;
    }
  
    const defaultSession = {
      bargain_id: '',
      farmer_id: '',
      farmer_name: 'Unknown Farmer',
      farmer_profile_photo: null, // Add this field
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
  const groupSessionsByFarmer = (sessions) => {
    const grouped = {};
    
    sessions.forEach(session => {
      if (!grouped[session.farmer_id]) {
        grouped[session.farmer_id] = {
          farmer_id: session.farmer_id,
          farmer_name: session.farmer_name,
          farmer_profile_photo: farmerProfilePhotos[session.farmer_id] || null,
          sessions: [],
          unread_count: 0,
          last_updated: session.updated_at
        };
      }
      
      grouped[session.farmer_id].sessions.push(session);
      grouped[session.farmer_id].unread_count += session.unread_count || 0;
      
      if (new Date(session.updated_at) > new Date(grouped[session.farmer_id].last_updated)) {
        grouped[session.farmer_id].last_updated = session.updated_at;
      }
    });
    
    return Object.values(grouped).map(group => ({
      ...group,
      sessions: group.sessions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    })).sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
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

  const handleSessionSelect = (group) => {
    // If we're passing the whole group, get the latest session
    const session = Array.isArray(group?.sessions) ? group.sessions[0] : group;
    
    if (!validateSession(session)) {
      console.error("Invalid session data:", session);
      return;
    }
  
    // Prepare farmer and product data for the chat window
    const farmerData = {
      first_name: session.farmer_name.split(' ')[0],
      last_name: session.farmer_name.split(' ').slice(1).join(' ') || '',
      phone_number: session.farmer_phone || 'Not available',
      location: session.farmer_location || 'Not specified',
      profile_photo: group.farmer_profile_photo || null // Add this
    };
  
  
    const productData = {
      produce_name: session.product_name,
      quantity: session.quantity,
      price_per_kg: session.initial_price,
      current_offer: session.current_price,
      product_id: session.product_id || `temp-${session.bargain_id}`
    };
  
    // Navigate to chat window with state
    navigate(`/bargain/${session.bargain_id}`, {
      state: {
        farmer: farmerData,
        product: productData,
        initialPrice: session.current_price,
        allSessions: group.sessions || [session] // Pass all sessions if available
      }
    });
  
    // Clear any new messages for all sessions in this group
    setNewMessages(prev => {
      const updated = { ...prev };
      if (group.sessions) {
        group.sessions.forEach(s => delete updated[s.bargain_id]);
      } else {
        delete updated[session.bargain_id];
      }
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

  const filteredSessions = groupSessionsByFarmer(
    bargainSessions
      .filter(session => validateSession(session))
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
      })
  );

  useEffect(() => {
    console.log("Current bargain sessions:", bargainSessions);
  }, [bargainSessions]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchSessions();
      
      // After sessions are loaded, fetch profile photos for each unique farmer
      const uniqueFarmerIds = [...new Set(bargainSessions.map(s => s.farmer_id))];
      uniqueFarmerIds.forEach(farmerId => {
        if (!farmerProfilePhotos[farmerId]) {
          fetchFarmerProfilePhoto(farmerId);
        }
      });
    };
  
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchSessions, fetchFarmerProfilePhoto, bargainSessions, farmerProfilePhotos]);
   
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
            filteredSessions.map((group) => {
              const latestSession = group.sessions[0];
              const productCount = group.sessions.length;
              
              return (
                <div
                  key={`farmer-${group.farmer_id}`}
                  className={`session-card ${consumerId === latestSession.bargain_id ? "active" : ""}`}
                  onClick={() => handleSessionSelect(group)}
                >
                  {group.farmer_profile_photo ? (
                    <img 
                      src={group.farmer_profile_photo} 
                      alt="Farmer" 
                      className="farmer-avatar-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.className = 'farmer-avatar';
                        e.target.textContent = group.farmer_name.charAt(0).toUpperCase();
                      }}
                    />
                  ) : (
                    <div className="farmer-avatar">
                      {group.farmer_name.charAt(0).toUpperCase()}
                    </div>
                  )} 
                  <div className="session-content">
                    <div className="session-header">
                      <h3>{group.farmer_name}</h3>
                      <span className="session-time">
                        {formatDate(group.last_updated)}
                      </span>
                    </div>
                    
                    <div className="session-preview">
                      <p className="message-preview">
                        {productCount > 1 
                          ? `${productCount} active bargains` 
                          : latestSession.product_name}
                      </p>
                      
                      {group.unread_count > 0 && (
                        <div className="unread-badge">
                          {group.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {group.unread_count > 0 && (
                    <div className="unread-badge">
                      {group.unread_count}
                    </div>
                  )}
                </div>
              );
            })
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