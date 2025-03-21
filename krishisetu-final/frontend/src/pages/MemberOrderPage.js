import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js"; // Import Navbar3
import "../styles/OrderPageC.css";

function MemberOrderPage() {
  const { communityId, memberId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("Fetching orders for communityId:", communityId, "and memberId:", memberId);
        const response = await fetch(`http://localhost:5000/api/order/${communityId}/member/${memberId}`);
        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch orders");
        }

        const data = await response.json();
        console.log("Fetched data:", data);

        setOrderDetails(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [communityId, memberId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  if (!orderDetails) {
    return <p>No order details found.</p>;
  }

  return (
    <div className="krishi-member-order-page">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      <div className="krishi-order-container">
        <button className="krishi-back-btn" onClick={() => navigate("/krishisetu")}>
          Back to Krishisetu
        </button>

        <h2>Order Details</h2>

        {/* Order Summary Section */}
        <div className="krishi-order-summary">
          <p><strong>Community Name:</strong> {orderDetails.communityName}</p>
          <p><strong>Admin Name:</strong> {orderDetails.adminName}</p>
          <p><strong>Address:</strong> {orderDetails.address}</p>
          <p><strong>Delivery Date:</strong> {orderDetails.deliveryDate}</p>
          <p><strong>Delivery Time:</strong> {orderDetails.deliveryTime}</p>
        </div>

        {/* Member Details Section */}
        <div className="krishi-member-details">
          <h3>Member Details</h3>
          <p><strong>Name:</strong> {orderDetails.memberName}</p>
          <p><strong>Phone:</strong> {orderDetails.memberPhone}</p>
        </div>

        {/* Your Orders Section */}
        <div className="krishi-member-orders">
          <h3>Your Orders</h3>
          <table className="krishi-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.orders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.product}</td>
                  <td>{order.quantity}</td>
                  <td>${order.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Summary Section */}
        <div className="krishi-payment-summary">
          <h3>Payment Summary</h3>
          <p><strong>Total:</strong> ${orderDetails.total}</p>
          <p><strong>Discount:</strong> ${orderDetails.discount}</p>
          <p><strong>Payment Amount:</strong> ${orderDetails.paymentAmount}</p>
          <p><strong>Payment Status:</strong> {orderDetails.paymentStatus}</p>
        </div>
      </div>
    </div>
  );
}

export default MemberOrderPage;