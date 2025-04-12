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
import './ConsumerChatWindow.css';

const BargainChatWindow = () => {
  const navigate = useNavigate();
  const { bargainId } = useParams();
  const { token, consumer } = useAuth();
  const location = useLocation();
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const { 
    farmer: initialFarmer, 
    product: initialProduct,
    currentPrice: initialPrice,
    originalPrice
  } = location.state || {};

  // State management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [bargainStatus, setBargainStatus] = useState('pending');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
  const [selectedFarmer] = useState(initialFarmer || null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
  const [priceSuggestions, setPriceSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasFarmerCounterOffer, setHasFarmerCounterOffer] = useState(false);


 // Generate price suggestions based on current price
 const generatePriceSuggestions = useCallback((basePrice) => {
  const suggestions = [];
  
  // Generate 6 suggestions, each ₹1 less than the previous
  for (let i = 1; i <= 6; i++) {
    const newPrice = basePrice - i;
    if (newPrice > 0) { // Only include positive prices
      suggestions.push({
        amount: -i,
        price: newPrice,
        label: `₹${newPrice} (₹${i} less)`
      });
    } else {
      break; // Stop if price would go below 0
    }
  }

  return suggestions;
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

   // Modify the socket message handler to detect counter offers
   useEffect(() => {
    if (!socket.current) return;

    const handleNewMessage = (message) => {
      if (message?.message_id) {
        setMessages(prev => [...prev, message]);
        
        // Check if this is a counter offer from farmer
        if (message.sender_role === 'farmer' && message.message_type === 'counter_offer') {
          setHasFarmerCounterOffer(true);
          setWaitingForResponse(false);
          
          // Generate new suggestions based on farmer's counter offer
          const suggestions = generatePriceSuggestions(message.price_suggestion);
          setPriceSuggestions(suggestions);
          setShowPriceSuggestions(true);
          
          // Update current price
          setCurrentPrice(message.price_suggestion);
        }
      }
    };
    
    socket.current.on('new_message', handleNewMessage);

    return () => {
      if (socket.current) {
        socket.current.off('new_message', handleNewMessage);
      }
    };
  }, [generatePriceSuggestions]);
  
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
    auth: { token },
    query: { bargainId },
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

  // Connection established
  socket.current.on('connect', () => {
    console.log("Socket connected with ID:", socket.current?.id);
    setConnectionStatus("connected");
  });

  // Connection error
  socket.current.on('connect_error', (err) => {
    console.error("Socket connection error:", {
      message: err.message,
      description: err.description,
      context: err.context
    });
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

  // Connection closed
  socket.current.on('disconnect', (reason) => {
    console.log("Socket disconnected:", reason);
    setConnectionStatus("disconnected");
    
    // Immediate reconnect for certain disconnect reasons
    if (reason === "io server disconnect") {
      console.log("Attempting immediate reconnect");
      setTimeout(() => initializeSocketConnection(), 1000);
    }
  });

  // Price update from farmer
  socket.current.on('priceUpdate', (data) => {
    if (data?.newPrice) {
      setCurrentPrice(data.newPrice);
      addSystemMessage(`Farmer updated price to ₹${data.newPrice}/kg`);
      setWaitingForResponse(false);
    } else {
      console.error("Invalid priceUpdate data:", data);
    }
  });

  // Bargain status update
  socket.current.on('bargainStatusUpdate', (status) => {
    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (validStatuses.includes(status)) {
      setBargainStatus(status);
      if (status === 'accepted') {
        addSystemMessage("🎉 Farmer accepted your offer!");
      } else if (status === 'rejected') {
        addSystemMessage("❌ Farmer declined your offer");
      }
      setWaitingForResponse(false);
    } else {
      console.error("Invalid bargain status:", status);
    }
  });

socket.current.on('new_message', (message) => {
  if (message?.message_id) {
    setMessages(prev => [...prev, message]);
    if (message.sender_role === 'farmer') {
      setWaitingForResponse(false);
      
      // If it's a counter offer, show new suggestions
      if (message.message_type === 'counter_offer' && message.price_suggestion) {
        const suggestions = generatePriceSuggestions(message.price_suggestion);
        setPriceSuggestions(suggestions);
        setShowPriceSuggestions(true);
      }
    }
  }
});

  // Typing indicator
  socket.current.on('typing', (isTyping) => {
    setIsTyping(Boolean(isTyping));
  });

  // Price suggestions
  socket.current.on('priceSuggestions', (data) => {
    if (Array.isArray(data?.suggestions)) {
      setPriceSuggestions(data.suggestions);
      setShowPriceSuggestions(true);
    } else {
      console.error("Invalid price suggestions:", data);
    }
  });

  // Error handling
  socket.current.on('error', (error) => {
    console.error("Socket error:", error);
    setError(error.message || "WebSocket communication error");
  });

  // Cleanup function for useEffect
  return () => {
    if (socket.current) {
      console.log("Cleaning up socket connection");
      socket.current.removeAllListeners();
      socket.current.disconnect();
    }
  };
}, [bargainId, token]);


  // Helper function to add system messages
  const addSystemMessage = useCallback((content) => {
    setMessages(prev => [
      ...prev,
      {
        content,
        sender_type: "system",
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

 useEffect(() => {
  const initializeChat = async () => {
    try {
      setLoading(true);
      await fetchMessages();
      initializeSocketConnection();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  initializeChat();

  return () => {
    if (socket.current) {
      socket.current.disconnect();
    }
  };
}, [initializeSocketConnection]);

// Show initial system message and price suggestions when product is selected
useEffect(() => {
  if (selectedProduct && !isBargainPopupOpen && messages.length === 0) {
    const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${selectedQuantity}kg) at ₹${selectedProduct.price_per_kg}/kg`;
    addSystemMessage(systemMessageContent);
    
    const suggestions = generatePriceSuggestions(selectedProduct.price_per_kg);
    setPriceSuggestions(suggestions);
    setShowPriceSuggestions(true);
  }
}, [selectedProduct, isBargainPopupOpen, messages.length, addSystemMessage, generatePriceSuggestions, selectedQuantity]);

 // Fetch bargain data
 useEffect(() => {
  const fetchBargainData = async () => {
    try {
      if (!bargainId || !token) {
        throw new Error("Missing bargain ID or authentication token");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const contentType = response.headers.get('content-type');
      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON but got ${contentType}`);
      }

      const data = JSON.parse(rawText);

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch bargain data");
      }

      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        setSelectedProduct(product);
        setCurrentPrice(product.current_offer || product.price_per_kg);
        setQuantity(product.quantity || 1);
        setSelectedQuantity(product.quantity || '10');
      }
      
      setBargainStatus(data.status || 'pending');
      
    } catch (error) {
      setError(error.message || "Failed to load bargain data");
    }
  };

  if (!initialProduct) {
    fetchBargainData();
  }
}, [bargainId, token, initialProduct]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBargainConfirm = async () => {
    if (!selectedProduct) {
      setError("Please select a product first");
      return;
    }
  
    try {
      setIsLoading(true);
      setError(null);
  
      // 1. Create bargain session
      const bargainResponse = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/create-bargain`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            farmer_id: selectedFarmer.farmer_id
          })
        }
      );
  
      if (!bargainResponse.ok) {
        throw new Error(await bargainResponse.text() || 'Failed to create bargain session');
      }
  
      const bargainData = await bargainResponse.json();
  
      // 2. Add product to bargain
      const productResponse = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/add-bargain-product`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bargain_id: bargainData.bargainId,
            product_id: selectedProduct.product_id,
            quantity: parseFloat(selectedQuantity) || 10
          })
        }
      );
  
      if (!productResponse.ok) {
        throw new Error(await productResponse.text() || 'Product addition failed');
      }
  
      const productData = await productResponse.json();
  
      // 3. Save SYSTEM MESSAGE to database
      const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${selectedQuantity}kg) at ₹${selectedProduct.price_per_kg}/kg`;
      const systemMessageResponse = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/bargain/${bargainData.bargainId}/system-message`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message_content: systemMessageContent,
            message_type: 'system'
          })
        }
      );
  
      if (!systemMessageResponse.ok) {
        throw new Error('Failed to save system message');
      }
  
      const systemMessage = await systemMessageResponse.json();
  
      // 4. Generate and show price suggestions
      const suggestions = generatePriceSuggestions(selectedProduct.price_per_kg);
      setPriceSuggestions(suggestions);
      setShowPriceSuggestions(true);
  
      // 5. Close popup and navigate
      setIsBargainPopupOpen(false);
      navigate(`/bargain/${bargainData.bargainId}`, {
        state: {
          product: {
            ...selectedProduct,
            price_per_kg: productData.price_per_kg,
            quantity: productData.quantity
          },
          farmer: selectedFarmer,
          currentPrice: productData.price_per_kg,
          bargainId: bargainData.bargainId,
          originalPrice: productData.price_per_kg
        }
      });
  
    } catch (err) {
      console.error('Bargain initiation error:', err);
      setError(err.message || "Failed to start bargaining");
    } finally {
      setIsLoading(false);
    }
  };
  const handlePriceSelection = async (price) => {
    try {
      // Immediately hide suggestions and update price
      setShowPriceSuggestions(false);
      setCurrentPrice(price);
  
      // Construct message content
      const messageContent = `💰 Offered ₹${price}/kg for ${selectedQuantity}kg of ${selectedProduct.produce_name}`;
  
      // Send the price offer to server
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            sender_role: 'consumer',
            sender_id: consumer.consumer_id,
            message_content: messageContent,
            price_suggestion: price,
            message_type: 'price_offer'
          })
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save message");
      }
  
      // Update UI with the new message
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
  
      // Notify farmer via WebSocket
      if (socket.current?.connected) {
        socket.current.emit('priceOffer', {
          bargainId,
          message: newMessage,
          productId: selectedProduct.product_id,
          quantity: selectedQuantity,
          newPrice: price
        });
      }
  
    } catch (err) {
      console.error('Error handling price selection:', err);
      setError(err.message);
      // Re-show suggestions if there was an error
      setShowPriceSuggestions(true);
    }
  };


  // Add this function to handle accepting the farmer's counter offer
  const handleAcceptFarmerOffer = async () => {
    try {
      if (!socket.current?.connected) {
        throw new Error("Connection not established");
      }

      // Emit acceptance to server
      socket.current.emit('updateBargainStatus', {
        bargainId,
        status: 'accepted'
      });

      // Update local state
      setBargainStatus('accepted');
      setShowPriceSuggestions(false);
      setHasFarmerCounterOffer(false);
      
      // Add system message
      addSystemMessage(`✅ You accepted the farmer's offer of ₹${currentPrice}/kg`);
      
    } catch (err) {
      setError(err.message);
    }
  };

  // Add this function to handle rejecting the farmer's counter offer
  const handleRejectFarmerOffer = async () => {
    try {
      if (!socket.current?.connected) {
        throw new Error("Connection not established");
      }

      // Emit rejection to server
      socket.current.emit('updateBargainStatus', {
        bargainId,
        status: 'rejected'
      });

      // Update local state
      setBargainStatus('rejected');
      setShowPriceSuggestions(false);
      setHasFarmerCounterOffer(false);
      
      // Add system message
      addSystemMessage(`❌ You declined the farmer's offer`);
      
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading bargain session...</p>
      </div>
    );
  }

  return (
    <div className="bargain-chat-container">
      {/* Bargain Initiation Popup */}
      {isBargainPopupOpen && selectedFarmer && (
  <div className="bargain-popup-overlay">
    <div className="bargain-popup-container">
      <div className="bargain-popup-content">
        {/* Popup Header */}
        <div className="popup-header">
          <h3>
            <FontAwesomeIcon icon={faHandshake} /> Initiate Bargain with {selectedFarmer.farmer_name}
          </h3>
          <button 
            onClick={() => navigate(-1)} 
            className="popup-close-btn"
            aria-label="Close popup"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Product Selection */}
        <div className="popup-section">
          <label className="popup-label">Select Product</label>
          <select
            className="popup-select"
            value={selectedProduct?.produce_name || ''}
            onChange={(e) => {
              const product = selectedFarmer.products.find(
                p => p.produce_name === e.target.value
              );
              setSelectedProduct(product || null);
              if (product) {
                setCurrentPrice(product.price_per_kg);
                setSelectedQuantity('10');
              }
            }}
          >
            <option value="">-- Select a product --</option>
            {selectedFarmer.products?.map(product => (
              <option 
                key={product.product_id} 
                value={product.produce_name}
                data-price={product.price_per_kg}
              >
                {product.produce_name} (₹{product.price_per_kg}/kg)
              </option>
            ))}
          </select>
        </div>

        {/* Product Details */}
        {selectedProduct && (
          <>
            <div className="popup-section product-details">
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{selectedProduct.produce_type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Availability:</span>
                <span className="detail-value">{selectedProduct.availability} kg</span>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="popup-section">
              <label className="popup-label">Quantity (kg)</label>
              <div className="quantity-input-container">
                <input
                  type="number"
                  className="popup-input"
                  min="10"
                  max={selectedProduct.availability}
                  value={selectedQuantity}
                  onChange={(e) => {
                    const val = Math.min(
                      selectedProduct.availability,
                      Math.max(10, e.target.value || 10)
                    );
                    setSelectedQuantity(val);
                  }}
                  placeholder="Enter quantity"
                />
                <div className="quantity-range">
                  <span>Min: 10 kg</span>
                  <span>Max: {selectedProduct.availability} kg</span>
                </div>
              </div>
            </div>

            {/* Price Display */}
            <div className="price-summary">
              <div className="price-row">
                <span>Unit Price:</span>
                <span>₹{selectedProduct.price_per_kg}/kg</span>
              </div>
              <div className="price-row total">
                <span>Total Price:</span>
                <span>
                  ₹{(selectedProduct.price_per_kg * (parseFloat(selectedQuantity) || 0).toFixed(2))}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="popup-error">
            <FontAwesomeIcon icon={faTimesCircle} />
            <span>{error.includes('JSON') ? 'Server error' : error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="popup-actions">
          <button
            onClick={() => navigate(-1)}
            className="popup-cancel-btn"
          >
            Cancel
          </button>
       
       <button
          onClick={handleBargainConfirm}
          disabled={!selectedProduct || isLoading}
          className={`bargain-btn ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faHandshake} />
              <span>Start Bargaining</span>
            </>
          )}
        </button>
        </div>
      </div>
    </div>
  </div>
)}
      {/* Chat Interface */}
      {selectedProduct && !isBargainPopupOpen && (
        <div className="chat-interface animate__animated animate__fadeIn">

<button 
      onClick={() => navigate('/consumer-dashboard')} 
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
                <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
              </h2>
              <span className={`connection-status ${connectionStatus}`}>
                {connectionStatus.toUpperCase()}
              </span>
            </div>
            
            <div className="product-info">
              <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
              <p><strong>Quantity:</strong> {selectedQuantity || quantity}kg</p>
              <div className="price-display">
                <span className="current-price">
                  <strong>Current:</strong> ₹{currentPrice}/kg
                </span>
                <span className="base-price">
                  <strong>Base:</strong> ₹{selectedProduct.price_per_kg}/kg
                </span>
                <span className="total-price">
                  <strong>Total:</strong> ₹{(parseFloat(selectedQuantity || quantity) * currentPrice)}
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
                <p>No messages yet. Start the negotiation!</p>
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
                      {msg.sender_type === 'consumer' ? 'You' : 
                       msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
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
                <span>{selectedFarmer?.farmer_name} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Controls */}
          <div className="chat-controls">
            {showPriceSuggestions && (
              <div className="price-suggestions animate__animated animate__fadeInUp">
                <h4>Make an Offer:</h4>
                <div className="suggestion-buttons">
                  {priceSuggestions.map((suggestion, index) => (
                    <button
                      key={`price-${index}`}
                      onClick={() => handlePriceSelection(suggestion.price)}
                      className={`suggestion-btn ${suggestion.amount < 0 ? 'decrease' : 'increase'}`}
                      disabled={waitingForResponse}
                    >
                      <div className="price-change">
                        {suggestion.amount < 0 ? (
                          <FontAwesomeIcon icon={faArrowDown} />
                        ) : (
                          <FontAwesomeIcon icon={faArrowUp} />
                        )}
                        ₹{suggestion.price}
                      </div>
                      <div className="price-label">{suggestion.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {waitingForResponse && (
              <div className="waiting-indicator animate__animated animate__pulse animate__infinite">
                <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's response...
              </div>
            )}

            {bargainStatus === 'accepted' && (
              <div className="accepted-actions animate__animated animate__fadeIn">
                <button 
                  className="primary-action animate__animated animate__pulse"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </button>
                <button 
                  className="secondary-action"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BargainChatWindow;

