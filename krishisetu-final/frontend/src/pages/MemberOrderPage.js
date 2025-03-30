import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js"; // Import Navbar3
// import "../styles/MemberOrder.css";

function MemberOrderPage() {
  const { communityId, consumerId } = useParams(); // Extract communityId and consumerId from the URL
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch member details based on consumer_id
    fetch(`http://localhost:5000/api/member/${consumerId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch member details");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Member Data:", data); // Debugging: Log member data
        setMember(data);

        // Fetch orders for the member
        return fetch(`http://localhost:5000/api/order/${communityId}/member/${consumerId}`);
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        return response.json();
      })
      .then((ordersData) => {
        console.log("Orders Data:", ordersData); // Debugging: Log orders data
        setOrders(ordersData);
      })
      .catch((error) => {
        console.error("Error:", error); // Debugging: Log errors
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [communityId, consumerId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="krishi-member-order-page">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      <div className="krishi-main-content">
        {/* Member Details Section */}
        <div className="krishi-member-details">
          <h1>{member.member_name}</h1>
          <p><strong>Email:</strong> {member.member_email}</p>
          <p><strong>Phone:</strong> {member.phone_number}</p>
        </div>

        {/* Orders Section */}
        <div className="krishi-orders-section">
          <h2>Your Orders</h2>
          {orders.length > 0 ? (
            <ul className="krishi-orders-list">
              {orders.map((order) => (
                <li key={order.orderId} className="krishi-order-item">
                  <p><strong>Order ID:</strong> {order.orderId}</p>
                  <p><strong>Product:</strong> {order.product}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p><strong>Price:</strong> ${order.price.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No orders found.</p>
          )}
        </div>

        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="krishi-back-button">
          Back to Community
        </button>
      </div>
    </div>
  );
}

export default MemberOrderPage;