import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import "../components/ConsumerDashboard.css";
import { fetchProducts } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faBolt, 
  faUsers, 
  faCalendarAlt,
  //faUser,
  faHandshake,
  // faComments,
  faStar,
  faStarHalfAlt,
  // faTimes
} from '@fortawesome/free-solid-svg-icons';

// Import images
import Farmer from "../assets/farmer.jpeg";
import OrganicBadge from "../assets/organic.jpg";
import Tomato from "../assets/tomato.jpg";
import Apple from "../assets/apple.jpg";
import Banana from "../assets/banana.jpg";
import Butter from "../assets/butter.jpg";
import Cheese from "../assets/cheese.jpg";
import Chilly from "../assets/chilly.jpg";
import Cumin from "../assets/cuminseeds.jpg";
import Ghee from "../assets/ghee.jpg";
import Ginger from "../assets/ginger.jpg";
import Grapes from "../assets/grapes.jpg";
import Onion from "../assets/onion.jpg";
import Potato from "../assets/potato.jpg";
import Rice from "../assets/rice.jpg";
import Turmeric from "../assets/turmeric.jpg";
import Wheat from "../assets/wheat.png";
import Pomegranate from "../assets/pomegranate.jpg";
import MasoorDal from "../assets/masoordal.jpg";
import Uraddal from "../assets/uraddal.jpg";
import Redchilly from "../assets/redchilly.jpg";
import Garlic from "../assets/garlic.jpg";
import Coriander from "../assets/coriander.jpg";
import Avocado from "../assets/avocado.png";
import Capsicum from "../assets/capsicum.jpg";
import Carrot from "../assets/carrot.jpg";
import Cauliflower from "../assets/cauliflower.webp";
import Curd from "../assets/curd.jpg";
import Lentils from "../assets/lentils.jpg";
import Mango from "../assets/mango.jpg";
import Milk from "../assets/milk.jpg";
import BlackPepper from "../assets/blackpepper.jpg"; 
// import BargainChatWindow from "./bargaining/ConsumerChatWindow";

const productImages = {
  BlackPepper,
  Mango,
  Milk,
  Lentils,
  Curd,
  Cauliflower,
  Carrot,
  Capsicum,
  Avocado,
  MasoorDal,
  Uraddal,
  Redchilly,
  Garlic,
  Coriander,
  Tomato,
  Apple,
  Banana,
  Butter,
  Cheese,
  Chilly,
  Cumin,
  Ghee,
  Ginger,
  Grapes,
  Onion,
  Potato,
  Rice,
  Turmeric,
  Wheat,
  Pomegranate,
};

