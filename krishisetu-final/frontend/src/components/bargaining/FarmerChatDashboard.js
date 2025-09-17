import React, { useState } from 'react';
import FarmerChatList from './FarmerChatList';
import FarmerChatWindow from './FarmerChatWindow';
import './FarmerChatDashboard.css';

const FarmerChatDashboard = () => {
    const [selectedSession, setSelectedSession] = useState(null);

    return (
        <div className="farmer-chat-dashboard">
            <div className="chatlist-container">
                <FarmerChatList 
                    onSessionSelect={setSelectedSession} 
                    selectedSession={selectedSession} 
                />
            </div>
            <div className="chatwindow-container">
                {selectedSession ? (
                    <FarmerChatWindow bargainId={selectedSession.bargain_id} />
                ) : (
                    <div className="empty-chat-window">
                        <h3>Select a bargain request</h3>
                        <p>Choose a conversation from the sidebar to start bargaining</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerChatDashboard;