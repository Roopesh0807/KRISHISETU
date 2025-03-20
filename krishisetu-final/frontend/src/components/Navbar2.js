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
      <ul className="navbar-icons">
        {/* Add Produce */}
        <li>
          <Link to="/add-produce" className="icon-link" title="Add Produce">
            <div className="icon-container">
              <FaSeedling className="icon" aria-label="Add Produce" />
              <FaPlus className="plus-icon" aria-label="Add" />
            </div>
            <span className="icon-text">Add Produce</span>
          </Link>
        </li>

        {/* Notifications */}
        <li>
          <Link to="/notifications" className="icon-link" title="Notifications">
            <FaBell className="icon" aria-label="Notifications" />
            <span className="icon-text">Notifications</span>
          </Link>
        </li>

        {/* Profile */}
        <li>
          <Link to="/profile" className="icon-link" title="Profile">
            <FaUser className="icon" aria-label="Profile" />
            <span className="icon-text">Profile</span>
          </Link>
        </li>

        {/* Logout */}
        <li>
          <button className="icon-link logout" title="Logout" onClick={handleLogout}>
            <FaSignOutAlt className="icon" aria-label="Logout" />
            <span className="icon-text">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar2;