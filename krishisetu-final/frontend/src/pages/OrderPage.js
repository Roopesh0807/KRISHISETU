

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar3 from "../components/Navbar3.js";
import "../styles/OrderPageC.css";

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
        const response = await fetch(`http://localhost:5000/api/order/${communityId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        
        // Convert all numeric fields to numbers
        const processedData = {
          ...data,
          adminOrders: (data.adminOrders || []).map(order => ({
            ...order,
            price: Number(order.price) || 0,
            quantity: Number(order.quantity) || 0
          })),
          // Filter out admin from members list
          members: (data.members || []).filter(member => 
            member.consumer_id !== data.admin_id
          ).map(member => ({
            ...member,
            total: Number(member.total) || 0,
            orders: (member.orders || []).map(order => ({
              ...order,
              price: Number(order.price) || 0,
              quantity: Number(order.quantity) || 0
            }))
          })),
          grandTotal: Number(data.grandTotal) || 0,
          adminTotal: Number(data.adminTotal) || 0,
          totalMembers: Number(data.totalMembers) || 0,
          confirmedMembers: Number(data.confirmedMembers) || 0,
          admin_id: data.admin_id // Keep admin_id for reference
        };

        setOrderDetails(processedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [communityId]);

  const handlePlaceOrder = () => {
    navigate(`/orderpage`);
  };
  const handleorder= () => {
    navigate(`/consumer-dashboard`);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!orderDetails) return <div className="error">No order data found</div>;

  return (
    <div className="order-page">
      <Navbar3 />
      
      <div className="order-header">
        <h1>Order Details - {orderDetails.communityName || 'Unnamed Community'}</h1>
        <div className="member-counts">
          <span>Total Members: {orderDetails.totalMembers}</span>
          <span>Confirmed Orders: {orderDetails.confirmedMembers}</span>
        </div>
      </div>

      <div className="summary-card">
        <h3>Community Information</h3>
        <div className="community-details">
          <p><strong>Admin:</strong> {orderDetails.adminName || 'Not specified'}</p>
          <p><strong>Address:</strong> {orderDetails.address || 'Not specified'}</p>
          <p><strong>Delivery Date:</strong> {orderDetails.deliveryDate || 'Not specified'}</p>
          <p><strong>Delivery Time:</strong> {orderDetails.deliveryTime || 'Not specified'}</p>
          <p><strong>Grand Total:</strong> ₹{orderDetails.grandTotal.toFixed(2)}</p>
          <p><strong>Overall Status:</strong> {orderDetails.overallPaymentStatus || 'Not specified'}</p>
        </div>
      </div>

      <div className="your-orders-section">
        <div className="section-header">
          <h2>Your Orders</h2>
          <button 
            className="place-order-btn"
            onClick={handlePlaceOrder}
          >
            Proceed to payment
          </button>
        </div>
        {orderDetails.adminOrders && orderDetails.adminOrders.length > 0 ? (
          <>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.adminOrders.map((order) => (
                  <tr key={order.order_id || Math.random()}>
                    <td>{order.product_id || 'N/A'}</td>
                    <td>{order.quantity}</td>
                    <td>₹{order.price.toFixed(2)}</td>
                    <td>₹{(order.price * order.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="order-summary">
              <p><strong>Your Total:</strong> ₹{orderDetails.adminTotal.toFixed(2)}</p>
            </div>
          </>
        ) : (
          <div className="no-orders-section">
            <p className="no-orders">You haven't placed any orders yet.</p>
            <button 
              className="place-order-btn"
              onClick={handleorder}
            >
              + Place Your First Order
            </button>
          </div>
        )}
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="members-orders-section">
        <h2>Members Orders</h2>
        {orderDetails.members && orderDetails.members.length > 0 ? (
          <div className="members-grid">
            {orderDetails.members
              .filter(member => 
                member.memberName && 
                member.memberName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(member => (
                <div key={member.memberId || Math.random()} className="member-card">
                  <h3>{member.memberName || 'Unnamed Member'}</h3>
                  <p><strong>Phone:</strong> {member.phone ? member.phone.slice(-4).padStart(10, '*') : 'Not provided'}</p>
                  <p><strong>Total:</strong> ₹{member.total.toFixed(2)}</p>
                  
                  {member.orders && member.orders.length > 0 ? (
                    <table className="member-orders">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {member.orders.map(order => (
                          <tr key={order.id || Math.random()}>
                            <td>{order.product || 'N/A'}</td>
                            <td>{order.quantity}</td>
                            <td>₹{order.price.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-orders">No orders placed</p>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <p className="no-members">No member orders found</p>
        )}
      </div>
    </div>
  );
}

export default OrderPage;