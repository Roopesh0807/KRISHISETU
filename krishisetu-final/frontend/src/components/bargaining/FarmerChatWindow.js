import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from "../../context/AuthContext";
import { io } from 'socket.io-client';
import {
  faSpinner,
  faRupeeSign,
  faArrowUp,
  faArrowDown,
  faTimes,
  faDoorOpen,
  faHandshake,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './FarmerChatWindow.css';

const FarmerChatWindow = () => {
  const navigate = useNavigate();
  const { bargainId } = useParams();
  const { token, farmer } = useAuth();
  const location = useLocation();
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttempts = useRef(0);

  // Extract initial state from location
  const { 
    consumer: initialConsumer,
    product: initialProduct,
    initialPrice
  } = location.state || {};

  // State management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(initialPrice || 0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [bargainStatus, setBargainStatus] = useState('pending');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState(initialConsumer || null);
  const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
  const [quantity, setQuantity] = useState(initialProduct?.quantity || 1);
  const [error, setError] = useState(null);
  const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
  const [priceSuggestions, setPriceSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(initialProduct?.price_per_kg || 0);

  // Generate price suggestions based on current price
  const generatePriceSuggestions = useCallback((basePrice) => {
    if (!basePrice || isNaN(basePrice)) return [];
    
    const suggestions = [];
    const step = 1; // ₹1 increments
    
    // Generate suggestions both above and below current price
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue; // Skip the current price
      
      const newPrice = basePrice + (i * step);
      if (newPrice <= 0) continue; // Don't suggest negative prices
      
      suggestions.push({
        amount: i * step,
        price: newPrice,
        label: `₹${newPrice} (₹${Math.abs(i * step)} ${i > 0 ? 'more' : 'less'})`
      });
    }
    
    // Sort by price (ascending)
    return suggestions.sort((a, b) => a.price - b.price);
  }, []);

  // Fetch messages from database
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    }
  };

  // WebSocket connection management
  const initializeSocketConnection = useCallback(() => {
    if (!bargainId || !token) {
      console.error("Cannot initialize socket: missing bargainId or token");
      setConnectionStatus("disconnected");
      return;
    }

    // Clear any existing socket connection
    if (socket.current) {
      socket.current.removeAllListeners();
      socket.current.disconnect();
      socket.current = null;
    }

    // Configure socket options
    const socketOptions = {
      auth: { 
        token,
        bargainId 
      },
      query: { 
        bargainId,
        userType: 'farmer'
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
        Authorization: `Bearer ${token}`
      }
    };

    console.log("Initializing socket with options:", socketOptions);

    // Create new socket connection
    socket.current = io(
      process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
      socketOptions
    );

    // Connection events
    socket.current.on('connect', () => {
      console.log("Socket connected with ID:", socket.current?.id);
      setConnectionStatus("connected");
      reconnectAttempts.current = 0;
    });

    socket.current.on('connect_error', (err) => {
      console.error("Socket connection error:", err);
      setConnectionStatus("error");
      
      // Exponential backoff reconnection
      const maxAttempts = 5;
      if (reconnectAttempts.current < maxAttempts) {
        const delay = Math.min(30000, Math.pow(2, reconnectAttempts.current) * 1000);
        reconnectAttempts.current += 1;
        console.log(`Reconnecting attempt ${reconnectAttempts.current} in ${delay}ms`);
        setTimeout(() => initializeSocketConnection(), delay);
      }
    });

    socket.current.on('disconnect', (reason) => {
      console.log("Socket disconnected:", reason);
      setConnectionStatus("disconnected");
      
      if (reason === "io server disconnect") {
        setTimeout(() => initializeSocketConnection(), 1000);
      }
    });
    // Update the socket message handling in useEffect
socket.current.on('systemMessage', (message) => {
  if (message?.content) {
    setMessages(prev => [...prev, {
      content: message.content,
      sender_type: 'system',
      timestamp: message.timestamp || new Date().toISOString()
    }]);
  }
});

    // Message handling
    socket.current.on('newMessage', (message) => {
      if (message?.content && message?.sender_type) {
        setMessages(prev => [...prev, message]);
        if (message.sender_type === 'consumer') {
          setWaitingForResponse(false);
        }
      }
    });

    // Price update handling
   // Update the priceUpdate handler to ensure it shows in messages
socket.current.on('priceUpdate', (data) => {
  if (data?.newPrice) {
    setCurrentPrice(data.newPrice);
    addSystemMessage(`Price updated to ₹${data.newPrice}/kg`); // This will now appear
    setWaitingForResponse(false);
    
    const suggestions = generatePriceSuggestions(data.newPrice);
    setPriceSuggestions(suggestions);
    setShowPriceSuggestions(true);
  }
});

    // Status update handling
    socket.current.on('bargainStatusUpdate', (status) => {
      const validStatuses = ['pending', 'accepted', 'rejected'];
      if (validStatuses.includes(status)) {
        setBargainStatus(status);
        if (status === 'accepted') {
          addSystemMessage("🎉 You accepted the consumer's offer!");
        } else if (status === 'rejected') {
          addSystemMessage("❌ You declined the consumer's offer");
        }
        setWaitingForResponse(false);
      }
    });

    // Typing indicator
    socket.current.on('typing', (isTyping) => {
      setIsTyping(Boolean(isTyping));
    });

    // Error handling
    socket.current.on('error', (error) => {
      console.error("Socket error:", error);
      setError(error.message || "WebSocket communication error");
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [bargainId, token, generatePriceSuggestions]);

  // Helper function to add system messages
  const addSystemMessage = (content) => {
    setMessages(prev => [
      ...prev,
      {
        content,
        sender_type: "system",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // Initialize socket connection and fetch data
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        
        // Fetch messages and bargain data if not passed via location state
        await fetchMessages();
        
        if (!selectedProduct || !selectedConsumer) {
          const response = await fetch(
            `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          const data = await response.json();
          
          if (data.consumer && !selectedConsumer) {
            setSelectedConsumer(data.consumer);
          }
          
          if (data.product && !selectedProduct) {
            setSelectedProduct(data.product);
            setCurrentPrice(data.product.current_offer || data.product.price_per_kg);
            setOriginalPrice(data.product.price_per_kg);
            setQuantity(data.product.quantity || 1);
          }
          
          if (data.status) {
            setBargainStatus(data.status);
          }
        }
        
        initializeSocketConnection();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (bargainId && token) {
      initializeChat();
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [bargainId, token, initializeSocketConnection]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle price selection (farmer's counter offer)
  const handlePriceSelection = (price) => {
    if (!socket.current || !socket.current.connected) {
      setError("Connection not established");
      return;
    }

    const messageContent = `💰 Counter offered ₹${price}/kg`;
    
    addSystemMessage(messageContent);
    setCurrentPrice(price);
    setShowPriceSuggestions(false);
    setWaitingForResponse(true);

    // Emit the price offer to the server
    socket.current.emit('priceOffer', {
      price,
      bargainId,
      productId: selectedProduct?.product_id,
      quantity: quantity
    });

    // Also send as a message
    socket.current.emit('sendMessage', {
      bargainId,
      content: messageContent,
      senderType: 'farmer'
    });
  };

  // Handle bargain status change (accept/reject)
  const handleBargainStatus = (status) => {
    if (!socket.current || !socket.current.connected) {
      setError("Connection not established");
      return;
    }

    socket.current.emit('updateBargainStatus', {
      bargainId,
      status
    });
    
    setBargainStatus(status);
    setShowPriceSuggestions(false);
    
    const statusMessage = status === 'accepted' 
      ? `You accepted the offer at ₹${currentPrice}/kg`
      : "You declined the offer";
    
    addSystemMessage(statusMessage);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading bargain session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Chat</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/farmer-dashboard')} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!selectedProduct || !selectedConsumer) {
    return (
      <div className="error-container">
        <h3>Missing Data</h3>
        <p>Could not load product or consumer information</p>
        <button onClick={() => navigate('/farmer/bargain')} className="back-btn">
          Back to Bargain List
        </button>
      </div>
    );
  }

  return (
    <div className="farmer-chat-container">
      <div className="chat-interface animate__animated animate__fadeIn">
        <button 
          onClick={() => navigate('/farmer-dashboard')} 
          className="unique-close-btn"
          title="Exit Chat"
        >
          <FontAwesomeIcon icon={faDoorOpen} />
          <span>Exit</span>
        </button>
        
        {/* Chat Header */}
        <div className="chat-header">
          <div className="header-top">
            <h2>
              <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedConsumer.first_name} {selectedConsumer.last_name}
            </h2>
            <span className={`connection-status ${connectionStatus}`}>
              {connectionStatus.toUpperCase()}
            </span>
          </div>
          
          {/* <div className="consumer-info">
            <p><strong>Consumer:</strong> {selectedConsumer.first_name} {selectedConsumer.last_name}</p>
            {selectedConsumer.phone_number && <p><strong>Phone:</strong> {selectedConsumer.phone_number}</p>}
            {selectedConsumer.location && <p><strong>Location:</strong> {selectedConsumer.location}</p>}
          </div> */}
          
          <div className="product-info">
            <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
            <p><strong>Quantity:</strong> {quantity}kg</p>
            <div className="price-display">
              <span className="current-price">
                <strong>Current Offer:</strong> ₹{currentPrice}/kg
              </span>
              <span className="base-price">
                <strong>Your Price:</strong> ₹{originalPrice}/kg
              </span>
              <span className="total-price">
                <strong>Total:</strong> ₹{(quantity * currentPrice).toFixed(2)}
              </span>
            </div>
            {bargainStatus === 'accepted' && (
              <p className="status-accepted">
                <FontAwesomeIcon icon={faCheckCircle} /> Offer Accepted!
              </p>
            )}
            {bargainStatus === 'rejected' && (
              <p className="status-rejected">
                <FontAwesomeIcon icon={faTimesCircle} /> Offer Declined
              </p>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Waiting for consumer...</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={`msg-${index}`} 
                className={`message ${msg.sender_type} animate__animated animate__fadeIn`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="message-content">
                  {msg.content}
                </div>
                <div className="message-meta">
                  <span className="sender">
                    {msg.sender_type === 'farmer' ? 'You' : 
                     msg.sender_type === 'consumer' ? `${selectedConsumer.first_name} ${selectedConsumer.last_name}` : 'System'}
                  </span>
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <span>{selectedConsumer.first_name} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Controls */}
        <div className="chat-controls">
          {showPriceSuggestions && bargainStatus === 'pending' && (
            <div className="price-suggestions animate__animated animate__fadeInUp">
              <h4>Respond to Offer:</h4>
              <div className="suggestion-buttons">
                {priceSuggestions.map((suggestion, index) => (
                  <button
                    key={`price-${index}`}
                    onClick={() => handlePriceSelection(suggestion.price)}
                    className={`suggestion-btn ${suggestion.amount > 0 ? 'increase' : 'decrease'}`}
                    disabled={waitingForResponse}
                  >
                    <div className="price-change">
                      {suggestion.amount > 0 ? (
                        <FontAwesomeIcon icon={faArrowUp} />
                      ) : (
                        <FontAwesomeIcon icon={faArrowDown} />
                      )}
                      ₹{suggestion.price}
                    </div>
                    <div className="price-label">{suggestion.label}</div>
                  </button>
                ))}
              </div>
              
              <div className="action-buttons">
                <button 
                  className="accept-btn"
                  onClick={() => handleBargainStatus('accepted')}
                  disabled={waitingForResponse}
                >
                  <FontAwesomeIcon icon={faCheckCircle} /> Accept Offer
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => handleBargainStatus('rejected')}
                  disabled={waitingForResponse}
                >
                  <FontAwesomeIcon icon={faTimesCircle} /> Decline Offer
                </button>
              </div>
            </div>
          )}

          {waitingForResponse && (
            <div className="waiting-indicator animate__animated animate__pulse animate__infinite">
              <FontAwesomeIcon icon={faSpinner} spin /> Waiting for consumer's response...
            </div>
          )}

          {bargainStatus === 'accepted' && (
            <div className="accepted-actions animate__animated animate__fadeIn">
              <button 
                className="primary-action animate__animated animate__pulse"
                onClick={() => navigate('/farmer-dashboard')}
              >
                Back to Dashboard
              </button>
              <button 
                className="secondary-action"
                onClick={() => navigate('/farmer-orders')}
              >
                View Orders
              </button>
            </div>
          )}

          {bargainStatus === 'rejected' && (
            <div className="rejected-actions animate__animated animate__fadeIn">
              <button 
                className="primary-action"
                onClick={() => navigate('/farmer-dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerChatWindow;