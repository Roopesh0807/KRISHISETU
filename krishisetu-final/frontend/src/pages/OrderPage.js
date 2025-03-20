import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/OrderPage.css";


function OrderPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("Fetching orders for communityId:", communityId); // Debug log
        const response = await fetch(`http://localhost:5000/api/order/${communityId}`);
        console.log("Response status:", response.status); // Debug log

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch orders");
        }

        const data = await response.json();
        console.log("Fetched data:", data); // Debug log

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
    return <p>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  if (!orderDetails) {
    return <p>No order details found.</p>;
  }

  return (
    <div className="order-page container">
      <button className="btn btn-secondary back-btn" onClick={() => navigate("/krishisetu")}>Back to Krishisetu</button>

      <h2 className="text-center">Order Details</h2>
      <div className="order-summary card p-3">
      <p><strong>Community Name:</strong> {orderDetails.communityName}</p>
        <p><strong>Admin Name:</strong> {orderDetails.adminName}</p>
        <p><strong>Address:</strong> {orderDetails.address}</p>
        <p><strong>Delivery Date:</strong> {orderDetails.deliveryDate}</p>
        <p><strong>Delivery Time:</strong> {orderDetails.deliveryTime}</p>
      </div>

      <div className="payment-summary card p-3 mt-3">
      <p><strong>Grand Total:</strong> ${orderDetails.grandTotal}</p>
      <p><strong>Payment Status:</strong> {orderDetails.overallPaymentStatus}</p>
      </div>

      <div className="search-section my-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search member..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="member-sections">
        {filteredMembers.map((member) => (
          <div key={member.memberId} className="member-section card p-3 mb-3">
            <h3>{member.memberName}</h3>
            <p><strong>Phone:</strong> {member.phone}</p>
            <table className="table table-bordered">
              <thead  className="table-dark">
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Priceeeee</th>
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

            <div className="member-payment-details">
            <p><strong>Total:</strong> ${member.total}</p>
              <p><strong>Discount:</strong> ${member.discount}</p>
              <p><strong>Payment Amount:</strong> ${member.paymentAmount}</p>
              <p><strong>Payment Status:</strong> {member.paymentStatus}</p>
              <button
                                className={`btn ${member.paymentStatus === "paid" ? "btn-success" : "btn-primary"}`}
                                onClick={() => alert(`Pay ${member.paymentAmount} for ${member.memberName}`)}
                                disabled={member.paymentStatus === "paid"}>
                {member.paymentStatus === "paid" ? "Paid" : "Pay"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderPage;