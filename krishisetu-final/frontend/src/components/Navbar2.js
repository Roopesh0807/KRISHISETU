import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.jpg";
import "./Navbar2.css"; // Import the updated CSS

const Navbar2 = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Logo" />
        <span className="navbar-name">KRISHISETU</span>
      </div>
      <ul className="navbar-links">
        <li><Link to="/farmer-dashboard" className="nav-item">Home</Link></li>
        <li><Link to="/profile" className="nav-item">Profile</Link></li>
        <li><Link to="/notifications" className="nav-item">Notifications</Link></li>
        <li><Link to="/add-produce" className="nav-item">Add Produce</Link></li>
        <li><Link to="/feeds" className="nav-item">Feed</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar2;