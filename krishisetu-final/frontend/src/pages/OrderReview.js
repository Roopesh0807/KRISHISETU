import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./../styles/OrderReview.css";

const OrderReview = ({ isSidebarOpen }) => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get farmer_id from URL query params
  const queryParams = new URLSearchParams(location.search);
  const farmer_id = queryParams.get('farmer_id');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("Fetching orders for farmer_id:", farmer_id); // Debug log
        if (!farmer_id) {
          throw new Error("Farmer ID is required. Please ensure you're logged in.");
        }

        const response = await axios.get(`http://localhost:5000/api/farmer/orders/${farmer_id}`);
        console.log("Orders response:", response.data); // Debug log
        setOrders(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [farmer_id]);


  // const OrderItem = ({ order }) => {
  //   return (
  //     <tr className="order-item">
  //       <td>{order.orderid}</td>
  //       <td>{new Date(order.order_date).toLocaleDateString()}</td>
  //       <td>{order.produce_name}</td>
  //       <td>{order.quantity} kg</td>
  //       <td>₹{order.amount}</td>
  //       <td>
  //         <span className={`status-badge ${order.status.toLowerCase()}`}>
  //           {order.status}
  //         </span>
  //       </td>
  //       <td>
  //         <span className={`payment-badge ${order.payment_status.toLowerCase()}`}>
  //           {order.payment_status}
  //         </span>
  //       </td>
  //     </tr>
  //   );
  // };

  if (loading) {
    return (
      <div className={`order-review-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`order-review-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`order-review-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <div className="order-header">
        <h2>Order History</h2>
        <p>View and manage your farm produce orders</p>
      </div>

      {orders.length > 0 ? (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderid} className="order-item">
                  <td>{order.orderid}</td>
                  <td>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td>{order.produce_name}</td>
                  <td>{order.quantity} kg</td>
                  <td>₹{order.amount}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge ${order.payment_status.toLowerCase()}`}>
                      {order.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-orders">
          <i className="fas fa-clipboard"></i>
          <p>No orders found</p>
        </div>
      )}
    </div>
  );
};

export default OrderReview;