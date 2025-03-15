import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSeedling, FaPlus, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/logo.jpg';
import './Navbar2.css';

const Navbar2 = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform logout logic here
    navigate('/LoginPage');
  };

  return (
    <nav className="navbar2">
      {/* Left Aligned: Logo and Name */}
      <div className="logo" onClick={() => navigate('/farmer-dashboard')}>
        <img src={logo} alt="KrishiSetu Logo" />
        <span className="navbar-name">KRISHISETU</span>
      </div>

      {/* Right Aligned: Icons */}
      <div className="navbar-icons">
        {/* Add Produce */}
        <Link to="/add-produce" className="icon-link" title="Add Produce">
          <div className="icon-container">
            <FaSeedling className="icon" aria-label="Add Produce" />
            <FaPlus className="plus-icon" aria-label="Add" />
          </div>
          <span className="icon-text">Add Produce</span>
        </Link>

        {/* Notifications */}
        <Link to="/notifications" className="icon-link" title="Notifications">
          <FaBell className="icon" aria-label="Notifications" />
          <span className="icon-text">Notifications</span>
        </Link>

        {/* Profile */}
        <Link to="/profile" className="icon-link" title="Profile">
          <FaUser className="icon" aria-label="Profile" />
          <span className="icon-text">Profile</span>
        </Link>

        {/* Feeds
        <Link to="/feeds" className="icon-link" title="Feeds">
          <FaRss className="icon" aria-label="Feeds" />
          <span className="icon-text">Feeds</span>
        </Link> */}

        {/* Logout */}
        <button className="icon-link" title="Logout" onClick={handleLogout}>
          <FaSignOutAlt className="icon" aria-label="Logout" />
          <span className="icon-text">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar2;