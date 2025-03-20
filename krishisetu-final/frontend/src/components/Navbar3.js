import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from "../assets/logo.jpg";
import "./Navbar3.css";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar3 = () => {
  const { consumer } = useContext(AuthContext);
  console.log("Consumer from AuthContext:", consumer);
  const consumer_id = consumer ? consumer.consumer_id : null;
  const [isHovered, setIsHovered] = useState(null);
  const location = useLocation();
  const { cartCount } = useCart();
  const [, setCartCount] = useState(0);
  const handleMouseEnter = (index) => setIsHovered(index);
  const handleMouseLeave = () => setIsHovered(null);

  const isActive = (path) => location.pathname === path;
     // 🔹 Fetch cart count from localStorage on component mount
     useEffect(() => {
      const fetchCartCount = () => {
        const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        setCartCount(cartItems.length);
      };
  
      fetchCartCount(); // Initial load
  
      // 🔹 Listen for 'cartUpdated' event
      window.addEventListener("cartUpdated", fetchCartCount);
  
      return () => {
        window.removeEventListener("cartUpdated", fetchCartCount);
      };
    }, []);
  return (
    <nav className="navbar3">
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
             to={`/consumerprofile/${consumer_id}`} 
            className={`navbar-link ${isHovered === 2 ? 'hover' : ''} ${isActive(`/consumerprofile/${consumer_id}`) ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(2)}
            onMouseLeave={handleMouseLeave}>
            Profile
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
            className={`navbar-link ${isHovered === 3 ? 'hover' : ''} ${isActive("/communityHome") ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(4)}
            onMouseLeave={handleMouseLeave}>
            Community Orders
          </Link>
        </li>
        <li>
          <Link
            to="/subscribe"
            className={`navbar-link ${isHovered === 4 ? 'hover' : ''} ${isActive("/subscribe") ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(5)}
            onMouseLeave={handleMouseLeave}>
            Subscription
          </Link>
        </li>
        <li>
          <Link
            to="/cart"
            className={`navbar-link ${isHovered === 5 ? 'hover' : ''} ${isActive("/cart") ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(6)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="cart-container">
              Cart
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </div>
          </Link>
        </li>

      </ul>
    </nav>
  );
};

export default Navbar3;
