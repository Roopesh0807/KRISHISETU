import React from "react";
import Navbar2 from "../components/Navbar2.js";
import Sidebar from "../components/Sidebar.js";
import "./../styles/OrderReview.css";

const OrderReview = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
      <tr className="order-track-item">
        <td>
          <span className="order-track-id">{order.id}</span>
        </td>
        <td>{order.date}</td>
        <td>
          <div className="order-product-meta">
            <div className="order-product-icon">
              <i className={`fas ${order.product.includes("Wheat") ? "fa-wheat" : 
                            order.product.includes("Rice") ? "fa-rice" : 
                            "fa-apple-alt"}`}></i>
            </div>
            <div>
              <span className="order-product-name">{order.product}</span>
              <span className="order-product-location">
                <i className="fas fa-map-marker-alt"></i> {order.location}
              </span>
            </div>
          </div>
        </td>
        <td>{order.quantity}</td>
        <td className="order-track-amount">{order.amount}</td>
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
    <div className={`order-track-app ${sidebarOpen ? "sidebar-active" : ""}`}>
      <Navbar2 toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`order-track-content ${sidebarOpen ? "sidebar-shifted" : ""}`}>
        <div className="order-track-wrapper">
          <div className="order-track-summary">
            <div className="order-track-title">
              <h2>Order History</h2>
              <p>Track your agricultural purchases and deliveries</p>
            </div>
            <div className="order-track-stats">
              <div className="order-stat">
                <div className="order-stat-icon total-orders">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <div className="order-stat-info">
                  <h3>{orders.length}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="order-stat">
                <div className="order-stat-icon completed-orders">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="order-stat-info">
                  <h3>{orders.filter(o => o.status === "fulfilled").length}</h3>
                  <p>Completed</p>
                </div>
              </div>
              <div className="order-stat">
                <div className="order-stat-icon pending-orders">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="order-stat-info">
                  <h3>{orders.filter(o => o.status === "unfulfilled").length}</h3>
                  <p>Pending</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-track-table-container">
            <table className="order-track-table">
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
    </div>
  );
};

export default OrderReview;