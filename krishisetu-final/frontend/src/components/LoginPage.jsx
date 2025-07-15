// import React from 'react';
// import './LoginPage.css';
// import LoginBg from '../assets/LoginBg.jpg';
// import Farmer from '../assets/farmer.jpeg';
// import Consumer from '../assets/consumer.jpeg';
// import { useNavigate } from 'react-router-dom';

// const LoginPage = () => {
//   const navigate = useNavigate();

//   // Farmer Navigation Handler
//   const handleFarmerClick = () => {
//     navigate('/farmer-login');
//   };

//   // Consumer Navigation Handler
//   const handleConsumerClick = () => {
//     navigate('/consumer-login');
//   };

//   return (
//     <div className="login-cont">
//       <img src={LoginBg} alt="Background" className="login-bg" />
//       <div className="log-cont">
//         <h2 className="login-title">Login As</h2>
//         <div className="login-options">
//           {/* Farmer Card */}
//           <button onClick={handleFarmerClick} className="login-card">
//             <img src={Farmer} alt="Farmer" className="login-card-img" />
//             <p>Farmer</p>
//           </button>
//           {/* Consumer Card */}
//           <button onClick={handleConsumerClick} className="login-card">
//             <img src={Consumer} alt="Consumer" className="login-card-img" />
//             <p>Consumer</p>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaUserShield, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './LoginPage.css';
import LoginBg from '../assets/LoginBg.jpg';
import FarmerImage from '../assets/farmer.jpeg';
import ConsumerImage from '../assets/consumer.jpeg';

const KrishisetuLogin = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  // Card data
  const loginOptions = [
    {
      id: 'farmer',
      title: 'Farmer Portal',
      description: 'Access farming resources, market prices, and sell your produce directly',
      icon: <FaUserShield className="ks-login-card-icon" />,
      image: FarmerImage,
      action: () => navigate('/farmer-login')
    },
    {
      id: 'consumer',
      title: 'Consumer Portal',
      description: 'Discover fresh farm produce directly from local growers',
      icon: <FaUserTie className="ks-login-card-icon" />,
      image: ConsumerImage,
      action: () => navigate('/consumer-login')
    }
  ];

  return (
    <div className="ks-login-container">
      {/* Background with overlay */}
      <div className="ks-login-bg-overlay"></div>
      <img src={LoginBg} alt="Farm landscape" className="ks-login-bg-image" />
      
      {/* Main content */}
      <motion.div 
        className="ks-login-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="ks-login-header">
          <h1 className="ks-login-title">
            <span className="ks-login-title-highlight">Krishisetu</span> Portal
          </h1>
          <p className="ks-login-subtitle">
            Connecting farmers and consumers through sustainable agriculture
          </p>
        </div>

        <div className="ks-login-cards-container">
          {loginOptions.map((option) => (
            <motion.div
              key={option.id}
              className={`ks-login-card ${hoveredCard === option.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(option.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={option.action}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="ks-login-card-image-container">
                <img 
                  src={option.image} 
                  alt={option.title} 
                  className="ks-login-card-image" 
                />
                <div className="ks-login-card-overlay"></div>
              </div>
              
              <div className="ks-login-card-content">
                <div className="ks-login-card-icon-container">
                  {option.icon}
                </div>
                <h3 className="ks-login-card-title">{option.title}</h3>
                <p className="ks-login-card-description">{option.description}</p>
                
                <motion.div 
                  className="ks-login-card-cta"
                  animate={{ 
                    x: hoveredCard === option.id ? 5 : 0,
                    opacity: hoveredCard === option.id ? 1 : 0.8
                  }}
                >
                  <span>Enter Portal</span>
                  <FaArrowRight className="ks-login-card-arrow" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="ks-login-footer">
          <p className="ks-login-footer-text">
            New to Krishisetu? <a href="/register" className="ks-login-footer-link">Create an account</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default KrishisetuLogin;