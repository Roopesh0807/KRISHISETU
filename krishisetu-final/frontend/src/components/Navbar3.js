import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from "../assets/logo.jpg";
import "./Navbar3.css";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faSignOutAlt, 
  faBoxOpen, 
  faReceipt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const Navbar3 = () => {
  const { consumer, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();
  const [, setCartCount] = useState(0);

  const handleMouseEnter = (index) => setIsHovered(index);
  const handleMouseLeave = () => setIsHovered(null);
  const [, setConsumerState] = useState(consumer);

  useEffect(() => {
    setConsumerState(consumer);
  }, [consumer]);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cartItems.length);
    };
    fetchCartCount();
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/LoginPage');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setMobileProfileOpen(false);
  };

  const toggleMobileProfile = () => {
    setMobileProfileOpen(!mobileProfileOpen);
  };

  return (
    <nav className="navbar3">
      <div className="logo" onClick={() => navigate('/consumer-dashboard')}>
        <img src={logo} alt="Logo" />
        <span className="navbar-name">KRISHISETU</span>
      </div>
      
      {/* Desktop Navigation */}
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
            to="/bargain"
            className={`navbar-link ${isHovered === 3 ? 'hover' : ''} ${isActive("/bargain") ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(3)}
            onMouseLeave={handleMouseLeave}>
            Bargain
          </Link>
        </li>
        <li>
          <Link
            to="/community-home"
            className={`navbar-link ${isHovered === 4 ? 'hover' : ''} ${isActive("/communityHome") ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(4)}
            onMouseLeave={handleMouseLeave}>
            Community Orders
          </Link>
        </li>
        <li>
          <Link
            to="/community-flash-deals"
            className={`navbar-link ${isHovered === 12 ? 'hover' : ''} ${isActive("/community-flash-deals") ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(12)}
            onMouseLeave={handleMouseLeave}>
            Community Flash Deals
          </Link>
        </li>
        <li>
          <Link
            to="/subscribe"
            className={`navbar-link ${isHovered === 5 ? 'hover' : ''} ${isActive("/subscribe") ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(5)}
            onMouseLeave={handleMouseLeave}>
            Subscription
          </Link>
        </li>
        <li>
          <Link
            to="/cart"
            className={`navbar-link ${isHovered === 6 ? 'hover' : ''} ${isActive("/cart") ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(6)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="cart-container">
              Cart
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </div>
          </Link>
        </li>
        
        {/* Desktop Profile Dropdown */}
        <li 
          className="profile-icon-container"
          onMouseEnter={() => setShowProfileDropdown(true)}
          onMouseLeave={() => setShowProfileDropdown(false)}
        >
          <div className="profile-icon">
            <FontAwesomeIcon icon={faUser} />
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <span className="user-email">{consumer?.email || 'User'}</span>
                </div>
                
                {consumer?.consumer_id && (
                  <>
                    <Link 
                      to={`/consumerprofile/${consumer.consumer_id}`}
                      className={`dropdown-item ${isActive(`/consumerprofile/${consumer.consumer_id}`) ? 'active' : ''}`}
                      onMouseEnter={() => handleMouseEnter(7)}
                    >
                      <FontAwesomeIcon icon={faUser} className="dropdown-icon" />
                      My Profile
                    </Link>
                    
                    <Link 
                      to="/my-orders"
                      className={`dropdown-item ${isActive("/my-orders") ? 'active' : ''}`}
                      onMouseEnter={() => handleMouseEnter(8)}
                    >
                      <FontAwesomeIcon icon={faBoxOpen} className="dropdown-icon" />
                      My Orders
                    </Link>
                    
                    <Link 
                      to="/transactions"
                      className={`dropdown-item ${isActive("/transactions") ? 'active' : ''}`}
                      onMouseEnter={() => handleMouseEnter(9)}
                    >
                      <FontAwesomeIcon icon={faReceipt} className="dropdown-icon" />
                      Transactions
                    </Link>
                  </>
                )}
                
                <div className="dropdown-divider"></div>
                
                <div
                  className="dropdown-item"
                  onClick={handleLogout}
                  onMouseEnter={() => handleMouseEnter(10)}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
                  Logout
                </div>
              </div>
            )}
          </div>
        </li>
      </ul>
      
      {/* Mobile Hamburger Menu */}
      <div 
        className={`navbar3-hamburger ${mobileMenuOpen ? 'open' : ''}`} 
        onClick={toggleMobileMenu}
      >
        {mobileMenuOpen ? (
          <FontAwesomeIcon icon={faTimes} />
        ) : (
          <>
            <div></div>
            <div></div>
            <div></div>
          </>
        )}
      </div>
      
      {/* Mobile Menu */}
      <ul className={`navbar3-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <li>
          <Link
            to="/consumer-dashboard"
            className="navbar-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/bargain"
            className="navbar-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Bargain
          </Link>
        </li>
        <li>
          <Link
            to="/community-home"
            className="navbar-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Community Orders
          </Link>
        </li>
        <li>
          <Link
            to="/community-flash-deals"
            className="navbar-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Community Flash Deals
          </Link>
        </li>
        <li>
          <Link
            to="/subscribe"
            className="navbar-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Subscription
          </Link>
        </li>
        <li>
          <Link
            to="/cart"
            className="navbar-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="cart-container">
              Cart
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </div>
          </Link>
        </li>
        
        {/* Mobile Profile Section */}
        <li className="navbar3-mobile-profile">
          <div className="user-email">{consumer?.email || 'User'}</div>
          
          <div 
            className="dropdown-item" 
            onClick={toggleMobileProfile}
            style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}
          >
            <span>
              <FontAwesomeIcon icon={faUser} style={{marginRight: '10px'}} />
              My Account
            </span>
            <span>{mobileProfileOpen ? '▲' : '▼'}</span>
          </div>
          
          {mobileProfileOpen && consumer?.consumer_id && (
            <div style={{paddingLeft: '20px'}}>
              <Link 
                to={`/consumerprofile/${consumer.consumer_id}`}
                className="dropdown-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faUser} style={{marginRight: '10px'}} />
                My Profile
              </Link>
              
              <Link 
                to="/my-orders"
                className="dropdown-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faBoxOpen} style={{marginRight: '10px'}} />
                My Orders
              </Link>
              
              <Link 
                to="/transactions"
                className="dropdown-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faReceipt} style={{marginRight: '10px'}} />
                Transactions
              </Link>
              
              <div className="dropdown-divider"></div>
              
              <div
                className="dropdown-item"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} style={{marginRight: '10px'}} />
                Logout
              </div>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar3;