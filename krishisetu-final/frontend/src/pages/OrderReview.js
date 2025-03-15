import React from "react";
import "./../styles/OrderReview.css";

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
      <td className={order.status}>{order.status}</td>
    </tr>
  );
};

// OrderReview component
const OrderReview = () => {
  return (
    <div className="order-review">
      <h2>Order Overview</h2>
      <table>
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
  );
};

export default OrderReview;