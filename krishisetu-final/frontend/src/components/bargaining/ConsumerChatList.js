import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faListAlt, faShoppingCart, faLeaf, faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
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
      farmer_profile_photo: null,
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
  
  const groupSessionsByFarmerAndProduct = (sessions) => {
    const grouped = {};
    
    sessions.forEach(session => {
      const key = `${session.farmer_id}-${session.product_name}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          farmer_id: session.farmer_id,
          farmer_name: session.farmer_name,
          farmer_profile_photo: farmerProfilePhotos[session.farmer_id] || null,
          product_name: session.product_name,
          sessions: [],
          unread_count: 0,
          last_updated: session.updated_at,
          best_price: session.current_price,
          initial_price: session.initial_price
        };
      }
      
      grouped[key].sessions.push(session);
      grouped[key].unread_count += session.unread_count || 0;
      
      // Track the best (lowest) price for this product from this farmer
      if (session.current_price < grouped[key].best_price) {
        grouped[key].best_price = session.current_price;
      }
      
      if (new Date(session.updated_at) > new Date(grouped[key].last_updated)) {
        grouped[key].last_updated = session.updated_at;
      }
    });
    
    return Object.values(grouped).map(group => ({
      ...group,
      sessions: group.sessions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    }));
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
        signal: AbortSignal.timeout(10000)
      });

      console.log("Response Status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }

      const responseData = await response.json();
      console.log("Raw API Data:", responseData);

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

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

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

      if (socket.current) {
        console.log("Disconnecting existing socket connection");
        socket.current.off();
        socket.current.disconnect();
        socket.current = null;
      }

      console.log("Initializing new socket connection for consumer list");
      socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
        auth: { token },
        query: { 
          userType: 'consumer',
          consumerId 
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
          'X-Consumer-ID': consumerId
        }
      });
      
      socket.current.on('connect', () => {
        console.log("Socket connected successfully");
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
        fetchSessions();
      });

      socket.current.on('connect_error', (err) => {
        console.error("Socket connection error:", err.message);
        setConnectionStatus("error");
        
        const maxAttempts = 5;
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

      socket.current.on('bargainMessage', (message) => {
        console.log("New message received:", message);
        fetchSessions();
      });

      socket.current.on('bargainStatusUpdate', (data) => {
        console.log("Status update received:", data);
        fetchSessions();
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
    const session = Array.isArray(group?.sessions) ? group.sessions[0] : group;
    
    if (!validateSession(session)) {
      console.error("Invalid session data:", session);
      return;
    }
  
    const farmerData = {
      first_name: session.farmer_name.split(' ')[0],
      last_name: session.farmer_name.split(' ').slice(1).join(' ') || '',
      phone_number: session.farmer_phone || 'Not available',
      location: session.farmer_location || 'Not specified',
      profile_photo: group.farmer_profile_photo || null
    };
  
    const productData = {
      produce_name: session.product_name,
      quantity: session.quantity,
      price_per_kg: session.initial_price,
      current_offer: session.current_price,
      product_id: session.product_id || `temp-${session.bargain_id}`
    };
  
    navigate(`/bargain/${session.bargain_id}`, {
      state: {
        farmer: farmerData,
        product: productData,
        initialPrice: session.current_price,
        allSessions: group.sessions || [session]
      }
    });
  
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
    const groupedSessions = groupSessionsByFarmerAndProduct(
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

    // Apply sorting based on the selected criteria
    return [...groupedSessions].sort((a, b) => {
      if (sortConfig.key === 'updated_at') {
        const aDate = new Date(a[sortConfig.key]);
        const bDate = new Date(b[sortConfig.key]);
        if (sortConfig.direction === 'desc') {
          return bDate - aDate;
        } else {
          return aDate - bDate;
        }
      } else if (sortConfig.key === 'farmer_name' || sortConfig.key === 'product_name') {
        if (sortConfig.direction === 'desc') {
          return b[sortConfig.key].localeCompare(a[sortConfig.key]);
        } else {
          return a[sortConfig.key].localeCompare(b[sortConfig.key]);
        }
      } else if (sortConfig.key === 'current_price') {
        if (sortConfig.direction === 'desc') {
          return b.best_price - a.best_price;
        } else {
          return a.best_price - b.best_price;
        }
      } else {
        if (sortConfig.direction === 'desc') {
          return b[sortConfig.key] - a[sortConfig.key];
        } else {
          return a[sortConfig.key] - b[sortConfig.key];
        }
      }
    });
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

  // Check if a price is a good deal (at least 10% lower than initial price)
  const isGoodDeal = (currentPrice, initialPrice) => {
    return currentPrice <= initialPrice * 0.9;
  };

  // Check if a price is the best available for this product
  const isBestPrice = (group, session) => {
    return session.current_price === group.best_price;
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchSessions();
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
      <div className="loading-spinner">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading bargain requests...</p>
      </div>
    );
  }

  return (
    <div className="bargain-container">
      {/* Sidebar - Chat List */}
      <div className="bargain-sidebar">
        <div className="bargain-header">
          <h2 className="header-title">Bargain Requests</h2>
          <Link to="/consumer-dashboard">
            <FontAwesomeIcon icon={faLeaf} className="cart-icon-link" />
          </Link>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search farmers or products..."
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
            className={`sort-button ${sortConfig.key === 'farmer_name' ? 'active' : ''}`}
            onClick={() => requestSort('farmer_name')}
          >
            Farmer <FontAwesomeIcon icon={getSortIcon('farmer_name')} />
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
            sortedAndFilteredSessions.map((group) => {
              const latestSession = group.sessions[0];
              const sessionCount = group.sessions.length;
              
              return (
                <div
                  key={`${group.farmer_id}-${group.product_name}`}
                  className={`session-item ${selectedSession && latestSession.bargain_id === selectedSession.bargain_id ? 'active' : ''}`}
                  onClick={() => handleSessionSelect(group)}
                >
                  <div className="session-info">
                    {group.farmer_profile_photo ? (
                      <img src={group.farmer_profile_photo} alt="Farmer Profile" className="profile-photo" />
                    ) : (
                      <div className="profile-photo placeholder">
                        {group.farmer_name.charAt(0)}
                      </div>
                    )}
                    <div className="session-details">
                      <p className="farmer-name">{group.farmer_name}</p>
                      
                      <p className="bargain-details">
                        <span className="product-name">
                          {group.product_name}
                          {sessionCount > 1 && ` (${sessionCount} offers)`}
                        </span>
                        
                        <br/>
                        <span className="prices">
                          Base: ₹{group.initial_price} | 
                          Current: <span className={`current-price ${isGoodDeal(group.best_price, group.initial_price) ? 'good-deal' : ''}`}>
                            ₹{group.best_price}
                          </span>
                          {isGoodDeal(group.best_price, group.initial_price) && (
                            <span className="deal-badge">Good Deal!</span>
                          )}
                        </span>
                        <br/>
                        Status: <span className={`status-text ${getStatusClass(latestSession.status)}`}>
                          {latestSession.status}
                        </span>
                        <br/>
                        <span className="time-text">
                          {formatDate(group.last_updated)}
                        </span>
                      </p>
                      
                      {group.unread_count > 0 && (
                        <div className="unread-badge">
                          {group.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Show best price indicator if there are multiple sessions */}
                  {sessionCount > 1 && (
                    <div className="best-price-indicator">
                      Best Price
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