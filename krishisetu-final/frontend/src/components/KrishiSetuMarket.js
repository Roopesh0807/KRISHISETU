import React, { useState } from 'react';
import './krishisetumarket.css';

const KrishiSetuMarket = ({ produces, addProduce }) => {
  const [newProduce, setNewProduce] = useState({
    productID: '',
    produceName: '',
    availability: '',
    pricePerKg: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduce({ ...newProduce, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Adding new produce to the list
    addProduce(newProduce);
    // Reset form fields
    setNewProduce({ productID: '', produceName: '', availability: '', pricePerKg: '' });
  };

  return (
    <div className="krishisetu-container">
      <h2>KrishiSetu Market</h2>
      <form onSubmit={handleSubmit}>
        <label>Product ID:</label>
        <input
          type="text"
          name="productID"
          value={newProduce.productID}
          onChange={handleChange}
        />
        <label>Produce Name:</label>
        <input
          type="text"
          name="produceName"
          value={newProduce.produceName}
          onChange={handleChange}
        />
        <label>Availability (kg):</label>
        <input
          type="number"
          name="availability"
          value={newProduce.availability}
          onChange={handleChange}
        />
        <label>Price per KG:</label>
        <input
          type="number"
          name="pricePerKg"
          value={newProduce.pricePerKg}
          onChange={handleChange}
        />
        <button type="submit">Add Produce</button>
      </form>

      <h3>List of Produces:</h3>
      <ul>
        {produces.map((produce, index) => (
          <li key={index}>
            Product ID: {produce.productID} - {produce.produceName} - {produce.availability}kg - ₹{produce.pricePerKg}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KrishiSetuMarket;
