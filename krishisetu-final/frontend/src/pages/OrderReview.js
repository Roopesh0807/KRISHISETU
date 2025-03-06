import React from "react";
import "./../styles/OrderReview.css";

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
          <tr>
            <td>001</td>
            <td>2025-02-06</td>
            <td>Wheat</td>
            <td>500 Kg</td>
            <td>250rs</td>
            <td className="fulfilled">Fulfilled</td>
          </tr>
          <tr>
            <td>002</td>
            <td>2025-02-05</td>
            <td>Rice</td>
            <td>300 Kg</td>
            <td>180rs</td>
            <td className="unfulfilled">Unfulfilled</td>
          </tr>
          <tr>
            <td>003</td>
            <td>2025-02-04</td>
            <td>Tomato</td>
            <td>100 Kg</td>
            <td>60rs</td>
            <td className="fulfilled">Fulfilled</td>
          </tr>
          <tr>
            <td>004</td>
            <td>2025-02-03</td>
            <td>Onion</td>
            <td>200 Kg</td>
            <td>120rs</td>
            <td className="unfulfilled">Unfulfilled</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OrderReview;
