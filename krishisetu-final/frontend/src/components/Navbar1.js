import React from 'react';
import logo from '../assets/logo.jpg';
import './Navbar1.css';
import { useNavigate } from 'react-router-dom';

const Navbar1 = ({ isLoginPage = false, isAuthPage = false }) => {
  const navigate = useNavigate();

  // Navigation Handlers
  const handleHomeClick = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/LoginPage');
  };

  return (
    <nav className="navbar1">
      <div className="logo" onClick={handleHomeClick}>
        <img src={logo} alt="Logo" />
        <span className="navbar-name">KRISHISETU</span>
      </div>
      <ul className="navbar-links">
        {/* Always show Home button */}
        <li>
          <a href="/" className="navbar-link" onClick={handleHomeClick}>
            HOME
          </a>
        </li>

        {/* Show Login button only on auth pages (login/register) */}
        {isAuthPage && (
          <li>
            <a href="/LoginPage" className="navbar-link" onClick={handleLoginClick}>
              LOG IN
            </a>
          </li>
        )}

        {/* Hide other buttons on login page */}
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
    </nav>
  );
};

export default Navbar1;