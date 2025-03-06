import React, { useState } from 'react';
import ChatWindow from './ChatWindowBargain';
import './BargainingChat.css';

const ChatList = () => {
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [farmers, setFarmers] = useState([
    { id: 1, name: 'Deepika', avatar: 'https://i.pravatar.cc/40?img=10', status: 'Online', lastMessage: 'The price is ₹50 per kg.' },
    { id: 2, name: 'Nikita', avatar: 'https://i.pravatar.cc/40?img=20', status: 'Offline', lastMessage: 'Can I offer a discount?' },
    { id: 3, name: 'Roopesh', avatar: 'https://i.pravatar.cc/40?img=30', status: 'Online', lastMessage: 'Delivery charges are extra.' },
    { id: 4, name: 'Shree Raksha', avatar: 'https://i.pravatar.cc/40?img=40', status: 'Online', lastMessage: 'pure organic food.' },
    // { id: 5, name: 'Deepika', avatar: 'https://i.pravatar.cc/40?img=50', status: 'Online', lastMessage: 'The price is ₹50 per kg.' },
    // { id: 6, name: 'Nikita', avatar: 'https://i.pravatar.cc/40?img=60', status: 'Offline', lastMessage: 'Can I offer a discount?' },
    // { id: 7, name: 'Roopesh', avatar: 'https://i.pravatar.cc/40?img=70', status: 'Online', lastMessage: 'Delivery charges are extra.' },
    // { id: 8, name: 'Shree Raksha', avatar: 'https://i.pravatar.cc/40?img=80', status: 'Online', lastMessage: 'pure organic food.' },
    // { id: 9, name: 'Deepika', avatar: 'https://i.pravatar.cc/40?img=10', status: 'Online', lastMessage: 'The price is ₹50 per kg.' },
    // { id: 10, name: 'Nikita', avatar: 'https://i.pravatar.cc/40?img=20', status: 'Offline', lastMessage: 'Can I offer a discount?' },
    // { id: 11, name: 'Roopesh', avatar: 'https://i.pravatar.cc/40?img=30', status: 'Online', lastMessage: 'Delivery charges are extra.' },
    // { id: 12, name: 'Shree Raksha', avatar: 'https://i.pravatar.cc/40?img=40', status: 'Online', lastMessage: 'pure organic food.' },
  ]);

  const handleFarmerClick = (farmer) => {
    setSelectedFarmer(farmer); // Set the selected farmer
  };

  const handleCloseChat = () => {
    setSelectedFarmer(null); // Close the chat window
  };

  const handleNewMessage = (farmerId, message) => {
    setFarmers((prevFarmers) =>
      prevFarmers.map((farmer) =>
        farmer.id === farmerId ? { ...farmer, lastMessage: message } : farmer
      )
    );
  };

  return (
    <div className="chat-list-page">
      <div className="chat-list">
        <h2>Farmers</h2>
        <ul>
          {farmers.map((farmer) => (
            <li
              key={farmer.id}
              className={`chat-item ${selectedFarmer?.id === farmer.id ? 'active' : ''}`}
              onClick={() => handleFarmerClick(farmer)}
            >
              <img src={farmer.avatar} alt={farmer.name} className="avatar" />
              <div className="chat-info">
                <span className="farmer-name">{farmer.name}</span>
                <span className="last-message">{farmer.lastMessage}</span>
              </div>
              <span className="status">{farmer.status}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-window-container">
        {selectedFarmer ? (
          <ChatWindow
          member={selectedFarmer}
          onClose={handleCloseChat}
          onNewMessage={(message) => handleNewMessage(selectedFarmer.id, message)}
        />
        ) : (
          <div className="welcome-message">
            <h2>Welcome to Bargaining Chats</h2>
            <p>Select a farmer to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;