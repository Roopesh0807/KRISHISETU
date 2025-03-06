import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import logo from "../assets/logo.jpg"; 
import "./Navbar1.css";

const Navbar3 = () => {
  const [isHovered, setIsHovered] = useState(null);
  const location = useLocation(); // Get the current location

  const handleMouseEnter = (index) => setIsHovered(index);
  const handleMouseLeave = () => setIsHovered(null);

  // Function to check if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Logo" />
        <span className="navbar-name">KRISHISETU</span>
      </div>
      <ul className="navbar-links">
        <li>
          <Link 
            to="/consumer-dashboard" 
            className={`navbar-link ${isHovered === 1 ? 'hover' : ''} ${isActive("/consumer-dashboard") ? 'active' : ''}`} 
            onMouseEnter={() => handleMouseEnter(1)} 
            onMouseLeave={handleMouseLeave}>
            Home
          </Link>
        </li>
        <li>
          <Link 
            to="/consumerprofile" 
            className={`navbar-link ${isHovered === 2 ? 'hover' : ''} ${isActive("/consumerprofile") ? 'active' : ''}`} 
            onMouseEnter={() => handleMouseEnter(2)} 
            onMouseLeave={handleMouseLeave}>
            Profile
          </Link>
        </li>
        <li>
          <Link 
            to="/bargain_consumer" 
            className={`navbar-link ${isHovered === 3 ? 'hover' : ''} ${isActive("/bargain_consumer") ? 'active' : ''}`} 
            onMouseEnter={() => handleMouseEnter(3)} 
            onMouseLeave={handleMouseLeave}>
            Bargain
          </Link>
        </li>
        <li>
          <Link 
            to="/subscribe" 
            className={`navbar-link ${isHovered === 4 ? 'hover' : ''} ${isActive("/subscribe") ? 'active' : ''}`} 
            onMouseEnter={() => handleMouseEnter(4)} 
            onMouseLeave={handleMouseLeave}>
            Subscription
          </Link>
        </li>
        <li>
          <Link 
            to="/cart" 
            className={`navbar-link ${isHovered === 5 ? 'hover' : ''} ${isActive("/cart") ? 'active' : ''}`} 
            onMouseEnter={() => handleMouseEnter(5)} 
            onMouseLeave={handleMouseLeave}>
            Cart
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar3;