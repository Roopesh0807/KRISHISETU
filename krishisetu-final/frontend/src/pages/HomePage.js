import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar3 from '../components/Navbar3.js'; // Import Navbar3
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="krishi-home-page">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      {/* Hero Section */}
      <div className="krishi-hero-section">
        <div className="krishi-hero-content">
          <h1>Welcome to KrishiSetu</h1>
          <p className="krishi-subtitle">Empowering Farmers, Connecting Communities</p>
          <div className="krishi-button-container">
            <button onClick={() => navigate('/join-community')} className="krishi-cta-button">
              Join a Community
            </button>
            <button onClick={() => navigate('/create-community')} className="krishi-cta-button">
              Create a Community
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="krishi-features-section">
        <h2>Why Choose KrishiSetu?</h2>
        <div className="krishi-features-grid">
          <div className="krishi-feature-card">
            <div className="krishi-feature-icon">
              <i className="fas fa-tractor"></i> {/* Font Awesome icon */}
            </div>
            <h3>Farm-to-Table</h3>
            <p>Directly connect with farmers and get fresh produce at your doorstep.</p>
          </div>
          <div className="krishi-feature-card">
            <div className="krishi-feature-icon">
              <i className="fas fa-hand-holding-usd"></i> {/* Font Awesome icon */}
            </div>
            <h3>Fair Pricing</h3>
            <p>Transparent pricing ensures farmers get their fair share.</p>
          </div>
          <div className="krishi-feature-card">
            <div className="krishi-feature-icon">
              <i className="fas fa-users"></i> {/* Font Awesome icon */}
            </div>
            <h3>Community Support</h3>
            <p>Join a network of farmers and consumers working together.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;