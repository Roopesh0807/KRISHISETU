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
    const numericPrice = parseFloat(basePrice);
    if (isNaN(numericPrice)) return [];
    
    const suggestions = [];
    const steps = [-3, -2, -1, 1, 2, 3]; // ₹1 increments
    
    steps.forEach(step => {
      const newPrice = numericPrice + step;
      if (newPrice > 0) { // Only positive prices
        suggestions.push({
          amount: step,
          price: newPrice,
          label: `₹${newPrice} (₹${Math.abs(step)} ${step > 0 ? 'more' : 'less'})`
        });
      }
    });
    
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
  // In initializeSocketConnection, update the newMessage handler:
  socket.current.on('newMessage', (message) => {
    if (message?.content && message?.sender_type) {
      setMessages(prev => [...prev, message]);
      
      // Show suggestions for any consumer message
      if (message.sender_type === 'consumer') {
        // Extract price from message content if available
        const priceMatch = message.content.match(/₹(\d+)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : currentPrice;
        
        const suggestions = generatePriceSuggestions(price);
        setPriceSuggestions(suggestions);
        setShowPriceSuggestions(true);
        setCurrentPrice(price); // Update current price if found in message
      }
    }
  });
    // Price update handling
   // Update the priceUpdate handler to ensure it shows in messages
  // Update the priceUpdate handler in initializeSocketConnection
socket.current.on('priceUpdate', (data) => {
  if (data?.newPrice) {
    setCurrentPrice(data.newPrice);
    addSystemMessage(`Price updated to ₹${data.newPrice}/kg`);
    
    // Always show suggestions after price update from consumer
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

  useEffect(() => {
    console.log('Current Price Suggestions:', {
      show: showPriceSuggestions,
      count: priceSuggestions.length,
      suggestions: priceSuggestions,
      currentPrice
    });
  }, [priceSuggestions, showPriceSuggestions, currentPrice]);
  const handlePriceSelection = async (price) => {
    try {
      // Immediately update UI
      setCurrentPrice(price);
      setShowPriceSuggestions(false);
      
      // Create message content
      const messageContent = `💰 Counter offer: ₹${price}/kg`;
      
      // Save message to database
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            sender_role: 'farmer',
            sender_id: farmer.farmer_id,
            message_content: messageContent,
            price_suggestion: price,
            message_type: 'counter_offer'
          })
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to save message');
      }
  
      const savedMessage = await response.json();
      setMessages(prev => [...prev, savedMessage]);
  
      // Notify consumer via socket
      if (socket.current?.connected) {
        socket.current.emit('priceUpdate', {
          bargainId,
          newPrice: price,
          productId: selectedProduct.product_id
        });
        
        socket.current.emit('newMessage', savedMessage);
      }
  
    } catch (err) {
      console.error('Error handling price selection:', err);
      setError(err.message);
      // Re-show suggestions if there was an error
      setShowPriceSuggestions(true);
    }
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
      <div className="suggestion-header">
        <h4>Make a Counter Offer:</h4>
        <button 
          onClick={() => setShowPriceSuggestions(false)}
          className="close-suggestions"
          title="Close suggestions"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      {priceSuggestions.length > 0 ? (
        <div className="suggestion-buttons-grid">
          {priceSuggestions.map((suggestion, index) => (
            <button
              key={`suggestion-${index}`}
              onClick={() => handlePriceSelection(suggestion.price)}
              className={`suggestion-btn ${
                suggestion.amount > 0 ? 'increase' : 'decrease'
              } animate__animated animate__fadeIn`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="suggestion-icon">
                <FontAwesomeIcon icon={suggestion.amount > 0 ? faArrowUp : faArrowDown} />
              </div>
              <div className="suggestion-details">
                <span className="suggestion-price">₹{suggestion.price}/kg</span>
                <span className="suggestion-diff">
                  (₹{Math.abs(suggestion.amount)} {suggestion.amount > 0 ? 'more' : 'less'})
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="no-suggestions">
          <p>No valid suggestions available</p>
        </div>
      )}
    </div>
  )}

  {/* Action buttons when no suggestions are shown */}
  {!showPriceSuggestions && bargainStatus === 'pending' && (
    <div className="bargain-actions">
      <button
        onClick={() => {
          setPriceSuggestions(generatePriceSuggestions(currentPrice));
          setShowPriceSuggestions(true);
        }}
        className="show-suggestions-btn"
      >
        <FontAwesomeIcon icon={faHandshake} /> Make Counter Offer
      </button>
      
      <div className="status-buttons">
        <button
          onClick={() => handleBargainStatus('accepted')}
          className="accept-btn"
          disabled={waitingForResponse}
        >
          <FontAwesomeIcon icon={faCheckCircle} /> Accept Offer
        </button>
        <button
          onClick={() => handleBargainStatus('rejected')}
          className="reject-btn"
          disabled={waitingForResponse}
        >
          <FontAwesomeIcon icon={faTimesCircle} /> Decline
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