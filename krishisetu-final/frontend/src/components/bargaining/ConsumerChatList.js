import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConsumerChatWindow from './ConsumerChatWindow';
import './ConsumerChatList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const ConsumerChatList = () => {
  const { session_id } = useParams();
  const navigate = useNavigate();
  const { consumer } = useAuth();
  const [bargainSessions, setBargainSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBargainSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!consumer?.token || !consumer?.id) {
          navigate('/LoginPage');
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/bargain/sessions/consumer/${consumer.id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${consumer.token}`,
            },
            credentials: 'include'
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired - please login again');
          }
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Transform data to match your frontend structure
        const formattedSessions = data.map(session => ({
          session_id: session.bargain_id,
          farmer_name: session.farmer_name || 'Unknown Farmer',
          product_name: session.product_name || 'Unknown Product',
          current_price: session.current_price || 0,
          quantity: session.quantity || 1,
          status: session.status || 'pending',
          updated_at: session.updated_at,
          unread_count: session.unread_count || 0
        }));

        setBargainSessions(formattedSessions);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
        
        if (error.message.includes('expired') || error.message.includes('Authentication')) {
          navigate('/LoginPage');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBargainSessions();
  }, [consumer, navigate]);

  const handleSessionSelect = (sessionId) => {
    if (!consumer?.token) {
      navigate('/LoginPage');
      return;
    }
    navigate(`/consumer/bargain/chat/${sessionId}`);
  };

  const filteredSessions = bargainSessions.filter(session => {
    const farmerName = session.farmer_name.toLowerCase();
    const productName = session.product_name.toLowerCase();
    return (
      farmerName.includes(searchTerm.toLowerCase()) ||
      productName.includes(searchTerm.toLowerCase())
    );
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return (
    <div className="loading-container">
      <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      <p>Loading bargain sessions...</p>
    </div>
  );

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="consumer-chat-app">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Active Bargains</h2>
        </div>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by farmer or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
  
        <div className="session-list">
          {filteredSessions.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <p>No matching requests found</p>
              ) : (
                <p>No active bargain requests</p>
              )}
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.session_id}
                className={`session-card ${session_id === session.session_id ? "active" : ""}`}
                onClick={() => handleSessionSelect(session.session_id)}
              >
                <div className="farmer-avatar">
                  {session.farmer_name.charAt(0).toUpperCase()}
                </div>
                
                <div className="session-content">
                  <div className="session-header">
                    <h3>{session.farmer_name}</h3>
                    <span className="session-time">
                      {formatTime(session.updated_at)}
                    </span>
                  </div>
                  
                  <div className="session-details">
                    <p className="product-info">
                      <strong>{session.product_name}</strong> ({session.quantity}kg)
                    </p>
                    <p className="price-info">
                      Current: ₹{session.current_price}/kg
                    </p>
                  </div>
                </div>
                
                {session.unread_count > 0 && (
                  <div className="unread-badge">
                    {session.unread_count}
                  </div>
                )}
                
                {session.status === 'pending' && (
                  <div className="status-indicator pending" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
  
      <div className="chat-window-container">
        {session_id ? (
          <ConsumerChatWindow
            sessionId={session_id}
            onBack={() => navigate("/consumer/bargain")}
          />
        ) : (
          <div className="empty-chat-window">
            <div className="empty-content">
              <h3>Select a bargain request</h3>
              <p>Choose a conversation from the sidebar to start bargaining</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerChatList;