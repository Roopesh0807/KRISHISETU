// import React, { useState, useEffect, useRef } from 'react';
// import { useParams,useNavigate, useLocation } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { useAuth } from "../../context/AuthContext";
//   // ✅ Go up two levels if needed


// import { 
//   faSpinner, 
//   faPaperPlane, 
//   faRupeeSign,
//   faArrowUp,
//   faComments,
//   faTimes,
//   faArrowDown
// } from '@fortawesome/free-solid-svg-icons';
// import './cbargain.css';

// const BargainChatWindow = () => {
//   const navigate = useNavigate();
//   const { bargainId } = useParams();
//    const { consumer} = useAuth();
//   const location = useLocation();
//   const { product, farmer } = location.state || {};
//   const messagesEndRef = useRef(null);
 
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [selectedFarmer] = useState(null);
//   const [currentPrice, setCurrentPrice] = useState(product?.price_per_kg || 0);
//   const [ws, setWs] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState('connecting');
//   const [bargainAccepted, setBargainAccepted] = useState(false);
//   const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//    const [quantity, setQuantity] = useState(1);
//    const [isLoading, setIsLoading] = useState(false);
//      const [error, setError] = useState(null);

//   // WebSocket setup with reconnect logic
//   useEffect(() => {
//     if (!bargainId) {
//       console.error("❌ Missing bargainId. WebSocket connection aborted.");
//       return;
//     }
  
//     const token = localStorage.getItem('token');
//     if (!token || token === "null") {
//       console.error("❌ Missing or invalid token. WebSocket connection aborted.");
//       return;
//     }
  
//     const socketUrl = `ws://localhost:5000/ws/bargain/${bargainId}?token=${token}`;
//     console.log(`🔗 Connecting to WebSocket: ${socketUrl}`);

//     const socket = new WebSocket(socketUrl);
  
//     socket.onopen = () => {
//       console.log('✅ WebSocket connected');
//       setConnectionStatus('connected');
//       setWs(socket);
//     };
  
//     socket.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log('📩 WebSocket message received:', data);
        
//         switch (data.type) {
//           case 'PRICE_SUGGESTIONS':
//             // Receive price suggestions from the backend
//             setMessages(prev => [
//               ...prev, 
//               {
//                 content: `Here are the price suggestions: ₹${data.suggestions.join(', ')}/kg`,
//                 sender_type: 'system',
//                 timestamp: new Date().toISOString()
//               }
//             ]);
//             break;
    
//           case 'NEW_OFFER':
//             // When the consumer makes an offer, it will be sent to the farmer
//             setMessages(prev => [
//               ...prev,
//               {
//                 content: `You offered ₹${data.newPrice}/kg`,
//                 sender_type: 'consumer',
//                 timestamp: new Date().toISOString()
//               }
//             ]);
//             break;
    
//           case 'BARGAIN_ACCEPTED':
//             // If the farmer accepts the offer
//             setBargainAccepted(true);
//             setMessages(prev => [
//               ...prev, 
//               {
//                 content: '🎉 Farmer accepted your offer!',
//                 sender_type: 'system',
//                 timestamp: new Date().toISOString()
//               }
//             ]);
//             break;
    
//           case 'BARGAIN_REJECTED':
//             // If the farmer rejects the offer
//             setMessages(prev => [
//               ...prev, 
//               {
//                 content: '❌ Farmer rejected your offer.',
//                 sender_type: 'system',
//                 timestamp: new Date().toISOString()
//               }
//             ]);
//             break;
    
//           case 'COUNTER_OFFER':
//             // If the farmer sends a counter-offer
//             setMessages(prev => [
//               ...prev, 
//               {
//                 content: `Farmer's counter-offer: ₹${data.counterPrice}/kg`,
//                 sender_type: 'farmer',
//                 timestamp: new Date().toISOString()
//               }
//             ]);
//             break;
    
//           default:
//             console.warn('⚠️ Unknown message type:', data.type);
//         }
//       } catch (error) {
//         console.error("⚠️ Error parsing WebSocket message:", error);
//       }
//     };
    

//     socket.onerror = (error) => {
//       console.error('❌ WebSocket error:', error);
//       setConnectionStatus('error');
//     };
  
//     socket.onclose = () => {
//       console.log('🔌 WebSocket disconnected');
//       setConnectionStatus('disconnected');
//       setTimeout(() => {
//         console.log("🔄 Attempting to reconnect WebSocket...");
//         setWs(new WebSocket(socketUrl));
//       }, 3000);
//     };
  
//     return () => {
//       console.log('❌ Closing WebSocket...');
//       socket.close();
//     };
//   }, [bargainId]);
 
//   const handleNewMessage = (senderType, content) => {
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { senderType, content }
//     ]);
//   };
//   const handleFarmerResponse = (response) => {
//     handleNewMessage('farmer', response);
//   };

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
//   useEffect(() => {
//     // If there's an initial message from navigation state, show it in the chat
//     if (location.state?.initialMessage) {
//       setMessages([
//         { sender_type: 'system', content: location.state.initialMessage, timestamp: Date.now() }
//       ]);
//     }
//   }, [location.state]);

//   // const handleStartBargain = () => {
//   //   // Send the "Bargain Request Sent" message to the chat
//   //   setMessages((prevMessages) => [
//   //     ...prevMessages,
//   //     { sender_type: 'system', content: 'Bargain request sent to farmer, please wait until he accepts.', timestamp: Date.now() },
//   //   ]);
//   // };
//   const handleMakeOffer = (price) => {
//     if (ws && ws.readyState === WebSocket.OPEN) {
//       const offerMessage = {
//         type: 'PRICE_UPDATE',
//         newPrice: price,
//         sender: 'consumer',
//       };
//       ws.send(JSON.stringify(offerMessage));
//       setMessages((prev) => [...prev, {
//         content: `You offered ₹${price}/kg`,
//         sender_type: 'consumer',
//         timestamp: new Date().toISOString(),
//       }]);
//       setCurrentPrice(price);
//     } else {
//       console.error('WebSocket is not connected. Cannot send offer.');
//     }
//   };

//   const handleSendMessage = () => {
//     if (!newMessage.trim()) return;
    
//     if (ws && ws.readyState === WebSocket.OPEN) {
//       const chatMessage = {
//         type: 'NEW_MESSAGE',
//         message: {
//           content: newMessage,
//           sender_type: 'consumer',
//           timestamp: new Date().toISOString(),
//         },
//       };
//       ws.send(JSON.stringify(chatMessage));
//       setMessages((prev) => [...prev, chatMessage.message]);
//       setNewMessage('');
//     } else {
//       console.error('WebSocket is not connected. Cannot send message.');
//     }
//   };
  
//   // Fetch initial messages
//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/messages`, {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });
//         const data = await response.json();
//         if (data?.messages) {
//           setMessages(data.messages);
//         } else {
//           setMessages([]); // Set to empty array if no messages found
//         }
//         if (data?.currentPrice) setCurrentPrice(data.currentPrice);
//       } catch (error) {
//         console.error("Error fetching messages:", error);
//         setMessages([]); // Set to empty array if error occurs
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchMessages();
//   }, [bargainId]);
  

//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);


//   if (loading) {
//     return (
//       <div className="loading-container">
//         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
//         <p>Loading bargain session...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bargain-chat-container">
//       <div className="chat-header">
//         <div className="header-top">
//           <h2>
//             <FontAwesomeIcon icon={faRupeeSign} /> Bargaining with {farmer?.farmer_name}
//           </h2>
//           <span className={`connection-status ${connectionStatus}`}>
//             {connectionStatus.toUpperCase()}
//           </span>
//         </div>
        
//         <div className="product-info">
//           <p><strong>Product:</strong> {product?.produce_name}</p>
//           <p><strong>Quantity:</strong> {quantity}kg</p>
//           <p className="current-price">
//             <strong>Current Price:</strong> ₹{currentPrice}/kg
//           </p>
//         </div>
//       </div>

//       <div className="chat-messages">
//         {messages.length === 0 ? (
//           <div className="no-messages">
//             <p>Start the negotiation by making an offer!</p>
//           </div>
//         ) : (
//           messages.map((msg, index) => (
//             <div key={index} className={`message ${msg.sender_type}`}>
//               <div className="message-content">
//                 {msg.content}
//                 {msg.price && (
//                   <div className="price-offer">
//                     <FontAwesomeIcon icon={faRupeeSign} /> {msg.price}/kg
//                   </div>
//                 )}
//               </div>
//               <div className="message-meta">
//                 <span className="sender">
//                   {msg.sender_type === 'consumer' ? 'You' : 
//                    msg.sender_type === 'farmer' ? farmer?.farmer_name : 'System'}
//                 </span>
//                 <span className="timestamp">
//                   {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
//                 </span>
//               </div>
//             </div>
//           ))
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="chat-controls">
      
//        {bargainAccepted && (
//   <div className="price-suggestions">
//     <h4>Quick Offers:</h4>
//     <div className="suggestion-buttons">
//       <button onClick={() => handleMakeOffer(currentPrice - 6)}>
//         <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 6} (-6)
//       </button>
//       <button onClick={() => handleMakeOffer(currentPrice - 5)}>
//         <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 5} (-5)
//       </button>
//       <button onClick={() => handleMakeOffer(currentPrice - 4)}>
//         <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 4} (-4)
//       </button>
//       <button onClick={() => handleMakeOffer(currentPrice - 3)}>
//         <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - 3} (-3)
//       </button>
//       <button onClick={() => handleMakeOffer(currentPrice - 2)}>
//         <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice - 2} (-2)
//       </button>
//       <button onClick={() => handleMakeOffer(currentPrice - 1)}>
//         <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice - 1} (-1)
//       </button>
//     </div>
//   </div>
// )}


//             <div className="message-input">
//               <input
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}  // Bind input to newMessage state
//                 placeholder="Type your message..."
//                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}  // Handle Enter key for sending
//                 disabled={connectionStatus !== 'connected'}  // Disable if not connected
//               />
//               <button
//                 onClick={handleSendMessage}
//                 disabled={!newMessage.trim() || connectionStatus !== 'connected'}
//               >
//                 <FontAwesomeIcon icon={faPaperPlane} />
//               </button>
//             </div>
// {isBargainPopupOpen && selectedFarmer && selectedFarmer.products && (
//         <div className="ks-bargain-modal">
//           <div className="ks-bargain-modal-content">
//             <button 
//               onClick={() => setIsBargainPopupOpen(false)} 
//               className="ks-modal-close-btn"
//             >
//               <FontAwesomeIcon icon={faTimes} />
//             </button>
//             <h3 className="ks-modal-title">Bargain with {selectedFarmer.farmer_name}</h3>
            
//             <div className="ks-modal-form-group">
//               <label className="ks-modal-label">Select Product</label>
//               <select
//                 onChange={(e) => {
//                   const selectedProductData = selectedFarmer.products.find(
//                     (product) => product.produce_name === e.target.value
//                   );
//                   setSelectedProduct(selectedProductData || null);
//                 }}
//                 className="ks-modal-select"
//               >
//                 <option value="">Choose a product</option>
//                 {selectedFarmer.products.map((product) => (
//                   <option key={product.product_id} value={product.produce_name}>
//                     {product.produce_name} - ₹{product.price_per_kg}/kg
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             <div className="ks-modal-form-group">
//               <label className="ks-modal-label">Quantity (kg)</label>
//               <input
//                 type="number"
//                 min="1"
//                 max={selectedProduct?.availability || 100}
//                 value={quantity}
//                 onChange={(e) => setQuantity(Number(e.target.value))}
//                 className="ks-modal-input"
//               />
//             </div>
            
//             {error && <div className="ks-error-message">{error}</div>}

//             <div className="ks-modal-actions">
//               <button 
//                 onClick={handleBargainConfirm}
//                 disabled={isLoading || !selectedProduct || !consumer}
//                 className="ks-modal-confirm-btn"
//               >
//                 {isLoading ? (
//                   <>
//                     <FontAwesomeIcon icon={faSpinner} spin /> Starting Bargain...
//                   </>
//                 ) : (
//                   <>
//                     <FontAwesomeIcon icon={faComments} /> Start Bargaining
//                   </>
//                 )}
//               </button>
//             </div>
            
//           </div>
//         </div>
//       )}
//       </div>
//     </div>
//   );
// };

// export default BargainChatWindow;
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from "../../context/AuthContext";
import { 
  faSpinner, 
  faPaperPlane, 
  faRupeeSign,
  faArrowUp,
  faArrowDown,
  faTimes,
  faHandshake
} from '@fortawesome/free-solid-svg-icons';
import './cbargain.css';

const BargainChatWindow = () => {
  const navigate = useNavigate();
  const { bargainId } = useParams();
  const { token, consumer } = useAuth();
  const location = useLocation();
  console.log("Token in BargainChatWindow:", token);
  const { product: initialProduct, farmer: initialFarmer, quantity: initialQuantity } = location.state || {};
  // Refs
  const messagesEndRef = useRef(null);
  // State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(initialProduct?.price_per_kg || 0);
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [bargainAccepted, setBargainAccepted] = useState(false);
  const [waitingForReply, setWaitingForReply] = useState(false);
  // Bargain initiation state
  const [isBargainPopupOpen, setIsBargainPopupOpen] = useState(true); // Show popup by default
  const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
  const [selectedFarmer] = useState(initialFarmer || null);
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Initialize WebSocket connection
  useEffect(() => {
    if (!bargainId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Missing token");
      return;
    }
    const socketUrl = `ws://localhost:5000/ws/bargain/${bargainId}?token=${token}`;
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      setConnectionStatus('connected');
      setWs(socket);
    };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'PRICE_UPDATE':
            setCurrentPrice(data.newPrice);
            setMessages(prev => [...prev, {
              content: `Farmer updated price to ₹${data.newPrice}/kg`,
              sender_type: 'system',
              timestamp: new Date().toISOString()
            }]);
            setWaitingForReply(false);
            break;
            
          case 'BARGAIN_ACCEPTED':
            setBargainAccepted(true);
            setWaitingForReply(false);
            setMessages(prev => [...prev, {
              content: '🎉 Farmer accepted your offer!',
              sender_type: 'system',
              timestamp: new Date().toISOString()
            }]);
            break;
            
          case 'MESSAGE':
            setMessages(prev => [...prev, data.message]);
            // If we receive a message from farmer, we're no longer waiting for reply
            if (data.message.sender_type === 'farmer') {
              setWaitingForReply(false);
            }
            break;
            
          case 'INITIAL_MESSAGE_SENT':
            // Farmer acknowledged our initial message, now we can show suggestions
            setWaitingForReply(false);
            break;
            
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };
    socket.onerror = (error) => {
      setConnectionStatus('error');
      console.error('WebSocket error:', error);
    };
    socket.onclose = () => {
      setConnectionStatus('disconnected');
      setTimeout(() => {
        setWs(new WebSocket(socketUrl));
      }, 3000);
    };
    return () => socket.close();
  }, [bargainId]);

  // Load initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bargain/${bargainId}/messages`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setMessages(data.messages || []);
        if (data.currentPrice) setCurrentPrice(data.currentPrice);
        
        // If we already have messages, close the popup
        if (data.messages && data.messages.length > 0) {
          setIsBargainPopupOpen(false);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (bargainId) {
      fetchMessages();
    }
  }, [bargainId]);
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle bargain confirmation
  const handleBargainConfirm = async () => {
    setError(null);
    setIsLoading(true);
    setWaitingForReply(true); // Wait for farmer's reply

    try {
      if (!selectedProduct || !selectedFarmer || quantity <= 0) {
        throw new Error("Please select a product and valid quantity");
      }

      if (!consumer?.token) {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      // Send initial bargain message
      if (ws && ws.readyState === WebSocket.OPEN) {
        const bargainMessage = {
          type: 'INIT_BARGAIN',
          product: selectedProduct,
          quantity,
          initialPrice: selectedProduct.price_per_kg,
          farmer: selectedFarmer,
          consumerName: consumer.name
        };
        ws.send(JSON.stringify(bargainMessage));
      }

      // Add initial message to chat
      setMessages(prev => [...prev, {
        content: `You sent an bargain request for ${quantity}kg of ${selectedProduct.produce_name}`,
        // at ₹${selectedProduct.price_per_kg}/kg
        sender_type: 'consumer',
        timestamp: new Date().toISOString()
      }]);

      // Close popup after successful initiation
      setIsBargainPopupOpen(false);
      
    } catch (error) {
      setError(error.message);
      setWaitingForReply(false);
    } finally {
      setIsLoading(false);
    }
  };
  // Handle price offer
  const handleMakeOffer = (price) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      setWaitingForReply(true); // Wait for farmer's reply
      
      const offerMessage = {
        type: 'PRICE_OFFER',
        price,
        productId: selectedProduct.product_id,
        quantity
      };
      ws.send(JSON.stringify(offerMessage));
      setMessages(prev => [...prev, {
        content: `You offered ₹${price}/kg for ${quantity}kg`,
        sender_type: 'consumer',
        timestamp: new Date().toISOString()
      }]);
      setCurrentPrice(price);
    }
  };
  // Handle regular message sending
  const handleSendMessage = () => {
    if (!newMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    const message = {
      type: 'MESSAGE',
      content: newMessage,
      sender_type: 'consumer',
      timestamp: new Date().toISOString()
    };
    
    ws.send(JSON.stringify(message));
    setMessages(prev => [...prev, message]);
    setNewMessage('');
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
          <div className="popup-content">
            <button 
              onClick={() => navigate(-1)} 
              className="close-btn"
            >
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
                  if (product) setCurrentPrice(product.price_per_kg);
                }}
              >
                <option value="">Select a product</option>
                {selectedFarmer.products?.map(product => (
                  <option key={product.product_id} value={product.produce_name}>
                    {product.produce_name} (₹{product.price_per_kg}/kg)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Quantity (kg)</label>
              <input
                type="number"
                min="1"
                max={selectedProduct?.availability || 100}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, e.target.value))}
              />
            </div>
            
            <div className="current-price-display">
              Current Price: ₹{selectedProduct?.price_per_kg || 0}/kg
            </div>
            {error && <div className="error-message">{error}</div>}
            <button
              onClick={handleBargainConfirm}
              disabled={!selectedProduct || isLoading}
              className="confirm-btn"
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
      {/* Main Chat Interface */}
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
          {selectedProduct && (
            <>
              <p><strong>Product:</strong> {selectedProduct.produce_name}</p>
              <p><strong>Quantity:</strong> {quantity}kg</p>
              <p className="current-price">
                <strong>Current Price:</strong> ₹{currentPrice}/kg
              </p>
            </>
          )}
        </div>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the negotiation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender_type}`}>
              <div className="message-content">{msg.content}</div>
              <div className="message-meta">
                <span className="sender">
                  {msg.sender_type === 'consumer' ? 'You' : 
                   msg.sender_type === 'farmer' ? selectedFarmer?.farmer_name : 'System'}
                </span>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-controls">
        {/* Show price suggestions only after initial message is sent and not waiting for reply */}
        {!bargainAccepted && selectedProduct && messages.length > 0 && !waitingForReply && (
          <div className="price-suggestions">
            <h4>Make an Offer:</h4>
            <div className="suggestion-buttons">
              {[1, 2, 3, 5].map(amount => (
                <button 
                  key={`decrease-${amount}`} 
                  onClick={() => handleMakeOffer(currentPrice - amount)}
                  disabled={currentPrice - amount <= 0}
                >
                  <FontAwesomeIcon icon={faArrowDown} /> ₹{currentPrice - amount}
                </button>
              ))}
              {[1, 2, 3].map(amount => (
                <button 
                  key={`increase-${amount}`} 
                  onClick={() => handleMakeOffer(currentPrice + amount)}
                >
                  <FontAwesomeIcon icon={faArrowUp} /> ₹{currentPrice + amount}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Show waiting indicator when waiting for farmer's reply */}
        {waitingForReply && (
          <div className="waiting-indicator">
            <FontAwesomeIcon icon={faSpinner} spin /> Waiting for farmer's reply...
          </div>
        )}
        <div className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={connectionStatus !== 'connected'}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || connectionStatus !== 'connected'}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BargainChatWindow;