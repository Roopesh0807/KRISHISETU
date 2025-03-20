import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './cbargain.css';

const ConsumerChatWindow = () => {
  const { consumer_id } = useParams(); // Get consumer ID from URL
  const navigate = useNavigate(); // For redirection
  const [consumer, setConsumer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Predefined suggestion messages
  const suggestionMessages = [
    "I specialize in organic produce. Can I offer you a fresh discount?",
    "I grow my products without chemicals. Would you like to try them?",
    "We offer great deals for bulk purchases. Let me know your quantity!",
    "How about a special discount if you buy from me regularly?",
    "I'm known for high-quality produce. Would you like to see samples?",
    "We source directly from the farm. Can I offer you a competitive price?",
    "We deliver straight to your door. Would you prefer that?",
    "I offer eco-friendly packaging. Are you interested in that?",
    "Do you need delivery at a specific time? Let me know your preference.",
    "Let me know what other products you're looking for, I may have them!"
  ];

  // Fetch consumer details
  useEffect(() => {
    const fetchConsumer = async () => {
      if (!consumer_id) {
        setError("Consumer ID not found!");
        setLoading(false);
        return;
      }

      try {
        const url = `http://localhost:5000/api/consumerprof/${consumer_id}`;
        console.log(`Fetching consumer data from: ${url}`);

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        console.log("Response Status:", response.status);
        console.log("Response Headers:", response.headers.get("content-type"));

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const jsonData = await response.json();
        console.log("Fetched consumer data:", jsonData);

        setConsumer(jsonData.length > 0 ? jsonData[0] : null);
      } catch (err) {
        console.error("Error fetching consumer data:", err);
        setError(`Failed to load consumer data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchConsumer();
  }, [consumer_id]);
  
  // Handle suggestion click
  const handleSuggestionClick = (message) => {
    const newMessage = { text: message, sender: 'You', timestamp: new Date().toLocaleTimeString() };
    setMessages([...messages, newMessage]);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close and Redirect to Consumer Profile Page
  const handleClose = () => {
    console.log("Closing chat window and redirecting...");
    navigate('/consumerprof', { replace: true });  // Ensures proper redirection
  };

  if (loading) return <p>Loading consumer details...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-content">
          <img src={consumer?.photo || 'default-avatar.png'} alt={consumer?.name || 'User'} className="avatar" />
          <div className="member-info">
            <span className="member-name">{consumer?.name}</span>
            <span className="member-id">ID: {consumer?.consumer_id}</span>
          </div>
        </div>
        <button className="close-button" onClick={handleClose}>&#10005;</button>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.sender === 'You' ? 'sent' : 'received'}`}>
              <div className="message-text">{message.text}</div>
              <div className="message-timestamp">{message.timestamp}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-suggestions">
        <h4>Farmer's Special Offers</h4>
        <div className="suggestion-grid">
          {suggestionMessages.map((message, index) => (
            <button key={index} className="suggestion-button" onClick={() => handleSuggestionClick(message)}>
              {message}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

ConsumerChatWindow.propTypes = {
  onClose: PropTypes.func,
};

export default ConsumerChatWindow;
