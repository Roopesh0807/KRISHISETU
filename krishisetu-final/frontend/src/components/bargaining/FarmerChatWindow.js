import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from "../../context/AuthContext";
import { io } from 'socket.io-client';
import {
  faSpinner,
  faRupeeSign,
  faArrowUp,
  // faArrowDown,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './FarmerChatWindow.css';

const FarmerChatWindow = () => {
  const navigate = useNavigate();
  const { bargainId } = useParams();
  const { token } = useAuth();
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttempts = useRef(0);

  // State management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [bargainStatus, setBargainStatus] = useState('pending');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [product, setProduct] = useState(null);
  const [consumerDetails, setConsumerDetails] = useState({});
  const [quantity, setQuantity] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // WebSocket connection management
  const initializeSocketConnection = useCallback(() => {
    if (!bargainId || !token) {
      console.error("Missing bargainId or token for WebSocket connection");
      return;
    }
  
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
  
    socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
      auth: { token },
      query: { bargainId },
      transports: ['websocket'],
      withCredentials: true,
      extraHeaders: { Authorization: `Bearer ${token}` }
    });
    
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
  
    socket.current.on('priceUpdate', (data) => {
      setCurrentPrice(data.newPrice);
      addSystemMessage(`Consumer updated price to ₹${data.newPrice}/kg`);
      setWaitingForResponse(false);
    });
  
    socket.current.on('bargainStatusUpdate', (status) => {
      setBargainStatus(status);
      if (status === 'accepted') {
        addSystemMessage("🎉 You accepted the offer!");
      } else if (status === 'rejected') {
        addSystemMessage("❌ You declined the offer");
      }
      setWaitingForResponse(false);
    });
  
    socket.current.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      if (message.sender_type === 'consumer') {
        setWaitingForResponse(false);
      }
    });

    socket.current.on('typing', (isTyping) => {
      setIsTyping(isTyping);
    });
  
    socket.current.on('error', (error) => {
      console.error("Socket error:", error);
    });
  
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [bargainId, token]);

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

  // Initialize socket connection on mount
  useEffect(() => {
    initializeSocketConnection();
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [initializeSocketConnection]);

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
  
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch bargain data");
        }
  
        const { session } = data;
  
        if (!session) {
          throw new Error("No session data received from server");
        }
  
        setMessages(session.messages || []);
        setCurrentPrice(session.current_price || 0);
        setProduct(session.product || null);
        setConsumerDetails(session.consumer || {});
        setQuantity(session.quantity || 0);
        setBargainStatus(session.status || 'pending');
      } catch (error) {
        console.error("Error loading bargain data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchBargainData();
  }, [bargainId, token]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle price offer
  const handleMakeOffer = (price) => {
    if (socket.current && socket.current.connected) {
      const messageContent = `💰 You offered ₹${price}/kg for ${quantity}kg`;
      addSystemMessage(messageContent);
      setCurrentPrice(price);
      setWaitingForResponse(true);
      
      socket.current.emit('priceOffer', {
        price,
        productId: product?.product_id,
        quantity
      });

      // Send the message to consumer
      socket.current.emit("bargainMessage", {
        bargain_id: bargainId,
        message: {
          content: messageContent,
          sender_type: "farmer",
          timestamp: new Date().toISOString()
        },
        recipientType: "consumer",
        recipientId: consumerDetails.id,
      });
    }
  };

  // Handle accept/reject
  const handleBargainResponse = (response) => {
    if (socket.current && socket.current.connected) {
      const action = response ? 'accept' : 'reject';
      const messageContent = `You ${action}ed the offer`;
      addSystemMessage(messageContent);
      setWaitingForResponse(true);
      
      socket.current.emit('bargainResponse', {
        response,
        bargainId
      });

      // Send the response to consumer
      socket.current.emit("bargainMessage", {
        bargain_id: bargainId,
        message: {
          content: response ? "🎉 Offer accepted!" : "❌ Offer declined",
          sender_type: "system",
          timestamp: new Date().toISOString()
        },
        recipientType: "consumer",
        recipientId: consumerDetails.id,
      });
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
      {/* Chat Header */}
      <div className="chat-header">
        <div className="header-top">
          <h2>
            <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {consumerDetails.name || "Consumer"}
          </h2>
          <span className={`connection-status ${connectionStatus}`}>
            {connectionStatus.toUpperCase()}
          </span>
        </div>
        
        <div className="product-info">
          {product && (
            <>
              <p><strong>Product:</strong> {product.produce_name}</p>
              <p><strong>Quantity:</strong> {quantity}kg</p>
              <div className="price-display">
                <span className="current-price">
                  <strong>Current:</strong> ₹{currentPrice}/kg
                </span>
                <span className="base-price">
                  <strong>Base:</strong> ₹{product.price_per_kg}/kg
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
            </>
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
              className={`message ${
                msg.sender_type === 'farmer' || msg.sender_type === 'system' 
                  ? 'right' 
                  : 'left'
              } animate__animated animate__fadeIn`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="message-content">
                {msg.content}
              </div>
              <div className="message-meta">
                <span className="sender">
                  {msg.sender_type === 'farmer' ? 'You' : 
                   msg.sender_type === 'consumer' ? consumerDetails.name || 'Consumer' : 'System'}
                </span>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="typing-indicator left">
            <div className="typing-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
            <span>{consumerDetails.name || 'Consumer'} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Controls */}
      <div className="chat-controls">
        {bargainStatus === 'pending' && 
         product && 
         messages.length > 0 && 
         messages.some(m => m.sender_type === 'consumer') && (
          <div className="price-suggestions animate__animated animate__fadeInUp">
            <h4>Respond to Offer:</h4>
            <div className="suggestion-grid">
              {[1, 2, 3].map(amount => (
                <div 
                  key={`increase-${amount}`} 
                  className="suggestion-card increase"
                  onClick={() => handleMakeOffer(currentPrice + amount)}
                >
                  <div className="price-change">
                    <FontAwesomeIcon icon={faArrowUp} />
                    <span className="price-amount">₹{currentPrice + amount}</span>
                    <span className="per-kg">/kg</span>
                  </div>
                  <div className="price-label">Counter Offer</div>
                  <div className="price-difference">+₹{amount}</div>
                </div>
              ))}
              <div 
                className="suggestion-card accept"
                onClick={() => handleBargainResponse(true)}
              >
                <div className="price-change">
                  <span className="price-amount">Accept</span>
                </div>
                <div className="price-label">Current Price</div>
                <div className="price-difference">₹{currentPrice}/kg</div>
              </div>
              <div 
                className="suggestion-card reject"
                onClick={() => handleBargainResponse(false)}
              >
                <div className="price-change">
                  <span className="price-amount">Reject</span>
                </div>
                <div className="price-label">End Negotiation</div>
              </div>
            </div>
          </div>
        )}

        {waitingForResponse && (
          <div className="waiting-indicator animate__animated animate__pulse animate__infinite">
            <FontAwesomeIcon icon={faSpinner} spin /> Waiting for response...
          </div>
        )}

        {bargainStatus === 'accepted' && (
          <div className="accepted-actions animate__animated animate__fadeIn">
            <button 
              className="primary-action animate__animated animate__pulse"
              onClick={() => navigate('/orders')}
            >
              View Order Details
            </button>
            <button 
              className="secondary-action"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerChatWindow;