import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css'; // Styling for the sidebar

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const [isOpen, setIsOpen] = useState(false); // Sidebar closed by default
  const [showCommunity, setShowCommunity] = useState(false);

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Function to open Plant Disease Detection in a new tab
  const handlePlantDiseaseClick = () => {
    window.open(
      'https://plant-disease-detection-system-for-sustainable-agriculture-yg2.streamlit.app/',
      '_blank'
    );
  };

  // Check if a button is active based on the current route
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Content */}
        <div className="sidebar-content">
          {/* Toggle Button */}
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isOpen ? '✕' : '☰'} {/* Close icon when open, hamburger when closed */}
          </button>

          {/* Sidebar Buttons */}
          <button
            onClick={() => navigate('/farmer-dashboard')}
            title="Dashboard"
            className={isActive('/farmer-dashboard') ? 'active' : ''}
          >
            <i className="fas fa-home"></i> {/* Icon */}
            {isOpen && 'Dashboard'} {/* Text only when open */}
          </button>
          <button
            onClick={() => navigate('/view-profile')}
            title="View Profile"
            className={isActive('/view-profile') ? 'active' : ''}
          >
            <i className="fas fa-user"></i>
            {isOpen && 'View Profile'}
          </button>
          <button
            onClick={() => navigate('/order-review')}
            title="Order Review"
            className={isActive('/order-review') ? 'active' : ''}
          >
            <i className="fas fa-clipboard-list"></i>
            {isOpen && 'Order Review'}
          </button>
          <button
            onClick={() => navigate('/bargain_farmer')}
            title="Bargain"
            className={isActive('/bargain_farmer') ? 'active' : ''}
          >
            <i className="fas fa-handshake"></i>
            {isOpen && 'Bargain'}
          </button>
          <button
            onClick={handlePlantDiseaseClick}
            title="Plant Disease Detection"
          >
            <i className="fas fa-leaf"></i>
            {isOpen && 'Plant Disease Detection'}
          </button>
          <button
            onClick={() => setShowCommunity(true)}
            title="Farmer's Community"
          >
            <i className="fas fa-users"></i>
            {isOpen && "Farmer's Community"}
          </button>
          <button
            onClick={() => navigate('/Contact')}
            title="Help and Support"
            className={isActive('/help') ? 'active' : ''}
          >
            <i className="fas fa-question-circle"></i>
            {isOpen && 'Help and Support'}
          </button>
        </div>
      </div>

      {/* Farmer's Community Overlay */}
      {showCommunity && (
        <div className="community-overlay">
          <button className="close-btn" onClick={() => setShowCommunity(false)}>
            Close
          </button>
          <iframe
            src="https://farmer-s-community.onrender.com"
            className="community-iframe"
            title="Farmer's Community"
          ></iframe>
        </div>
      )}
    </>
  );
};

export default Sidebar;