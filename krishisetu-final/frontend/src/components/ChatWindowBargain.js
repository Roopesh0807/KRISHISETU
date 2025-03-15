import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ChatWindowBargain.css';

const ChatWindow = ({ farmer_id, full_name, farmer_photo, price, quantity, onClose }) => {
  const [priceSuggestions, setPriceSuggestions] = useState([]);
  

  // Generate price suggestions when product & quantity are selected
  useEffect(() => {
    if (price && !isNaN(price)) {
      const basePrice = parseFloat(price);
      const suggestions = [
        (basePrice * 0.93).toFixed(2), // 7% below
        (basePrice * 0.97).toFixed(2), // 3% below
        (basePrice * 1.03).toFixed(2), // 3% above
        (basePrice * 1.07).toFixed(2), // 7% above
      ];
      setPriceSuggestions(suggestions);
    } else {
      console.error("Invalid price value:", price);
    }
  }, [price]);

  const handleAccept = () => {
    console.log("Accepted price, adding to cart...");
    // Here, implement logic to add product to cart
  };

  const handleReject = () => {
    console.log("Rejected price, navigating to dashboard...");
    // Implement navigation logic to dashboard
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-content">
          <img src={farmer_photo || 'default-avatar.png'} alt={full_name || 'User'} className="avatar" />
          <div className="member-info">
            <span className="member-name">{full_name}</span>
            <span className="member-id">ID: {farmer_id}</span>
          </div>
        </div>
        <button className="close-button" onClick={onClose}>&#10005;</button>
      </div>

      <div className="bargain-section">
        <h4>Choose a Bargain Price</h4>
        {priceSuggestions.length > 0 ? (
          <div className="price-options">
            {priceSuggestions.map((suggestion, index) => (
              <button key={index} className="price-button">₹{suggestion}</button>
            ))}
          </div>
        ) : (
          <p>Loading price suggestions...</p>
        )}
        <div className="bargain-actions">
          <button className="accept-button" onClick={handleAccept}>Accept</button>
          <button className="reject-button" onClick={handleReject}>Reject</button>
        </div>
      </div>
    </div>
  );
};

ChatWindow.propTypes = {
  farmer_id: PropTypes.string.isRequired,
  full_name: PropTypes.string.isRequired,
  farmer_photo: PropTypes.string,
  price: PropTypes.number.isRequired,
  quantity: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ChatWindow;
