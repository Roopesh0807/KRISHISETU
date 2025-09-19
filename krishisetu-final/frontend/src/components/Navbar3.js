// import React, { useState, useEffect, useContext } from 'react';
// import { Link, useLocation,useNavigate } from 'react-router-dom';
// import logo from "../assets/logo.jpg";
// import "./Navbar3.css";
// import { AuthContext } from "../context/AuthContext";
// import { useCart } from "../context/CartContext";

// const Navbar3 = () => {
//   const { consumer } = useContext(AuthContext);
//   console.log("Navbar3 Consumer Data:", consumer); 
// const navigate = useNavigate();
//   const [isHovered, setIsHovered] = useState(null);
//   const location = useLocation();
//   const { cartCount } = useCart();
//   const [, setCartCount] = useState(0);
//   const handleMouseEnter = (index) => setIsHovered(index);
//   const handleMouseLeave = () => setIsHovered(null);
//   const [, setConsumerState] = useState(consumer);

// useEffect(() => {
//   setConsumerState(consumer);
// }, [consumer]);

//   const isActive = (path) => location.pathname === path;
//      // 🔹 Fetch cart count from localStorage on component mount
//      useEffect(() => {
//       const fetchCartCount = () => {
//         const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
//         setCartCount(cartItems.length);
//       };
  
//       fetchCartCount(); // Initial load
  
//       // 🔹 Listen for 'cartUpdated' event
//       window.addEventListener("cartUpdated", fetchCartCount);
  
//       return () => {
//         window.removeEventListener("cartUpdated", fetchCartCount);
//       };
//     }, []);
//   return (
//     <nav className="navbar3">
//       <div className="logo" onClick={() => navigate('/consumer-dashboard')}>
//         <img src={logo} alt="Logo" />
//         <span className="navbar-name">KRISHISETU</span>
//       </div>
//       <ul className="navbar-links">
//         <li>
//           <Link
//             to="/consumer-dashboard"
//             className={`navbar-link ${isHovered === 1 ? 'hover' : ''} ${isActive("/consumer-dashboard") ? 'active' : ''}`}
//             onMouseEnter={() => handleMouseEnter(1)}
//             onMouseLeave={handleMouseLeave}>
//             Home
//           </Link>
//         </li>
//         <li>
//         {consumer?.consumer_id && (
//           <Link
//             to={`/consumerprofile/${consumer.consumer_id}`}
//             className={`navbar-link ${isHovered === 2 ? 'hover' : ''} ${isActive(`/consumerprofile/${consumer.consumer_id}`) ? 'active' : ''}`}
//             onMouseEnter={() => handleMouseEnter(2)}
//             onMouseLeave={handleMouseLeave}
//           >
//             Profile
//           </Link>
//         )}


//         </li>
//         <li>
//           <Link
//             to="/bargain"
//             className={`navbar-link ${isHovered === 3 ? 'hover' : ''} ${isActive("/bargain") ? 'active' : ''}`}
//             onMouseEnter={() => handleMouseEnter(3)}
//             onMouseLeave={handleMouseLeave}>
//             Bargain
//           </Link>
//         </li>
//         <li>
//           <Link
//             to="/community-home"
//             className={`navbar-link ${isHovered === 3 ? 'hover' : ''} ${isActive("/communityHome") ? 'active' : ''}`}
//             onMouseEnter={() => handleMouseEnter(4)}
//             onMouseLeave={handleMouseLeave}>
//             Community Orders
//           </Link>
//         </li>
//         <li>
//           <Link
//             to="/subscribe"
//             className={`navbar-link ${isHovered === 4 ? 'hover' : ''} ${isActive("/subscribe") ? 'active' : ''}`}
//             onMouseEnter={() => handleMouseEnter(5)}
//             onMouseLeave={handleMouseLeave}>
//             Subscription
//           </Link>
//         </li>
//         <li>
//           <Link
//             to="/cart"
//             className={`navbar-link ${isHovered === 5 ? 'hover' : ''} ${isActive("/cart") ? 'active' : ''}`}
//             onMouseEnter={() => handleMouseEnter(6)}
//             onMouseLeave={handleMouseLeave}
//           >
//             <div className="cart-container">
//               Cart
//               {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
//             </div>
//           </Link>
//         </li>
//         <li>
//           <Link
//             to="/LoginPage"
//             className={`navbar-link ${isHovered === 3 ? 'hover' : ''} ${isActive("/") ? 'active' : ''}`}
//             onMouseEnter={() => handleMouseEnter(3)}
//             onMouseLeave={handleMouseLeave}>
//             Logout
//           </Link>
//         </li>

//       </ul>
//     </nav>
//   );
// };

// export default Navbar3;



// Navbar3.js
/* Add these new imports at the top of your file */
import { faBoxOpen, faReceipt } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from "../assets/logo.jpg";
import "./Navbar3.css";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Navbar3 = () => {
  const { consumer, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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
  };

  return (
    <nav className="navbar3">
      <div className="logo" onClick={() => navigate('/consumer-dashboard')}>
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
        
        <Link
          to="/LoginPage"
          className={`dropdown-item ${isActive("/LoginPage") ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            logout();
            navigate('/LoginPage');
          }}
          onMouseEnter={() => handleMouseEnter(10)}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
          Logout
        </Link>
      </div>
    )}
  </div>
</li>
      </ul>
    </nav>
  );
};

export default Navbar3;