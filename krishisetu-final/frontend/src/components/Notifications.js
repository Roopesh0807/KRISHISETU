import React, { useState } from "react";
import {
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  CloudSun,
  FileText,
  CreditCard,
  Handshake,
  Droplets,
  Sun,
  Calendar,
  Wrench,
  TrendingUp,
  Users,
  X
} from "lucide-react";
import "./Notifications.css";

const notificationsData = [
  { id: 1, type: "order-placed", message: "New order placed for 50kg wheat!", time: "5 mins ago", details: "Order #1023 for 50kg wheat placed by Consumer A." },
  { id: 2, type: "order-accepted", message: "Your order for 50kg wheat is accepted!", time: "10 mins ago", details: "Farmer B has accepted your order." },
  { id: 3, type: "weather", message: "Heavy rainfall expected tomorrow. Take precautions!", time: "30 mins ago", details: "According to IMD, 80% rainfall chance in your region." },
  { id: 4, type: "scheme", message: "New government subsidy available for organic farming!", time: "1 hour ago", details: "₹15,000 subsidy for organic certifications this season." },
  { id: 5, type: "disease", message: "Crop disease detected in nearby farms. Check your fields!", time: "3 hours ago", details: "Fungal infection reported in 3km radius." },
  { id: 6, type: "payment", message: "Payment of ₹10,000 credited to your account!", time: "1 day ago", details: "Transaction ID: TXN93828 | From: KrishiSetu" },
  { id: 7, type: "bargain", message: "Buyer offered ₹1200/kg for your wheat. Respond now!", time: "2 days ago", details: "Consumer A is interested in negotiating." },
  { id: 8, type: "harvest-reminder", message: "Time to harvest your rice crop!", time: "3 days ago", details: "Based on crop calendar, rice is ready to harvest." },
  { id: 9, type: "equipment-maintenance", message: "Your tractor is due for maintenance.", time: "4 days ago", details: "Tractor #TRX-90: Last maintenance 6 months ago." },
  { id: 10, type: "market-update", message: "Tomato prices increased to ₹30/kg", time: "5 days ago", details: "Increase due to short supply in local markets." },
  { id: 11, type: "community-event", message: "Farmer meet-up happening this Sunday!", time: "6 days ago", details: "Location: Village Hall | Time: 10AM | Lunch provided" },
];

const FarmerNotifications = () => {
  const [notifications, setNotifications] = useState(notificationsData);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ));
    const clicked = notifications.find(n => n.id === id);
    setSelectedNotification(clicked);
  };

  const getIcon = (type) => {
    switch (type) {
      case "order-placed": return <ShoppingCart size={20} />;
      case "order-accepted": return <CheckCircle size={20} />;
      case "order-rejected": return <AlertTriangle size={20} />;
      case "weather": return <CloudSun size={20} />;
      case "scheme": return <FileText size={20} />;
      case "disease": return <AlertTriangle size={20} />;
      case "payment": return <CreditCard size={20} />;
      case "bargain": return <Handshake size={20} />;
      case "rain": return <Droplets size={20} />;
      case "sun": return <Sun size={20} />;
      case "harvest-reminder": return <Calendar size={20} />;
      case "equipment-maintenance": return <Wrench size={20} />;
      case "market-update": return <TrendingUp size={20} />;
      case "community-event": return <Users size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <div className="notification-container">
      <h2>🌿 Farmer Notifications</h2>

      <h3>🔔 Unread</h3>
      <div className="notifications-grid">
        {unread.length === 0 ? <p>No unread notifications.</p> : unread.map((notification) => (
          <div
            key={notification.id}
            className={`notification-card ${notification.type}`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="icon">{getIcon(notification.type)}</div>
            <div className="text">
              <p>{notification.message}</p>
              <span>{notification.time}</span>
            </div>
          </div>
        ))}
      </div>

      <h3>📬 Read</h3>
      <div className="notifications-grid read-section">
        {read.length === 0 ? <p>No read notifications yet.</p> : read.map((notification) => (
          <div
            key={notification.id}
            className={`notification-card read ${notification.type}`}
            onClick={() => setSelectedNotification(notification)}
          >
            <div className="icon">{getIcon(notification.type)}</div>
            <div className="text">
              <p>{notification.message}</p>
              <span>{notification.time}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedNotification && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="close-btn" onClick={() => setSelectedNotification(null)}>
              <X size={20} />
            </button>
            <h3>{selectedNotification.message}</h3>
            <p>{selectedNotification.details}</p>
            <span className="popup-time">{selectedNotification.time}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerNotifications;
