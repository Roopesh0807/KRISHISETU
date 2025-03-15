import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useParams to get consumer_id from URL, useNavigate for navigation
import ConsumerChatWindow from './ChatWindowBargainF'; // The updated chat window for consumers
import './BargainingChat.css';

const ConsumerChatList = () => {
  const { consumer_id } = useParams(); // Get the consumer_id from URL
  const navigate = useNavigate(); // Navigate hook
  const [consumers, setConsumers] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch list of consumers
  useEffect(() => {
    const fetchConsumers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/consumerprof');
        const data = await response.json();
        setConsumers(data);
      } catch (error) {
        setError('Failed to fetch consumers');
      } finally {
        setLoading(false);
      }
    };

    fetchConsumers();
  }, []);

  // Fetch selected consumer's details based on consumer_id from URL or when manually selected
  useEffect(() => {
    if (consumer_id) {
      const fetchConsumerDetails = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/consumerprof/${consumer_id}`);
          const data = await response.json();
          setSelectedConsumer(data);
        } catch (error) {
          setError('Failed to fetch consumer details');
        }
      };
      fetchConsumerDetails();
    }
  }, [consumer_id]); // Runs when the consumer_id in the URL changes
   // Runs when the consumer_id in the URL changes

  // Handle consumer selection from the list (manual select)
  const handleConsumerClick = (consumer) => {
    setSelectedConsumer(consumer);
    navigate(`/consumerprof/${consumer.consumer_id}`); // Navigate to the consumer's chat window
  };

  const handleCloseChat = () => {
    setSelectedConsumer(null); // Close the chat window
  };

  if (loading) {
    return <div>Loading consumers...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="chat-list-page">
      <div className="chat-list">
        <h2>Consumers</h2>
        <ul>
          {consumers.map((consumer) => (
            <li
              key={consumer.consumer_id}
              className={`chat-item ${selectedConsumer?.consumer_id === consumer.consumer_id ? 'active' : ''}`}
              onClick={() => handleConsumerClick(consumer)} // Clicking on a consumer to open chat
            >
              <img src={consumer.photo || 'default-avatar.png'} alt={consumer.name} className="avatar" />
              <div className="chat-info">
                <span className="consumer-name">{consumer.name}</span>
                <p className="consumer-id">{consumer.consumer_id}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Display the chat window if a consumer is selected */}
      <div className="chat-window-container">
            
      {selectedConsumer ? (
  <ConsumerChatWindow
    consumer_id={selectedConsumer.consumer_id}
    name={selectedConsumer.name}
    photo={selectedConsumer.photo}
    onClose={handleCloseChat}
  />
) : (
  <div className="welcome-message">
    <h2>Welcome to Consumer Chats</h2>
    <p>Select a consumer to start chatting.</p>
  </div>
)}
      </div>
    </div>
  );
};

export default ConsumerChatList;
