import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './ChatWindowBargain.css';

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
    "Hi, I'm interested in your product. Can we discuss the price?",
    "Is there any discount for bulk orders?",
    "Can you include delivery charges in the final price?",
    "I’m a regular customer. Can you offer a better deal?",
    "What’s the best price you can offer for this product?",
    "Can you provide a sample before I place the order?",
    "I’m comparing prices from other sellers. Can you match a lower price?",
    "Can you offer a discount if I pay in advance?",
    "I’m ready to place the order if we can agree on a fair price.",
    "Thank you for your offer. I’ll get back to you after comparing with other sellers.",
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
        <h4>Quick Suggestions</h4>
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
