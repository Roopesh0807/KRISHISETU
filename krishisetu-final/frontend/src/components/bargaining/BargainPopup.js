// // // // src/components/bargaining/BargainPopup.js
// // // import React, { useState } from "react";
// // // import { useParams, useNavigate } from "react-router-dom";

// // // const BargainPopup = () => {
// // //   const { farmerId } = useParams();
// // //   const navigate = useNavigate();
// // //   const token = localStorage.getItem("token");

// // //   const [selectedProduct, setSelectedProduct] = useState(null);
// // //   const [selectedQuantity, setSelectedQuantity] = useState(10);
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [error, setError] = useState(null);

// // //   const handleConfirm = async () => {
// // //     if (!selectedProduct) {
// // //       setError("Please select a product first");
// // //       return;
// // //     }

// // //     try {
// // //       setIsLoading(true);
// // //       setError(null);

// // //       // 1. Create bargain session
// // //       const bargainResponse = await fetch(
// // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/create-bargain`,
// // //         {
// // //           method: "POST",
// // //           headers: {
// // //             Authorization: `Bearer ${token}`,
// // //             "Content-Type": "application/json",
// // //           },
// // //           body: JSON.stringify({
// // //             farmer_id: farmerId,
// // //           }),
// // //         }
// // //       );

// // //       if (!bargainResponse.ok) {
// // //         throw new Error(await bargainResponse.text() || "Failed to create bargain session");
// // //       }

// // //       const bargainData = await bargainResponse.json();
// // //       const newBargainId =
// // //         bargainData.bargainId || bargainData.id || bargainData.bargain_id;

// // //       if (!newBargainId) throw new Error("Invalid create-bargain response");

// // //       // 2. Add product to bargain
// // //       const productResponse = await fetch(
// // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/add-bargain-product`,
// // //         {
// // //           method: "POST",
// // //           headers: {
// // //             Authorization: `Bearer ${token}`,
// // //             "Content-Type": "application/json",
// // //           },
// // //           body: JSON.stringify({
// // //             bargain_id: newBargainId,
// // //             product_id: selectedProduct.product_id,
// // //             quantity: parseFloat(selectedQuantity) || 10,
// // //           }),
// // //         }
// // //       );

// // //       if (!productResponse.ok) {
// // //         throw new Error(await productResponse.text() || "Product addition failed");
// // //       }

// // //       const productData = await productResponse.json();

// // //       // 3. Save SYSTEM MESSAGE
// // //       const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${selectedQuantity}kg) at ₹${selectedProduct.price_per_kg}/kg`;
// // //       await fetch(
// // //         `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${newBargainId}/system-message`,
// // //         {
// // //           method: "POST",
// // //           headers: {
// // //             Authorization: `Bearer ${token}`,
// // //             "Content-Type": "application/json",
// // //           },
// // //           body: JSON.stringify({
// // //             message_content: systemMessageContent,
// // //             message_type: "system",
// // //           }),
// // //         }
// // //       );

// // //       // 4. Navigate to chat UI
// // //       navigate(`/bargain/${newBargainId}`, {
// // //         state: {
// // //           product: {
// // //             ...selectedProduct,
// // //             price_per_kg: productData.price_per_kg || selectedProduct.price_per_kg,
// // //             quantity: productData.quantity || selectedProduct.quantity,
// // //           },
// // //           farmerId,
// // //           currentPrice: productData.price_per_kg || selectedProduct.price_per_kg,
// // //           bargainId: newBargainId,
// // //           originalPrice: productData.price_per_kg || selectedProduct.price_per_kg,
// // //         },
// // //       });
// // //     } catch (err) {
// // //       console.error("Bargain initiation error:", err);
// // //       setError(err.message || "Failed to start bargaining");
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="popup-container">
// // //       <div className="popup">
// // //         <h2>Select Product for Bargaining</h2>
// // //         {error && <p style={{ color: "red" }}>{error}</p>}

// // //         {/* Product selection */}
// // //         <div className="form-group">
// // //           <label>Select Product:</label>
// // //           {/* Replace this select with your existing product list fetch */}
// // //           <select
// // //             onChange={(e) => setSelectedProduct(JSON.parse(e.target.value))}
// // //           >
// // //             <option value="">-- Select --</option>
// // //             {/* Example placeholder, replace with dynamic list */}
// // //             <option
// // //               value={JSON.stringify({
// // //                 product_id: 1,
// // //                 produce_name: "Tomato",
// // //                 price_per_kg: 30,
// // //               })}
// // //             >
// // //               Tomato
// // //             </option>
// // //             <option
// // //               value={JSON.stringify({
// // //                 product_id: 2,
// // //                 produce_name: "Onion",
// // //                 price_per_kg: 40,
// // //               })}
// // //             >
// // //               Onion
// // //             </option>
// // //           </select>
// // //         </div>

// // //         {/* Quantity */}
// // //         <div className="form-group">
// // //           <label>Quantity (kg):</label>
// // //           <input
// // //             type="number"
// // //             value={selectedQuantity}
// // //             onChange={(e) => setSelectedQuantity(e.target.value)}
// // //           />
// // //         </div>

// // //         <div className="popup-actions">
// // //           <button onClick={() => navigate(-1)}>Cancel</button>
// // //           <button onClick={handleConfirm} disabled={isLoading}>
// // //             {isLoading ? "Starting..." : "Confirm"}
// // //           </button>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default BargainPopup;
// // // src/components/bargaining/BargainPopup.js
// // import React, { useState, useEffect } from "react";
// // import { useParams, useNavigate, useLocation } from "react-router-dom";
// // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // import {
// //   faSpinner,
// //   faTimes,
// //   faHandshake,
// //   faLeaf,
// //   faWeightHanging
// // } from '@fortawesome/free-solid-svg-icons';
// // import './BargainPopup.css'; // Create this CSS file for styling

// // const BargainPopup = () => {
// //   const { farmerId } = useParams();
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const { farmer, products: farmerProducts } = location.state || {};
// //   const token = localStorage.getItem("consumer") 
// //     ? JSON.parse(localStorage.getItem("consumer")).token 
// //     : null;

// //   const [selectedProduct, setSelectedProduct] = useState(null);
// //   const [selectedQuantity, setSelectedQuantity] = useState(10);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [availableProducts, setAvailableProducts] = useState([]);

// //   useEffect(() => {
// //     if (farmerProducts && farmerProducts.length > 0) {
// //       setAvailableProducts(farmerProducts);
// //       if (farmerProducts.length === 1) {
// //         setSelectedProduct(farmerProducts[0]);
// //       }
// //     } else {
// //       // Fallback: fetch products if not passed in state
// //       fetchFarmerProducts();
// //     }
// //   }, [farmerId, farmerProducts]);

// //   const fetchFarmerProducts = async () => {
// //     try {
// //       const response = await fetch(
// //         `http://localhost:5000/api/produces?farmer_id=${farmerId}&market_type=Bargaining Market`,
// //         {
// //           headers: {
// //             "Authorization": `Bearer ${token}`,
// //           },
// //         }
// //       );
      
// //       if (response.ok) {
// //         const products = await response.json();
// //         setAvailableProducts(products);
// //         if (products.length === 1) {
// //           setSelectedProduct(products[0]);
// //         }
// //       }
// //     } catch (error) {
// //       console.error("Error fetching farmer products:", error);
// //     }
// //   };

// //   const handleConfirm = async () => {
// //     if (!selectedProduct) {
// //       setError("Please select a product first");
// //       return;
// //     }

// //     try {
// //       setIsLoading(true);
// //       setError(null);

// //       // 1. Create bargain session
// //       const bargainResponse = await fetch(
// //         `http://localhost:5000/api/create-bargain`,
// //         {
// //           method: "POST",
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             farmer_id: farmerId,
// //           }),
// //         }
// //       );

// //       if (!bargainResponse.ok) {
// //         throw new Error(await bargainResponse.text() || "Failed to create bargain session");
// //       }

// //       const bargainData = await bargainResponse.json();
// //       const newBargainId = bargainData.bargainId;

// //       if (!newBargainId) throw new Error("Invalid create-bargain response");

// //       // 2. Add product to bargain
// //       const productResponse = await fetch(
// //         `http://localhost:5000/api/add-bargain-product`,
// //         {
// //           method: "POST",
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             bargain_id: newBargainId,
// //             product_id: selectedProduct.product_id || selectedProduct.produce_id,
// //             quantity: parseFloat(selectedQuantity) || 10,
// //           }),
// //         }
// //       );

// //       if (!productResponse.ok) {
// //         throw new Error(await productResponse.text() || "Product addition failed");
// //       }

// //       const productData = await productResponse.json();

// //       // 3. Save SYSTEM MESSAGE
// //       const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${selectedQuantity}kg) at ₹${selectedProduct.price_per_kg}/kg`;
// //       await fetch(
// //         `http://localhost:5000/api/bargain/${newBargainId}/system-message`,
// //         {
// //           method: "POST",
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             message_content: systemMessageContent,
// //             message_type: "system",
// //           }),
// //         }
// //       );

// //       // 4. Navigate to chat UI
// //       navigate(`/bargain/${newBargainId}`, {
// //         state: {
// //           product: {
// //             ...selectedProduct,
// //             price_per_kg: productData.price_per_kg || selectedProduct.price_per_kg,
// //             quantity: productData.quantity || selectedQuantity,
// //           },
// //           farmer,
// //           currentPrice: productData.price_per_kg || selectedProduct.price_per_kg,
// //           bargainId: newBargainId,
// //           originalPrice: productData.price_per_kg || selectedProduct.price_per_kg,
// //         },
// //       });
// //     } catch (err) {
// //       console.error("Bargain initiation error:", err);
// //       setError(err.message || "Failed to start bargaining");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="bargain-popup-overlay">
// //       <div className="bargain-popup-container">
// //         <div className="popup-header">
// //           <div className="popup-title">
// //             <FontAwesomeIcon icon={faHandshake} />
// //             <h2>Initiate Bargain with {farmer?.farmer_name || "Farmer"}</h2>
// //           </div>
// //           <button 
// //             onClick={() => navigate(-1)} 
// //             className="popup-close-btn"
// //           >
// //             <FontAwesomeIcon icon={faTimes} />
// //           </button>
// //         </div>

// //         <div className="popup-content">
// //           {error && <div className="error-message">{error}</div>}

// //           {/* Product selection */}
// //           <div className="form-group">
// //             <label>Select Product:</label>
// //             <select
// //               value={selectedProduct ? selectedProduct.produce_name : ""}
// //               onChange={(e) => {
// //                 const product = availableProducts.find(
// //                   p => p.produce_name === e.target.value
// //                 );
// //                 setSelectedProduct(product);
// //                 setSelectedQuantity(product?.minimum_quantity || 10);
// //               }}
// //               className="product-select"
// //             >
// //               <option value="">-- Select Product --</option>
// //               {availableProducts.map((product) => (
// //                 <option
// //                   key={product.product_id || product.produce_id}
// //                   value={product.produce_name}
// //                 >
// //                   {product.produce_name} - ₹{product.price_per_kg}/kg
// //                 </option>
// //               ))}
// //             </select>
// //           </div>

// //           {/* Product details */}
// //           {selectedProduct && (
// //             <div className="product-details">
// //               <div className="detail-item">
// //                 <FontAwesomeIcon icon={faLeaf} />
// //                 <span>Type: {selectedProduct.produce_type}</span>
// //               </div>
// //               <div className="detail-item">
// //                 <FontAwesomeIcon icon={faWeightHanging} />
// //                 <span>Available: {selectedProduct.availability} kg</span>
// //               </div>
// //               <div className="detail-item">
// //                 <span>Minimum Quantity: {selectedProduct.minimum_quantity || 10} kg</span>
// //               </div>
// //             </div>
// //           )}

// //           {/* Quantity input */}
// //           <div className="form-group">
// //             <label>Quantity (kg):</label>
// //             <input
// //               type="number"
// //               value={selectedQuantity}
// //               onChange={(e) => setSelectedQuantity(e.target.value)}
// //               min={selectedProduct?.minimum_quantity || 10}
// //               max={selectedProduct?.availability || 100}
// //               className="quantity-input"
// //             />
// //           </div>

// //           {/* Price summary */}
// //           {selectedProduct && (
// //             <div className="price-summary">
// //               <div className="price-row">
// //                 <span>Unit Price:</span>
// //                 <span>₹{selectedProduct.price_per_kg}/kg</span>
// //               </div>
// //               <div className="price-row total">
// //                 <span>Total Price:</span>
// //                 <span>₹{(selectedProduct.price_per_kg * selectedQuantity).toFixed(2)}</span>
// //               </div>
// //             </div>
// //           )}
// //         </div>

// //         <div className="popup-actions">
// //           <button onClick={() => navigate(-1)} className="btn-secondary">
// //             Cancel
// //           </button>
// //           <button 
// //             onClick={handleConfirm} 
// //             disabled={!selectedProduct || isLoading}
// //             className="btn-primary"
// //           >
// //             {isLoading ? (
// //               <>
// //                 <FontAwesomeIcon icon={faSpinner} spin />
// //                 <span>Starting...</span>
// //               </>
// //             ) : (
// //               <>
// //                 <FontAwesomeIcon icon={faHandshake} />
// //                 <span>Start Bargaining</span>
// //               </>
// //             )}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default BargainPopup;
// // src/components/bargaining/BargainPopup.js
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faSpinner,
//   faTimes,
//   faHandshake,
//   faLeaf,
//   faWeightHanging,
//   faExclamationCircle
// } from '@fortawesome/free-solid-svg-icons';
// import './BargainPopup.css';

// const BargainPopup = () => {
//   const { farmerId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { farmer, products: farmerProducts } = location.state || {};
  
//   // Get token from localStorage
//   const consumerData = JSON.parse(localStorage.getItem("consumer") || "{}");
//   const token = consumerData.token;

//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [selectedQuantity, setSelectedQuantity] = useState(10);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [availableProducts, setAvailableProducts] = useState([]);

//   useEffect(() => {
//     if (farmerProducts && farmerProducts.length > 0) {
//       setAvailableProducts(farmerProducts);
//       if (farmerProducts.length === 1) {
//         setSelectedProduct(farmerProducts[0]);
//         setSelectedQuantity(farmerProducts[0]?.minimum_quantity || 10);
//       }
//     } else if (farmerId && token) {
//       // Fallback: fetch products if not passed in state
//       fetchFarmerProducts();
//     }
//   }, [farmerId, farmerProducts, token]);

//   const fetchFarmerProducts = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(
//         `http://localhost:5000/api/produces?farmer_id=${farmerId}&market_type=Bargaining Market`,
//         {
//           headers: {
//             "Authorization": `Bearer ${token}`,
//           },
//         }
//       );
      
//       if (response.ok) {
//         const products = await response.json();
//         setAvailableProducts(products);
//         if (products.length === 1) {
//           setSelectedProduct(products[0]);
//           setSelectedQuantity(products[0]?.minimum_quantity || 10);
//         }
//       } else {
//         throw new Error('Failed to fetch products');
//       }
//     } catch (error) {
//       console.error("Error fetching farmer products:", error);
//       setError("Failed to load products. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

// //   const handleConfirm = async () => {
// //     if (!selectedProduct) {
// //       setError("Please select a product first");
// //       return;
// //     }

// //     if (!token) {
// //       setError("Authentication error. Please log in again.");
// //       return;
// //     }

// //     try {
// //       setIsLoading(true);
// //       setError(null);

// //       // Validate quantity
// //       const quantityNum = parseFloat(selectedQuantity);
// //       if (isNaN(quantityNum) || quantityNum <= 0) {
// //         setError("Please enter a valid quantity");
// //         return;
// //       }

// //       if (quantityNum > selectedProduct.availability) {
// //         setError(`Only ${selectedProduct.availability}kg available`);
// //         return;
// //       }

// //       if (quantityNum < (selectedProduct.minimum_quantity || 10)) {
// //         setError(`Minimum quantity is ${selectedProduct.minimum_quantity || 10}kg`);
// //         return;
// //       }

// //       // 1. Create bargain session
// //       const bargainResponse = await fetch(
// //         `http://localhost:5000/api/create-bargain`,
// //         {
// //           method: "POST",
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             farmer_id: farmerId,
// //           }),
// //         }
// //       );

// //       if (!bargainResponse.ok) {
// //         const errorText = await bargainResponse.text();
// //         throw new Error(errorText || "Failed to create bargain session");
// //       }

// //       const bargainData = await bargainResponse.json();
// //       const newBargainId = bargainData.bargainId || bargainData.bargain_id;

// //       if (!newBargainId) {
// //         throw new Error("Invalid create-bargain response");
// //       }

// //       // 2. Add product to bargain
// //       const productResponse = await fetch(
// //         `http://localhost:5000/api/add-bargain-product`,
// //         {
// //           method: "POST",
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             bargain_id: newBargainId,
// //             product_id: selectedProduct.product_id || selectedProduct.produce_id,
// //             quantity: quantityNum,
// //           }),
// //         }
// //       );

// //       if (!productResponse.ok) {
// //         const errorText = await productResponse.text();
// //         throw new Error(errorText || "Product addition failed");
// //       }

// //       const productData = await productResponse.json();

// //       if (!productData.success) {
// //         throw new Error(productData.error || "Failed to add product to bargain");
// //       }

// //       // 3. Save SYSTEM MESSAGE
// //       const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${quantityNum}kg) at ₹${selectedProduct.price_per_kg}/kg`;
// //       const messageResponse = await fetch(
// //         `http://localhost:5000/api/bargain/${newBargainId}/system-message`,
// //         {
// //           method: "POST",
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             message_content: systemMessageContent,
// //             message_type: "system",
// //           }),
// //         }
// //       );

// //       if (!messageResponse.ok) {
// //         console.warn("Failed to save system message, but continuing...");
// //       }

// //       // 4. Navigate to chat UI
// //       navigate(`/bargain/${newBargainId}`, {
// //         state: {
// //           product: {
// //             ...selectedProduct,
// //             price_per_kg: productData.price_per_kg || selectedProduct.price_per_kg,
// //             quantity: productData.quantity || quantityNum,
// //           },
// //           farmer,
// //           currentPrice: productData.price_per_kg || selectedProduct.price_per_kg,
// //           bargainId: newBargainId,
// //           originalPrice: productData.price_per_kg || selectedProduct.price_per_kg,
// //         },
// //         replace: true
// //       });
// //     } catch (err) {
// //       console.error("Bargain initiation error:", err);
// //       try {
// //         const errorData = JSON.parse(err.message);
// //         setError(errorData.error || err.message || "Failed to start bargaining");
// //       } catch {
// //         setError(err.message || "Failed to start bargaining");
// //       }
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// // const handleConfirm = async (
// //   selectedProduct,
// //   selectedQuantity,
// //   selectedFarmer,
// //   token,
// //   generatePriceSuggestions,
// //   setPriceSuggestions,
// //   setShowPriceSuggestions,
// //   setIsBargainPopupOpen,
// //   navigate
// // ) => {
// //   if (!selectedProduct) {
// //     setError("Please select a product first");
// //     return;
// //   }

// //   try {
// //     setIsLoading(true);
// //     setError(null);

// //     // Validate quantity
// //     const quantityNum = parseFloat(selectedQuantity) || 0;
// //     const minQuantity = selectedProduct.minimum_quantity ;
    
// //     if (quantityNum < minQuantity) {
// //       setError(`Minimum quantity is ${minQuantity}kg`);
// //       setIsLoading(false);
// //       return;
// //     }
    
// //     if (quantityNum > selectedProduct.availability) {
// //       setError(`Only ${selectedProduct.availability}kg available`);
// //       setIsLoading(false);
// //       return;
// //     }

// //     // 1. Create bargain session
// //     const bargainResponse = await fetch(
// //       `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/create-bargain`,
// //       {
// //         method: 'POST',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify({
// //           farmer_id: selectedFarmer.farmer_id
// //         })
// //       }
// //     );

// //     if (!bargainResponse.ok) {
// //       const errorData = await bargainResponse.json().catch(() => ({}));
// //       throw new Error(errorData.error || 'Failed to create bargain session');
// //     }

// //     const bargainData = await bargainResponse.json();

// //     // 2. Add product to bargain
// //     const productResponse = await fetch(
// //       `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/add-bargain-product`,
// //       {
// //         method: 'POST',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify({
// //           bargain_id: bargainData.bargainId,
// //           product_id: selectedProduct.product_id,
// //           quantity: quantityNum
// //         })
// //       }
// //     );

// //     if (!productResponse.ok) {
// //       const errorData = await productResponse.json().catch(() => ({}));
// //       throw new Error(errorData.error || 'Product addition failed');
// //     }

// //     const productData = await productResponse.json();

// //     // 3. Save SYSTEM MESSAGE to database
// //     const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${quantityNum}kg) at ₹${selectedProduct.price_per_kg}/kg`;
// //     const systemMessageResponse = await fetch(
// //       `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/bargain/${bargainData.bargainId}/system-message`,
// //       {
// //         method: 'POST',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify({
// //           message_content: systemMessageContent,
// //           message_type: 'system'
// //         })
// //       }
// //     );

// //     if (!systemMessageResponse.ok) {
// //       console.warn('Failed to save system message, continuing anyway');
// //     }

// //     // 4. Generate and show price suggestions
// //     const suggestions = generatePriceSuggestions(selectedProduct.price_per_kg);
// //     setPriceSuggestions(suggestions);
// //     setShowPriceSuggestions(true);

// //     // 5. Close popup and navigate
// //     setIsBargainPopupOpen(false);
// //     navigate(`/bargain/${bargainData.bargainId}`, {
// //       state: {
// //         product: {
// //           ...selectedProduct,
// //           price_per_kg: productData.price_per_kg,
// //           quantity: productData.quantity
// //         },
// //         farmer: selectedFarmer,
// //         currentPrice: productData.price_per_kg,
// //         bargainId: bargainData.bargainId,
// //         originalPrice: productData.price_per_kg
// //       }
// //     });

// //   } catch (err) {
// //     console.error('Bargain initiation error:', err);
// //     setError(err.message || "Failed to start bargaining");
// //   } finally {
// //     setIsLoading(false);
// //   }
// // };
// const handleBargainConfirm = async () => {
//   if (!selectedProduct) {
//     setError("Please select a product first");
//     return;
//   }

//   try {
//     setIsLoading(true);
//     setError(null);

//     // Validate quantity - USE THE ACTUAL MINIMUM QUANTITY FROM PRODUCT DATA
//     const quantityNum = parseFloat(selectedQuantity) || 0;
//     const minQuantity = selectedProduct.minimum_quantity;
    
//     if (quantityNum < minQuantity) {
//       setError(`Minimum quantity is ${minQuantity}kg`);
//       setIsLoading(false);
//       return;
//     }
    
//     if (quantityNum > selectedProduct.availability) {
//       setError(`Only ${selectedProduct.availability}kg available`);
//       setIsLoading(false);
//       return;
//     }

//     // 1. Create bargain session
//     const bargainResponse = await fetch(
//       `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/create-bargain`,
//       {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           farmer_id: selectedFarmer.farmer_id
//         })
//       }
//     );

//     if (!bargainResponse.ok) {
//       const errorData = await bargainResponse.json().catch(() => ({}));
//       throw new Error(errorData.error || 'Failed to create bargain session');
//     }

//     const bargainData = await bargainResponse.json();

//     // 2. Add product to bargain
//     const productResponse = await fetch(
//       `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/add-bargain-product`,
//       {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           bargain_id: bargainData.bargainId,
//           product_id: selectedProduct.product_id,
//           quantity: quantityNum
//         })
//       }
//     );

//     if (!productResponse.ok) {
//       const errorData = await productResponse.json().catch(() => ({}));
//       throw new Error(errorData.error || 'Product addition failed');
//     }

//     const productData = await productResponse.json();

//     // 3. Save SYSTEM MESSAGE to database
//     const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${quantityNum}kg) at ₹${selectedProduct.price_per_kg}/kg`;
//     const systemMessageResponse = await fetch(
//       `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/bargain/${bargainData.bargainId}/system-message`,
//       {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           message_content: systemMessageContent,
//           message_type: 'system'
//         })
//       }
//     );

//     if (!systemMessageResponse.ok) {
//       console.warn('Failed to save system message, continuing anyway');
//     }

//     // 4. Generate and show price suggestions
//     const suggestions = generatePriceSuggestions(selectedProduct.price_per_kg);
//     setPriceSuggestions(suggestions);
//     setShowPriceSuggestions(true);

//     // 5. Close popup and navigate
//     setIsBargainPopupOpen(false);
//     navigate(`/bargain/${bargainData.bargainId}`, {
//       state: {
//         product: {
//           ...selectedProduct,
//           price_per_kg: productData.price_per_kg,
//           quantity: productData.quantity
//         },
//         farmer: selectedFarmer,
//         currentPrice: productData.price_per_kg,
//         bargainId: bargainData.bargainId,
//         originalPrice: productData.price_per_kg
//       }
//     });

//   } catch (err) {
//     console.error('Bargain initiation error:', err);
//     setError(err.message || "Failed to start bargaining");
//   } finally {
//     setIsLoading(false);
//   }
// };

//   return (
//     <div className="bargain-popup-overlay">
//       <div className="bargain-popup-container">
//         <div className="popup-header">
//           <div className="popup-title">
//             <FontAwesomeIcon icon={faHandshake} />
//             <h2>Initiate Bargain with {farmer?.farmer_name || "Farmer"}</h2>
//           </div>
//           <button 
//             onClick={() => navigate(-1)} 
//             className="popup-close-btn"
//           >
//             <FontAwesomeIcon icon={faTimes} />
//           </button>
//         </div>

//         <div className="popup-content">
//           {error && (
//             <div className="error-message">
//               <FontAwesomeIcon icon={faExclamationCircle} />
//               <span>{error}</span>
//             </div>
//           )}

//           {/* Product selection */}
//           <div className="form-group">
//             <label>Select Product:</label>
//             <select
//               value={selectedProduct ? selectedProduct.produce_name : ""}
//               onChange={(e) => {
//                 const product = availableProducts.find(
//                   p => p.produce_name === e.target.value
//                 );
//                 setSelectedProduct(product || null);
//                 if (product) {
//                   setSelectedQuantity(product.minimum_quantity || 10);
//                 }
//               }}
//               className="product-select"
//               disabled={isLoading}
//             >
//               <option value="">-- Select Product --</option>
//               {availableProducts.map((product, index) => (
//                 <option
//                   key={product.product_id || product.produce_id || index}
//                   value={product.produce_name}
//                 >
//                   {product.produce_name} - ₹{product.price_per_kg}/kg
//                   {product.availability > 0 ? ` (${product.availability}kg available)` : ' (Out of stock)'}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Product details */}
//           {selectedProduct && (
//             <div className="product-details">
//               <div className="detail-item">
//                 <FontAwesomeIcon icon={faLeaf} />
//                 <span>Type: {selectedProduct.produce_type}</span>
//               </div>
//               <div className="detail-item">
//                 <FontAwesomeIcon icon={faWeightHanging} />
//                 <span>Available: {selectedProduct.availability} kg</span>
//               </div>
//               <div className="detail-item">
//                 <span>Minimum Quantity: {selectedProduct.minimum_quantity } kg</span>
//               </div>
//               <div className="detail-item">
//                 <span>Price: ₹{selectedProduct.price_per_kg}/kg</span>
//               </div>
//             </div>
//           )}

//           {/* Quantity input */}
//           {selectedProduct && (
//             <div className="form-group">
//               <label>Quantity (kg):</label>
//               <input
//                 type="number"
//                 value={selectedQuantity}
//                 onChange={(e) => setSelectedQuantity(e.target.value)}
//                 min={selectedProduct.minimum_quantity || 10}
//                 max={selectedProduct.availability}
//                 className="quantity-input"
//                 disabled={isLoading}
//               />
//               <div className="quantity-hint">
//                 Min: {selectedProduct.minimum_quantity || 10}kg, Max: {selectedProduct.availability}kg
//               </div>
//             </div>
//           )}

//           {/* Price summary */}
//           {selectedProduct && (
//             <div className="price-summary">
//               <div className="price-row">
//                 <span>Unit Price:</span>
//                 <span>₹{selectedProduct.price_per_kg}/kg</span>
//               </div>
//               <div className="price-row total">
//                 <span>Total Price:</span>
//                 <span>₹{(selectedProduct.price_per_kg * selectedQuantity).toFixed(2)}</span>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="popup-actions">
//           <button 
//             onClick={() => navigate(-1)} 
//             className="btn-secondary"
//             disabled={isLoading}
//           >
//             Cancel
//           </button>
//           <button 
//             onClick={handleConfirm} 
//             disabled={!selectedProduct || isLoading || !selectedProduct.availability}
//             className="btn-primary"
//           >
//             {isLoading ? (
//               <>
//                 <FontAwesomeIcon icon={faSpinner} spin />
//                 <span>Starting...</span>
//               </>
//             ) : (
//               <>
//                 <FontAwesomeIcon icon={faHandshake} />
//                 <span>Start Bargaining</span>
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BargainPopup;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faTimes,
  faHandshake,
  faLeaf,
  faWeightHanging,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import './BargainPopup.css';

const BargainPopup = () => {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { farmer, products: farmerProducts } = location.state || {};
  
  // Get token from localStorage
  const consumerData = JSON.parse(localStorage.getItem("consumer") || "{}");
  const token = consumerData.token;

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    if (farmerProducts && farmerProducts.length > 0) {
      setAvailableProducts(farmerProducts);
      if (farmerProducts.length === 1) {
        setSelectedProduct(farmerProducts[0]);
        setSelectedQuantity(farmerProducts[0]?.minimum_quantity || 10);
      }
    } else if (farmerId && token) {
      // Fallback: fetch products if not passed in state
      fetchFarmerProducts();
    }
  }, [farmerId, farmerProducts, token]);

  const fetchFarmerProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/produces?farmer_id=${farmerId}&market_type=Bargaining Market`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const products = await response.json();
        setAvailableProducts(products);
        if (products.length === 1) {
          setSelectedProduct(products[0]);
          setSelectedQuantity(products[0]?.minimum_quantity || 10);
        }
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error("Error fetching farmer products:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedProduct) {
      setError("Please select a product first");
      return;
    }

    if (!token) {
      setError("Authentication error. Please log in again.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validate quantity
      const quantityNum = parseFloat(selectedQuantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        setError("Please enter a valid quantity");
        return;
      }

      if (quantityNum > selectedProduct.availability) {
        setError(`Only ${selectedProduct.availability}kg available`);
        return;
      }

      if (quantityNum < selectedProduct.minimum_quantity) {
        setError(`Minimum quantity is ${selectedProduct.minimum_quantity}kg`);
        return;
      }

      // 1. Create bargain session
      const bargainResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/create-bargain`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            farmer_id: farmerId,
          }),
        }
      );

      if (!bargainResponse.ok) {
        const errorText = await bargainResponse.text();
        throw new Error(errorText || "Failed to create bargain session");
      }

      const bargainData = await bargainResponse.json();
      const newBargainId = bargainData.bargainId || bargainData.bargain_id;

      if (!newBargainId) {
        throw new Error("Invalid create-bargain response");
      }

      // 2. Add product to bargain
      const productResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/add-bargain-product`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bargain_id: newBargainId,
            product_id: selectedProduct.product_id || selectedProduct.produce_id,
            quantity: quantityNum,
          }),
        }
      );

      if (!productResponse.ok) {
        const errorText = await productResponse.text();
        throw new Error(errorText || "Product addition failed");
      }

      const productData = await productResponse.json();

      if (!productData.success) {
        throw new Error(productData.error || "Failed to add product to bargain");
      }

      // 3. Save SYSTEM MESSAGE
      const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${quantityNum}kg) at ₹${selectedProduct.price_per_kg}/kg`;
      const messageResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/bargain/${newBargainId}/system-message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message_content: systemMessageContent,
            message_type: "system",
          }),
        }
      );

      if (!messageResponse.ok) {
        console.warn("Failed to save system message, but continuing...");
      }

      // 4. Navigate to chat UI
      navigate(`/bargain/${newBargainId}`, {
        state: {
          product: {
            ...selectedProduct,
            price_per_kg: productData.price_per_kg || selectedProduct.price_per_kg,
            quantity: productData.quantity || quantityNum,
          },
          farmer,
          currentPrice: productData.price_per_kg || selectedProduct.price_per_kg,
          bargainId: newBargainId,
          originalPrice: productData.price_per_kg || selectedProduct.price_per_kg,
        },
        replace: true
      });
    } catch (err) {
      console.error("Bargain initiation error:", err);
      try {
        const errorData = JSON.parse(err.message);
        setError(errorData.error || err.message || "Failed to start bargaining");
      } catch {
        setError(err.message || "Failed to start bargaining");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bargain-popup-overlay">
      <div className="bargain-popup-container">
        <div className="popup-header">
          <div className="popup-title">
            <FontAwesomeIcon icon={faHandshake} />
            <h2>Initiate Bargain with {farmer?.farmer_name || "Farmer"}</h2>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="popup-close-btn"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="popup-content">
          {error && (
            <div className="error-message">
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>{error}</span>
            </div>
          )}

          {/* Product selection */}
          <div className="form-group">
            <label>Select Product:</label>
            <select
              value={selectedProduct ? selectedProduct.produce_name : ""}
              onChange={(e) => {
                const product = availableProducts.find(
                  p => p.produce_name === e.target.value
                );
                setSelectedProduct(product || null);
                if (product) {
                  setSelectedQuantity(product.minimum_quantity);
                }
              }}
              className="product-select"
              disabled={isLoading}
            >
              <option value="">-- Select Product --</option>
              {availableProducts.map((product, index) => (
                <option
                  key={product.product_id || product.produce_id || index}
                  value={product.produce_name}
                >
                  {product.produce_name} - ₹{product.price_per_kg}/kg
                  {product.availability > 0 ? ` (${product.availability}kg available)` : ' (Out of stock)'}
                </option>
              ))}
            </select>
          </div>

          {/* Product details */}
          {selectedProduct && (
            <div className="product-details">
              <div className="detail-item">
                <FontAwesomeIcon icon={faLeaf} />
                <span>Type: {selectedProduct.produce_type}</span>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faWeightHanging} />
                <span>Available: {selectedProduct.availability} kg</span>
              </div>
              <div className="detail-item">
                <span>Minimum Quantity: {selectedProduct.minimum_quantity} kg</span>
              </div>
              <div className="detail-item">
                <span>Price: ₹{selectedProduct.price_per_kg}/kg</span>
              </div>
            </div>
          )}

          {/* Quantity input */}
          {selectedProduct && (
            <div className="form-group">
              <label>Quantity (kg):</label>
              <input
                type="number"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                min={selectedProduct.minimum_quantity}
                max={selectedProduct.availability}
                className="quantity-input"
                disabled={isLoading}
              />
              <div className="quantity-hint">
                Min: {selectedProduct.minimum_quantity}kg, Max: {selectedProduct.availability}kg
              </div>
            </div>
          )}

          {/* Price summary */}
          {selectedProduct && (
            <div className="price-summary">
              <div className="price-row">
                <span>Unit Price:</span>
                <span>₹{selectedProduct.price_per_kg}/kg</span>
              </div>
              <div className="price-row total">
                <span>Total Price:</span>
                <span>₹{(selectedProduct.price_per_kg * selectedQuantity).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="popup-actions">
          <button 
            onClick={() => navigate(-1)} 
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={!selectedProduct || isLoading || !selectedProduct.availability}
            className="btn-primary"
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Starting...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faHandshake} />
                <span>Start Bargaining</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BargainPopup;