const ConsumerDashboard = () => {
  const { 
    consumer = null, 
    // farmer = null,
    // loginConsumer,
    // logout
  } = useAuth();
  console.log("🔍 Consumer from AuthContext:", consumer);
  // const location = useLocation();
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [buyType, setBuyType] = useState("");
  const { addToCart } = useCart();
  const location = useLocation();
  // const { bargainId } = useParams();
  // const [, setIsBargainPopupOpen] = useState(false);
  // const [, setSelectedFarmer] = useState(null);
  // const [selectedProduct, setSelectedProduct] = useState(null);
  // const [quantity, setQuantity] = useState(1);
  const [farmerSearchTerm, setFarmerSearchTerm] = useState("");
  const [sortPriceOrder, setSortPriceOrder] = useState("");
  const [sortProduceOrder, setSortProduceOrder] = useState("");
  const navigate = useNavigate();
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [, setMessages] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        return response.json();
      })
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/farmers', {
          credentials: 'include' // Important for CORS
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch farmers');
        }
  
        const data = await response.json();
  
        // Ensure farmers have a default rating if missing
        const formattedData = data.map(farmer => ({
          ...farmer,
          average_rating: farmer.average_rating || 0 // Default to 0 if missing
        }));
  
        setFarmers(formattedData);
      } catch (error) {
        console.error("Error fetching farmers:", error);
        alert("Failed to load farmers. Please refresh the page.");
      }
    };
  
    fetchFarmers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await fetchProducts("/api/products");
        setProducts(productData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, []);

  // const handleNewMessage = (senderType, content) => {
  //   setMessages((prevMessages) => [
  //     ...prevMessages,
  //     { senderType, content }
  //   ]);
  // };

  // const handleFarmerResponse = (response) => {
  //   handleNewMessage('farmer', response);
  // };

  const handleBargainClick = async (farmer, product, e) => {
    e.stopPropagation();
    setError(null);
    setIsLoading(true);
  
    try {
      // Validate authentication
      if (!consumer?.token) {
        navigate('/loginpage', { state: { from: location.pathname } });
        return;
      }
  
      // Default quantity (you can make this configurable)
      const quantity = 10; 
  
      // Create bargain request
      const response = await fetch('http://localhost:5000/api/create-bargain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity,
          initiator: "consumer"
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
  
      if (!data.bargainId) {
        throw new Error("Missing bargainId in response");
      }
  
      // Navigate directly to chat window with bargain context
      navigate(`/bargain/${data.bargainId}`, {
        state: {
          product: product,
          farmer: farmer,
          quantity: quantity,
          originalPrice: data.originalPrice,
          isNewBargain: true // Flag to show this is a new bargain
        }
      });
  
    } catch (error) {
      console.error("Bargain initiation failed:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
//   const handleBargainConfirm = async () => {
//     setError(null);
//     setIsLoading(true);
  
//     try {
//       // 1. Validate inputs
//       if (!selectedProduct || quantity <= 0) {
//         throw new Error("Please select a product and valid quantity");
//       }
  
//       // 2. Check authentication
//       if (!consumer?.token) {
//         navigate('/login', { state: { from: location.pathname } });
//         return;
//       }
//    // Simulate sending a message when a bargain is confirmed
//     handleNewMessage('consumer', `Sent a request to ${selectedFarmer.farmer_name} to initiate the bargain.`);
      
//    // Simulate a farmer response (you can customize the logic here)
//      setTimeout(() => {
//        handleFarmerResponse('Farmer has seen your request and is reviewing your offer.');
//    }, 2000);
//       // 3. Make the API call
//       const response = await fetch('http://localhost:5000/api/create-bargain', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${consumer.token}`
//         },
//         body: JSON.stringify({
//           product_id: selectedProduct.product_id,
//           quantity,
//           initiator: "consumer"
//         })
//       });
  
//       // 4. Handle response
//       const data = await response.json();
//       console.log("Full response:", { status: response.status, data }); // Debug log
  
//       if (!response.ok) {
//         // Server returned an error (4xx/5xx)
//         throw new Error(data.error || `Server error: ${response.status}`);
//       }
  
//       if (!data.bargainId) {
//         throw new Error("Missing bargainId in response");
//       }
  
//        // 5. Fetch farmer details if not included in response
//     let farmerData = data.farmer;
//     if (!farmerData) {
//       const farmerResponse = await fetch(`http://localhost:5000/api/farmers/${selectedProduct.farmer_id}`, {
//         headers: {
//           'Authorization': `Bearer ${consumer.token}`
//         }
//       });
//       farmerData = await farmerResponse.json();
//     }

//       // 6. Success case
//   //   // Send a "Bargain Request" message
//   //   await fetch('http://localhost:5000/api/send-bargain-message', {
//   //     method: 'POST',
//   //     headers: {
//   //       'Content-Type': 'application/json',
//   //       'Authorization': `Bearer ${consumer.token}`
//   //     },
//   //     body: JSON.stringify({
//   //       bargainId: data.bargainId,
//   //       senderType: 'consumer'  // This indicates the consumer initiated the request
//   //     })
//   //   });
//   // // 7. Navigate to the chat window
//   // navigate(`/bargain/${data.bargainId}`, {
//   //   state: {
//   //     product: selectedProduct,
//   //     farmer: data.farmer,
//   //     quantity,
//   //     originalPrice: data.originalPrice
//   //   }
//   // });
// // Success case
//         setIsBargainPopupOpen(false); // Close the popup
//         navigate(`/bargain/${data.bargainId}`, {
//           state: {
//             product: selectedProduct,
//             farmer: selectedFarmer,
//             quantity,
//             originalPrice: data.originalPrice,
//             initialMessage: 'Bargain request sent to farmer, please wait until he accepts.' // Send initial message as part of state
//           }
//         });
//     } catch (error) {
//       console.error("Full bargain error:", error);
//       setError(error.message);
      
//       // Specific handling for network errors
//       if (error.message.includes("Failed to fetch")) {
//         setError("Cannot connect to server. Please check your connection.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
        console.error("❌ No token found!");
    }
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.farmer_id) {
          alert("Farmers cannot initiate bargains");
          localStorage.clear();
          navigate("/consumer-login");
        }
      } catch (e) {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  const handleQuantityChange = (productId, event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      setSelectedQuantities(prev => ({
        ...prev,
        [productId]: value
      }));
    }
  };

  const handleBuyNow = (product, e) => {
    e.stopPropagation();
    const quantity = selectedQuantities[product.product_id] || 1;
    addToCart(product, quantity);
    navigate("/cart");
  };

  // const handleClosePopup = () => {
  //   setIsBargainPopupOpen(false);
  // };

  const handleProductClick = (productId) => {
    navigate(`/productDetails/${productId}`);
  };

  const handleFarmerClick = (farmerId) => {
    navigate(`/farmerDetails/${farmerId}`);
  };

  const handleAddToCommunityOrders = (product, e) => {
    e.stopPropagation();
    console.log("Added to community orders:", product);
    alert(`${product.product_name} added to community orders!`);
  };

  const handleSubscribe = (product, e) => {
    e.stopPropagation();
    navigate("/subscribe", { state: { product } });
  };

  const filteredProducts = products.filter((product) => {
    return (
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (category === "" || product.category.toLowerCase() === category.toLowerCase()) &&
      (buyType === "" || product.buy_type.toLowerCase() === buyType.toLowerCase())
    );
  });
  
  const filteredFarmers = farmers
  .map((farmer) => {
    const parsedProducts = Array.isArray(farmer.products)
      ? farmer.products
      : JSON.parse(farmer.products || "[]");
    return { ...farmer, products: parsedProducts };
  })
  .filter((farmer) => {
    const term = farmerSearchTerm.toLowerCase();
    const matchesFarmer = 
      farmer.farmer_name?.toLowerCase().includes(term) ||
      farmer.farmer_id?.toString().toLowerCase().includes(term);
    
    const matchesProducts = farmer.products.some((product) => {
      return (
        product.produce_id?.toLowerCase().includes(term) ||
        product.produce_name?.toLowerCase().includes(term) ||
        product.produce_type?.toLowerCase().includes(term) ||
        product.price_per_kg?.toString().includes(term) ||
        product.product_id?.toString().includes(term)
      );
    });
    
    return matchesFarmer || matchesProducts;
  })
  .sort((a, b) => {
    if (sortPriceOrder) {
      const aMinPrice = Math.min(...a.products.map(p => p.price_per_kg));
      const bMinPrice = Math.min(...b.products.map(p => p.price_per_kg));
      return sortPriceOrder === "asc" ? aMinPrice - bMinPrice : bMinPrice - aMinPrice;
    }
    if (sortProduceOrder) {
      const aProduceType = a.products[0]?.produce_type || "";
      const bProduceType = b.products[0]?.produce_type || "";
      return sortProduceOrder === "asc"
        ? aProduceType.localeCompare(bProduceType)
        : bProduceType.localeCompare(aProduceType);
    }
    return 0;
  });

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} className="ks-star-filled" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className="ks-star-filled" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="ks-star" />);
    }
    
    return stars;
  };

  return (
    <div className="ks-consumer-dashboard">
      {/* Product Section */}
      <div className="ks-market-section">
        <h2 className="ks-section-title">KrishiSetu Marketplace</h2>
        <div className="ks-search-filter-container">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ks-search-input"
          />
          <div className="ks-filter-group">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="ks-filter-select"
            >
              <option value="">All Categories</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="dairy">Dairy</option>
              <option value="spices">Spices</option>
            </select>
            <select 
              value={buyType} 
              onChange={(e) => setBuyType(e.target.value)}
              className="ks-filter-select"
            >
              <option value="">All Types</option>
              <option value="organic">Organic</option>
              <option value="standard">Standard</option>
            </select>
          </div>
        </div>
        
        <div className="ks-products-grid">
          {filteredProducts.map((product) => (
            <div 
              key={product.product_id} 
              className="ks-product-card"
              onClick={() => handleProductClick(product.product_id)}
            >
              <div className="ks-product-image-container">
                {product.buy_type === "organic" && (
                  <img src={OrganicBadge} alt="Organic" className="ks-organic-badge" />
                )}
                <img
                  src={productImages[product.product_name]}
                  alt={product.product_name}
                  className="ks-product-image"
                />
              </div>
              <div className="ks-product-details">
                <h3 className="ks-product-name">{product.product_name}</h3>
                <div className="ks-product-meta">
                  <span className={`ks-product-type ${product.buy_type}`}>
                    {product.buy_type}
                  </span>
                  <span className="ks-product-category">{product.category}</span>
                </div>
                
                <div className="ks-price-container">
                  <span className="ks-price-label">From:</span>
                  <span className="ks-price-value">₹{product.price_1kg}/kg</span>
                </div>
                
                <div className="ks-quantity-selector">
                  <select
                    value={selectedQuantities[product.product_id] || 1}
                    onChange={(e) => handleQuantityChange(product.product_id, e)}
                    className="ks-quantity-dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="1">1kg - ₹{product.price_1kg}</option>
                    <option value="2">2kg - ₹{product.price_2kg}</option>
                    <option value="5">5kg - ₹{product.price_5kg}</option>
                  </select>
                </div>
                
                <div className="ks-product-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, selectedQuantities[product.product_id] || 1);
                    }}
                    className="ks-action-btn ks-cart-btn"
                  >
                    <FontAwesomeIcon icon={faShoppingCart} /> Cart
                  </button>
                  <button
                    onClick={(e) => handleBuyNow(product, e)}
                    className="ks-action-btn ks-buy-btn"
                  >
                    <FontAwesomeIcon icon={faBolt} /> Buy
                  </button>
                  <button 
                    onClick={(e) => handleAddToCommunityOrders(product, e)}
                    className="ks-action-btn ks-community-btn"
                  >
                    <FontAwesomeIcon icon={faUsers} /> Community
                  </button>
                  <button
                    onClick={(e) => handleSubscribe(product, e)}
                    className="ks-action-btn ks-subscribe-btn"
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} /> Subscribe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bargaining Market Section */}
      <div className="ks-bargaining-section">
        <h2 className="ks-section-title">Farmer Bargaining Marketplace</h2>
        <div className="ks-farmer-search-container">
          <input
            type="text"
            placeholder="Search farmers or products..."
            value={farmerSearchTerm}
            onChange={(e) => setFarmerSearchTerm(e.target.value)}
            className="ks-search-input"
          />
          <div className="ks-farmer-filters">
            <select
              value={sortPriceOrder}
              onChange={(e) => setSortPriceOrder(e.target.value)}
              className="ks-filter-select"
            >
              <option value="">Sort by Price</option>
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>
            <select
              value={sortProduceOrder}
              onChange={(e) => setSortProduceOrder(e.target.value)}
              className="ks-filter-select"
            >
              <option value="">Sort by Type</option>
              <option value="asc">Organic</option>
              <option value="desc">Standard</option>
            </select>
          </div>
        </div>
        
        <div className="ks-farmers-list">
          {filteredFarmers.map((farmer) => {
            const parsedProducts = Array.isArray(farmer.products)
              ? farmer.products
              : JSON.parse(farmer.products || "[]");

            return (
              <div 
                key={farmer.farmer_id} 
                className="ks-farmer-card"
                onClick={() => handleFarmerClick(farmer.farmer_id)}
              >
                <div className="ks-farmer-header">
                  <img src={Farmer} alt="Farmer" className="ks-farmer-avatar" />
                  <div className="ks-farmer-basic-info">
                    <h3 className="ks-farmer-name">{farmer.farmer_name}</h3>
                    <div className="ks-farmer-meta">
                      <span className="ks-farmer-id">ID: {farmer.farmer_id}</span>
                      <span className="ks-farmer-rating">
                        {renderRatingStars(farmer.ratings || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="ks-products-table-container">
                  <table className="ks-products-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Price/kg</th>
                        <th>Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedProducts.map((product) => (
                        <tr key={`${product.product_id}-${product.produce_name}`}>
                          <td>{product.produce_name}</td>
                          <td>{product.produce_type}</td>
                          <td>₹{product.price_per_kg}</td>
                          <td>{product.availability}kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="ks-farmer-actions">
                  <button 
                    onClick={(e) => handleBargainClick(farmer, farmer.products[0], e)} 
                    className="ks-farmer-action-btn ks-bargain-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faHandshake} /> Bargain
                      </>
                    )}
                  </button>
                  {error && <div className="error-message">{error}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

     
    </div>
  );
};

export default ConsumerDashboard;