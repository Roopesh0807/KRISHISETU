import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import './addproduce.css';
import KSlogo from "../assets/logo.jpg";
import BSimg from "../assets/bargain.jpeg";
import { AuthContext } from '../context/AuthContext';

// Move the helper function outside the component
const getFarmerName = (farmerData) => {
  if (!farmerData) return 'Farmer';
  if (farmerData.full_name) return farmerData.full_name;
  if (farmerData.first_name && farmerData.last_name) {
    return `${farmerData.first_name} ${farmerData.last_name}`;
  }
  return farmerData.first_name || farmerData.last_name || 'Farmer';
};

const AddProduce = () => {
  // State declarations
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [produces, setProduces] = useState([]);
  const [newProduce, setNewProduce] = useState({
    produce_name: '',
    availability: '',
    price_per_kg: '',
    produce_type: 'Standard',
    market_type: ''
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get farmer from AuthContext with proper initialization
  const authContext = useContext(AuthContext);
  const farmer = authContext?.farmer || {};
  
  // State for farmer details with proper initialization
  const [farmerDetails, setFarmerDetails] = useState({
    id: '',
    name: 'Loading...',
    isLoaded: false
  });

  // Effect to update farmer details when context changes
  useEffect(() => {
    if (authContext?.farmer) {
      setFarmerDetails({
        id: authContext.farmer.farmer_id || '',
        name: getFarmerName(authContext.farmer),
        isLoaded: true
      });
    } else {
      setFarmerDetails({
        id: '',
        name: 'Loading...',
        isLoaded: false
      });
    }
  }, [authContext?.farmer]);
  

  const loadProduces = useCallback(async () => {
    if (!selectedMarket || !farmerDetails.id || !farmerDetails.isLoaded) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/produces`, {
        params: {
          farmer_id: farmerDetails.id,
          market_type: selectedMarket
        }
      });
      setProduces(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch produces:', err);
      setError('Failed to load produces. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMarket, farmerDetails.id, farmerDetails.isLoaded]);

  useEffect(() => {
    loadProduces();
  }, [loadProduces]);

  const handleMarketClick = (market) => {
    const marketType = market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market';
    setSelectedMarket(marketType);
    setIsFormVisible(false);
    setError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewProduce({
      ...newProduce,
      [name]: value,
      market_type: selectedMarket
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newProduce.produce_name || !newProduce.availability || !newProduce.price_per_kg) {
      setError('Please fill all the fields');
      return;
    }
  
    if (isNaN(newProduce.availability)) {
      setError('Availability must be a number');
      return;
    }
  
    if (isNaN(newProduce.price_per_kg)) {
      setError('Price must be a valid number');
      return;
    }

    if (!farmer?.farmer_id) {
      setError('Farmer information not available. Please log in again.');
      return;
    }
  
    try {
      setIsLoading(true);
      const produceData = {
        ...newProduce,
        farmer_id: farmer.farmer_id,
        farmer_name: farmer.full_name || `${farmer.first_name} ${farmer.last_name}`,
        email: farmer.email,
        availability: parseFloat(newProduce.availability),
        price_per_kg: parseFloat(newProduce.price_per_kg),
        market_type: selectedMarket
      };

      if (newProduce.id) {
        await axios.put(`http://localhost:5000/api/produces/${newProduce.id}`, produceData);
      } else {
        await axios.post('http://localhost:5000/api/produces', produceData);
      }

      await loadProduces();
      setNewProduce({
        produce_name: '',
        availability: '',
        price_per_kg: '',
        produce_type: 'Standard',
        market_type: selectedMarket
      });
      setIsFormVisible(false);
    } catch (err) {
      console.error('Failed to save produce:', err);
      setError(err.response?.data?.error || 'Failed to save produce. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const editProduce = (produce) => {
    setNewProduce({
      ...produce,
      id: produce.product_id
    });
    setIsFormVisible(true);
  };

  const deleteProduce = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this produce?')) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/produces/${productId}`);
      await loadProduces();
    } catch (err) {
      console.error('Failed to delete produce:', err);
      setError('Failed to delete produce. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="addproduce-container">
      <h1>Produces Added to the List</h1>
      
      {/* Farmer info section */}
      <div className="farmer-info">
        {farmerDetails.isLoaded ? (
          <>
            {farmerDetails.id && <p>Farmer ID: {farmerDetails.id}</p>}
            <p>Farmer Name: {farmerDetails.name}</p>
          </>
        ) : (
          <p>Loading farmer information...</p>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-indicator">Loading...</div>}

      <div className="addproduce-market-buttons">
        <button 
          onClick={() => handleMarketClick('krishisetu')} 
          className={selectedMarket === 'KrishiSetu Market' ? 'active' : ''}
          disabled={isLoading}
        >
          <img src={KSlogo} alt="KrishiSetu Logo" />
          KrishiSetu Market
        </button>
        <button 
          onClick={() => handleMarketClick('bargaining')} 
          className={selectedMarket === 'Bargaining Market' ? 'active' : ''}
          disabled={isLoading}
        >
          <img src={BSimg} alt="Bargaining Logo" />
          Bargaining System
        </button>
      </div>

      {selectedMarket && (
        <>
          <button 
            className="addproduce-button" 
            onClick={() => {
              setIsFormVisible(!isFormVisible);
              if (isFormVisible) {
                setNewProduce({
                  produce_name: '',
                  availability: '',
                  price_per_kg: '',
                  produce_type: 'Standard',
                  market_type: selectedMarket
                });
              }
            }}
            disabled={isLoading}
          >
            {isFormVisible ? 'Cancel' : 'Add Produce'}
          </button>

          {isFormVisible && (
            <div className="addproduce-form">
              <h3>{newProduce.id ? 'Edit Produce' : 'Add Produce'} to {selectedMarket}</h3>
              <form onSubmit={handleSubmit}>
                <div>
                  <label>Produce Name:</label>
                  <input
                    type="text"
                    name="produce_name"
                    value={newProduce.produce_name}
                    onChange={handleFormChange}
                    placeholder="Enter produce name"
                    required
                    disabled={isLoading}
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
                    min="0.1"
                    step="0.1"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label>Price per KG:</label>
                  <input
                    type="number"
                    name="price_per_kg"
                    value={newProduce.price_per_kg}
                    onChange={handleFormChange}
                    placeholder="Enter price per kg"
                    min="0.01"
                    step="0.01"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label>Produce Type:</label>
                  <select
                    name="produce_type"
                    value={newProduce.produce_type}
                    onChange={handleFormChange}
                    required
                    disabled={isLoading}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Organic">Organic</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="addproduce-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : newProduce.id ? 'Update Produce' : 'Add Produce'}
                </button>
              </form>
            </div>
          )}

          <h3>List of Produces in {selectedMarket}</h3>
          {produces.length > 0 ? (
            <table className="addproduce-table">
              <thead>
                <tr>
                  <th>Produce Name</th>
                  <th>Type</th>
                  <th>Availability (kg)</th>
                  <th>Price per KG</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {produces.map((produce) => (
                  <tr key={produce.product_id}>
                    <td>{produce.produce_name}</td>
                    <td>{produce.produce_type}</td>
                    <td>{produce.availability} kg</td>
                    <td>₹{produce.price_per_kg}</td>
                    <td>
                      <button
                        className="addproduce-edit-button"
                        onClick={() => editProduce(produce)}
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        className="addproduce-remove-button"
                        onClick={() => deleteProduce(produce.product_id)}
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No produces added yet for this market.</p>
          )}
        </>
      )}
    </div>
  );
};

export default AddProduce;