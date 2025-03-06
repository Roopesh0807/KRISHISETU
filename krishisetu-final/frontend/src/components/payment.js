import React, { useState } from "react";
import "./payment.css"; // Ensure this file exists or remove this import if unnecessary

const PlaceOrder = () => {
  const [deliveryType, setDeliveryType] = useState("regular");
  const [showPopup, setShowPopup] = useState(false);
  const deliveryCharge = deliveryType === "regular" ? 33 : 63;
  const itemPrice = 53;
  const tax = 5;
  const total = itemPrice + (deliveryType === "regular" ? 10 : 20) + tax;

  const handlePayment = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // Hide popup after 3 seconds
  };

  return (
    <div className="place-order-container">
      <div className="order-box">
        {/* Address Section */}
        <h2 className="section-title">Enter Delivery Address</h2>
        <div className="address-box">
          <p className="font-bold">Name: Roopesh Kumar K R</p>
          <p>Phone Number: 6363134856</p>
          <div className="address-grid">
            <input className="input-field" placeholder="48/25-16, Ashwattappa Nilaya" disabled />
            <input className="input-field" placeholder="Apartment Name" disabled />
            <input className="input-field" placeholder="Jakkasandra" disabled />
            <input className="input-field" placeholder="Bangalore" disabled />
            <input className="input-field" placeholder="560102" disabled />
          </div>
        </div>

        {/* Delivery Options */}
        <div className="delivery-options-box">
          <h3 className="section-subtitle">Select Delivery Type</h3>
          <div className="delivery-options">
            <label className="radio-label">
              <input
                type="radio"
                name="delivery"
                value="regular"
                checked={deliveryType === "regular"}
                onChange={() => setDeliveryType("regular")}
              />
              Regular delivery ₹33
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="delivery"
                value="instant"
                checked={deliveryType === "instant"}
                onChange={() => setDeliveryType("instant")}
              />
              Instant delivery ₹63
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary-box">
          <p>Item price: ₹{itemPrice}</p>
          <p>Delivery charge: ₹{deliveryCharge}</p>
          <p>Tax: ₹{tax}</p>
          <p className="total-amount">Total: ₹{total}</p>
        </div>

        {/* Payment Button */}
        <button onClick={handlePayment} className="payment-btn">
          Proceed to Payment
        </button>
      </div>

      {/* Payment Success Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <span className="success-icon">✔</span>
            <h2 className="popup-text">Payment Successfully Done</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
