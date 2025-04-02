import React from "react";
import "./../styles/OrderReview.css";

const OrderReview = ({ isSidebarOpen }) => {  // Receive sidebar state as prop
  const orders = [
    {
      id: "KR-001",
      date: "2025-02-06",
      product: "Organic Wheat",
      quantity: "500 Kg",
      amount: "₹12,500",
      status: "fulfilled",
      location: "Punjab, India"
    },
    {
      id: "KR-002",
      date: "2025-02-05",
      product: "Basmati Rice",
      quantity: "300 Kg",
      amount: "₹18,000",
      status: "unfulfilled",
      location: "Haryana, India"
    },
    {
      id: "KR-003",
      date: "2025-02-04",
      product: "Cherry Tomatoes",
      quantity: "100 Kg",
      amount: "₹6,000",
      status: "fulfilled",
      location: "Maharashtra, India"
    },
  ];

  const OrderItem = ({ order }) => {
    return (
      <tr className="order-item">
        <td>
          <span className="order-id">{order.id}</span>
        </td>
        <td>{order.date}</td>
        <td>
          <div className="product-meta">
            <div className="product-icon">
              <i className={`fas ${order.product.includes("Wheat") ? "fa-wheat" : 
                            order.product.includes("Rice") ? "fa-rice" : 
                            "fa-apple-alt"}`}></i>
            </div>
            <div>
              <span className="product-name">{order.product}</span>
              <span className="product-location">
                <i className="fas fa-map-marker-alt"></i> {order.location}
              </span>
            </div>
          </div>
        </td>
        <td>{order.quantity}</td>
        <td className="order-amount">{order.amount}</td>
        <td>
          <span className={`order-status ${order.status}`}>
            {order.status === "fulfilled" ? (
              <>
                <i className="fas fa-check-circle"></i> Completed
              </>
            ) : (
              <>
                <i className="fas fa-clock"></i> Pending
              </>
            )}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className={`order-review-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <div className="order-review-wrapper">
        <div className="order-summary">
          <div className="order-title">
            <h2>Order History</h2>
            <p>Track your agricultural purchases and deliveries</p>
          </div>
          <div className="order-stats">
            <div className="stat-card">
              <div className="stat-icon total-orders">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <div className="stat-info">
                <h3>{orders.length}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon completed-orders">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{orders.filter(o => o.status === "fulfilled").length}</h3>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pending-orders">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <h3>{orders.filter(o => o.status === "unfulfilled").length}</h3>
                <p>Pending</p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-table-container">
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderItem key={order.id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;