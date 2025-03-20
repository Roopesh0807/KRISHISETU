import React from "react";
import Navbar3 from "../components/Navbar3.js"; // Import Navbar3
import "./../styles/OrderReviewComm.css";

// Sample data for orders
const orders = [
  {
    id: "001",
    date: "2025-02-06",
    product: "Wheat",
    quantity: "500 Kg",
    amount: "250rs",
    status: "fulfilled",
  },
  {
    id: "002",
    date: "2025-02-05",
    product: "Rice",
    quantity: "300 Kg",
    amount: "180rs",
    status: "unfulfilled",
  },
  {
    id: "003",
    date: "2025-02-04",
    product: "Tomato",
    quantity: "100 Kg",
    amount: "60rs",
    status: "fulfilled",
  },
  {
    id: "004",
    date: "2025-02-03",
    product: "Onion",
    quantity: "200 Kg",
    amount: "120rs",
    status: "unfulfilled",
  },
];

// OrderRow component to render each row
const OrderRow = ({ order }) => {
  return (
    <tr>
      <td>{order.id}</td>
      <td>{order.date}</td>
      <td>{order.product}</td>
      <td>{order.quantity}</td>
      <td>{order.amount}</td>
      <td className={`krishi-status-${order.status}`}>{order.status}</td>
    </tr>
  );
};

// OrderReview component
const OrderReview = () => {
  return (
    <div className="krishi-order-review">
      {/* Navbar3 Integrated */}
      <Navbar3 />

      <div className="krishi-order-container">
        <h2>Order Overview</h2>
        <table className="krishi-order-table">
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
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderReview;