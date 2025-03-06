import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import logo from "../assets/logo.jpg";
import "./Navbar1.css";

const Navbar1 = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Logo" />
        <span className="navbar-name">KRISHISETU</span>
      </div>
      <ul className="navbar-links">
        <li><Link to="/" className="navbar-link">HOME</Link></li>
        <li><Link to="/ScrollSection" className="navbar-link">ABOUT US</Link></li>
        <li><Link to="/Contact" className="navbar-link">CONTACT US</Link></li>
        <li><Link to="/LoginPage" className="navbar-link">LOG IN</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar1;
