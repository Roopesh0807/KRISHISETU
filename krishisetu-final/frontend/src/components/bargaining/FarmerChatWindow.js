import React, { useState, useEffect } from 'react';
import './BargainingChat.css';

const FarmerChatWindow = ({ sessionId }) => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bargain/${sessionId}`);
        const data = await response.json();
        setSession(data);
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Error fetching bargain session:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleRespond = async (accept) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bargain/${sessionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept })
      });
      const data = await response.json();
      setSession(data.updatedSession);
      setMessages([...messages, data.newMessage]);
    } catch (error) {
      console.error("Error responding to bargain:", error);
    }
  };

  const handleSubmitOffer = async (price) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bargain/${sessionId}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price })
      });
      const data = await response.json();
      setSession(data.updatedSession);
      setMessages([...messages, data.newMessage]);
    } catch (error) {
      console.error("Error submitting offer:", error);
    }
  };

  if (loading) return <div className="loading">Loading bargain session...</div>;
  if (!session) return <div className="error">Session not found</div>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Bargain with {session.consumer_name}</h3>
        <p>Product: {session.product_name}</p>
        <p>Status: {session.status}</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      {session.status === 'requested' && (
        <div className="bargain-actions">
          <button onClick={() => handleRespond(true)}>Accept Bargain</button>
          <button onClick={() => handleRespond(false)}>Reject Bargain</button>
        </div>
      )}

      {session.status === 'countered' && (
        <div className="counter-actions">
          <h4>Consumer's Offer: ₹{session.current_offer}</h4>
          <div className="counter-buttons">
            <button onClick={() => handleSubmitOffer(session.current_offer - 2)}>Counter -₹2</button>
            <button onClick={() => handleSubmitOffer(session.current_offer + 2)}>Counter +₹2</button>
            <button onClick={() => handleRespond(true)}>Accept Offer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerChatWindow;