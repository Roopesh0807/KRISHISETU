import React from "react";
import "./../styles/ProduceAdding.css";

const ProduceAdding = () => {
  return (
    <div className="produce-adding">
      <h2>Add Produce</h2>
      <input type="text" placeholder="Product Name" />
      <input type="number" placeholder="Quantity (Kg)" />
      <input type="number" placeholder="Price per Kg (₹)" />
      <button>Add Product</button>
    </div>
  );
};

export default ProduceAdding;
