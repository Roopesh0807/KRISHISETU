import React, { useState } from 'react';
import logo from '../assets/logo.jpg';
import './Navbar1.css';
import { useNavigate } from 'react-router-dom';

const Navbar1 = ({ isLoginPage = false, isAuthPage = false }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Navigation Handlers
  const handleHomeClick = () => {
    navigate('/');
    setIsOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/LoginPage');
    setIsOpen(false);
  };
  
  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar1">
      <div className="logo" onClick={handleHomeClick}>
        <img src={logo} alt="Logo" />
        <span className="navbar-name">KRISHISETU</span>
      </div>
      
      {/* Hamburger Icon */}
      <div className="hamburger" onClick={handleMenuToggle}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      
      {/* Desktop Links */}
      <ul className="navbar-links">
        <li>
          <a href="/" className="navbar-link" onClick={handleHomeClick}>
            HOME
          </a>
        </li>
        {isAuthPage && (
          <li>
            <a href="/LoginPage" className="navbar-link" onClick={handleLoginClick}>
              LOG IN
            </a>
          </li>
        )}
        {!isLoginPage && !isAuthPage && (
          <>
            <li>
              <a href="#about" className="navbar-link">
                ABOUT US
              </a>
            </li>
            <li>
              <a href="#contact" className="navbar-link">
                CONTACT US
              </a>
            </li>
            <li>
              <a href="/LoginPage" className="navbar-link">
                LOG IN
              </a>
            </li>
          </>
        )}
      </ul>
      
      {/* Mobile Menu as a separate container */}
      <ul className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <span className="close-btn" onClick={handleMenuToggle}>&times;</span>
        <li>
          <a href="/" className="navbar-link" onClick={handleHomeClick}>
            HOME
          </a>
        </li>
        {!isLoginPage && !isAuthPage && (
          <>
            <li>
              <a href="#about" className="navbar-link" onClick={() => setIsOpen(false)}>
                ABOUT US
              </a>
            </li>
            <li>
              <a href="#contact" className="navbar-link" onClick={() => setIsOpen(false)}>
                CONTACT US
              </a>
            </li>
            <li>
              <a href="/LoginPage" className="navbar-link" onClick={handleLoginClick}>
                LOG IN
              </a>
            </li>
          </>
        )}
        {isAuthPage && (
          <li>
            <a href="/LoginPage" className="navbar-link" onClick={handleLoginClick}>
              LOG IN
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar1;