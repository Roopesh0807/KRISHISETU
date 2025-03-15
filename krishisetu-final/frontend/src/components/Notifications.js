import React, { useState } from "react";
import { CloudLightning, CheckCircle, FileText, AlertTriangle, CreditCard } from "lucide-react";
import "./Notifications.css";

const notificationsData = [
  { id: 1, type: "order", message: "Your order for 50kg wheat is accepted!", time: "5 mins ago" },
  { id: 2, type: "weather", message: "Heavy rainfall expected tomorrow. Take precautions!", time: "30 mins ago" },
  { id: 3, type: "scheme", message: "New government subsidy available for organic farming!", time: "1 hour ago" },
  { id: 4, type: "disease", message: "Crop disease detected in nearby farms. Check your fields!", time: "3 hours ago" },
  { id: 5, type: "payment", message: "Payment of ₹10,000 credited to your account!", time: "1 day ago" },
];

const FarmerNotifications = () => {
  const [notifications, setNotifications] = useState(notificationsData);

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="notification-container">
      <h2>🌿 Farmer Notifications</h2>
      <div className="notifications">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-card ${notification.type} ${notification.read ? "read" : ""}`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="icon">
              {notification.type === "order" && <CheckCircle size={20} />}
              {notification.type === "weather" && <CloudLightning size={20} />}
              {notification.type === "scheme" && <FileText size={20} />}
              {notification.type === "disease" && <AlertTriangle size={20} />}
              {notification.type === "payment" && <CreditCard size={20} />}
            </div>
            <div className="text">
              <p>{notification.message}</p>
              <span>{notification.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmerNotifications;