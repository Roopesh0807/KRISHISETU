import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/ConsumerDashboard.css";
import { fetchProducts } from '../utils/api';
import { useCart } from '../context/CartContext';
<<<<<<< HEAD
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faBolt, 
  faUsers, 
  faCalendarAlt,
  //faUser,
  faHandshake,
  faComments,
  faStar,
  faStarHalfAlt,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
=======

>>>>>>> 9bc2a9681eb8780ed9dc47bbf484b5a8bad79dc7

// Import images
import Farmer from "../assets/farmer.jpeg";
import OrganicBadge from "../assets/organic.jpg";
import Tomato from "../assets/tomato.jpg";
import Apple from "../assets/apple.jpg";
import Banana from "../assets/banana.jpg";
import Butter from "../assets/butter.jpg";
import Cheese from "../assets/cheese.jpg";
import Chilly from "../assets/chilly.jpg";
import CuminSeeds from "../assets/cumin_seeds.jpg";
import Ghee from "../assets/ghee.jpg";
import Ginger from "../assets/ginger.jpg";
import Grapes from "../assets/grapes.jpg";
import Onion from "../assets/onion.jpg";
import Potato from "../assets/potato.jpg";
import Rice from "../assets/rice.jpg";
import Turmeric from "../assets/turmeric.jpg";
import Wheat from "../assets/wheat.jpg";
import Pomegranate from "../assets/pomegranate.jpg";
import MasoorDal from "../assets/masoordal.jpg";
import Uraddal from "../assets/uraddal.jpg";
import Redchilly from "../assets/redchilly.jpg";
import Garlic from "../assets/garlic.jpg";
import Coriander from "../assets/coriander.jpg";

const productImages = {
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
  CuminSeeds,
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
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [buyType, setBuyType] = useState("");
  const { addToCart } = useCart();
  const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [farmerSearchTerm, setFarmerSearchTerm] = useState("");
  const [sortPriceOrder, setSortPriceOrder] = useState("");
  const [sortProduceOrder, setSortProduceOrder] = useState("");
  const navigate = useNavigate();
<<<<<<< HEAD
  const [selectedQuantities, setSelectedQuantities] = useState({});
=======
 

  // const [selectedQuantity, setSelectedQuantity] = useState("1kg"); // Default selection
  const [selectedQuantities, setSelectedQuantities] = useState("10kg");
>>>>>>> 9bc2a9681eb8780ed9dc47bbf484b5a8bad79dc7

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
<<<<<<< HEAD

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

  const handleBargainClick = (farmer, e) => {
    e.stopPropagation();
    setSelectedFarmer(farmer);
    setIsBargainPopupOpen(true);
  };

  const handleBargainConfirm = () => {
    if (selectedProduct && quantity > 0) {
      setIsBargainPopupOpen(false);
      navigate(`/bargain/${selectedFarmer.farmer_id}`, {
        state: {
          productId: selectedProduct.product_id, 
          productName: selectedProduct.produce_name,
          quantity: quantity,
          pricePerKg: selectedProduct.price_per_kg
        },
      });
    } else {
      alert("Please select a product and enter a valid quantity.");
=======
  
  useEffect(() => {
    const token = localStorage.getItem("token");
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
  
// Fetch products when component mounts
useEffect(() => {
  const fetchData = async () => {
    try {
      const productData = await fetchProducts("/api/products");
      setProducts(productData);
    } catch (error) {
      console.error("Error fetching products:", error);
>>>>>>> 9bc2a9681eb8780ed9dc47bbf484b5a8bad79dc7
    }
  };

<<<<<<< HEAD
  const handleQuantityChange = (productId, event) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: parseInt(event.target.value, 10),
    }));
  };

  const handleBuyNow = (product, e) => {
    e.stopPropagation();
    const quantity = selectedQuantities[product.product_id] || 1;
    addToCart(product, quantity);
    navigate("/cart");
  };

  const handleClosePopup = () => {
    setIsBargainPopupOpen(false);
  };

  const handleProductClick = (productId) => {
    navigate(`/productDetails/${productId}`);
  };
=======
const handleBargainClick = (farmer) => {
  console.log("Bargain clicked for farmer:", farmer); // Debugging
  setSelectedFarmer(farmer); // Store full farmer details
  setIsBargainPopupOpen(true); // Open popup
};

const handleBargainConfirm = async () => {
  console.log("Selected Farmer:", selectedFarmer);
  console.log("Selected Product:", selectedProduct);
  console.log("Quantity:", quantity);

  if (!selectedFarmer?.farmer_id || !selectedProduct?.product_id || !quantity || !selectedProduct?.price_per_kg) {
    alert("Missing required fields!");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/bargain/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        farmer_id: selectedFarmer.farmer_id,
        product_id: selectedProduct.product_id,
        quantity: quantity,
        original_price: selectedProduct.price_per_kg
      })
    });

    console.log("Response status:", response.status);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error("Unexpected response:", text);  // 🔍 Log non-JSON responses
      throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    console.log("Full Response Data:", data);  // 🔍 Log full response

    if (!response.ok) throw new Error(data.error || "Bargain failed");

    console.log("Success:", data);
    alert("Bargain initiated!");

    // Ensure `bargainId` exists before navigating
    if (data.bargainId) {
      navigate(`/bargain/${data.bargainId}`);
    } else {
      console.error("❌ Backend did not return a valid bargain session ID!");
      alert("Something went wrong! Bargain ID is missing.");
    }

  } catch (error) {
    console.error("Request failed:", error);
    alert(error.message.includes("<!DOCTYPE html>")
      ? "API endpoint not found (404)"
      : error.message
    );
  }
};
>>>>>>> 9bc2a9681eb8780ed9dc47bbf484b5a8bad79dc7

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
      const searchTerm = farmerSearchTerm.toLowerCase();
      return (
        farmer.farmer_name?.toLowerCase().includes(searchTerm) ||
        farmer.farmer_id?.toString().toLowerCase().includes(searchTerm) ||
        farmer.products.some((product) =>
          product.produce_id?.toLowerCase().includes(searchTerm) ||
          product.produce_name?.toLowerCase().includes(searchTerm) ||
          product.produce_type?.toLowerCase().includes(searchTerm) ||
          product.price_per_kg?.toString().includes(searchTerm) ||
          product.product_id?.toString().includes(searchTerm)
        )
      );
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
<<<<<<< HEAD
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
=======
              <p><strong>Product ID:</strong> {product.product_id}</p>
              <p><strong>Name:</strong> {product.product_name}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Buy Type:</strong> {product.buy_type}</p>
              {/* Quantity Dropdown */}
      <label><strong>Select Quantity:</strong></label>
      <select
      value={selectedQuantities[product.product_id] || 10} // Default 1kg
      onChange={(e) => handleQuantityChange(product.product_id, e)}
    >
      <option value="1">1kg - ₹{product.price_1kg}</option>
      <option value="2">2kg - ₹{product.price_2kg}</option>
      <option value="5">5kg - ₹{product.price_5kg}</option>
    </select>

              <button onClick={() => navigate(`/productDetails/${product.product_id}`)}>
  View Product
</button>

<button onClick={() => addToCart(product, selectedQuantities[product.product_id] || 1)}>
      Add to Cart
    </button>

    <button
  onClick={() => handleBuyNow(product)}
  className="btn btn-primary"
>
  Buy Now
</button>

  <button className="product-button" onClick={() => navigate("/subscribe")}>Subscribe</button>
