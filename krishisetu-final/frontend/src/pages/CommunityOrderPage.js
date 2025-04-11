import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Navbar3 from "../components/Navbar3.js";
import "../styles/CommunityOrderPage.css";

function CommunityOrderPage() {
  const { communityId, orderId } = useParams();
  const navigate = useNavigate();
  const { consumer } = useAuth();
  const [order, setOrder] = useState(null);
  const [community, setCommunity] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash-on-delivery");

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/community/${communityId}/order/${orderId}`,
          {
            headers: {
              'Authorization': `Bearer ${consumer.token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch order data');
        }

        const data = await response.json();
        setOrder(data.order);
        setCommunity(data.community);
        setMember(data.member);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [communityId, orderId, consumer.token]);

  const handlePlaceOrder = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/community/${communityId}/order/${orderId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${consumer.token}`
          },
          body: JSON.stringify({ paymentMethod })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      navigate(`/community/${communityId}/order/${orderId}/confirmation`);
    } catch (err) {
      console.error("Place order error:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!order || !community || !member) {
    return <div className="no-data">No data available</div>;
  }

  const parsedOrders = JSON.parse(order.order_data);
  const parsedDiscount = JSON.parse(order.discount_data);
  const finalAmount = order.total_amount * (1 - (parsedDiscount.totalDiscount / 100));

  return (
    <div className="community-order-page">
      <Navbar3 />
      
      <div className="header">
        <button 
          onClick={() => navigate(`/community/${communityId}`)}
          className="back-btn"
        >
          Back to Community
        </button>
        <h1>Community Order Confirmation</h1>
      </div>

      <div className="order-summary">
        <div className="community-info">
          <h2>{community.name}</h2>
          <p>Delivery Address: {community.address || "Not specified"}</p>
          <p>
            Delivery Date: {new Date(community.delivery_date).toLocaleDateString()} at{" "}
            {community.delivery_time || "N/A"}
          </p>
        </div>

        <div className="member-info">
          <h3>Your Information</h3>
          <p>Name: {member.member_name}</p>
          <p>Phone: {member.phone_number}</p>
        </div>

        <div className="order-items">
          <h3>Your Order</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {parsedOrders.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name}</td>
                  <td>₹{item.price}</td>
                  <td>{item.quantity}</td>
                  <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="discount-summary">
          <h3>Discounts Applied</h3>
          <div className="discount-row">
            <span>Community Discount ({parsedDiscount.memberCount} members):</span>
            <span>{parsedDiscount.memberDiscount}%</span>
          </div>
          <div className="discount-row">
            <span>Volume Discount ({parsedDiscount.itemCount} items):</span>
            <span>{parsedDiscount.itemDiscount}%</span>
          </div>
          <div className="discount-total">
            <span>Total Discount:</span>
            <span>{parsedDiscount.totalDiscount}%</span>
          </div>
        </div>

        <div className="payment-section">
          <h3>Payment Method</h3>
          <div className="payment-options">
            <label>
              <input
                type="radio"
                name="payment"
                value="cash-on-delivery"
                checked={paymentMethod === "cash-on-delivery"}
                onChange={() => setPaymentMethod("cash-on-delivery")}
              />
              Cash on Delivery
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
              Online Payment
            </label>
          </div>
        </div>

        <div className="order-total">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Total Discount:</span>
            <span>- ₹{(order.total_amount * (parsedDiscount.totalDiscount / 100)).toFixed(2)}</span>
          </div>
          <div className="final-total">
            <span>Amount to Pay:</span>
            <span>₹{finalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button 
          className="place-order-btn"
          onClick={handlePlaceOrder}
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
}

export default CommunityOrderPage;