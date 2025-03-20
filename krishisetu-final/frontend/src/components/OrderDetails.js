import React from 'react';
import '../styles/OrderDetails.css';

function OrderDetails({ orders }) {
  return (
    <div className="order-details">
      <h3>Order Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index}>
              <td>{order.product}</td>
              <td>{order.quantity}</td>
              <td>${order.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderDetails;