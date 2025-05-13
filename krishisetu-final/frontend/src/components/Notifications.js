import React, { useState, useEffect } from "react";
import "./Notifications.css";

const NotificationModal = ({ notification, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <h2>Notification Details</h2>
      <p><strong>Order #{notification.order_id}</strong></p>
      <p>{notification.message}</p>
      <p><strong>Date:</strong> {new Date(notification.created_at).toLocaleString()}</p>
      <button className="close-button" onClick={onClose}>Close</button>
    </div>
  </div>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = async () => {
    const farmer_id = localStorage.getItem("farmerID");
    const token = localStorage.getItem("token");

    if (!farmer_id || !token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/farmer-notifications/${farmer_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) setNotifications(data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/mark-notification-read/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) await markAsRead(notification.id);
    setSelectedNotification(notification);
    fetchNotifications(); // Refresh the list to update read status
  };

  const handleCloseModal = () => setSelectedNotification(null);

  return (
    <div className="notifications-container">
      <h3 className="notifications-heading">
        Notifications ({notifications.length})
      </h3>

      {notifications.length === 0 ? (
        <p className="no-notifications">No notifications available.</p>
      ) : (
        <div className="notification-list">
          {notifications.map((note) => (
            <div
              key={note.id}
              className={`notification-item ${!note.read ? "unread" : ""}`}
              onClick={() => handleNotificationClick(note)}
            >
              <strong>Order #{note.order_id}</strong>: {note.message}
              <br />
              <small>{new Date(note.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}

      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Notifications;
