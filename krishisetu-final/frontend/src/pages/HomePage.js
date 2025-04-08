import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar3 from '../components/Navbar3.js';
import { useAuth } from '../context/AuthContext';
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [password, setPassword] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { consumer } = useAuth();
  const consumerId = consumer?.consumer_id || localStorage.getItem('consumerId');
  useEffect(() => {
    if (consumerId) {
      fetch(`http://localhost:5000/api/community/consumer/${consumerId}/communities`, {
        headers: { 
          'Authorization': `Bearer ${consumer.token}`
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error('Failed to fetch communities');
          return response.json();
        })
        .then((data) => {
          setCommunities(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching communities:', error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [consumer]); // Add consumer to dependency array

  const handleCommunityClick = (community) => {
    setSelectedCommunity(community);
    setPassword('');
  };

  const handlePasswordSubmit = async () => {
    if (!selectedCommunity || !password) {
      alert('Please enter a password.');
      return;
    }

    const consumerId = consumer?.consumer_id || localStorage.getItem('consumerId');

    try {
      const response = await fetch('http://localhost:5000/api/community/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
           'Authorization': `Bearer ${consumer.token}`
         },
        body: JSON.stringify({
          communityName: selectedCommunity.community_name,
          password,
          consumerId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/community-page/${data.community_id}/${data.isAdmin ? 'admin' : 'member'}`);
      } else {
        alert(data.error || 'Access denied');
      }
    } catch (error) {
      console.error('Error verifying access:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="ks-final-container">
      <Navbar3 />
      
      {/* Hero Section with previous background */}
      <section className="ks-final-hero">
        <div className="ks-hero-overlay">
          <div className="ks-hero-content">
            <h1 className="ks-hero-title">Welcome to <span>KrishiSetu</span></h1>
            <p className="ks-hero-subtitle">Bridging Farmers and Consumers for a Sustainable Future</p>
            <div className="ks-hero-actions">
              <button 
                onClick={() => navigate('/join-community')} 
                className="ks-btn ks-btn-primary ks-btn-glow"
              >
                <i className="fas fa-users ks-btn-icon"></i>
                Join Community
              </button>
              <button 
                onClick={() => navigate('/create-community')} 
                className="ks-btn ks-btn-secondary"
              >
                <i className="fas fa-plus ks-btn-icon"></i>
                Create Community
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Communities Section with current design */}
      <section className="ks-final-communities">
        <div className="ks-section-header">
          <h2 className="ks-section-title">Your Agricultural Networks</h2>
          <div className="ks-section-divider"></div>
        </div>
        
        {isLoading ? (
          <div className="ks-loading-container">
            <div className="ks-loading-spinner"></div>
            <p>Loading your communities...</p>
          </div>
        ) : communities.length > 0 ? (
          <div className="ks-communities-grid">
            {communities.map((community) => (
              <div
                key={community.community_id}
                className={`ks-community-card ${community.isAdmin ? 'ks-admin-card' : 'ks-member-card'}`}
                onClick={() => handleCommunityClick(community)}
              >
                <div className="ks-card-corner"></div>
                <div className="ks-card-content">
                  <div className="ks-card-badge">
                    {community.isAdmin ? (
                      <i className="fas fa-crown ks-badge-icon"></i>
                    ) : (
                      <i className="fas fa-user ks-badge-icon"></i>
                    )}
                    {community.isAdmin ? 'Admin' : 'Member'}
                  </div>
                  <h3 className="ks-card-title">{community.community_name}</h3>
                  <p className="ks-card-description">
                    {community.description || 'Agricultural community focused on sustainable farming'}
                  </p>
                  <div className="ks-card-stats">
                    <div className="ks-stat-item">
                      <i className="fas fa-users ks-stat-icon"></i>
                      <span>{community.member_count || 0} Members</span>
                    </div>
                  </div>
                </div>
                <div className="ks-card-hover-effect"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ks-empty-state">
            <div className="ks-empty-illustration">
              <i className="fas fa-seedling ks-empty-icon"></i>
            </div>
            <h3 className="ks-empty-title">No Communities Yet</h3>
            <p className="ks-empty-text">
              You haven't joined any agricultural communities yet. Start by exploring available 
              communities or create your own to connect with farmers and consumers.
            </p>
            <div className="ks-empty-actions">
              <button 
                onClick={() => navigate('/join-community')} 
                className="ks-btn ks-btn-primary"
              >
                Browse Communities
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Features Section from previous design */}
      <section className="ks-final-features">
        <div className="ks-section-header">
          <h2 className="ks-section-title">Why Choose KrishiSetu?</h2>
          <div className="ks-section-divider"></div>
        </div>
        
        <div className="ks-features-grid">
          <div className="ks-feature-card">
            <div className="ks-feature-icon ks-icon-farmer">
              <i className="fas fa-tractor"></i>
            </div>
            <h3>Direct Farmer Connect</h3>
            <p>Eliminate middlemen and connect directly with farmers for fresh produce at fair prices.</p>
          </div>
          
          <div className="ks-feature-card">
            <div className="ks-feature-icon ks-icon-community">
              <i className="fas fa-hands-helping"></i>
            </div>
            <h3>Community Driven</h3>
            <p>Join or create communities that share your agricultural interests and values.</p>
          </div>
          
          <div className="ks-feature-card">
            <div className="ks-feature-icon ks-icon-eco">
              <i className="fas fa-leaf"></i>
            </div>
            <h3>Sustainable Practices</h3>
            <p>Promote and learn about eco-friendly farming techniques within your community.</p>
          </div>
        </div>
      </section>

      {/* Password Modal from current design */}
      {selectedCommunity && (
        <div className="ks-modal-overlay">
          <div className="ks-modal-container">
            <div className="ks-modal-header">
              <h3>
                <i className="fas fa-lock ks-modal-icon"></i>
                Enter Community Password
              </h3>
              <button 
                onClick={() => setSelectedCommunity(null)} 
                className="ks-modal-close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="ks-modal-body">
              <p>
                To access <strong>{selectedCommunity.community_name}</strong>, please enter the 
                community password below.
              </p>
              <div className="ks-input-group">
                <input
                  type="password"
                  className="ks-modal-input"
                  placeholder="Enter community password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <i className="fas fa-key ks-input-icon"></i>
              </div>
            </div>
            <div className="ks-modal-footer">
              <button 
                onClick={() => setSelectedCommunity(null)} 
                className="ks-btn ks-modal-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={handlePasswordSubmit} 
                className="ks-btn ks-modal-confirm ks-btn-glow"
              >
                Access Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;