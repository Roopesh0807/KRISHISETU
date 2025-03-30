import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/ConsumerDashboard.css";
import { fetchProducts } from '../utils/api';
import { useCart } from '../context/CartContext';


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
  // const [, setCart] = useState([]);
  const [loading] = useState("");
  const { addToCart } = useCart();
  const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [farmerSearchTerm, setFarmerSearchTerm] = useState("");
  const [sortPriceOrder, setSortPriceOrder] = useState(""); // State for price sorting
  const [sortProduceOrder, setSortProduceOrder] = useState(""); // State for produce type sorting
  const navigate = useNavigate();
 

  // const [selectedQuantity, setSelectedQuantity] = useState("1kg"); // Default selection
  const [selectedQuantities, setSelectedQuantities] = useState("10kg");

  useEffect(() => {
    // Fetch Products
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
    }
  };
  fetchData();
}, []);

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

const handleBuyNow = (product) => {
  const quantity = selectedQuantities[product.product_id] || 1; // Get selected quantity, default to 1kg
  addToCart(product, quantity);
  navigate("/cart");
};



// Function to close the popup
const handleClosePopup = () => {
  setIsBargainPopupOpen(false);
};
// const addToCart = (product) => {
//   let currentCart = JSON.parse(localStorage.getItem("cart")) || [];
//   const productIndex = currentCart.findIndex((item) => item.product_id === product.product_id);

//   if (productIndex === -1) {
//     currentCart.push({ ...product, quantity: selectedQuantity });
//   } else {
//     currentCart[productIndex].quantity = selectedQuantity;
//   }

//   localStorage.setItem("cart", JSON.stringify(currentCart));
//   alert(`${product.product_name} (x${selectedQuantity}) has been added to your cart!`);
// };

if (loading) {
  return <div>Loading products...</div>;
}
  // Filter products based on search term, category, and buy type
  const filteredProducts = products.filter((product) => {
    return (
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (category === "" || product.category.toLowerCase() === category.toLowerCase()) &&
      (buyType === "" || product.buy_type.toLowerCase() === buyType.toLowerCase())
    );
  });
  
  // Filter farmers based on search term and sort order
  const filteredFarmers = farmers
  .map((farmer) => {
    // Ensure products is always an array
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
    // Sorting by price (consider the lowest price product per farmer)
    if (sortPriceOrder) {
      const aMinPrice = Math.min(...a.products.map(p => p.price_per_kg));
      const bMinPrice = Math.min(...b.products.map(p => p.price_per_kg));
      return sortPriceOrder === "asc" ? aMinPrice - bMinPrice : bMinPrice - aMinPrice;
    }

    // Sorting by produce type (first product in the list)
    if (sortProduceOrder) {
      const aProduceType = a.products[0]?.produce_type || "";
      const bProduceType = b.products[0]?.produce_type || "";
      return sortProduceOrder === "asc"
        ? aProduceType.localeCompare(bProduceType)
        : bProduceType.localeCompare(aProduceType);
    }

    return 0;
  });



  return (
    <div className="market-bargaining-container">
      {/* Product Section */}
      <div className="market-section">
        <h2>KrishiSetu Market</h2>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm state
        />
        <div className="filters">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="grains">Grains</option>
          </select>
          <select value={buyType} onChange={(e) => setBuyType(e.target.value)}>
            <option value="">All Types</option>
            <option value="organic">Organic</option>
            <option value="standard">Standard</option>
          </select>
        </div>
        <div className="products-container">
          {filteredProducts.map((product) => (
            <div key={product.product_id} className="product-card">
              <div className="product-image-container">
                {product.buy_type === "organic" && (
                  <img src={OrganicBadge} alt="Organic" className="organic-badge" />
                )}
                <img
                  src={productImages[product.product_name]}
                  alt={product.product_name}
                  className="product-image"
                />
              </div>
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
            </div>
          ))}
        </div>
      </div>

      {/* Bargaining Market Section */}
      <div className="bargaining-section">
        <h2>Bargaining System</h2>
        <input
          type="text"
          placeholder="Search farmers..."
          value={farmerSearchTerm}
          onChange={(e) => setFarmerSearchTerm(e.target.value)} // Update farmerSearchTerm state
        />
        <div className="filters">
        {/* Sort by Price */}
        <select
          value={sortPriceOrder}
          onChange={(e) => setSortPriceOrder(e.target.value)}
        >
          <option value="">Sort by Price</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>

        {/* Sort by Produce Type */}
        <select
          value={sortProduceOrder}
          onChange={(e) => setSortProduceOrder(e.target.value)}
        >
          <option value="">Sort by Produce Type</option>
          <option value="asc">Organic</option>
          <option value="desc">Standard</option>
        </select>
      </div>
      <div className="farmers-container">
  {filteredFarmers.map((farmer) => {
    // Ensure products is always an array
    const parsedProducts = Array.isArray(farmer.products)
      ? farmer.products
      : JSON.parse(farmer.products || "[]");

    return (
      <div key={farmer.farmer_id} className="farmer-profile-card">
        <div className="farmer-info">
          <img src={Farmer} alt="Farmer" className="farmer-image" />
          <div className="farmer-details">
            <p><strong>Farmer ID:</strong> {farmer.farmer_id}</p>
            <p><strong>Farmer Name:</strong> {farmer.farmer_name}</p>
            <p><strong>Farming Method:</strong> {farmer.produce_type}</p>
            <p><strong>Ratings:</strong> {farmer.ratings} ⭐</p>
          </div>
        </div>

        {/* Table for multiple products */}
        <table className="produce-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Produce</th>
              <th>Type</th>
              <th>Price (₹/kg)</th>
              <th>Availability (kg)</th>
            </tr>
          </thead>
          <tbody>
            {parsedProducts.map((product) => (
              <tr key={`${product.product_id}-${product.produce_name}`}>
                <td>{product.product_id}</td>
                <td>{product.produce_name}</td>
                <td>{product.produce_type}</td>
                <td>₹{product.price_per_kg}</td>
                <td>{product.availability}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Action Buttons */}
        <div className="farmer-buttons">
          <button
            onClick={() => navigate(`/farmerDetails/${farmer.farmer_id}`)}
            className="farmer-button"
          >
            View Farmer
          </button>
          <button onClick={() => handleBargainClick(farmer)} className="farmer-button">
            Bargain Now
          </button>
        </div>
      </div>
    );
  })}
</div>
</div>
      {/* Bargain Popup */}
      {isBargainPopupOpen && selectedFarmer && selectedFarmer.products && (
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
    </div>
  );
};

export default ConsumerDashboard;
