import React from 'react';
import './LoginPage.css';
import LoginBg from '../assets/LoginBg.jpg';
// import Logo from '../assets/logo.jpg';
import Farmer from '../assets/farmer.jpeg';
import Consumer from '../assets/consumer.jpeg';
import { useNavigate } from 'react-router-dom';


const LoginPage = () => {
  const navigate = useNavigate();

  // College Admin Navigation Handler
  const handleFarmerClick = () => {
    navigate('/farmer-login');
  };

  //Super Admin Navigation Handler
  const handleconsumerClick = () => {
    navigate('/consumer-login');
  };

 
  return (
    <div className="login-cont">
        <img src={LoginBg} alt="Background" />
     
        <div className="log-cont">
        <h2 className="login-title">Login As</h2>
        <div className="login-options">
          
          {/* College Admin Card */}
          <button onClick={handleFarmerClick} className="login-card">
            <img src={Farmer} alt="Farmer" />
            <p>Farmer</p>
          </button>
          
          {/* Super Admin Card */}
          <button onClick={handleconsumerClick} className="login-card">
            <img src={Consumer} alt="Consumer" />
            <p>Consumer</p>
          </button>
          
        
        </div>
      </div>
    
    </div>
  );
};

export default LoginPage;
