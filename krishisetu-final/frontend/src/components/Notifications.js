import React, { useState, useEffect } from "react";
import "./Notifications.css";

const NotificationModal = ({ notification, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Notification Details</h2>
      <p><strong>Order #{notification.order_id}</strong>: {notification.message}</p>
      <p><strong>Date:</strong> {new Date(notification.created_at).toLocaleString()}</p>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = async () => {
    const farmer_id = localStorage.getItem("farmerID");

    try {
      const res = await fetch(`http://localhost:5000/api/farmer-notifications/${farmer_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch farmer notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (note) => {
    if (!note.read) {
      try {
        await fetch(`http://localhost:5000/api/mark-notification-read/${note.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        // Re-fetch to get updated read status
        await fetchNotifications();
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }

    setSelectedNotification(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  if (!notifications || notifications.length === 0) {
    return <p>No notifications available.</p>;
  }

  return (
    <div className="notifications-container">
      <div className="notifications-heading">
        <h3>Notifications ({notifications.length})</h3>
      </div>

      <div className="notification-section">
        {notifications.map((note) => (
          <div
            key={note.id}
            className={`notification-item ${!note.read ? "notification-unread" : ""}`}
            onClick={() => handleNotificationClick(note)}
          >
            <strong>Order #{note.order_id}</strong>: {note.message}
            <br />
            <small>{new Date(note.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>

      {isModalOpen && selectedNotification && (
        <NotificationModal notification={selectedNotification} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Notifications;
