import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faPaperPlane, 
  faRupeeSign,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import './cbargain.css';

const BargainChatWindow = () => {
  const { bargainId } = useParams();
  const location = useLocation();
  const { product, farmer, quantity } = location.state || {};
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(product?.price_per_kg || 0);
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Initialize WebSocket connection
  useEffect(() => {
    if (!bargainId) {
      console.error("❌ Missing bargainId. WebSocket connection aborted.");
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token || token === "null") {
      console.error("❌ Missing or invalid token. WebSocket connection aborted.");
      return;
    }
  
    const socketUrl = `ws://localhost:5000/ws/bargain/${bargainId}?token=${token}`;
    console.log(`🔗 Connecting to WebSocket: ${socketUrl}`);
  
    const socket = new WebSocket(socketUrl);
  
    socket.onopen = () => {
      console.log('✅ WebSocket connected');
      setConnectionStatus('connected');
      setWs(socket);
    };
  
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 WebSocket message received:', data);
        
        switch (data.type) {
          case 'NEW_MESSAGE':
            setMessages(prev => [...prev, data.message]);
            break;
          case 'PRICE_UPDATE':
            setCurrentPrice(data.newPrice);
            setMessages(prev => [...prev, {
              content: `New offer: ₹${data.newPrice}/kg`,
              sender_type: data.sender,
              timestamp: new Date().toISOString()
            }]);
            break;
          case 'BARGAIN_ACCEPTED':
            setMessages(prev => [...prev, {
              content: '🎉 Farmer accepted your offer!',
              sender_type: 'system',
              timestamp: new Date().toISOString()
            }]);
            break;
          case 'BARGAIN_REJECTED':
            setMessages(prev => [...prev, {
              content: '❌ Farmer rejected your offer.',
              sender_type: 'system',
              timestamp: new Date().toISOString()
            }]);
            break;
          default:
            console.warn('⚠️ Unknown message type:', data.type);
        }
      } catch (error) {
        console.error("⚠️ Error parsing WebSocket message:", error);
      }
    };
  
    socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('error');
    };
  
    socket.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setConnectionStatus('disconnected');
    };
  
    return () => {
      console.log('❌ Closing WebSocket...');
      socket.close();
    };
  }, [bargainId]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = new WebSocket(`ws://localhost:5000/ws/bargain/${bargainId}?token=${token}`);
  
    socket.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      setWs(socket);
    };
  
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };
  
    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
    };
  
    return () => socket.close();
  }, [bargainId]);
  
  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/messages`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setMessages(data.messages);
        if (data.currentPrice) setCurrentPrice(data.currentPrice);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [bargainId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ws) return;

    try {
      const message = {
        type: 'NEW_MESSAGE',
        content: newMessage,
        bargainId
      };
      
      ws.send(JSON.stringify(message));
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleMakeOffer = async (price) => {
    if (!ws) return;

    try {
      const offer = {
        type: 'PRICE_OFFER',
        bargainId,
        price
      };
      
      ws.send(JSON.stringify(offer));
      setMessages(prev => [...prev, {
        content: `You offered: ₹${price}/kg`,
        sender_type: 'consumer',
        timestamp: new Date().toISOString()
      }]);
      setCurrentPrice(price);
    } catch (error) {
      console.error("Error making offer:", error);
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
      <div className="chat-header">
        <div className="header-top">
          <h2>
            <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {farmer?.farmer_name}
          </h2>
          <span className={`connection-status ${connectionStatus}`}>
            {connectionStatus.toUpperCase()}
          </span>
        </div>
        
        <div className="product-info">
          <p><strong>Product:</strong> {product?.produce_name}</p>
          <p><strong>Quantity:</strong> {quantity}kg</p>
          <p className="current-price">
            <strong>Current Price:</strong> ₹{currentPrice}/kg
          </p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Start the negotiation by making an offer!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender_type}`}>
              <div className="message-content">
                {msg.content}
                {msg.price && (
                  <div className="price-offer">
                    <FontAwesomeIcon icon={faRupeeSign} /> {msg.price}/kg
                  </div>
                )}
              </div>
              <div className="message-meta">
                <span className="sender">
                  {msg.sender_type === 'consumer' ? 'You' : 
                   msg.sender_type === 'farmer' ? farmer?.farmer_name : 'System'}
                </span>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-controls">
        <div className="price-suggestions">
          <h4>Quick Offers:</h4>
          <div className="suggestion-buttons">
          <button onClick={() => handleMakeOffer(currentPrice - 6)}>
              <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 6} (-6)
            </button>
            <button onClick={() => handleMakeOffer(currentPrice - 5)}>
              <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 5} (-5)
            </button>
            <button onClick={() => handleMakeOffer(currentPrice - 4)}>
              <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 4} (-4)
            </button>
            <button onClick={() => handleMakeOffer(currentPrice - 3)}>
              <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 3} (-3)
            </button>
            <button onClick={() => handleMakeOffer(currentPrice - 2)}>
              <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice - 2} (-2)
            </button>
            <button onClick={() => handleMakeOffer(currentPrice - 1)}>
              <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice - 1} (-1)
            </button>
          </div>
        </div>

        <div className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={connectionStatus !== 'connected'}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || connectionStatus !== 'connected'}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BargainChatWindow;