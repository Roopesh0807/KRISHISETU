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
  faTimesCircle,
  faLeaf,
  faUserTie,
  faWeightHanging,
  faPercentage
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
  const [waitingForConsumerResponse, setWaitingForConsumerResponse] = useState(false);

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

    socket.current.on('systemMessage', (message) => {
      if (message?.content) {
        setMessages(prev => [...prev, {
          content: message.content,
          sender_type: 'system',
          timestamp: message.timestamp || new Date().toISOString()
        }]);
      }
    });

    socket.current.on('newMessage', (message) => {
      if (message?.message_content) {
        const formattedMessage = {
          ...message,
          content: message.message_content,
          timestamp: message.created_at,
          sender_type: message.sender_role === 'system' ? 'system' : message.sender_role
        };
        
        setMessages(prev => [...prev, formattedMessage]);
        
        if (message.sender_role === 'consumer') {
          // Show price suggestions when consumer makes an offer
          const priceMatch = message.message_content.match(/₹(\d+)/);
          const price = priceMatch ? parseFloat(priceMatch[1]) : currentPrice;
          
          const suggestions = generatePriceSuggestions(price);
          setPriceSuggestions(suggestions);
          setShowPriceSuggestions(true);
          setCurrentPrice(price);
        }
      }
    });

    socket.current.on('bargainStatusUpdate', (data) => {
      const { status, currentPrice, initiatedBy } = data;
      
      // Farmer's perspective
      if (initiatedBy === 'farmer') {
        // Farmer initiated this action
        if (status === 'accepted') {
          addSystemMessage(`✅ You accepted the offer at ₹${currentPrice}/kg`);
        } else if (status === 'rejected') {
          addSystemMessage(`❌ You rejected the offer at ₹${currentPrice}/kg`);
        }
      } else {
        // Consumer initiated this action
        if (status === 'accepted') {
          addSystemMessage(`🎉 ${selectedConsumer.first_name} accepted your offer at ₹${currentPrice}/kg`);
        } else if (status === 'rejected') {
          addSystemMessage(`😞 ${selectedConsumer.first_name} rejected your offer`);
        }
      }
      
      setBargainStatus(status);
      setCurrentPrice(currentPrice);
      setWaitingForResponse(false);
      setWaitingForConsumerResponse(false);
    });

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

    socket.current.on('consumerResponse', (response) => {
      if (response.type === 'counter_offer') {
        setCurrentPrice(response.price);
        setPriceSuggestions(generatePriceSuggestions(response.price));
        setShowPriceSuggestions(true);
      }
      setWaitingForConsumerResponse(false);
    });

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

  // Handle bargain status change (accept/reject)
  const handleBargainStatus = async (status) => {
    if (!socket.current || !socket.current.connected) {
      setError("Connection not established");
      return;
    }
  
    try {
      setWaitingForResponse(true);
      
      // First save to database
      const messageContent = status === 'accepted' 
        ? `✅ You accepted the offer at ₹${currentPrice}/kg`
        : `❌ You rejected the offer at ₹${currentPrice}/kg`;
      
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
            message_type: status === 'accepted' ? 'accept' : 'reject',
            price_suggestion: currentPrice
          })
        }
      );
  
      if (!response.ok) throw new Error('Failed to save status message');
  
      const savedMessage = await response.json();
      setMessages(prev => [...prev, savedMessage]);
      
      // Then emit socket event
      socket.current.emit('updateBargainStatus', {
        bargainId,
        status,
        currentPrice,
        userId: farmer.farmer_id,
        userType: 'farmer'
      });
  
      setBargainStatus(status);
      setShowPriceSuggestions(false);
      
    } catch (err) {
      setError(err.message);
      setWaitingForResponse(false);
    }
  };

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

  const handlePriceSelection = async (price) => {
    try {
      setWaitingForConsumerResponse(true);
      setCurrentPrice(price);
      setShowPriceSuggestions(false);
      
      const messageContent = `💰 Counter offer: ₹${price}/kg for ${quantity}kg of ${selectedProduct.produce_name}`;
      
      // Define the API URL
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`;
      
      // Create the message payload
      const messagePayload = {
        sender_role: 'farmer',
        sender_id: farmer.farmer_id,
        message_content: messageContent,
        price_suggestion: price,  // Explicit price
        message_type: 'counter_offer',
        created_at: new Date().toISOString()
      };

      console.log('Sending message payload:', messagePayload); // Debug log
      
      // Save to database
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(messagePayload)
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send message');
      }
  
      const savedMessage = await response.json();
      setMessages(prev => [...prev, savedMessage]);
  
      // Enhanced socket emission
      if (socket.current?.connected) {
        console.log('Emitting socket message:', {  // Debug log
          ...savedMessage,
          price_suggestion: price, // Ensure price is included
          bargain_id: bargainId
        });
        
        socket.current.emit('bargainMessage', {
          ...savedMessage,
          bargain_id: bargainId,
          price_suggestion: price, // Double ensure price is sent
          created_at: new Date().toISOString() // Fresh timestamp
        });
      } else {
        console.warn('Socket not connected when trying to emit');
      }
    } catch (err) {
      console.error('Failed to send counter offer:', err);
      setError(`Failed to send offer: ${err.message}`);
      setShowPriceSuggestions(true);
      setWaitingForConsumerResponse(false);
      
      // Attempt socket reconnection if needed
      if (!socket.current?.connected) {
        console.log('Attempting socket reconnection...');
        initializeSocketConnection();
      }
    }
  };

  if (loading) {
    return (
      <div className="krishi-farmer-loading">
        <div className="krishi-loading-content">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="krishi-spinner" />
          <p className="krishi-loading-text">Loading bargain session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="krishi-farmer-error">
        <div className="krishi-error-content">
          <h3>Error Loading Chat</h3>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/farmer-dashboard')} 
            className="krishi-btn krishi-btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!selectedProduct || !selectedConsumer) {
    return (
      <div className="krishi-farmer-error">
        <div className="krishi-error-content">
          <h3>Missing Data</h3>
          <p>Could not load product or consumer information</p>
          <button 
            onClick={() => navigate('/farmer/bargain')} 
            className="krishi-btn krishi-btn-primary"
          >
            Back to Bargain List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="krishi-farmer-chat">
      {/* Chat Header */}
      <div className="krishi-farmer-header">
        <div className="krishi-header-content">
          <div className="krishi-header-top">
            <div className="krishi-chat-title">
              <FontAwesomeIcon icon={faRupeeSign} />
              <h2>Bargaining with {selectedConsumer.first_name} {selectedConsumer.last_name}</h2>
            </div>
            <div className="krishi-header-controls">
              <span className={`krishi-connection-status krishi-status-${connectionStatus}`}>
                {connectionStatus.toUpperCase()}
              </span>
              <button 
                onClick={() => navigate('/farmer-dashboard')} 
                className="krishi-exit-btn"
                title="Exit Chat"
              >
                <FontAwesomeIcon icon={faDoorOpen} />
                <span>Exit</span>
              </button>
            </div>
          </div>
          
          <div className="krishi-product-info">
            <div className="krishi-product-row">
              <FontAwesomeIcon icon={faLeaf} className="krishi-product-icon" />
              <span className="krishi-product-label">Product:</span>
              <span className="krishi-product-value">{selectedProduct.produce_name}</span>
            </div>
            <div className="krishi-product-row">
              <FontAwesomeIcon icon={faWeightHanging} className="krishi-product-icon" />
              <span className="krishi-product-label">Quantity:</span>
              <span className="krishi-product-value">{quantity}kg</span>
            </div>
            
            <div className="krishi-price-info">
              <div className="krishi-price-item">
                <span className="krishi-price-label">Current Offer:</span>
                <span className="krishi-price-value">₹{currentPrice}/kg</span>
              </div>
              <div className="krishi-price-item">
                <span className="krishi-price-label">Your Price:</span>
                <span className="krishi-price-value">₹{originalPrice}/kg</span>
              </div>
              <div className="krishi-price-item krishi-price-total">
                <span className="krishi-price-label">Total:</span>
                <span className="krishi-price-value">₹{(quantity * currentPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="krishi-messages-container">
        {messages.length === 0 ? (
          <div className="krishi-no-messages">
            <p>No messages yet. Waiting for consumer...</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const messageType = msg.sender_role === 'farmer' ? 'farmer' :
                             msg.sender_role === 'consumer' ? 'consumer' : 'system';

            return (
              <div 
                key={`msg-${index}`} 
                className={`krishi-message krishi-message-${messageType}`}
              >
                <div className="krishi-message-content">
                  {messageType === 'system' && <span className="krishi-system-label">System: </span>}
                  {msg.message_content || msg.content}
                </div>
                <div className="krishi-message-meta">
                  <span className="krishi-message-sender">
                    {messageType === 'farmer' ? 'You' : 
                     messageType === 'consumer' ? `${selectedConsumer.first_name} ${selectedConsumer.last_name}` : 'System'}
                  </span>
                  <span className="krishi-message-time">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Just now'}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="krishi-typing-indicator">
            <div className="krishi-typing-dots">
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
      <div className="krishi-chat-controls-container">
      <div className="krishi-chat-controls">
        {showPriceSuggestions && bargainStatus === 'pending' && (
          <div className="krishi-price-suggestions">
            <div className="krishi-suggestion-header">
              <h4>Make a Counter Offer:</h4>
              <button 
                onClick={() => setShowPriceSuggestions(false)}
                className="krishi-close-suggestions"
                title="Close suggestions"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {priceSuggestions.length > 0 ? (
              <div className="krishi-suggestion-grid">
                {priceSuggestions.map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => handlePriceSelection(suggestion.price)}
                    className={`krishi-suggestion-btn ${
                      suggestion.amount > 0 ? 'krishi-increase' : 'krishi-decrease'
                    }`}
                    disabled={waitingForConsumerResponse}
                  >
                    <div className="krishi-suggestion-icon">
                      <FontAwesomeIcon icon={suggestion.amount > 0 ? faArrowUp : faArrowDown} />
                    </div>
                    <div className="krishi-suggestion-details">
                      <span className="krishi-suggestion-price">₹{suggestion.price}/kg</span>
                      <span className="krishi-suggestion-diff">
                        (₹{Math.abs(suggestion.amount)} {suggestion.amount > 0 ? 'more' : 'less'})
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="krishi-no-suggestions">
                <p>No valid suggestions available</p>
              </div>
            )}
          </div>
        )}

        {!showPriceSuggestions && bargainStatus === 'pending' && (
          <div className="krishi-bargain-actions">
            <div className="krishi-action-buttons">
              <button
                onClick={() => handleBargainStatus('accepted')}
                className="krishi-action-btn krishi-accept-btn"
                disabled={waitingForResponse || waitingForConsumerResponse}
              >
                <FontAwesomeIcon icon={faCheckCircle} /> Accept
              </button>
              <button
                onClick={() => handleBargainStatus('rejected')}
                className="krishi-action-btn krishi-reject-btn"
                disabled={waitingForResponse || waitingForConsumerResponse}
              >
                <FontAwesomeIcon icon={faTimesCircle} /> Decline
              </button>
              <button
                onClick={() => {
                  setPriceSuggestions(generatePriceSuggestions(currentPrice));
                  setShowPriceSuggestions(true);
                }}
                className="krishi-action-btn krishi-counter-btn"
                disabled={waitingForConsumerResponse}
              >
                <FontAwesomeIcon icon={faHandshake} /> Counter
              </button>
            </div>
          </div>
        )}

        {waitingForConsumerResponse && (
          <div className="krishi-waiting-indicator">
            <FontAwesomeIcon icon={faSpinner} spin /> Waiting for consumer to respond...
          </div>
        )}

        {bargainStatus === 'accepted' && (
          <div className="krishi-result-actions">
            <button 
              className="krishi-action-btn krishi-btn-primary"
              onClick={() => navigate('/farmer-dashboard')}
            >
              Back to Dashboard
            </button>
            <button 
              className="krishi-action-btn krishi-btn-secondary"
              onClick={() => navigate('/farmer-orders')}
            >
              View Orders
            </button>
          </div>
        )}

        {bargainStatus === 'rejected' && (
          <div className="krishi-result-actions">
            <button 
              className="krishi-action-btn krishi-btn-primary"
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