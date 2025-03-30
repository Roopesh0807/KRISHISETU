import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './cbargain.css';

const ConsumerChatWindow = () => {
  const { session_id } = useParams();
  console.log("Extracted session_id:", session_id);

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          alert("You are not logged in. Redirecting...");
          window.location.href = "/login";
          return;
        }

        const response = await fetch(`http://localhost:5000/api/bargain/${session_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        console.log("✅ Session Data:", data);

        setSession(data);
        setMessages(data.offers || []);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching session:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSession();
}, [session_id]);

  /** ✅ FIX: Define handleSubmitOffer */
  const handleSubmitOffer = async (price) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ No token found in localStorage!");
        alert("You are not logged in. Redirecting...");
        window.location.href = "/login";
        return;
      }

      console.log("🔍 Sending Token in Header:", token);

      const response = await fetch(`http://localhost:5000/api/bargain/${session_id}/offer`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ price })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prevMessages) => [...prevMessages, data.newMessage]);
    } catch (error) {
      console.error("Error submitting offer:", error);
      alert("Failed to send offer. Try again.");
    }
  };

  if (loading) return <div className="loading">Loading bargain session...</div>;
  if (error) return <div className="error">⚠️ {error}</div>;
  if (!session) return <div className="error">Session not found</div>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Bargaining for {session?.product_id || "Unknown Product"}</h3>
        <p>Current Status: {session.status}</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      {session?.status === 'accepted' && session?.original_price && (
  <div className="price-suggestions">
    <h4>Make an Offer</h4>
    <div className="suggestion-buttons">
      {[session.original_price - 4, session.original_price - 2, session.original_price + 2, session.original_price + 4]
        .filter(price => price > 0)
        .map((price, i) => (
          <button key={i} onClick={() => handleSubmitOffer(price)}>
            ₹{price}
          </button>
        ))}
    </div>
  </div>
)}

      {session.status === 'completed' && (
        <button 
          className="checkout-btn" 
          onClick={() => window.location.href = '/checkout'}
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
};

export default ConsumerChatWindow;
