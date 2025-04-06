import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCommunity, setShowCommunity] = useState(false);
  const { farmer } = useContext(AuthContext);
  
  const handlePlantDiseaseClick = () => {
    window.open(
      'https://plant-disease-detection-system-for-sustainable-agriculture-yg2.streamlit.app/',
      '_blank'
    );
  };

  const isActive = (path) => location.pathname === path;

  const navigateWithFarmerId = (path) => {
    if (!farmer?.farmer_id) {
      alert("Please log in first");
      navigate("/farmer-login");
      return;
    }
    navigate(`${path}?farmer_id=${farmer.farmer_id}`);
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isOpen ? '✕' : '☰'}
          </button>

          <button
            onClick={() => navigateWithFarmerId('/farmer-dashboard')}
            className={isActive('/farmer-dashboard') ? 'active' : ''}
            title="Dashboard"
          >
            <i className="fas fa-home"></i>
            {isOpen && 'Dashboard'}
          </button>

          <button
            onClick={() => navigateWithFarmerId('/view-profile')}
            className={isActive('/view-profile') ? 'active' : ''}
            title="View Profile"
          >
            <i className="fas fa-user"></i>
            {isOpen && 'View Profile'}
          </button>
          
          <button
            onClick={() => navigateWithFarmerId('/order-review')}
            className={isActive('/order-review') ? 'active' : ''}
          >
            <i className="fas fa-clipboard-list"></i>
            {isOpen && 'Order Review'}
          </button>

          <button
            onClick={() => navigateWithFarmerId('/farmers/my-reviews')}
            className={isActive('/farmers/my-reviews') ? 'active' : ''}
            title="My Reviews"
          >
            <i className="fas fa-star"></i>
            {isOpen && 'My Reviews'}
          </button>

          <button
            onClick={() => navigateWithFarmerId('/farmer/bargain')}
            className={isActive('/farmer/bargain') ? 'active' : ''}
            title="Bargain"
          >
            <i className="fas fa-handshake"></i>
            {isOpen && 'Bargain'}
          </button>

          <button
            onClick={handlePlantDiseaseClick}
            title="Plant Disease Detection"
          >
            <i className="fas fa-leaf"></i>
            {isOpen && 'Plant Health'}
          </button>

          <button
            onClick={() => setShowCommunity(true)}
            title="Farmer's Community"
          >
            <i className="fas fa-users"></i>
            {isOpen && "Community"}
          </button>

          <button
            onClick={() => navigate('/Contact')}
            className={isActive('/Contact') ? 'active' : ''}
            title="Help and Support"
          >
            <i className="fas fa-question-circle"></i>
            {isOpen && 'Support'}
          </button>
        </div>
      </div>

      {showCommunity && (
        <div className="community-overlay">
          <button className="close-btn" onClick={() => setShowCommunity(false)}>
            <i className="fas fa-times"></i>
          </button>
          <iframe
            src="https://farmer-s-community.onrender.com"
            className="community-iframe"
            title="Farmer's Community"
          />
        </div>
      )}
    </>
  );
};

export default Sidebar;