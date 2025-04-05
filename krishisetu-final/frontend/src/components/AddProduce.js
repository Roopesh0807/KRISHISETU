import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './addproduce.css';
import KSlogo from "../assets/logo.jpg";
import BSimg from "../assets/bargain.jpeg";
import { useNavigate } from 'react-router-dom';

const AddProduce = () => {
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
  const [farmerId, setFarmerId] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [farmerEmail, setFarmerEmail] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch farmer details
  useEffect(() => {
    const fetchFarmerDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/farmer', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setFarmerId(response.data.farmer_id);
        setFarmerName(response.data.farmer_name);
        setFarmerEmail(response.data.email);
      } catch (err) {
        console.error('Failed to fetch farmer details:', err);
        setError('Failed to load farmer details. Please try again.');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmerDetails();
  }, [navigate]);

  // Load produces
  const loadProduces = useCallback(async () => {
    if (!selectedMarket || !farmerId) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/produces', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          market_type: selectedMarket
        }
      });
      setProduces(response.data);
    } catch (err) {
      console.error('Failed to fetch produces:', err);
      setError('Failed to load produces. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMarket, farmerId]);

  useEffect(() => {
    loadProduces();
  }, [loadProduces]);

  const handleMarketClick = (market) => {
    setSelectedMarket(market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market');
    setIsFormVisible(false);
    setEditingId(null);
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
    
    // Validate form inputs
    if (!newProduce.produce_name || !newProduce.availability || !newProduce.price_per_kg) {
      setError('Please fill all the fields');
      return;
    }
  
    if (isNaN(newProduce.availability) || parseFloat(newProduce.availability) <= 0) {
      setError('Availability must be a positive number');
      return;
    }
  
    if (isNaN(newProduce.price_per_kg)) {
      setError('Price must be a valid number');
      return;
    }
  
    try {
      setIsLoading(true);
      const produceData = {
        ...newProduce,
        farmer_id: farmerId,
        farmer_name: farmerName,
        email: farmerEmail,
        availability: parseFloat(newProduce.availability),
        price_per_kg: parseFloat(newProduce.price_per_kg)
      };
  
      if (editingId) {
        await axios.put(`/api/produces/${editingId}`, produceData);
      } else {
        await axios.post('/api/produces', produceData);
      }
  
      await loadProduces();
      resetForm();
    } catch (err) {
      console.error('Failed to save produce:', err);
      setError(err.response?.data?.error || 'Failed to save produce. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const editProduce = (produce) => {
    setNewProduce({
      produce_name: produce.produce_name,
      availability: produce.availability,
      price_per_kg: produce.price_per_kg,
      produce_type: produce.produce_type,
      market_type: produce.market_type
    });
    setEditingId(produce.product_id);
    setIsFormVisible(true);
  };

  const deleteProduce = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this produce?')) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`/api/produces/${productId}`);
      await loadProduces();
    } catch (err) {
      console.error('Failed to delete produce:', err);
      setError('Failed to delete produce. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewProduce({
      produce_name: '',
      availability: '',
      price_per_kg: '',
      produce_type: 'Standard',
      market_type: selectedMarket
    });
    setEditingId(null);
    setIsFormVisible(false);
  };

  return (
    <div className="addproduce-container">
      <h1>Produces Added to the List</h1>
      <p>Farmer ID: {farmerId}</p>
      <p>Farmer Name: {farmerName}</p>

      {/* Error and Loading indicators */}
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
              if (isFormVisible) resetForm();
            }}
            disabled={isLoading}
          >
            {isFormVisible ? 'Cancel' : 'Add Produce'}
          </button>

          {isFormVisible && (
            <div className="addproduce-form">
              <h3>{editingId ? 'Edit Produce' : 'Add Produce'} to {selectedMarket}</h3>
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
                  {isLoading ? 'Saving...' : editingId ? 'Update Produce' : 'Add Produce'}
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