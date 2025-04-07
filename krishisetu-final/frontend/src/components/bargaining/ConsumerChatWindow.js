// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { useAuth } from "../../context/AuthContext";
// import { io } from 'socket.io-client';
// import {
//   faSpinner,
//   faRupeeSign,
//   faArrowUp,
//   faArrowDown,
//   faTimes,
//   faHandshake
// } from '@fortawesome/free-solid-svg-icons';
// import './ConsumerChatWindow.css';

// const BargainChatWindow = () => {
//   const navigate = useNavigate();
//   const { bargainId } = useParams();
//   const { token } = useAuth();
//   const location = useLocation();
//   const socket = useRef(null);
//   const messagesEndRef = useRef(null);
//   const reconnectAttempts = useRef(0);

//   // Extract initial state from location
//   const { 
//     product: initialProduct, 
//     farmer: initialFarmer, 
//     quantity: initialQuantity 
//   } = location.state || {};

//   // State management
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPrice, setCurrentPrice] = useState(0);
//   const [connectionStatus, setConnectionStatus] = useState("connecting");
//   const [bargainStatus, setBargainStatus] = useState('pending');
//   const [waitingForResponse, setWaitingForResponse] = useState(false);
//   const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);

//   // const [selectedProduct, setSelectedProduct] = useState(null);
//   const [selectedFarmer] = useState(initialFarmer || null);
//   const [quantity, setQuantity] = useState(1);
//   const [isLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [, setInitialPrice] = useState(0);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [selectedQuantity, setSelectedQuantity] = useState('');
//   const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
//   const [priceSuggestions, setPriceSuggestions] = useState([]);

// // const [selectedQuantity, setSelectedQuantity] = useState('');
// // const [, setShowPopup] = useState(false);

// const closePopup = () => {
//   setIsBargainPopupOpen(false);
//   setSelectedProduct(null);
//   setSelectedQuantity('');
// };

// // const openPopup = () => {
// //   setShowPopup(true);
// // };
//  // Generate price suggestions based on current price
//  const generatePriceSuggestions = useCallback((basePrice) => {
//   return [
//     { amount: -3, price: basePrice - 3 },
//     { amount: -2, price: basePrice - 2 },
//     { amount: -1, price: basePrice - 1 },
//     { amount: 1, price: basePrice + 1 },
//     { amount: 2, price: basePrice + 2 }
//   ].filter(suggestion => suggestion.price > 0); // Filter out negative prices
// }, []);

//   // WebSocket connection management
//   const initializeSocketConnection = useCallback(() => {
//     if (!bargainId || !token) {
//       console.error("Missing bargainId or token for WebSocket connection");
//       return;
//     }
  
//     // Close existing connection if any
//     if (socket.current) {
//       socket.current.disconnect();
//       socket.current = null;
//     }
  
//     socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
//       auth: {
//         token: token
//       },
//       query: { bargainId },
//       transports: ['websocket'],
//       withCredentials: true,
//       extraHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });
    
//     // Connection events
//     socket.current.on('connect', () => {
//       console.log("Socket connected");
//       setConnectionStatus("connected");
//       reconnectAttempts.current = 0;
//     });
  
//     socket.current.on('connect_error', (err) => {
//       console.error("Connection error:", err.message);
//       setConnectionStatus("error");
      
//       const maxAttempts = 5;
//       if (reconnectAttempts.current < maxAttempts) {
//         const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
//         reconnectAttempts.current += 1;
//         setTimeout(() => initializeSocketConnection(), delay);
//       }
//     });
  
//     socket.current.on('disconnect', (reason) => {
//       console.log("Socket disconnected:", reason);
//       setConnectionStatus("disconnected");
//     });
  
//     // Application events
//     socket.current.on('priceUpdate', (data) => {
//       setCurrentPrice(data.newPrice);
//       setMessages(prev => [...prev, {
//         content: `Farmer updated price to ₹${data.newPrice}/kg`,
//         sender_type: "system",
//         timestamp: new Date().toISOString()
//       }]);
//       setWaitingForResponse(false);
//     });
  
//     socket.current.on('bargainStatusUpdate', (status) => {
//       setBargainStatus(status);
//       if (status === 'accepted') {
//         setMessages(prev => [...prev, {
//           content: "🎉 Farmer accepted your offer!",
//           sender_type: "system",
//           timestamp: new Date().toISOString()
//         }]);
//       }
//       setWaitingForResponse(false);
//     });
  
//     socket.current.on('newMessage', (message) => {
//       setMessages(prev => [...prev, message]);
//       if (message.sender_type === 'farmer') {
//         setWaitingForResponse(false);
//       }
//     });
  
//     socket.current.on('error', (error) => {
//       console.error("Socket error:", error);
//       setError(error.message);
//     });
  
//     return () => {
//       if (socket.current) {
//         socket.current.disconnect();
//       }
//     };
//   }, [bargainId, token]);

//   // Helper function to add system messages
//   const addSystemMessage = (content) => {
//     setMessages(prev => [
//       ...prev,
//       {
//         content,
//         sender_type: "system",
//         timestamp: new Date().toISOString()
//       }
//     ]);
//   };

//   // Initialize socket connection on mount
//   useEffect(() => {
//     initializeSocketConnection();
//     return () => {
//       if (socket.current) {
//         socket.current.disconnect();
//       }
//     };
//   }, [initializeSocketConnection]);

//   // Fetch bargain data
//   useEffect(() => {
//     const fetchBargainData = async () => {
//       try {
//         if (!bargainId || !token) {
//           throw new Error("Missing bargain ID or authentication token");
//         }
  
//         console.log("🔐 Fetching bargain data for ID:", bargainId);
  
//         const response = await fetch(
//           `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
//           {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${token}`,
//             },
//           }
//         );
  
//         const contentType = response.headers.get('content-type');
//         const rawText = await response.text();
  
//         if (!response.ok) {
//           console.error("❌ Server error:", {
//             status: response.status,
//             statusText: response.statusText,
//             body: rawText
//           });
//           throw new Error(`Server error: ${response.status} - ${rawText || 'No error details'}`);
//         }
  
      
//         if (!contentType || !contentType.includes('application/json')) {
//           throw new Error(`Expected JSON but got ${contentType}. Response: ${rawText}`);
//         }
  
//         let data;
//         try {
//           data = JSON.parse(rawText);
//         } catch (parseError) {
//           console.error("❌ JSON parse error:", parseError);
//           throw new Error("Failed to parse JSON from server");
//         }
  
//         console.log("✅ Bargain data received:", data);
  
//         if (!data.success) {
//           throw new Error(data.error || "Failed to fetch bargain data");
//         }
  
//         if (!data) {
//           throw new Error("No data received from server");
//         }
        
//         setMessages([]); // or fetch messages separately if needed
        
//         // Access first product from the array
//         const product = data.products?.[0];
        
//         if (!product) {
//           console.warn("⚠️ No products found in this bargain session yet.");
//           // Maybe show a UI message: "No products added yet"
//           return;
//         }
        
//         setCurrentPrice(product?.current_offer || product?.original_price || 0);
//         setInitialPrice(product?.original_price || 0);
//         setBargainStatus(data.status || 'pending');
        
//       } catch (error) {
//         console.error("❌ Error in fetchBargainData:", {
//           message: error.message,
//           stack: error.stack
//         });
//         setError(error.message || "Failed to load bargain data");
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchBargainData();
//   }, [bargainId, token, initialProduct]);

  
//   // Auto-scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Handle bargain initiation
//   // const handleBargainConfirm = async () => {
//   //   setError(null);
//   //   setWaitingForResponse(false);

//   //   try {
//   //     if (!selectedProduct || !selectedFarmer || quantity <= 0) {
//   //       throw new Error("Please select a product and valid quantity");
//   //     }

//   //     if (!token) {
//   //       navigate('/login', { state: { from: location.pathname } });
//   //       return;
//   //     }

//   //     // First show the message immediately
//   //     addSystemMessage(`You sent a bargain request for ${quantity}kg of ${selectedProduct.produce_name}`);
//   //     setIsBargainPopupOpen(false);

//   //     // Then initiate the bargain (show loader only if it takes time)
//   //     if (socket.current && socket.current.connected) {
//   //       setIsLoading(true);
//   //       socket.current.emit('initBargain', {
//   //         product: selectedProduct,
//   //         quantity,
//   //         initialPrice: selectedProduct.price_per_kg,
//   //         farmer: selectedFarmer,
//   //         consumerName: consumer?.name || 'Consumer'
//   //       });
//   //     }
//   //   } catch (error) {
//   //     setError(error.message);
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   const handleProductSelect = (product) => {
//     setSelectedProduct(product);
//     setSelectedQuantity(10); // reset quantity to default for new product
//   };
  
//   const handleBargainConfirm = async () => {
//     if (!selectedProduct) {
//       setError("Please select a product");
//       return;
//     }
  
//     if (parseFloat(selectedQuantity) < 10) {
//       alert("⚠️ Minimum quantity should be 10kg");
//       return;
//     }
  
//     try {
//       const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/add-bargain-product`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           bargain_id: bargainId,
//           product_id: selectedProduct.product_id,
//           quantity: parseFloat(selectedQuantity), // Fixed: using selectedQuantity instead of quantity
//         }),
//       });
  
//       const data = await response.json();
  
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to add product');
//       }
  
//       console.log("✅ Product added to bargain successfully.");
  
//       // Construct system message
//       const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${parseFloat(selectedQuantity)}kg) for bargaining.`;
      
//       // Add system message to local state
//       addSystemMessage(systemMessageContent);
  
//       // Generate and show price suggestions
//       const suggestions = generatePriceSuggestions(selectedProduct.price_per_kg);
//       setPriceSuggestions(suggestions);
//       setShowPriceSuggestions(true);

//       // Emit system message to farmer via socket
//       if (socket.current && socket.current.connected) {
//         socket.current.emit("bargainMessage", {
//           bargain_id: bargainId,
//           message: {
//             content: systemMessageContent,
//             sender_type: "system",
//             timestamp: new Date().toISOString()
//           },
//           recipientType: "farmer",
//           recipientId: selectedProduct.farmer_id,
//         });
  
//         // Also emit product selection event
//         socket.current.emit('productSelected', {
//           bargainId,
//           product: selectedProduct,
//           quantity: parseFloat(selectedQuantity),
//           price: selectedProduct.price_per_kg
//         });
//       }
  
//       // Update local state
//       setQuantity(parseFloat(selectedQuantity));
//       setCurrentPrice(selectedProduct.price_per_kg);
      
//       // Close popup
//       setIsBargainPopupOpen(false);
  
//     } catch (err) {
//       console.error("❌ Error adding product:", err);
//       setError(err.message);
//     }
//   };
  
//   // Handle price offer
//   const handleMakeOffer = (price) => {
//     if (socket.current && socket.current.connected) {
//       // First show the message immediately
//       addSystemMessage(`You offered ₹${price}/kg for ${quantity}kg`);
//       setCurrentPrice(price);
      
//       // Then send the offer (show loader only if waiting for response)
//       setWaitingForResponse(true);
//       socket.current.emit('priceOffer', {
//         price,
//         productId: selectedProduct?.product_id,
//         quantity
//       });
//     }
//   };


// if (loading) {
//   return (
//     <div className="loading-container">
//       <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//       <p>Loading bargain session...</p>
//     </div>
//   );
// }
  
// // if (error) {
// //     return (
// //       <div className="error-container">
// //         <h3>Error Loading Bargain</h3>
// //         <p>{error}</p>
// //         <button onClick={() => window.location.reload()}>Retry</button>
// //       </div>
// //     );
// //   }
// // Render loading state

// return (
//   <div className="bargain-chat-container">
//     {/* Bargain Initiation Popup */}
//     {isBargainPopupOpen && selectedFarmer && (
//       <div className="bargain-initiation-popup">
//         <div className="popup-content">
//           <button onClick={() => navigate(-1)} className="close-btn">
//             <FontAwesomeIcon icon={faTimes} />
//           </button>
//           <h3>Initiate Bargain with {selectedFarmer.farmer_name}</h3>
          
//           <div className="form-group">
//             <label>Select Product</label>
//             <select
//               value={selectedProduct?.produce_name || ''}
//               onChange={(e) => {
//                 const product = selectedFarmer.products.find(
//                   p => p.produce_name === e.target.value
//                 );
//                 setSelectedProduct(product || null);
//                 if (product) {
//                   setCurrentPrice(product.price_per_kg);
//                   setQuantity(1); // Reset quantity when product changes
//                 }
//               }}
//             >
//               <option value="">-- Select a product --</option>
//               {selectedFarmer.products?.map(product => (
//                 <option key={product.product_id} value={product.produce_name}>
//                   {product.produce_name} (₹{product.price_per_kg}/kg)
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           {selectedProduct && (
//             <>
//               <div className="product-details">
//                 <p><strong>Category:</strong> {selectedProduct.produce_type}</p>
//                 <p><strong>Availability:</strong> {selectedProduct.availability} kg</p>
//               </div>
              
//               <div className="form-group">
//                 <label>Quantity (kg)</label>
//                 <input
//                   type="number"
//                   min={10}
//                   value={selectedQuantity}
//                   onChange={(e) => setSelectedQuantity(e.target.value)}
//                   placeholder="Enter quantity in kg"
//                 />

//                 <small>Min: {10} kg</small>
//                 <small>Max: {selectedProduct.availability} kg</small>
//               </div>
              
//               <div className="current-price-display">
//                 <p>Product Price: ₹{selectedProduct.price_per_kg}/kg</p>
//                 <p>Total for {quantity}kg: ₹{(selectedProduct.price_per_kg * quantity).toFixed(2)}</p>
//               </div>
//             </>
//           )}
          
//           {error && <div className="error-message">{error}</div>}
          
//           <button
//             onClick={handleBargainConfirm}
//             disabled={!selectedProduct || isLoading}
//             className="confirm-btn"
//           >
//             {isLoading ? (
//               <FontAwesomeIcon icon={faSpinner} spin />
//             ) : (
//               <FontAwesomeIcon icon={faHandshake} />
//             )}
//             Start Bargaining
//           </button>
//         </div>
//       </div>
//     )}

//     {/* Chat Header - Only show if product is selected */}
//     {selectedProduct && !isBargainPopupOpen && (
//       <div className="chat-header">
//         <div className="header-top">
//           <h2>
//             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
//           </h2>
//           <span className={`connection-status ${connectionStatus}`}>
//             {connectionStatus.toUpperCase()}
//           </span>
//         </div>
        
//         <div className="product-info">
//           <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
//           <p><strong>Category:</strong> {selectedProduct.produce_type}</p>
//           <p><strong>Quantity:</strong> {quantity}kg</p>
//           <p className="current-price">
//             <strong>Current Price:</strong> ₹{currentPrice}/kg
//           </p>
//           <p className="base-price">
//             <strong>Base Price:</strong> ₹{selectedProduct.price_per_kg}/kg
//           </p>
//           <p className="total-price">
//             <strong>Total:</strong> ₹{(quantity * currentPrice).toFixed(2)}
//           </p>
//           {bargainStatus === 'accepted' && (
//             <p className="status-accepted">Offer Accepted!</p>
//           )}
//           {bargainStatus === 'rejected' && (
//             <p className="status-rejected">Offer Declined</p>
//           )}
//         </div>
//       </div>
//     )}

//     {/* Chat Messages - Only show if product is selected */}
//     {selectedProduct && !isBargainPopupOpen && (
//       <>
//         <div className="chat-messages">
//           {messages.length === 0 ? (
//             <div className="no-messages">
//               <p>No messages yet. Start the negotiation!</p>
//             </div>
//           ) : (
//             messages.map((msg, index) => (
//               <div key={`msg-${index}`} className={`message ${msg.sender_type}`}>
//                 <div className="message-content">
//                   {msg.content}
//                 </div>

//                 <div className="message-meta">
//                   <span className="sender">
//                     {msg.sender_type === 'consumer' ? 'You' : 
//                      msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
//                   </span>
//                   <span className="timestamp">
//                     {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </span>
//                 </div>
//               </div>
//             ))
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Chat Controls - Only show if product is selected */}
//         <div className="chat-controls">
//           {bargainStatus === 'pending' && 
//            messages.length > 0 && 
//            messages.some(m => m.sender_type === 'consumer') && (
//             <div className="price-suggestions">
//               <h4>Make an Offer (Current: ₹{currentPrice}/kg):</h4>
//               <div className="suggestion-buttons">
//                 {[1, 2, 3, 5].map(amount => (
//                   <button 
//                     key={`decrease-${amount}`} 
//                     onClick={() => handleMakeOffer(currentPrice - amount)}
//                     disabled={currentPrice - amount <= 0 || waitingForResponse}
//                   >
//                     <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - amount}
//                   </button>
//                 ))}
//                 {[1, 2, 3].map(amount => (
//                   <button 
//                     key={`increase-${amount}`} 
//                     onClick={() => handleMakeOffer(currentPrice + amount)}
//                     disabled={waitingForResponse}
//                   >
//                     <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + amount}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {waitingForResponse && (
//             <div className="waiting-indicator">
//               <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's response...
//             </div>
//           )}

//           {bargainStatus === 'accepted' && (
//             <div className="accepted-actions">
//               <button className="primary-action" onClick={() => navigate('/checkout')}>
//                 Proceed to Checkout
//               </button>
//               <button className="secondary-action" onClick={() => navigate('/')}>
//                 Continue Shopping
//               </button>
//             </div>
//           )}
//         </div>
//       </>
//     )}
//   </div>
// );
// };

// export default BargainChatWindow;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from "../../context/AuthContext";
import { io } from 'socket.io-client';
import {
  faSpinner,
  faRupeeSign,
  faArrowUp,
  faArrowDown,
  faTimes,
  faHandshake,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import './ConsumerChatWindow.css';

const BargainChatWindow = () => {
  const navigate = useNavigate();
  const { bargainId } = useParams();
  const { token, consumer } = useAuth();
  const location = useLocation();
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttempts = useRef(0);

  // Extract initial state from location
  const { 
    product: initialProduct, 
    farmer: initialFarmer, 
    quantity: initialQuantity 
  } = location.state || {};

  // State management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [bargainStatus, setBargainStatus] = useState('pending');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true);
  const [selectedFarmer] = useState(initialFarmer || null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [, setInitialPrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
  const [priceSuggestions, setPriceSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const closePopup = () => {
    setIsBargainPopupOpen(false);
    setSelectedProduct(null);
    setSelectedQuantity('');
  };

  // Generate price suggestions based on current price
  const generatePriceSuggestions = useCallback((basePrice) => {
    return [
      { amount: -3, price: basePrice - 3, label: "Good Deal" },
      { amount: -2, price: basePrice - 2, label: "Fair Offer" },
      { amount: -1, price: basePrice - 1, label: "Small Discount" },
      { amount: 1, price: basePrice + 1, label: "Small Increase" },
      { amount: 2, price: basePrice + 2, label: "Fair Increase" }
    ].filter(suggestion => suggestion.price > 0);
  }, []);

  // WebSocket connection management
  const initializeSocketConnection = useCallback(() => {
    if (!bargainId || !token) {
      console.error("Missing bargainId or token for WebSocket connection");
      return;
    }
  
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
  
    socket.current = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000", {
      auth: {
        token: token
      },
      query: { bargainId },
      transports: ['websocket'],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      extraHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Connection events
    socket.current.on('connect', () => {
      console.log("Socket connected");
      setConnectionStatus("connected");
      reconnectAttempts.current = 0;
    });
  
    socket.current.on('connect_error', (err) => {
      console.error("Connection error:", err.message);
      setConnectionStatus("error");
      
      const maxAttempts = 5;
      if (reconnectAttempts.current < maxAttempts) {
        const delay = Math.min(30000, (2 ** reconnectAttempts.current) * 1000);
        reconnectAttempts.current += 1;
        setTimeout(() => initializeSocketConnection(), delay);
      }
    });
  
    socket.current.on('disconnect', (reason) => {
      console.log("Socket disconnected:", reason);
      setConnectionStatus("disconnected");
    });
  
    // Application events
    socket.current.on('priceUpdate', (data) => {
      setCurrentPrice(data.newPrice);
      addSystemMessage(`Farmer updated price to ₹${data.newPrice}/kg`);
      setWaitingForResponse(false);
    });
  
    socket.current.on('bargainStatusUpdate', (status) => {
      setBargainStatus(status);
      if (status === 'accepted') {
        addSystemMessage("🎉 Farmer accepted your offer!");
      } else if (status === 'rejected') {
        addSystemMessage("❌ Farmer declined your offer");
      }
      setWaitingForResponse(false);
    });
  
    socket.current.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      if (message.sender_type === 'farmer') {
        setWaitingForResponse(false);
      }
    });

    socket.current.on('typing', (isTyping) => {
      setIsTyping(isTyping);
    });
  
    socket.current.on('priceSuggestions', ({ suggestions }) => {
      setPriceSuggestions(suggestions);
      setShowPriceSuggestions(true);
    });
  
    socket.current.on('error', (error) => {
      console.error("Socket error:", error);
      setError(error.message);
    });
  }, [bargainId, token]);

  // Helper function to add system messages
  const addSystemMessage = (content) => {
    setMessages(prev => [
      ...prev,
      {
        content,
        sender_type: "consumer",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // Initialize socket connection on mount
  useEffect(() => {
    initializeSocketConnection();
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [initializeSocketConnection]);

  // Fetch bargain data
  useEffect(() => {
    const fetchBargainData = async () => {
      try {
        if (!bargainId || !token) {
          throw new Error("Missing bargain ID or authentication token");
        }
  
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/bargain/${bargainId}`, 
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
  
        const contentType = response.headers.get('content-type');
        const rawText = await response.text();
  
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
  
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON but got ${contentType}`);
        }
  
        const data = JSON.parse(rawText);
  
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch bargain data");
        }
  
        if (data.products && data.products.length > 0) {
          const product = data.products[0];
          setSelectedProduct(product);
          setCurrentPrice(product.current_offer || product.price_per_kg);
          setQuantity(product.quantity || 1);
          setSelectedQuantity(product.quantity || '10');
        }
        
        setBargainStatus(data.status || 'pending');
        
      } catch (error) {
        setError(error.message || "Failed to load bargain data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchBargainData();
  }, [bargainId, token]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBargainConfirm = async () => {
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }
  
    if (parseFloat(selectedQuantity) < 10) {
      alert("⚠️ Minimum quantity should be 10kg");
      return;
    }
  
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/add-bargain-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bargain_id: bargainId,
          product_id: selectedProduct.product_id,
          quantity: parseFloat(selectedQuantity),
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }
  
      const systemMessageContent = `🛒 You selected ${selectedProduct.produce_name} (${parseFloat(selectedQuantity)}kg) at ₹${selectedProduct.price_per_kg}/kg`;
      
      addSystemMessage(systemMessageContent);

      const suggestions = generatePriceSuggestions(selectedProduct.price_per_kg);
      setPriceSuggestions(suggestions);
      setShowPriceSuggestions(true);

      if (socket.current && socket.current.connected) {
        socket.current.emit("bargainMessage", {
          bargain_id: bargainId,
          message: {
            content: systemMessageContent,
            sender_type: "consumer",
            timestamp: new Date().toISOString()
          },
          recipientType: "farmer",
          recipientId: selectedProduct.farmer_id,
        });

        socket.current.emit('priceSuggestions', {
          bargainId,
          suggestions
        });
      }
  
      setQuantity(parseFloat(selectedQuantity));
      setCurrentPrice(selectedProduct.price_per_kg);
      setIsBargainPopupOpen(false);
  
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePriceSelection = (price) => {
    const messageContent = `💰 Offered ₹${price}/kg for ${selectedQuantity}kg`;
    
    addSystemMessage(messageContent);
    setCurrentPrice(price);
    setShowPriceSuggestions(false);
    setWaitingForResponse(true);

    if (socket.current && socket.current.connected) {
      socket.current.emit("bargainMessage", {
        bargain_id: bargainId,
        message: {
          content: messageContent,
          sender_type: "consumer",
          timestamp: new Date().toISOString()
        },
        recipientType: "farmer",
        recipientId: selectedProduct.farmer_id,
      });

      socket.current.emit('priceOffer', {
        price,
        productId: selectedProduct.product_id,
        quantity: selectedQuantity
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading bargain session...</p>
      </div>
    );
  }

  return (
    <div className="bargain-chat-container">
      {/* Bargain Initiation Popup */}
      {isBargainPopupOpen && selectedFarmer && (
        <div className="bargain-initiation-popup">
          <div className="popup-content animate__animated animate__fadeInUp">
            <button onClick={() => navigate(-1)} className="close-btn">
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3>Initiate Bargain with {selectedFarmer.farmer_name}</h3>
            
            <div className="form-group">
              <label>Select Product</label>
              <select
                value={selectedProduct?.produce_name || ''}
                onChange={(e) => {
                  const product = selectedFarmer.products.find(
                    p => p.produce_name === e.target.value
                  );
                  setSelectedProduct(product || null);
                  if (product) {
                    setCurrentPrice(product.price_per_kg);
                    setSelectedQuantity('10');
                  }
                }}
              >
                <option value="">-- Select a product --</option>
                {selectedFarmer.products?.map(product => (
                  <option key={product.product_id} value={product.produce_name}>
                    {product.produce_name} (₹{product.price_per_kg}/kg)
                  </option>
                ))}
              </select>
            </div>
            
            {selectedProduct && (
              <>
                <div className="product-details">
                  <p><strong>Category:</strong> {selectedProduct.produce_type}</p>
                  <p><strong>Availability:</strong> {selectedProduct.availability} kg</p>
                </div>
                
                <div className="form-group">
                  <label>Quantity (kg)</label>
                  <input
                    type="number"
                    min="10"
                    max={selectedProduct.availability}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    placeholder="Enter quantity in kg"
                  />
                  <div className="quantity-hints">
                    <span>Min: 10 kg</span>
                    <span>Max: {selectedProduct.availability} kg</span>
                  </div>
                </div>
                
                <div className="current-price-display">
                  <p>Product Price: ₹{selectedProduct.price_per_kg}/kg</p>
                  <p className="total-price">Total: ₹{(selectedProduct.price_per_kg * (parseFloat(selectedQuantity) || 0)).toFixed(2)}</p>
                </div>
              </>
            )}
            
            {error && <div className="error-message animate__animated animate__shakeX">{error}</div>}
            
            <button
              onClick={handleBargainConfirm}
              disabled={!selectedProduct || isLoading}
              className={`confirm-btn ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faHandshake} />
              )}
              Start Bargaining
            </button>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {selectedProduct && !isBargainPopupOpen && (
        <div className="chat-interface animate__animated animate__fadeIn">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="header-top">
              <h2>
                <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {selectedFarmer?.farmer_name}
              </h2>
              <span className={`connection-status ${connectionStatus}`}>
                {connectionStatus.toUpperCase()}
              </span>
            </div>
            
            <div className="product-info">
              <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
              <p><strong>Quantity:</strong> {selectedQuantity || quantity}kg</p>
              <div className="price-display">
                <span className="current-price">
                  <strong>Current:</strong> ₹{currentPrice}/kg
                </span>
                <span className="base-price">
                  <strong>Base:</strong> ₹{selectedProduct.price_per_kg}/kg
                </span>
                <span className="total-price">
                  <strong>Total:</strong> ₹{(parseFloat(selectedQuantity || quantity) * currentPrice)}
                </span>
              </div>
              {bargainStatus === 'accepted' && (
                <p className="status-accepted">
                  <FontAwesomeIcon icon={faCheckCircle} /> Offer Accepted!
                </p>
              )}
              {bargainStatus === 'rejected' && (
                <p className="status-rejected">
                  <FontAwesomeIcon icon={faTimesCircle} /> Offer Declined
                </p>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the negotiation!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={`msg-${index}`} 
                  className={`message ${msg.sender_type} animate__animated animate__fadeIn`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="message-content">
                    {msg.content}
                  </div>
                  <div className="message-meta">
                    <span className="sender">
                      {msg.sender_type === 'consumer' ? 'You' : 
                       msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
                    </span>
                    <span className="timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <span>{selectedFarmer?.farmer_name} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Controls */}
          <div className="chat-controls">
            {showPriceSuggestions && (
              <div className="price-suggestions animate__animated animate__fadeInUp">
                <h4>Make an Offer:</h4>
                <div className="suggestion-buttons">
                  {priceSuggestions.map((suggestion, index) => (
                    <button
                      key={`price-${index}`}
                      onClick={() => handlePriceSelection(suggestion.price)}
                      className={`suggestion-btn ${suggestion.amount < 0 ? 'decrease' : 'increase'}`}
                      disabled={waitingForResponse}
                    >
                      <div className="price-change">
                        {suggestion.amount < 0 ? (
                          <FontAwesomeIcon icon={faArrowDown} />
                        ) : (
                          <FontAwesomeIcon icon={faArrowUp} />
                        )}
                        ₹{suggestion.price}
                      </div>
                      <div className="price-label">{suggestion.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {waitingForResponse && (
              <div className="waiting-indicator animate__animated animate__pulse animate__infinite">
                <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's response...
              </div>
            )}

            {bargainStatus === 'accepted' && (
              <div className="accepted-actions animate__animated animate__fadeIn">
                <button 
                  className="primary-action animate__animated animate__pulse"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </button>
                <button 
                  className="secondary-action"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default BargainChatWindow;