import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const ProductDetail = () => {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${product_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError("Product not found");
        } else {
          setProduct(data);
          setSelectedQuantity("1kg"); // Default selection
        }
      })
      .catch(() => setError("Error fetching product"));
  }, [product_id]);

  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }

  if (!product) {
    return <p>Loading product details...</p>;
  }

  const handleSubscribe = () => {
    navigate("/subscribe", { state: { product, quantity: selectedQuantity } });
  };

  const handleAddToCart = () => {
    console.log("Added to cart:", product.product_name, selectedQuantity);
  };

  const handleAddToCommunityCart = () => {
    console.log("Added to community cart:", product.product_name, selectedQuantity);
  };

  const handleBuyNow = () => {
    console.log("Proceeding to buy:", product.product_name, selectedQuantity);
  };

  return (
    <div style={styles.container}>
      <div style={styles.productDetailContainer}>
        <h2 style={styles.productName}>{product.product_name}</h2>
        <img
          src={product.image ? `data:image/jpeg;base64,${product.image}` : "default-image-url"}
          alt="Product"
          style={styles.productImage}
        />
        <p style={styles.productDescription}>{product.description || "Fresh organic product available now!"}</p>

        <div style={styles.productDetails}>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Buy Type:</strong> {product.buy_type}</p>
        </div>

        <div style={styles.quantitySelector}>
          <label style={styles.quantityLabel}>Select Quantity: </label>
          <select value={selectedQuantity} onChange={(e) => setSelectedQuantity(e.target.value)} style={styles.quantitySelect}>
            <option value="1kg">1kg - ₹{product.price_1kg}</option>
            <option value="2kg">2kg - ₹{product.price_2kg}</option>
            <option value="5kg">5kg - ₹{product.price_5kg}</option>
          </select>
        </div>

        <div style={styles.buttonsContainer}>
          <button style={styles.cardButton} onClick={handleAddToCart}>Add to Cart</button>
          <button style={styles.cardButton} onClick={handleAddToCommunityCart}>Add to Community Cart</button>
          <button style={styles.cardButton} onClick={handleSubscribe}>Subscribe</button>
          <button style={styles.cardButton} onClick={handleBuyNow}>Buy Now</button>
        </div>

        <Link to="/consumer-dashboard" style={styles.backButton}>Back to Dashboard</Link>
      </div>
    </div>
  );
};

const styles = {
  container: { backgroundColor: "#f9f9f9", padding: "40px 0", display: "flex", justifyContent: "center", alignItems: "center" },
  productDetailContainer: { display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", maxWidth: "700px", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", backgroundColor: "#fff", transition: "all 0.3s ease" },
  productName: { color: "#333", fontSize: "30px", fontWeight: "bold", marginBottom: "10px" },
  productImage: { width: "200px", height: "200px", objectFit: "cover", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", transition: "transform 0.3s ease" },
  productDescription: { fontSize: "16px", color: "#555", marginTop: "10px", textAlign: "center" },
  productDetails: { marginTop: "20px", fontSize: "18px", color: "#555" },
  quantitySelector: { display: "flex", alignItems: "center", margin: "20px 0" },
  quantityLabel: { marginRight: "10px", fontSize: "16px" },
  quantitySelect: { 
    padding: "10px 25px", 
    fontSize: "16px", 
    fontWeight: "bold",
    borderRadius: "8px", 
    border: "2px solid #2980b9", 
    backgroundColor: "#f8f9fa", 
    color: "#333", 
    cursor: "pointer", 
    transition: "all 0.3s ease", 
    outline: "none", 
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
  },
  
  buttonsContainer: { display: "flex", gap: "10px", margin: "20px 0" },
  cardButton: { padding: "10px 20px", backgroundColor: "#2980b9", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", transition: "background-color 0.3s, transform 0.3s" },
  backButton: { marginTop: "20px", color: "#2980b9", textDecoration: "none", fontSize: "16px", fontWeight: "bold" },
};

export default ProductDetail;
