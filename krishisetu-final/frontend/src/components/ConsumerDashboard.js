import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/ConsumerDashboard.css";

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
  const [farmerSearchTerm, setFarmerSearchTerm] = useState("");
  const [sortPriceOrder, setSortPriceOrder] = useState(""); // State for price sorting
  const [sortProduceOrder, setSortProduceOrder] = useState(""); // State for produce type sorting
  const navigate = useNavigate();
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
    fetch("http://localhost:5000/api/farmers")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch farmers");
        return res.json();
      })
      .then((data) => setFarmers(data))
      .catch((error) => console.error("Error fetching farmers:", error));
  }, []);

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
  .filter((farmer) =>
    farmer.farmer_name.toLowerCase().includes(farmerSearchTerm.toLowerCase()) ||
    farmer.produce_name.toLowerCase().includes(farmerSearchTerm.toLowerCase()) ||
    farmer.product_id.toLowerCase().includes(farmerSearchTerm.toLowerCase()) ||
    farmer.user_id.toLowerCase().includes(farmerSearchTerm.toLowerCase()) ||
    farmer.produce_type.toLowerCase().includes(farmerSearchTerm.toLowerCase())
  )
  .sort((a, b) => {
    // Sort by price
    if (sortPriceOrder === "asc") {
      return a.price_per_kg - b.price_per_kg; // Low to High
    } else if (sortPriceOrder === "desc") {
      return b.price_per_kg - a.price_per_kg; // High to Low
    }

    if (sortProduceOrder === "asc") {
      return a.produce_type.localeCompare(b.produce_type); // Organic first
    } else if (sortProduceOrder === "desc") {
      return b.produce_type.localeCompare(a.produce_type); // Standard first
    }

    return 0; // Default: no sorting
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
              <p><strong>Price:</strong> ₹{product.price_1kg} per 1kg</p>
              <p><strong>Price:</strong> ₹{product.price_2kg} per 2kg</p>
              <p><strong>Price:</strong> ₹{product.price_5kg} per 5kg</p>
              <button className="product-button" onClick={() => navigate("/orderpage")}>Add to Cart</button>
              <button className="product-button" onClick={() => navigate("/payment")}>Buy Now</button>
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
          {filteredFarmers.map((farmer) => (
            <div key={farmer.farmer_id} className="farmer-profile-card">
            <div className="farmer-info">
              <img src={Farmer} alt="Farmer" className="farmer-image" />
              <div className="farmer-details">
              <p><strong>Product ID:</strong> {farmer.product_id}</p>
                <p><strong>Farmer ID:</strong> {farmer.user_id}</p>
                <p><strong>Farmer Name:</strong> {farmer.farmer_name}</p>
                <p><strong>Produce:</strong> {farmer.produce_name}</p>
                <p><strong>Produce Type:</strong> {farmer.produce_type}</p>
              </div>
            </div>
            <table className="produce-table">
              <thead>
                <tr>
                  <th>Produce</th>
                  <th>Price (₹/kg)</th>
                  <th>Availability (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{farmer.produce_name}</td>
                  <td>₹{farmer.price_per_kg}</td>
                  <td>{farmer.availability}</td>
                </tr>
              </tbody>
            </table>
            <div className="farmer-buttons">
              <button
                onClick={() => navigate(`/farmer/${farmer.farmer_id}`)}
                className="farmer-button"
              >
                View Farmer
              </button>
              <button
                onClick={() => navigate(`/negotiate/${farmer.farmer_id}`)}
                className="farmer-button"
              >
                Bargain Now
              </button>
            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
