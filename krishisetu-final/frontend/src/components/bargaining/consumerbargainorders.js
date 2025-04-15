import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Consumerbargainorders.css';

const ConsumerBargainOrders = () => {
  const { token, consumer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!consumer?.consumer_id) {
      setError("Please login as a consumer to view orders");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/consumer/${consumer.consumer_id}/bargain-orders`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
        
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [consumer, token]);

  if (loading) return <div className="loading-spinner">Loading your orders...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!consumer) return <div className="auth-warning">Please login to view orders</div>;

  return (
    <div className="consumer-orders-container">
      <h2 className="orders-header">Your Bargain Orders</h2>
      <p className="orders-count">Total orders: {orders.length}</p>

      {orders.length > 0 ? (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Farmer Name</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Original Price</th>
                <th>Final Price</th>
                <th>Total</th>
                <th>Status</th>
                <th>Order Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={`${order.order_id}-${order.consumer_id}`}>
                  <td>{order.order_id}</td>
                  <td>{order.farmer_name || 'Unknown Farmer'}</td>
                  <td>{order.product_name} ({order.product_category})</td>
                  <td>{order.quantity} kg</td>
                  <td>₹{order.original_price}</td>
                  <td>₹{order.final_price}</td>
                  <td>₹{order.total_amount}</td>
                  <td className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-orders">No bargain orders found</div>
      )}
    </div>
  );
};

export default ConsumerBargainOrders;