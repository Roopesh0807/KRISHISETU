import React from 'react';
import './LoginPage.css';
import LoginBg from '../assets/LoginBg.jpg';
import Farmer from '../assets/farmer.jpeg';
import Consumer from '../assets/consumer.jpeg';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  // Farmer Navigation Handler
  const handleFarmerClick = () => {
    navigate('/farmer-login');
  };

  // Consumer Navigation Handler
  const handleConsumerClick = () => {
    navigate('/consumer-login');
  };

  return (
    <div className="login-cont">
      <img src={LoginBg} alt="Background" className="login-bg" />
      <div className="log-cont">
        <h2 className="login-title">Login As</h2>
        <div className="login-options">
          {/* Farmer Card */}
          <button onClick={handleFarmerClick} className="login-card">
            <img src={Farmer} alt="Farmer" className="login-card-img" />
            <p>Farmer</p>
          </button>
          {/* Consumer Card */}
          <button onClick={handleConsumerClick} className="login-card">
            <img src={Consumer} alt="Consumer" className="login-card-img" />
            <p>Consumer</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;