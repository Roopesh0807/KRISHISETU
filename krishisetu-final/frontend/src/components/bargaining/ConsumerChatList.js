import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConsumerChatWindow from './ConsumerChatWindow';
import './BargainingChat.css';

const ConsumerChatList = () => {
  const { consumer_id } = useParams();
  const navigate = useNavigate();
  const [bargainSessions, setBargainSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active bargain sessions for the consumer
        const sessionsRes = await fetch('http://localhost:5000/api/bargain/sessions/consumer');
        const sessionsData = await sessionsRes.json();
        setBargainSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching bargain sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSessionSelect = (sessionId) => {
    navigate(`/bargain/chat/${sessionId}`);
  };

  if (loading) return <div className="loading">Loading bargain sessions...</div>;

  return (
    <div className="chat-list-page">
      <div className="chat-list">
        <h2>Active Bargains</h2>
        {bargainSessions.length === 0 ? (
          <p>No active bargain sessions with farmers</p>
        ) : (
          <ul>
            {bargainSessions.map(session => (
              <li 
                key={session.session_id}
                onClick={() => handleSessionSelect(session.session_id)}
                className={consumer_id === session.session_id ? 'active' : ''}
              >
                <div>
                  <strong>Farmer: {session.farmer_name}</strong>
                  <p>Product: {session.product_name}</p>
                  <p>Status: {session.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chat-window-container">
        {consumer_id ? (
          <ConsumerChatWindow sessionId={consumer_id} />
        ) : (
          <div className="welcome-message">
            <h3>Select a bargain session to continue</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerChatList;