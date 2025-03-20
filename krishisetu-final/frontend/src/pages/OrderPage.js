import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js"; // Import the Navbar3 component
import "../styles/OrderPageC.css";

function OrderPage() {
  const { communityId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/order/${communityId}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch orders");
        }
        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [communityId]);

  const filteredMembers = orderDetails?.members?.filter((member) =>
    member.memberName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="error-text">Error: {error}</p>;
  }

  if (!orderDetails) {
    return <p className="text-center">No order details found.</p>;
  }

  return (
    <div className="order-page">
      {/* Add Navbar3 Component */}
      <Navbar3 />

      <h1 className="page-title">Order Details</h1>

      <div className="summary-card">
        <h3>Community Information</h3>
        <p><strong>Community Name:</strong> {orderDetails.communityName}</p>
        <p><strong>Admin Name:</strong> {orderDetails.adminName}</p>
        <p><strong>Address:</strong> {orderDetails.address}</p>
        <p><strong>Delivery Date:</strong> {orderDetails.deliveryDate}</p>
        <p><strong>Delivery Time:</strong> {orderDetails.deliveryTime}</p>
      </div>

      <div className="summary-card">
        <h3>Payment Summary</h3>
        <p><strong>Grand Total:</strong> ${orderDetails.grandTotal}</p>
        <p><strong>Payment Status:</strong> {orderDetails.overallPaymentStatus}</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search member..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="member-sections">
        {filteredMembers.map((member) => (
          <div key={member.memberId} className="member-card">
            <h3>{member.memberName}</h3>
            <p><strong>Phone:</strong> {member.phone}</p>
            <table className="member-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {member.orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.product}</td>
                    <td>{order.quantity}</td>
                    <td>${order.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="payment-details">
              <p><strong>Total:</strong> ${member.total}</p>
              <p><strong>Discount:</strong> ${member.discount}</p>
              <p><strong>Payment Amount:</strong> ${member.paymentAmount}</p>
              <p><strong>Payment Status:</strong> {member.paymentStatus}</p>
              <button
                className={`payment-btn ${member.paymentStatus === "paid" ? "success" : "primary"}`}
                onClick={() => alert(`Pay ${member.paymentAmount} for ${member.memberName}`)}
                disabled={member.paymentStatus === "paid"}
              >
                {member.paymentStatus === "paid" ? "Paid" : "Pay Now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderPage;