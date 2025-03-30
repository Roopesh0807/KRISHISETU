// import React, { useState, useEffect } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import "./ProductDetails.css";
// import { useCart } from "../context/CartContext";
// import { AuthContext } from "../context/AuthContext"; // Import AuthContext

// const ProductDetail = () => {
//   const { product_id } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);
//   const [error, setError] = useState(null);
//   const { addToCart } = useCart();

//   const [selectedQuantity, setSelectedQuantity] = useState(1);
//   const [communities, setCommunities] = useState([]);
//   const [selectedCommunity, setSelectedCommunity] = useState("");
//   const [showCommunitySelect, setShowCommunitySelect] = useState(false);
//   const [addedToCommunityCart, setAddedToCommunityCart] = useState(false);
//   const [showCommunityOptions, setShowCommunityOptions] = useState(false);
//   const { consumer } = React.useContext(AuthContext); // Use AuthContext to check login status

//   // const [selectedQuantity, setSelectedQuantity] = useState(1); // ✅ Default is number


//   useEffect(() => {
//     fetch(`http://localhost:5000/api/products/${product_id}`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.error) {
//           setError("Product not found");
//         } else {
//           setProduct(data);

//           setSelectedQuantity(1);

//         }
//       })
//       .catch(() => setError("Error fetching product"));
//   }, [product_id]);


//   const handleAddToCommunityCart = async () => {
//     // Check login status using AuthContext
//     if (!consumer) {
//       alert("Please login first");
//       navigate("/consumer-login");
//       return;
//     }

//     if (addedToCommunityCart) {
//       navigate("/member-order-page");
//       return;
//     }

//   if (error) return <p className="error-message">{error}</p>;
//   if (!product) return <p className="loading-text">Loading product details...</p>;


//     try {
//       const response = await fetch(`http://localhost:5000/api/consumer-communities/${consumer.consumer_id}`);
//       const data = await response.json();
      
//       if (response.ok) {
//         if (data.error === "Consumer not found") {
//           alert("Your session might be expired. Please login again.");
//           navigate("/consumer-login");
//           return;
//         }
        
//         if (data.length === 0) {
//           setShowCommunityOptions(true);
//           return;
//         }
        
//         setCommunities(data);
//         setShowCommunitySelect(true);
//       } else {
//         throw new Error(data.error || "Failed to fetch communities");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       alert(error.message);
      
//       if (error.message.includes("Consumer not found") || 
//           error.message.includes("session")) {
//         navigate("/consumer-login");
//       }
//     }
//   };

//   const handleConfirmAddToCommunityCart = async () => {
//     if (!selectedCommunity) {
//       alert("Please select a community first");
//       return;
//     }
  
//     try {
//       const response = await fetch("http://localhost:5000/api/community-cart", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           community_id: selectedCommunity,
//           product_id: product.product_id,
//           consumer_id: consumer.consumer_id, // Use consumer from AuthContext
//           quantity: selectedQuantity,
//           price: selectedQuantity * product.price_1kg
//         })
//       });
      
//       const data = await response.json();
      
//     if (!response.ok) {
//       throw new Error(data.error || "Failed to add to community cart");
//     }
//       if (!response.ok) {
//         if (data.error === "Consumer not found") {
//           alert("Your account wasn't found. Please log in again.");
//           navigate("/consumer-login");
//           return;
//         }
//         if (data.error === "Membership not found") {
//           alert("You need to join this community first");
//           setShowCommunityOptions(true);
//           setShowCommunitySelect(false);
//           return;
//         }
//         throw new Error(data.error || "Failed to add to community cart");
//       }
  
//       setAddedToCommunityCart(true);
//       alert(`Added to ${data.community_name || 'community'} cart!`);
//     } catch (error) {
//       console.error("Error:", error);
//       alert(error.message);
      
//       if (error.message.includes("not a member") || 
//           error.message.includes("Membership not found")) {
//         setShowCommunityOptions(true);
//         setShowCommunitySelect(false);
//       }
//     }
//   };

//   // Rest of the component remains exactly the same
//   const handleSubscribe = () => {
//     navigate("/subscribe", { state: { product, quantity: selectedQuantity } });
//   };

//   const handleAddToCart = () => {
//     addToCart(product, selectedQuantity);
//     navigate("/cart");


//   };

//   // const handleAddToCommunityCart = () => {
//   //   console.log("Added to community cart:", product.product_name, selectedQuantity);

//   // };

//   const handleBuyNow = () => {
//     addToCart(product, selectedQuantity);
//     navigate("/cart");
//   };

//   const getImagePath = (productName) => {
//     return `/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
//   };

//   const handleIncrease = () => {
//     setSelectedQuantity((prev) => Math.max(1, prev + 1));
//   };

//   const handleDecrease = () => {
//     setSelectedQuantity((prev) => Math.max(1, prev - 1));
//   };

//   const totalPrice = selectedQuantity * (product?.price_1kg || 0);

//   if (error) return <p className="error-message">{error}</p>;
//   if (!product) return <p className="loading-text">Loading product details...</p>;

//     setSelectedQuantity((prev) => Math.max(1, prev + 1)); // ✅ Always valid
//   };

//   const handleDecrease = () => {
//     setSelectedQuantity((prev) => Math.max(1, prev - 1)); // ✅ Prevent negative
//   };

//   const totalPrice = selectedQuantity * (product?.price_1kg || 0); // ✅ Fixing NaN issue


//   return (
//     <div className="container">
//       <div className="productDetailContainer">
//         <h2 className="productName">{product.product_name}</h2>
//         <img
//           src={getImagePath(product.product_name)}
//           alt={product.product_name}
//           className="productImage"
//           onError={(e) => { e.target.src = "/images/default-image.jpg"; }} 
//         />

//         <p className="productDescription">{product.description || "Fresh organic product available now!"}</p>

//         <div className="productDetails">
//           <p><strong>Category:</strong> {product.category}</p>
//           <p><strong>Buy Type:</strong> {product.buy_type}</p>
//         </div>

//         <div className="quantitySelector">
//           <label className="quantityLabel"><strong>Select Quantity:</strong></label>
//           <div className="quantityControls">
//             <button onClick={handleDecrease} className="quantityButton">-</button>
//             <span className="quantityValue">{selectedQuantity} kg</span>
//             <button onClick={handleIncrease} className="quantityButton">+</button>
//           </div>
//         </div>


//         {showCommunitySelect && !addedToCommunityCart && (
//           <div className="communitySection">
//             <div className="communitySelector">
//               <label className="quantityLabel"><strong>Select Community:</strong></label>
//               <select
//                 value={selectedCommunity}
//                 onChange={(e) => setSelectedCommunity(e.target.value)}
//                 className="communitySelect"
//               >
//                 <option value="">Select a community</option>
//                 {communities.map(community => (
//                   <option key={community.community_id} value={community.community_id}>
//                     {community.community_name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <button 
//               className="cardButton confirmButton"
//               onClick={handleConfirmAddToCommunityCart}
//             >
//               Confirm Selection
//             </button>
//           </div>
//         )}

//         {showCommunityOptions && !showCommunitySelect && (
//           <div className="communityPrompt">
//             <p>You're not part of any community yet.You need to join a community to use this feature.</p>
//             <div className="communityActionButtons">
//               <button 
//                 className="cardButton"
//                 onClick={() => navigate("/create-community")}
//               >
//                 Create a Community
//               </button>
//               <button 
//                 className="cardButton"
//                 onClick={() => navigate("/join-community")}
//               >
//                 Join Existing Community
//               </button>
//             </div>
//           </div>
//         )}


//         <p className="totalPrice"><strong>Total Price: ₹ {totalPrice}</strong></p>

//         <div className="buttonsContainer">
//           <button className="cardButton" onClick={handleAddToCart}>Add to Cart</button>
//           <button className="cardButton" onClick={handleAddToCommunityCart}>
//             {addedToCommunityCart ? "Go to Community Cart" : "Add to Community Cart"}
//           </button>
//           <button className="cardButton" onClick={handleSubscribe}>Subscribe</button>
//           <button className="cardButton" onClick={handleBuyNow}>Buy Now</button>
//         </div>

//         {/* {communities.length === 0 && !showCommunitySelect && (
//           <div className="communityPrompt">
//             <p>You're not part of any community yet.</p>
//           </div>
//         )} */}

//         <Link to="/consumer-dashboard" className="backButton">Back to Dashboard</Link>
//       </div>
//     </div>
//   );
// };

// export default ProductDetail;
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ProductDetails.css";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const ProductDetail = () => {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [showCommunitySelect, setShowCommunitySelect] = useState(false);
  const [addedToCommunityCart, setAddedToCommunityCart] = useState(false);
  const [showCommunityOptions, setShowCommunityOptions] = useState(false);
  const { consumer } = React.useContext(AuthContext);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${product_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError("Product not found");
        } else {
          setProduct(data);
          setSelectedQuantity(1);
        }
      })
      .catch(() => setError("Error fetching product"));
  }, [product_id]);

  const handleAddToCommunityCart = async () => {
    if (!consumer) {
      alert("Please login first");
      navigate("/consumer-login");
      return;
    }

    if (addedToCommunityCart) {
      navigate("/member-order-page");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/consumer-communities/${consumer.consumer_id}`);
      const data = await response.json();
      
      if (response.ok) {
        if (data.error === "Consumer not found") {
          alert("Your session might be expired. Please login again.");
          navigate("/consumer-login");
          return;
        }
        
        if (data.length === 0) {
          setShowCommunityOptions(true);
          return;
        }
        
        setCommunities(data);
        setShowCommunitySelect(true);
      } else {
        throw new Error(data.error || "Failed to fetch communities");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
      
      if (error.message.includes("Consumer not found") || 
          error.message.includes("session")) {
        navigate("/consumer-login");
      }
    }
  };

  const handleConfirmAddToCommunityCart = async () => {
    if (!selectedCommunity) {
      alert("Please select a community first");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/community-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          community_id: selectedCommunity,
          product_id: product.product_id,
          consumer_id: consumer.consumer_id,
          quantity: selectedQuantity,
          price: selectedQuantity * product.price_1kg
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === "Consumer not found") {
          alert("Your account wasn't found. Please log in again.");
          navigate("/consumer-login");
          return;
        }
        if (data.error === "Membership not found") {
          alert("You need to join this community first");
          setShowCommunityOptions(true);
          setShowCommunitySelect(false);
          return;
        }
        throw new Error(data.error || "Failed to add to community cart");
      }
  
      setAddedToCommunityCart(true);
      alert(`Added to ${data.community_name || 'community'} cart!`);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
      
      if (error.message.includes("not a member") || 
          error.message.includes("Membership not found")) {
        setShowCommunityOptions(true);
        setShowCommunitySelect(false);
      }
    }
  };

  const handleSubscribe = () => {
    navigate("/subscribe", { state: { product, quantity: selectedQuantity } });
  };

  const handleAddToCart = () => {
    addToCart(product, selectedQuantity);
    navigate("/cart");
  };

  const handleBuyNow = () => {
    addToCart(product, selectedQuantity);
    navigate("/cart");
  };

  const getImagePath = (productName) => {
    return `/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
  };

  const handleIncrease = () => {
    setSelectedQuantity((prev) => Math.max(1, prev + 1));
  };

  const handleDecrease = () => {
    setSelectedQuantity((prev) => Math.max(1, prev - 1));
  };

  if (error) return <p className="error-message">{error}</p>;
  if (!product) return <p className="loading-text">Loading product details...</p>;

  const totalPrice = selectedQuantity * (product.price_1kg || 0);

  return (
    <div className="container">
      <div className="productDetailContainer">
        <h2 className="productName">{product.product_name}</h2>
        <img
          src={getImagePath(product.product_name)}
          alt={product.product_name}
          className="productImage"
          onError={(e) => { e.target.src = "/images/default-image.jpg"; }} 
        />

        <p className="productDescription">{product.description || "Fresh organic product available now!"}</p>

        <div className="productDetails">
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Buy Type:</strong> {product.buy_type}</p>
        </div>

        <div className="quantitySelector">
          <label className="quantityLabel"><strong>Select Quantity:</strong></label>
          <div className="quantityControls">
            <button onClick={handleDecrease} className="quantityButton">-</button>
            <span className="quantityValue">{selectedQuantity} kg</span>
            <button onClick={handleIncrease} className="quantityButton">+</button>
          </div>
        </div>

        {showCommunitySelect && !addedToCommunityCart && (
          <div className="communitySection">
            <div className="communitySelector">
              <label className="quantityLabel"><strong>Select Community:</strong></label>
              <select
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="communitySelect"
              >
                <option value="">Select a community</option>
                {communities.map(community => (
                  <option key={community.community_id} value={community.community_id}>
                    {community.community_name}
                  </option>
                ))}
              </select>
            </div>
            <button 
              className="cardButton confirmButton"
              onClick={handleConfirmAddToCommunityCart}
            >
              Confirm Selection
            </button>
          </div>
        )}

        {showCommunityOptions && !showCommunitySelect && (
          <div className="communityPrompt">
            <p>You're not part of any community yet.You need to join a community to use this feature.</p>
            <div className="communityActionButtons">
              <button 
                className="cardButton"
                onClick={() => navigate("/create-community")}
              >
                Create a Community
              </button>
              <button 
                className="cardButton"
                onClick={() => navigate("/join-community")}
              >
                Join Existing Community
              </button>
            </div>
          </div>
        )}

        <p className="totalPrice"><strong>Total Price: ₹ {totalPrice}</strong></p>

        <div className="buttonsContainer">
          <button className="cardButton" onClick={handleAddToCart}>Add to Cart</button>
          <button className="cardButton" onClick={handleAddToCommunityCart}>
            {addedToCommunityCart ? "Go to Community Cart" : "Add to Community Cart"}
          </button>
          <button className="cardButton" onClick={handleSubscribe}>Subscribe</button>
          <button className="cardButton" onClick={handleBuyNow}>Buy Now</button>
        </div>

        <Link to="/consumer-dashboard" className="backButton">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default ProductDetail;