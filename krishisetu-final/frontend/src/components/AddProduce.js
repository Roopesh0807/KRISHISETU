import React, { useState } from 'react';
import './addproduce.css'; // Import the CSS file
import KSlogo from "../assets/logo.jpg";
import BSimg from "../assets/bargain.jpeg";

const AddProduce = () => {
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [produces, setProduces] = useState({
    krishisetu: [],
    bargaining: []
  });
  const [newProduce, setNewProduce] = useState({
    produceName: '',
    availability: '',
    pricePerKg: ''
  });
  const [isFormVisible, setIsFormVisible] = useState(false);

  const farmerDetails = {
    farmerID: '12345',
    farmerName: 'John Doe',
  };

  const handleMarketClick = (market) => {
    setSelectedMarket(market);
    setIsFormVisible(false); // Hide form when switching market
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewProduce({
      ...newProduce,
      [name]: value,
    });
  };

  const addProduceToMarket = () => {
    if (!newProduce.produceName || !newProduce.availability || !newProduce.pricePerKg) {
      alert('Please fill all the fields');
      return;
    }

    const updatedProduces = {
      ...produces,
      [selectedMarket]: [...produces[selectedMarket], newProduce], // Corrected syntax
    };
    setProduces(updatedProduces);

    setNewProduce({
      produceName: '',
      availability: '',
      pricePerKg: ''
    });

    setIsFormVisible(false);
  };

  const removeProduceFromMarket = (index) => {
    const updatedProduces = {
      ...produces,
      [selectedMarket]: produces[selectedMarket].filter((_, i) => i !== index)
    };
    setProduces(updatedProduces);
  };

  return (
    <div className="addproduce-container">
      <h1>Produces Added to the List</h1>
      <p>Farmer ID: {farmerDetails.farmerID}</p>
      <p>Farmer Name: {farmerDetails.farmerName}</p>

      {/* Market selection buttons */}
      <div className="addproduce-market-buttons">
        <button 
          onClick={() => handleMarketClick('krishisetu')}
          className={selectedMarket === 'krishisetu' ? 'active' : ''}
        >
          <img src={KSlogo} alt="KrishiSetu Logo" />
          KrishiSetu Market
        </button>
        <button 
          onClick={() => handleMarketClick('bargaining')}
          className={selectedMarket === 'bargaining' ? 'active' : ''}
        >
          <img src={BSimg} alt="Bargaining Logo" />
          Bargaining System
        </button>
      </div>

      {/* Show Add Produce Button for selected market */}
      {selectedMarket && (
        <>
          <button 
            className="addproduce-button" 
            onClick={() => setIsFormVisible(!isFormVisible)}
          >
            {isFormVisible ? 'Cancel' : 'Add Produce'}
          </button>

          {/* Form to add produce */}
          {isFormVisible && (
            <div className="addproduce-form">
              <h3>Add Produce to {selectedMarket === 'krishisetu' ? 'KrishiSetu' : 'Bargaining'} Market</h3>
              <form>
                <div>
                  <label>Produce Name:</label>
                  <input
                    type="text"
                    name="produceName"
                    value={newProduce.produceName}
                    onChange={handleFormChange}
                    placeholder="Enter produce name"
                  />
                </div>
                <div>
                  <label>Availability (kg):</label>
                  <input
                    type="number"
                    name="availability"
                    value={newProduce.availability}
                    onChange={handleFormChange}
                    placeholder="Enter availability in kg"
                  />
                </div>
                <div>
                  <label>Price per KG:</label>
                  <input
                    type="number"
                    name="pricePerKg"
                    value={newProduce.pricePerKg}
                    onChange={handleFormChange}
                    placeholder="Enter price per kg"
                  />
                </div>
                <button type="button" onClick={addProduceToMarket}>
                  Add Produce
                </button>
              </form>
            </div>
          )}

          {/* Table of produces */}
          <h3>List of Produces in {selectedMarket === 'krishisetu' ? 'KrishiSetu' : 'Bargaining'} Market</h3>
          {produces[selectedMarket].length > 0 ? (
            <table className="addproduce-table">
              <thead>
                <tr>
                  <th>Produce Name</th>
                  <th>Availability (kg)</th>
                  <th>Price per KG</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {produces[selectedMarket].map((produce, index) => (
                  <tr key={index}>
                    <td>{produce.produceName}</td>
                    <td>{produce.availability} kg</td>
                    <td>₹{produce.pricePerKg}</td>
                    <td>
                      <button
                        className="addproduce-remove-button"
                        onClick={() => removeProduceFromMarket(index)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No produces added yet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default AddProduce;