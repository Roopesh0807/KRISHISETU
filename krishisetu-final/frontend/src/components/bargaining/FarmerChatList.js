import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FarmerChatWindow from './FarmerChatWindow';
import './BargainingChat.css';

const FarmerChatList = () => {
  const { farmer_id } = useParams();
  const navigate = useNavigate();
  const [bargainSessions, setBargainSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bargain/sessions/farmer`);
        const data = await response.json();
        setBargainSessions(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleSessionSelect = (sessionId) => {
    navigate(`/farmer/bargain/${sessionId}`);
  };

  if (loading) return <div className="loading">Loading bargain requests...</div>;

  return (
    <div className="chat-list-page">
      <div className="chat-list">
        <h2>Bargain Requests</h2>
        {bargainSessions.length === 0 ? (
          <p>No active bargain requests with consumers</p>
        ) : (
          <ul>
            {bargainSessions.map(session => (
              <li 
                key={session.session_id}
                onClick={() => handleSessionSelect(session.session_id)}
                className={farmer_id === session.farmer_id ? 'active' : ''}
              >
                <div>
                  <strong>Consumer: {session.consumer_name}</strong>
                  <p>Product: {session.product_name}</p>
                  <p>Status: {session.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chat-window-container">
        {farmer_id ? (
          <FarmerChatWindow sessionId={farmer_id} />
        ) : (
          <div className="welcome-message">
            <h3>Select a bargain request to respond</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerChatList;