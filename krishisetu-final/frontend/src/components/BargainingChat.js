import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useParams to get the farmer_id from URL, useNavigate to go back
import ChatWindow from './ChatWindowBargain';
import './BargainingChat.css';

const ChatList = () => {
  const { farmer_id } = useParams(); // Get farmer_id from URL
  const navigate = useNavigate(); // Navigation hook
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
// **✅ Add state for price and quantity**
const [selectedProductPrice, setSelectedProductPrice] = useState(null);
const [selectedQuantity] = useState(1); // Default to 1

  // Fetch list of farmers
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/farmers/simple');
        const data = await response.json();
        setFarmers(data);
      } catch (error) {
        setError('Failed to fetch farmers');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  // Fetch details of selected farmer based on farmer_id from URL or manually clicked
  useEffect(() => {
    if (farmer_id) {
      const fetchFarmerDetails = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/farmer/details/${farmer_id}`);
          const data = await response.json();
          setSelectedFarmer(data);
  
          // Fetch product price from the product table
          const productResponse = await fetch(`http://localhost:5000/api/products/${data.product_id}`);
          const productData = await productResponse.json();
  
          if (productData && productData.price_per_1kg) {
            setSelectedProductPrice(parseFloat(productData.price_per_1kg)); // Convert to number
          } else {
            console.error("Price not found for the product");
            setSelectedProductPrice(0);
          }
        } catch (error) {
          setError('Failed to fetch farmer or product details');
        }
      };
  
      fetchFarmerDetails();
    }
  }, [farmer_id]); // Runs only when the farmer_id in URL changes

  // Handle farmer selection from the list (manual select)
  const handleFarmerClick = (farmer) => {
    navigate(`/bargain/${farmer.farmer_id}`); // Navigate to the farmer's chat window
  };

  const handleCloseChat = () => {
    setSelectedFarmer(null); // Close the chat window
  };

  if (loading) {
    return <div>Loading farmers...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="chat-list-page">
      <div className="chat-list">
        <h2>Farmers</h2>
        <ul>
          {farmers.map((farmer) => (
            <li
              key={farmer.farmer_id}
              className={`chat-item ${selectedFarmer?.farmer_id === farmer.farmer_id ? 'active' : ''}`}
              onClick={() => handleFarmerClick(farmer)} // Clicking on a farmer to open chat
            >
              <img src={farmer.profilephoto || 'default-avatar.png'} alt={farmer.name} className="avatar" />
              <div className="chat-info">
                <span className="farmer-name">{farmer.name}</span>
                <p className="farmer-id">{farmer.farmer_id}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Display the chat window if a farmer is selected */}
      <div className="chat-window-container">
        {selectedFarmer ? (
          <ChatWindow
          farmer_id={selectedFarmer.farmer_id}
          full_name={selectedFarmer.full_name}
          farmer_photo={selectedFarmer.profilephoto}
          price={selectedProductPrice ?? 0} // Ensure price is not undefined
          quantity={selectedQuantity}
          onClose={handleCloseChat}
          />
        ) : (
          <div className="welcome-message">
            <h2>Welcome to Bargaining Chats</h2>
            <p>Select a farmer to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
