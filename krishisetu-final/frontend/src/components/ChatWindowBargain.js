import React, { useState, useEffect, useRef } from 'react';
import './ChatWindowBargain.css';

const ChatWindow = ({ farmer = {}, onClose }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

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

  const handleSuggestionClick = (message) => {
    setMessages([...messages, { text: message, sender: 'You', timestamp: new Date().toLocaleTimeString() }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-content">
          <img src={farmer.avatar || 'default-avatar.png'} alt={farmer.name || 'User'} className="avatar" />
          <div className="member-info">
            <span className="member-name">{farmer.name || 'Unknown User'}</span>
            <span className="member-status">{farmer.status || 'Offline'}</span>
          </div>
        </div>
        <button className="close-button" onClick={onClose}>
          &#10005; {/* "X" mark */}
        </button>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === 'You' ? 'sent' : 'received'}`}
            >
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
            <button
              key={index}
              className="suggestion-button"
              onClick={() => handleSuggestionClick(message)}
            >
              {message}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;