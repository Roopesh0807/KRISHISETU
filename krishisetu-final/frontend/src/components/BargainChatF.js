import React, { useState } from 'react';
import ChatWindow from './ChatWindowBF'; // Import the ChatWindow component
import './BargainingChat.css';

const FarmerChatList = () => {
  const [selectedConsumer, setSelectedConsumer] = useState(null);

  // Mock data for consumers
  const consumers = [
    { id: 1, name: 'Rahul', avatar: 'https://i.pravatar.cc/40?img=1', status: 'Online', lastMessage: 'Can you offer a discount?' },
    { id: 2, name: 'Priya', avatar: 'https://i.pravatar.cc/40?img=2', status: 'Offline', lastMessage: 'What’s the best price?' },
    { id: 3, name: 'Amit', avatar: 'https://i.pravatar.cc/40?img=3', status: 'Online', lastMessage: 'I need 100 kg of onions.' },
  ];

  const handleConsumerClick = (consumer) => {
    setSelectedConsumer(consumer); // Set the selected consumer
  };

  const handleCloseChat = () => {
    setSelectedConsumer(null); // Close the chat window
  };

  console.log('Selected Consumer:', selectedConsumer); // Debugging line

  return (
    <div className="chat-list-page">
      <div className="chat-list">
        <h2>Consumers</h2>
        <ul>
          {consumers.map((consumer) => (
            <li
              key={consumer.id}
              className={`chat-item ${selectedConsumer?.id === consumer.id ? 'active' : ''}`}
              onClick={() => handleConsumerClick(consumer)}
            >
              <img src={consumer.avatar} alt={consumer.name} className="avatar" />
              <div className="chat-info">
                <span className="consumer-name">{consumer.name}</span>
                <span className="last-message">{consumer.lastMessage}</span>
              </div>
              <span className="status">{consumer.status}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-window-container">
        {selectedConsumer ? (
          <ChatWindow member={selectedConsumer} onClose={handleCloseChat} />
        ) : (
          console.log('Rendering Welcome Message') || (
            <div className="welcome-message">
              <h2>Welcome to Bargaining Chats</h2>
              <p>Select a consumer to start chatting.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FarmerChatList;