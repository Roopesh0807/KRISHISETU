import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Subscription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {}; // Ensure product exists

  const [subscriptionType, setSubscriptionType] = useState("");
  const [validity, setValidity] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const handleSubscribe = () => {
    const subscriptionData = {
      productName: product?.name || "No product",
      quantity: product?.quantity || "Not specified",
      subscriptionType,
      validity,
      selectedDay,
      selectedTime,
    };
    
    navigate("/payment", { replace: true, state: subscriptionData }); // Ensure immediate navigation
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Subscription Plan</h2>

        {/* Product Details */}
        {product && (
          <div style={styles.productDetails}>
            <img src={product.image} alt={product.name} style={styles.productImage} />
            <h3>{product.name}</h3>
            <p><strong>Selected Quantity:</strong> {product.quantity}</p>
          </div>
        )}

        {/* Subscription Type */}
        <div style={styles.inputGroup}>
          <label>Subscription Type:</label>
          <select value={subscriptionType} onChange={(e) => setSubscriptionType(e.target.value)} style={styles.select}>
            <option value="">Select Subscription Type</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Validity & Day Selection */}
        {(subscriptionType === "weekly" || subscriptionType === "monthly") && (
          <>
            <div style={styles.inputGroup}>
              <label>Plan Validity:</label>
              <select value={validity} onChange={(e) => setValidity(e.target.value)} style={styles.select}>
                <option value="">Select Validity</option>
                <option value="3months">3 Months</option>
                <option value="6months">6 Months</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label>Select a Delivery Day:</label>
              <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} style={styles.select}>
                <option value="">Select a Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </>
        )}

        {/* Time Selection */}
        <div style={styles.inputGroup}>
          <label>Select Delivery Time:</label>
          <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} style={styles.input} />
        </div>

        {/* Subscribe Button */}
        <button onClick={handleSubscribe} style={styles.button}>Subscribe</button>

        {/* Back Button */}
        <button onClick={() => navigate("/consumer-dashboard")} style={styles.backButton}>Back to Dashboard</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  card: {
    width: "400px",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    color: "#333",
    marginBottom: "20px",
  },
  productDetails: {
    textAlign: "center",
    marginBottom: "20px",
  },
  productImage: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  inputGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
  select: {
    width: "100%",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  backButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default Subscription;