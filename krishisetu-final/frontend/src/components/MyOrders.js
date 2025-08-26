import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './MyOrders.css';

const MyOrders = () => {
  const { consumer } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!consumer?.consumer_id || !consumer?.token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${consumer.consumer_id}`, {
          headers: {
            'Authorization': `Bearer ${consumer.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please login again.');
          }
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [consumer]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading-container">Loading your orders...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        {error.includes('Session expired') && (
          <button 
            onClick={() => navigate('/login')} 
            className="login-btn"
          >
            Login Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/consumer-dashboard')} className="shop-now-btn">
            Shop Now
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.order_id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order #{order.order_id}</span>
                <span className={`order-status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <div className="order-info">
                  <p><strong>Date:</strong> {formatDate(order.order_date)}</p>
                  <p><strong>Product:</strong> {order.produce_name}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                </div>
                <div className="order-payment">
                  <p><strong>Amount:</strong> ₹{order.amount}</p>
                  <p><strong>Payment Method:</strong> {order.payment_method}</p>
                  <p><strong>Payment Status:</strong> {order.payment_status}</p>
                </div>
              </div>
              {order.is_community && (
                <div className="community-order-tag">Community Order</div>
              )}
              <button 
                onClick={() => navigate(`/order-details/${order.order_id}`)}
                className="view-details-btn"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;