>>>>>>> 9bc2a9681eb8780ed9dc47bbf484b5a8bad79dc7
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
                  {/* <button
                    onClick={() => handleFarmerClick(farmer.farmer_id)}
                    className="ks-farmer-action-btn ks-view-farmer-btn"
                  >
                    <FontAwesomeIcon icon={faUser} /> Profile
                  </button> */}
                  <button 
                    onClick={(e) => handleBargainClick(farmer, e)} 
                    className="ks-farmer-action-btn ks-bargain-btn"
                  >
                    <FontAwesomeIcon icon={faHandshake} /> Bargain
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bargain Popup */}
      {isBargainPopupOpen && selectedFarmer && selectedFarmer.products && (
<<<<<<< HEAD
        <div className="ks-bargain-modal">
          <div className="ks-bargain-modal-content">
            <button 
              onClick={handleClosePopup}
              className="ks-modal-close-btn"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3 className="ks-modal-title">Bargain with {selectedFarmer.farmer_name}</h3>
            
            <div className="ks-modal-form-group">
              <label className="ks-modal-label">Select Product</label>
              <select
                onChange={(e) => {
                  const selectedProductData = selectedFarmer.products.find(
                    (product) => product.produce_name === e.target.value
                  );
                  setSelectedProduct(selectedProductData || null);
                }}
                className="ks-modal-select"
              >
                <option value="">Choose a product</option>
                {selectedFarmer.products.map((product) => (
                  <option key={product.product_id} value={product.produce_name}>
                    {product.produce_name} - ₹{product.price_per_kg}/kg
                  </option>
                ))}
              </select>
            </div>
            
            <div className="ks-modal-form-group">
              <label className="ks-modal-label">Quantity (kg)</label>
              <input
                type="number"
                min="1"
                max={selectedProduct?.availability || 100}
                value={quantity}
                onChange={(e) => {
                  const enteredQuantity = Number(e.target.value);
                  if (enteredQuantity > 0) setQuantity(enteredQuantity);
                }}
                className="ks-modal-input"
              />
            </div>
            
            <div className="ks-modal-actions">
              <button 
                onClick={handleBargainConfirm}
                className="ks-modal-confirm-btn"
              >
                <FontAwesomeIcon icon={faComments} /> Start Bargaining
              </button>
            </div>
          </div>
        </div>
      )}
=======
  <div className="bargain-popup">
    <div className="bargain-popup-content">
      <h3>Select Product and Quantity from {selectedFarmer.farmer_name}</h3>
      
      <select
        onChange={(e) => {
          const selectedId = e.target.value;
          const product = selectedFarmer.products.find(p => p.product_id === selectedId);
          setSelectedProduct(product);
          setQuantity(10); // Set default quantity to 10kg when product changes
        }}
      >
        <option value="">Select a product</option>
        {selectedFarmer.products.map((product) => (
          <option 
            key={product.product_id} 
            value={product.product_id}
            disabled={product.availability <= 0}
          >
            {product.produce_name} - ₹{product.price_per_kg}/kg 
            ({product.availability}kg available)
          </option>
        ))}
      </select>

      <input
        type="number"
        min="1"
        max={selectedProduct?.availability || 10}
        value={quantity}
        onChange={(e) => {
          const val = Math.max(1, Math.min(
            selectedProduct?.availability || 10, 
            Number(e.target.value)
          ));
          setQuantity(val);
        }}
        placeholder={`Quantity (1-${selectedProduct?.availability || 10}kg)`}
        disabled={!selectedProduct}
      />

      <p className="price-preview">
        {selectedProduct ? (
          `Estimated Total: ₹${(selectedProduct.price_per_kg * quantity).toFixed(2)}`
        ) : (
          "Estimated Total: ₹0.00"
        )}
      </p>

      <div className="popup-buttons">
        <button onClick={handleBargainConfirm} disabled={!selectedProduct}>
          Start Bargaining
        </button>
        <button onClick={handleClosePopup}>Cancel</button>
      </div>
    </div>
  </div>
)}
>>>>>>> 9bc2a9681eb8780ed9dc47bbf484b5a8bad79dc7
    </div>
  );
};

export default ConsumerDashboard;