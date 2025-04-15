import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './farmerbargainorders.css';

const FarmerBargainOrders = () => {
  const { token, farmer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!farmer?.farmer_id) {
      setError("Farmer authentication required");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        console.log(`Fetching orders for farmer: ${farmer.farmer_id}`);
        const response = await fetch(
          `http://localhost:5000/api/farmer/${farmer.farmer_id}/bargain-orders`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API response data:', data); // Debug log

        // Ensure we have an array
        if (!Array.isArray(data)) {
          throw new Error(`Expected array but got ${typeof data}`);
        }

        setOrders(data);
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [farmer, token]);

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!farmer?.farmer_id) return <div className="error">Please login as farmer</div>;

  return (
    <div className="orders-container">
      <h2>Your Bargain Orders ({orders.length})</h2>
      
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Consumer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Original</th>
                <th>Final</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={`${order.order_id}-${order.bargain_id}`}>
                  <td>{order.order_id}</td>
                  <td>{order.consumer_name}</td>
                  <td>{order.product_name} ({order.product_category})</td>
                  <td>{order.quantity}</td>
                  <td>₹{order.original_price}</td>
                  <td>₹{order.final_price}</td>
                  <td>₹{order.total_amount}</td>
                  <td className={`status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FarmerBargainOrders;