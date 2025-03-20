import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar3 from '../components/Navbar3.js'; // Import Navbar3
//import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      {/* Hero Section */}
      <div className="hero-section">
        
        <h1>Welcome to Community Orders</h1>
        <p className="subtitle">Your Gateway to Seamless Group Purchasing</p>
        <div className="button-container">
          <button onClick={() => navigate('/join-community')} className="cta-button">
            Join a Community
          </button>
          <button onClick={() => navigate('/create-community')} className="cta-button">
            Create a Community
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Choose Community Orders?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Group Discounts</h3>
            <p>Enjoy exclusive discounts by pooling orders with your community.</p>
          </div>
          <div className="feature-card">
            <h3>Convenient Delivery</h3>
            <p>Get your orders delivered to a single location for easy pickup.</p>
          </div>
          <div className="feature-card">
            <h3>Transparent Pricing</h3>
            <p>No hidden costs—see exactly what you're paying for.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;