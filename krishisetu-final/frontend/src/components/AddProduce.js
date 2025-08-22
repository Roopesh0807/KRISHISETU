// // import React, { useState, useEffect, useCallback, useContext } from 'react';
// // import axios from 'axios';
// // import './addproduce.css';
// // import KSlogo from "../assets/logo.jpg";
// // import BSimg from "../assets/bargain.jpeg";
// // import { AuthContext } from '../context/AuthContext';

// // // Move the helper function outside the component
// // const getFarmerName = (farmerData) => {
// //   if (!farmerData) return 'Farmer';
// //   if (farmerData.full_name) return farmerData.full_name;
// //   if (farmerData.first_name && farmerData.last_name) {
// //     return `${farmerData.first_name} ${farmerData.last_name}`;
// //   }
// //   return farmerData.first_name || farmerData.last_name || 'Farmer';
// // };

// // const AddProduce = () => {
// //   // State declarations
// //   const [selectedMarket, setSelectedMarket] = useState(null);
// //   const [produces, setProduces] = useState([]);
// //   const [newProduce, setNewProduce] = useState({
// //     produce_name: '',
// //     availability: '',
// //     price_per_kg: '',
// //     produce_type: 'Standard',
// //     market_type: '',
// //     min_quantity:''
// //   });
// //   const [isFormVisible, setIsFormVisible] = useState(false);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState('');
  
// //   // Get farmer from AuthContext with proper initialization
// //   const authContext = useContext(AuthContext);
// //   const farmer = authContext?.farmer || {};
  
// //   // State for farmer details with proper initialization
// //   const [farmerDetails, setFarmerDetails] = useState({
// //     id: '',
// //     name: 'Loading...',
// //     isLoaded: false
// //   });

// //   // Effect to update farmer details when context changes
// //   useEffect(() => {
// //     if (authContext?.farmer) {
// //       setFarmerDetails({
// //         id: authContext.farmer.farmer_id || '',
// //         name: getFarmerName(authContext.farmer),
// //         isLoaded: true
// //       });
// //     } else {
// //       setFarmerDetails({
// //         id: '',
// //         name: 'Loading...',
// //         isLoaded: false
// //       });
// //     }
// //   }, [authContext?.farmer]);
  

// //   const loadProduces = useCallback(async () => {
// //     if (!selectedMarket || !farmerDetails.id || !farmerDetails.isLoaded) return;
    
// //     try {
// //       setIsLoading(true);
// //       const response = await axios.get(`http://localhost:5000/api/produces`, {
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'Authorization': `Bearer ${localStorage.getItem('token')}`
// //         },
// //         params: {
// //           farmer_id: farmerDetails.id,
// //           market_type: selectedMarket
// //         }
// //       });
// //       setProduces(response.data);
// //       setError('');
// //     } catch (err) {
// //       console.error('Failed to fetch produces:', err);
// //       setError('Failed to load produces. Please try again.');
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }, [selectedMarket, farmerDetails.id, farmerDetails.isLoaded]);

// //   useEffect(() => {
// //     loadProduces();
// //   }, [loadProduces]);

// //   const handleMarketClick = (market) => {
// //     const marketType = market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market';
// //     setSelectedMarket(marketType);
// //     setIsFormVisible(false);
// //     setError('');
// //   };

// //   const handleFormChange = (e) => {
// //     const { name, value } = e.target;
// //     setNewProduce({
// //       ...newProduce,
// //       [name]: value,
// //       market_type: selectedMarket
// //     });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError('');
    
// //     if (!newProduce.produce_name || !newProduce.availability || !newProduce.price_per_kg) {
// //       setError('Please fill all the fields');
// //       return;
// //     }
  
// //     if (isNaN(newProduce.availability)) {
// //       setError('Availability must be a number');
// //       return;
// //     }
  
// //     if (isNaN(newProduce.price_per_kg)) {
// //       setError('Price must be a valid number');
// //       return;
// //     }

// //     if (!farmer?.farmer_id) {
// //       setError('Farmer information not available. Please log in again.');
// //       return;
// //     }
  
// //     try {
// //       setIsLoading(true);
// //       const produceData = {
// //         ...newProduce,
// //         farmer_id: farmer.farmer_id,
// //         farmer_name: farmer.full_name || `${farmer.first_name} ${farmer.last_name}`,
// //         email: farmer.email,
// //         availability: parseFloat(newProduce.availability),
// //         price_per_kg: parseFloat(newProduce.price_per_kg),
// //         market_type: selectedMarket
// //       };

// //       const config = {
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'Authorization': `Bearer ${localStorage.getItem('token')}`
// //         }
// //       };

// //       if (newProduce.id) {
// //         await axios.put(
// //           `http://localhost:5000/api/produces/${newProduce.id}`,
// //           produceData,
// //           {
// //             headers: {
// //               'Content-Type': 'application/json',
// //               'Authorization': `Bearer ${localStorage.getItem('token')}`
// //             }
// //           }
// //         );
// //       } else {
// //         await axios.post(
// //           'http://localhost:5000/api/produces',
// //           produceData,
// //           {
// //             headers: {
// //               'Content-Type': 'application/json',
// //               'Authorization': `Bearer ${localStorage.getItem('token')}`
// //             }
// //           }
// //       )};

// //       await loadProduces();
// //       setNewProduce({
// //         produce_name: '',
// //         availability: '',
// //         price_per_kg: '',
// //         produce_type: 'Standard',
// //         market_type: selectedMarket
// //       });
// //       setIsFormVisible(false);
// //     } catch (err) {
// //       console.error('Failed to save produce:', err);
// //       setError(err.response?.data?.error || 'Failed to save produce. Please try again.');
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const editProduce = (produce) => {
// //     setNewProduce({
// //       ...produce,
// //       id: produce.product_id
// //     });
// //     setIsFormVisible(true);
// //   };

// //   const deleteProduce = async (productId) => {
// //     if (!window.confirm('Are you sure you want to delete this produce?')) return;
    
// //     try {
// //       setIsLoading(true);
// //       await axios.delete(`http://localhost:5000/api/produces/${productId}`,
// //         {
// //           headers: {
// //             'Content-Type': 'application/json',
// //             'Authorization': `Bearer ${localStorage.getItem('token')}`
// //           }
// //         }
// //       );
// //       await loadProduces();
// //     } catch (err) {
// //       console.error('Failed to delete produce:', err);
// //       setError('Failed to delete produce. Please try again.');
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="addproduce-container">
// //       <h1>Produces Added to the List</h1>
      
// //       {/* Farmer info section */}
// //       <div className="farmer-info">
// //         {farmerDetails.isLoaded ? (
// //           <>
// //             {farmerDetails.id && <p>Farmer ID: {farmerDetails.id}</p>}
// //             <p>Farmer Name: {farmerDetails.name}</p>
// //           </>
// //         ) : (
// //           <p>Loading farmer information...</p>
// //         )}
// //       </div>
// //       {error && <div className="error-message">{error}</div>}
// //       {isLoading && <div className="loading-indicator">Loading...</div>}

// //       <div className="addproduce-market-buttons">
// //         <button 
// //           onClick={() => handleMarketClick('krishisetu')} 
// //           className={selectedMarket === 'KrishiSetu Market' ? 'active' : ''}
// //           disabled={isLoading}
// //         >
// //           <img src={KSlogo} alt="KrishiSetu Logo" />
// //           KrishiSetu Market
// //         </button>
// //         <button 
// //           onClick={() => handleMarketClick('bargaining')} 
// //           className={selectedMarket === 'Bargaining Market' ? 'active' : ''}
// //           disabled={isLoading}
// //         >
// //           <img src={BSimg} alt="Bargaining Logo" />
// //           Bargaining System
// //         </button>
// //       </div>

// //       {selectedMarket && (
// //         <>
// //           <button 
// //             className="addproduce-button" 
// //             onClick={() => {
// //               setIsFormVisible(!isFormVisible);
// //               if (isFormVisible) {
// //                 setNewProduce({
// //                   produce_name: '',
// //                   availability: '',
// //                   price_per_kg: '',
// //                   produce_type: 'Standard',
// //                   market_type: selectedMarket
// //                 });
// //               }
// //             }}
// //             disabled={isLoading}
// //           >
// //             {isFormVisible ? 'Cancel' : 'Add Produce'}
// //           </button>

// //           {isFormVisible && (
// //             <div className="addproduce-form">
// //               <h3>{newProduce.id ? 'Edit Produce' : 'Add Produce'} to {selectedMarket}</h3>
// //               <form onSubmit={handleSubmit}>
// //                 <div>
// //                   <label>Produce Name:</label>
// //                   <input
// //                     type="text"
// //                     name="produce_name"
// //                     value={newProduce.produce_name}
// //                     onChange={handleFormChange}
// //                     placeholder="Enter produce name"
// //                     required
// //                     disabled={isLoading}
// //                   />
// //                 </div>
// //                 <div>
// //                   <label>Availability (kg):</label>
// //                   <input
// //                     type="number"
// //                     name="availability"
// //                     value={newProduce.availability}
// //                     onChange={handleFormChange}
// //                     placeholder="Enter availability in kg"
// //                     min="0.1"
// //                     step="0.1"
// //                     required
// //                     disabled={isLoading}
// //                   />
// //                 </div>
// //                 <div>
// //                   <label>Price per KG:</label>
// //                   <input
// //                     type="number"
// //                     name="price_per_kg"
// //                     value={newProduce.price_per_kg}
// //                     onChange={handleFormChange}
// //                     placeholder="Enter price per kg"
// //                     min="0.01"
// //                     step="0.01"
// //                     required
// //                     disabled={isLoading}
// //                   />
// //                 </div>
// //                 <div>
// //                   <label>Produce Type:</label>
// //                   <select
// //                     name="produce_type"
// //                     value={newProduce.produce_type}
// //                     onChange={handleFormChange}
// //                     required
// //                     disabled={isLoading}
// //                   >
// //                     <option value="Standard">Standard</option>
// //                     <option value="Organic">Organic</option>
// //                   </select>
// //                 </div>
// //                 <button 
// //                   type="submit" 
// //                   className="addproduce-submit-button"
// //                   disabled={isLoading}
// //                 >
// //                   {isLoading ? 'Saving...' : newProduce.id ? 'Update Produce' : 'Add Produce'}
// //                 </button>
// //               </form>
// //             </div>
// //           )}

// //           <h3>List of Produces in {selectedMarket}</h3>
// //           {produces.length > 0 ? (
// //             <table className="addproduce-table">
// //               <thead>
// //                 <tr>
// //                   <th>Produce Name</th>
// //                   <th>Type</th>
// //                   <th>Availability (kg)</th>
// //                   <th>Price per KG</th>
// //                   <th>Actions</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {produces.map((produce) => (
// //                   <tr key={produce.product_id}>
// //                     <td>{produce.produce_name}</td>
// //                     <td>{produce.produce_type}</td>
// //                     <td>{produce.availability} kg</td>
// //                     <td>₹{produce.price_per_kg}</td>
// //                     <td>
// //                       <button
// //                         className="addproduce-edit-button"
// //                         onClick={() => editProduce(produce)}
// //                         disabled={isLoading}
// //                       >
// //                         Edit
// //                       </button>
// //                       <button
// //                         className="addproduce-remove-button"
// //                         onClick={() => deleteProduce(produce.product_id)}
// //                         disabled={isLoading}
// //                       >
// //                         Remove
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           ) : (
// //             <p>No produces added yet for this market.</p>
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default AddProduce;

// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import axios from 'axios';
// import './addproduce.css';
// import KSlogo from "../assets/logo.jpg";
// import BSimg from "../assets/bargain.jpeg";
// import { AuthContext } from '../context/AuthContext';

// // Move the helper function outside the component
// const getFarmerName = (farmerData) => {
//   if (!farmerData) return 'Farmer';
//   if (farmerData.full_name) return farmerData.full_name;
//   if (farmerData.first_name && farmerData.last_name) {
//     return `${farmerData.first_name} ${farmerData.last_name}`;
//   }
//   return farmerData.first_name || farmerData.last_name || 'Farmer';
// };

// const AddProduce = () => {
//   // State declarations
//   const [selectedMarket, setSelectedMarket] = useState(null);
//   const [produces, setProduces] = useState([]);
//   const [newProduce, setNewProduce] = useState({
//     produce_name: '',
//     availability: '',
//     price_per_kg: '',
//     produce_type: 'Standard',
//     market_type: '',
//     minimum_quantity: '',
//     minimum_price: '' 
//   });
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showInstructions, setShowInstructions] = useState(true); // New state for instructions
  
//   // Get farmer from AuthContext with proper initialization
//   const authContext = useContext(AuthContext);
//   const farmer = authContext?.farmer || {};
  
//   // State for farmer details with proper initialization
//   const [farmerDetails, setFarmerDetails] = useState({
//     id: '',
//     name: 'Loading...',
//     isLoaded: false
//   });

//   // Effect to update farmer details when context changes
//   useEffect(() => {
//     if (authContext?.farmer) {
//       setFarmerDetails({
//         id: authContext.farmer.farmer_id || '',
//         name: getFarmerName(authContext.farmer),
//         isLoaded: true
//       });
//     } else {
//       setFarmerDetails({
//         id: '',
//         name: 'Loading...',
//         isLoaded: false
//       });
//     }
//   }, [authContext?.farmer]);

//   const loadProduces = useCallback(async () => {
//     if (!selectedMarket || !farmerDetails.id || !farmerDetails.isLoaded) return;
    
//     try {
//       setIsLoading(true);
//       const response = await axios.get(`http://localhost:5000/api/produces`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         params: {
//           farmer_id: farmerDetails.id,
//           market_type: selectedMarket
//         }
//       });
//       setProduces(response.data);
//       setError('');
//     } catch (err) {
//       console.error('Failed to fetch produces:', err);
//       setError('Failed to load produces. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedMarket, farmerDetails.id, farmerDetails.isLoaded]);

//   useEffect(() => {
//     loadProduces();
//   }, [loadProduces]);

//   const handleMarketClick = (market) => {
//     const marketType = market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market';
//     setSelectedMarket(marketType);
//     setIsFormVisible(false);
//     setError('');
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setNewProduce({
//       ...newProduce,
//       [name]: value,
//       market_type: selectedMarket
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
    
//     // Basic validation
//     if (!newProduce.produce_name || !newProduce.availability || !newProduce.price_per_kg) {
//       setError('Please fill all the fields');
//       return;
//     }
  
//     if (isNaN(newProduce.availability)) {
//       setError('Availability must be a number');
//       return;
//     }
  
//     if (isNaN(newProduce.price_per_kg)) {
//       setError('Price must be a valid number');
//       return;
//     }

//     // Additional validation for Bargaining Market
//     if (selectedMarket === 'Bargaining Market') {
//       if (!newProduce.minimum_quantity) {
//         setError('Minimum quantity is required for Bargaining Market');
//         return;
//       }
      
//       if (isNaN(newProduce.minimum_quantity)) {
//         setError('Minimum quantity must be a number');
//         return;
//       }
      
//       if (parseFloat(newProduce.minimum_quantity) < 10) { // Changed to 10kg minimum
//         setError('Minimum quantity must be at least 10kg for Bargaining Market');
//         return;
//       }

//       if (!newProduce.minimum_price) {
//         setError('Minimum price is required for Bargaining Market');
//         return;
//       }
      
//       if (isNaN(newProduce.minimum_price)) {
//         setError('Minimum price must be a valid number');
//         return;
//       }
      
//       if (parseFloat(newProduce.minimum_price) <= 0) {
//         setError('Minimum price must be greater than 0');
//         return;
//       }

//       if (parseFloat(newProduce.minimum_price) >= parseFloat(newProduce.price_per_kg)) {
//         setError('Minimum price must be less than the regular price');
//         return;
//       }
//     }

//     if (!farmer?.farmer_id) {
//       setError('Farmer information not available. Please log in again.');
//       return;
//     }
  
//     try {
//       setIsLoading(true);
//       const produceData = {
//         ...newProduce,
//         farmer_id: farmer.farmer_id,
//         farmer_name: farmer.full_name || `${farmer.first_name} ${farmer.last_name}`,
//         email: farmer.email,
//         availability: parseFloat(newProduce.availability),
//         price_per_kg: parseFloat(newProduce.price_per_kg),
//         market_type: selectedMarket,
//         ...(selectedMarket === 'Bargaining Market' && {
//           minimum_quantity: parseFloat(newProduce.minimum_quantity),
//           minimum_price: parseFloat(newProduce.minimum_price)
//         })
//       };

//       const config = {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       };

//       if (newProduce.id) {
//         await axios.put(
//           `http://localhost:5000/api/produces/${newProduce.id}`,
//           produceData,
//           config
//         );
//       } else {
//         await axios.post(
//           'http://localhost:5000/api/produces',
//           produceData,
//           config
//         );
//       }

//       await loadProduces();
//       setNewProduce({
//         produce_name: '',
//         availability: '',
//         price_per_kg: '',
//         produce_type: 'Standard',
//         market_type: selectedMarket,
//         minimum_quantity: '',
//         minimum_price: ''
//       });
//       setIsFormVisible(false);
//     } catch (err) {
//       console.error('Failed to save produce:', err);
//       setError(err.response?.data?.error || 'Failed to save produce. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const editProduce = (produce) => {
//     setNewProduce({
//       ...produce,
//       id: produce.product_id,
//       minimum_quantity: produce.minimum_quantity || '',
//       minimum_price: produce.minimum_price || ''
//     });
//     setIsFormVisible(true);
//   };

//   const deleteProduce = async (productId) => {
//     if (!window.confirm('Are you sure you want to delete this produce?')) return;
    
//     try {
//       setIsLoading(true);
//       await axios.delete(`http://localhost:5000/api/produces/${productId}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       await loadProduces();
//     } catch (err) {
//       console.error('Failed to delete produce:', err);
//       setError('Failed to delete produce. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Render instructions if showInstructions is true
//   if (showInstructions) {
//     return (
//       <div className="addproduce-instructions">
//         <h2>Instructions for Adding Produce</h2>
//         <div className="instructions-content">
//           <ol>
//             <li>
//               If you add the produce to <strong>KrishiSetu Market</strong>, it will be stored in the KrishiSetu market or warehouses. 
//               If you add the produce to <strong>Bargaining Market</strong>, it will be stored in the bargain marketplace in the consumer 
//               dashboard and it helps for bargaining with consumers.
//             </li>
//             <li>
//               The <strong>minimum price</strong> field is included to remove price conflicts in the bargaining system.
//             </li>
//             <li>
//               For the <strong>Bargaining Market</strong>, the minimum quantity you should add is <strong>10kg</strong>. 
//               This is because to initiate a bargain, the minimum quantity should be 10kg.
//             </li>
//             <li>
//               The minimum price should always be less than the regular price you set for the produce.
//             </li>
//           </ol>
//           <button 
//             className="close-instructions-button"
//             onClick={() => setShowInstructions(false)}
//           >
//             I Understand, Continue to Add Produce
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Regular UI when instructions are closed
//   return (
//     <div className="addproduce-container">
//       <h1>Produces Added to the List</h1>
      
//       {/* Farmer info section */}
//       <div className="farmer-info">
//         {farmerDetails.isLoaded ? (
//           <>
//             {farmerDetails.id && <p>Farmer ID: {farmerDetails.id}</p>}
//             <p>Farmer Name: {farmerDetails.name}</p>
//           </>
//         ) : (
//           <p>Loading farmer information...</p>
//         )}
//       </div>
//       {error && <div className="error-message">{error}</div>}
//       {isLoading && <div className="loading-indicator">Loading...</div>}

//       <div className="addproduce-market-buttons">
//         <button 
//           onClick={() => handleMarketClick('krishisetu')} 
//           className={selectedMarket === 'KrishiSetu Market' ? 'active' : ''}
//           disabled={isLoading}
//         >
//           <img src={KSlogo} alt="KrishiSetu Logo" />
//           KrishiSetu Market
//         </button>
//         <button 
//           onClick={() => handleMarketClick('bargaining')} 
//           className={selectedMarket === 'Bargaining Market' ? 'active' : ''}
//           disabled={isLoading}
//         >
//           <img src={BSimg} alt="Bargaining Logo" />
//           Bargaining Market
//         </button>
//       </div>

//       {selectedMarket && (
//         <>
//           <button 
//             className="addproduce-button" 
//             onClick={() => {
//               setIsFormVisible(!isFormVisible);
//               if (isFormVisible) {
//                 setNewProduce({
//                   produce_name: '',
//                   availability: '',
//                   price_per_kg: '',
//                   produce_type: 'Standard',
//                   market_type: selectedMarket,
//                   minimum_quantity: '',
//                   minimum_price: ''
//                 });
//               }
//             }}
//             disabled={isLoading}
//           >
//             {isFormVisible ? 'Cancel' : 'Add Produce'}
//           </button>

//           {isFormVisible && (
//             <div className="addproduce-form">
//               <h3>{newProduce.id ? 'Edit Produce' : 'Add Produce'} to {selectedMarket}</h3>
//               <form onSubmit={handleSubmit}>
//                 <div>
//                   <label>Produce Name:</label>
//                   <input
//                     type="text"
//                     name="produce_name"
//                     value={newProduce.produce_name}
//                     onChange={handleFormChange}
//                     placeholder="Enter produce name"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Availability (kg):</label>
//                   <input
//                     type="number"
//                     name="availability"
//                     value={newProduce.availability}
//                     onChange={handleFormChange}
//                     placeholder="Enter availability in kg"
//                     min="0.1"
//                     step="0.1"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Price per KG:</label>
//                   <input
//                     type="number"
//                     name="price_per_kg"
//                     value={newProduce.price_per_kg}
//                     onChange={handleFormChange}
//                     placeholder="Enter price per kg"
//                     min="0.01"
//                     step="0.01"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Produce Type:</label>
//                   <select
//                     name="produce_type"
//                     value={newProduce.produce_type}
//                     onChange={handleFormChange}
//                     required
//                     disabled={isLoading}
//                   >
//                     <option value="Standard">Standard</option>
//                     <option value="Organic">Organic</option>
//                   </select>
//                 </div>
                
//                 {selectedMarket === 'Bargaining Market' && (
//                   <>
//                     <div>
//                       <label>Minimum Quantity (kg):</label>
//                       <input
//                         type="number"
//                         name="minimum_quantity"
//                         value={newProduce.minimum_quantity}
//                         onChange={handleFormChange}
//                         placeholder="Minimum 10kg required"
//                         min="10"
//                         step="0.1"
//                         required
//                         disabled={isLoading}
//                       />
//                     </div>
//                     <div>
//                       <label>Minimum Price (per kg):</label>
//                       <input
//                         type="number"
//                         name="minimum_price"
//                         value={newProduce.minimum_price}
//                         onChange={handleFormChange}
//                         placeholder="Enter minimum acceptable price"
//                         min="0.01"
//                         step="0.01"
//                         max={newProduce.price_per_kg ? newProduce.price_per_kg - 0.01 : ''}
//                         required
//                         disabled={isLoading}
//                       />
//                     </div>
//                   </>
//                 )}
                
//                 <button 
//                   type="submit" 
//                   className="addproduce-submit-button"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? 'Saving...' : newProduce.id ? 'Update Produce' : 'Add Produce'}
//                 </button>
//               </form>
//             </div>
//           )}

//           <h3>List of Produces in {selectedMarket}</h3>
//           {produces.length > 0 ? (
//             <table className="addproduce-table">
//               <thead>
//                 <tr>
//                   <th>Produce Name</th>
//                   <th>Type</th>
//                   <th>Availability (kg)</th>
//                   <th>Price per KG</th>
//                   {selectedMarket === 'Bargaining Market' && (
//                     <>
//                       <th>Min Quantity</th>
//                       <th>Min Price</th>
//                     </>
//                   )}
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {produces.map((produce) => (
//                   <tr key={produce.product_id}>
//                     <td>{produce.produce_name}</td>
//                     <td>{produce.produce_type}</td>
//                     <td>{produce.availability} kg</td>
//                     <td>₹{produce.price_per_kg}</td>
//                     {selectedMarket === 'Bargaining Market' && (
//                       <>
//                         <td>{produce.minimum_quantity || 'N/A'} kg</td>
//                         <td>₹{produce.minimum_price || 'N/A'}</td>
//                       </>
//                     )}
//                     <td>
//                       <button
//                         className="addproduce-edit-button"
//                         onClick={() => editProduce(produce)}
//                         disabled={isLoading}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         className="addproduce-remove-button"
//                         onClick={() => deleteProduce(produce.product_id)}
//                         disabled={isLoading}
//                       >
//                         Remove
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No produces added yet for this market.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default AddProduce;
// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import axios from 'axios';
// import './addproduce.css';
// import KSlogo from "../assets/logo.jpg";
// import BSimg from "../assets/bargain.jpeg";
// import { AuthContext } from '../context/AuthContext';

// // Move the helper function outside the component
// const getFarmerName = (farmerData) => {
//   if (!farmerData) return 'Farmer';
//   if (farmerData.full_name) return farmerData.full_name;
//   if (farmerData.first_name && farmerData.last_name) {
//     return `${farmerData.first_name} ${farmerData.last_name}`;
//   }
//   return farmerData.first_name || farmerData.last_name || 'Farmer';
// };

// const AddProduce = () => {
//   // State declarations
//   const [selectedMarket, setSelectedMarket] = useState(null);
//   const [produces, setProduces] = useState([]);
//   const [newProduce, setNewProduce] = useState({
//     produce_name: '',
//     availability: '',
//     price_per_kg: '',
//     produce_type: 'Standard',
//     market_type: '',
//     min_quantity:''
//   });
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
  
//   // Get farmer from AuthContext with proper initialization
//   const authContext = useContext(AuthContext);
//   const farmer = authContext?.farmer || {};
  
//   // State for farmer details with proper initialization
//   const [farmerDetails, setFarmerDetails] = useState({
//     id: '',
//     name: 'Loading...',
//     isLoaded: false
//   });

//   // Effect to update farmer details when context changes
//   useEffect(() => {
//     if (authContext?.farmer) {
//       setFarmerDetails({
//         id: authContext.farmer.farmer_id || '',
//         name: getFarmerName(authContext.farmer),
//         isLoaded: true
//       });
//     } else {
//       setFarmerDetails({
//         id: '',
//         name: 'Loading...',
//         isLoaded: false
//       });
//     }
//   }, [authContext?.farmer]);
  

//   const loadProduces = useCallback(async () => {
//     if (!selectedMarket || !farmerDetails.id || !farmerDetails.isLoaded) return;
    
//     try {
//       setIsLoading(true);
//       const response = await axios.get(`http://localhost:5000/api/produces`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         params: {
//           farmer_id: farmerDetails.id,
//           market_type: selectedMarket
//         }
//       });
//       setProduces(response.data);
//       setError('');
//     } catch (err) {
//       console.error('Failed to fetch produces:', err);
//       setError('Failed to load produces. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedMarket, farmerDetails.id, farmerDetails.isLoaded]);

//   useEffect(() => {
//     loadProduces();
//   }, [loadProduces]);

//   const handleMarketClick = (market) => {
//     const marketType = market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market';
//     setSelectedMarket(marketType);
//     setIsFormVisible(false);
//     setError('');
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setNewProduce({
//       ...newProduce,
//       [name]: value,
//       market_type: selectedMarket
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
    
//     if (!newProduce.produce_name || !newProduce.availability || !newProduce.price_per_kg) {
//       setError('Please fill all the fields');
//       return;
//     }
  
//     if (isNaN(newProduce.availability)) {
//       setError('Availability must be a number');
//       return;
//     }
  
//     if (isNaN(newProduce.price_per_kg)) {
//       setError('Price must be a valid number');
//       return;
//     }

//     if (!farmer?.farmer_id) {
//       setError('Farmer information not available. Please log in again.');
//       return;
//     }
  
//     try {
//       setIsLoading(true);
//       const produceData = {
//         ...newProduce,
//         farmer_id: farmer.farmer_id,
//         farmer_name: farmer.full_name || `${farmer.first_name} ${farmer.last_name}`,
//         email: farmer.email,
//         availability: parseFloat(newProduce.availability),
//         price_per_kg: parseFloat(newProduce.price_per_kg),
//         market_type: selectedMarket
//       };

//       const config = {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       };

//       if (newProduce.id) {
//         await axios.put(
//           `http://localhost:5000/api/produces/${newProduce.id}`,
//           produceData,
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//           }
//         );
//       } else {
//         await axios.post(
//           'http://localhost:5000/api/produces',
//           produceData,
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//           }
//       )};

//       await loadProduces();
//       setNewProduce({
//         produce_name: '',
//         availability: '',
//         price_per_kg: '',
//         produce_type: 'Standard',
//         market_type: selectedMarket
//       });
//       setIsFormVisible(false);
//     } catch (err) {
//       console.error('Failed to save produce:', err);
//       setError(err.response?.data?.error || 'Failed to save produce. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const editProduce = (produce) => {
//     setNewProduce({
//       ...produce,
//       id: produce.product_id
//     });
//     setIsFormVisible(true);
//   };

//   const deleteProduce = async (productId) => {
//     if (!window.confirm('Are you sure you want to delete this produce?')) return;
    
//     try {
//       setIsLoading(true);
//       await axios.delete(`http://localhost:5000/api/produces/${productId}`,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         }
//       );
//       await loadProduces();
//     } catch (err) {
//       console.error('Failed to delete produce:', err);
//       setError('Failed to delete produce. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="addproduce-container">
//       <h1>Produces Added to the List</h1>
      
//       {/* Farmer info section */}
//       <div className="farmer-info">
//         {farmerDetails.isLoaded ? (
//           <>
//             {farmerDetails.id && <p>Farmer ID: {farmerDetails.id}</p>}
//             <p>Farmer Name: {farmerDetails.name}</p>
//           </>
//         ) : (
//           <p>Loading farmer information...</p>
//         )}
//       </div>
//       {error && <div className="error-message">{error}</div>}
//       {isLoading && <div className="loading-indicator">Loading...</div>}

//       <div className="addproduce-market-buttons">
//         <button 
//           onClick={() => handleMarketClick('krishisetu')} 
//           className={selectedMarket === 'KrishiSetu Market' ? 'active' : ''}
//           disabled={isLoading}
//         >
//           <img src={KSlogo} alt="KrishiSetu Logo" />
//           KrishiSetu Market
//         </button>
//         <button 
//           onClick={() => handleMarketClick('bargaining')} 
//           className={selectedMarket === 'Bargaining Market' ? 'active' : ''}
//           disabled={isLoading}
//         >
//           <img src={BSimg} alt="Bargaining Logo" />
//           Bargaining System
//         </button>
//       </div>

//       {selectedMarket && (
//         <>
//           <button 
//             className="addproduce-button" 
//             onClick={() => {
//               setIsFormVisible(!isFormVisible);
//               if (isFormVisible) {
//                 setNewProduce({
//                   produce_name: '',
//                   availability: '',
//                   price_per_kg: '',
//                   produce_type: 'Standard',
//                   market_type: selectedMarket
//                 });
//               }
//             }}
//             disabled={isLoading}
//           >
//             {isFormVisible ? 'Cancel' : 'Add Produce'}
//           </button>

//           {isFormVisible && (
//             <div className="addproduce-form">
//               <h3>{newProduce.id ? 'Edit Produce' : 'Add Produce'} to {selectedMarket}</h3>
//               <form onSubmit={handleSubmit}>
//                 <div>
//                   <label>Produce Name:</label>
//                   <input
//                     type="text"
//                     name="produce_name"
//                     value={newProduce.produce_name}
//                     onChange={handleFormChange}
//                     placeholder="Enter produce name"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Availability (kg):</label>
//                   <input
//                     type="number"
//                     name="availability"
//                     value={newProduce.availability}
//                     onChange={handleFormChange}
//                     placeholder="Enter availability in kg"
//                     min="0.1"
//                     step="0.1"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Price per KG:</label>
//                   <input
//                     type="number"
//                     name="price_per_kg"
//                     value={newProduce.price_per_kg}
//                     onChange={handleFormChange}
//                     placeholder="Enter price per kg"
//                     min="0.01"
//                     step="0.01"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Produce Type:</label>
//                   <select
//                     name="produce_type"
//                     value={newProduce.produce_type}
//                     onChange={handleFormChange}
//                     required
//                     disabled={isLoading}
//                   >
//                     <option value="Standard">Standard</option>
//                     <option value="Organic">Organic</option>
//                   </select>
//                 </div>
//                 <button 
//                   type="submit" 
//                   className="addproduce-submit-button"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? 'Saving...' : newProduce.id ? 'Update Produce' : 'Add Produce'}
//                 </button>
//               </form>
//             </div>
//           )}

//           <h3>List of Produces in {selectedMarket}</h3>
//           {produces.length > 0 ? (
//             <table className="addproduce-table">
//               <thead>
//                 <tr>
//                   <th>Produce Name</th>
//                   <th>Type</th>
//                   <th>Availability (kg)</th>
//                   <th>Price per KG</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {produces.map((produce) => (
//                   <tr key={produce.product_id}>
//                     <td>{produce.produce_name}</td>
//                     <td>{produce.produce_type}</td>
//                     <td>{produce.availability} kg</td>
//                     <td>₹{produce.price_per_kg}</td>
//                     <td>
//                       <button
//                         className="addproduce-edit-button"
//                         onClick={() => editProduce(produce)}
//                         disabled={isLoading}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         className="addproduce-remove-button"
//                         onClick={() => deleteProduce(produce.product_id)}
//                         disabled={isLoading}
//                       >
//                         Remove
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No produces added yet for this market.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default AddProduce;
///old one
// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import axios from 'axios';
// import './addproduce.css';
// import KSlogo from "../assets/logo.jpg";
// import BSimg from "../assets/bargain.jpeg";
// import { AuthContext } from '../context/AuthContext';

// // Move the helper function outside the component
// const getFarmerName = (farmerData) => {
//   if (!farmerData) return 'Farmer';
//   if (farmerData.full_name) return farmerData.full_name;
//   if (farmerData.first_name && farmerData.last_name) {
//     return `${farmerData.first_name} ${farmerData.last_name}`;
//   }
//   return farmerData.first_name || farmerData.last_name || 'Farmer';
// };

// const AddProduce = () => {
//   // State declarations
//   const [selectedMarket, setSelectedMarket] = useState(null);
//   const [produces, setProduces] = useState([]);
//   const [newProduce, setNewProduce] = useState({
//     produce_name: '',
//     availability: '',
//     price_per_kg: '',
//     produce_type: 'Standard',
//     market_type: '',
//     minimum_quantity: '',
//     minimum_price: '' 
//   });
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showInstructions, setShowInstructions] = useState(true); // New state for instructions
  
//   // Get farmer from AuthContext with proper initialization
//   const authContext = useContext(AuthContext);
//   const farmer = authContext?.farmer || {};
  
//   // State for farmer details with proper initialization
//   const [farmerDetails, setFarmerDetails] = useState({
//     id: '',
//     name: 'Loading...',
//     isLoaded: false
//   });

//   // Effect to update farmer details when context changes
//   useEffect(() => {
//     if (authContext?.farmer) {
//       setFarmerDetails({
//         id: authContext.farmer.farmer_id || '',
//         name: getFarmerName(authContext.farmer),
//         isLoaded: true
//       });
//     } else {
//       setFarmerDetails({
//         id: '',
//         name: 'Loading...',
//         isLoaded: false
//       });
//     }
//   }, [authContext?.farmer]);

//   const loadProduces = useCallback(async () => {
//     if (!selectedMarket || !farmerDetails.id || !farmerDetails.isLoaded) return;
    
//     try {
//       setIsLoading(true);
//       const response = await axios.get(`http://localhost:5000/api/produces`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         params: {
//           farmer_id: farmerDetails.id,
//           market_type: selectedMarket
//         }
//       });
//       setProduces(response.data);
//       setError('');
//     } catch (err) {
//       console.error('Failed to fetch produces:', err);
//       setError('Failed to load produces. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedMarket, farmerDetails.id, farmerDetails.isLoaded]);

//   useEffect(() => {
//     loadProduces();
//   }, [loadProduces]);

//   const handleMarketClick = (market) => {
//     const marketType = market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market';
//     setSelectedMarket(marketType);
//     setIsFormVisible(false);
//     setError('');
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setNewProduce({
//       ...newProduce,
//       [name]: value,
//       market_type: selectedMarket
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
    
//     // Basic validation
//     if (!newProduce.produce_name || !newProduce.availability || !newProduce.price_per_kg) {
//       setError('Please fill all the fields');
//       return;
//     }
  
//     if (isNaN(newProduce.availability)) {
//       setError('Availability must be a number');
//       return;
//     }
  
//     if (isNaN(newProduce.price_per_kg)) {
//       setError('Price must be a valid number');
//       return;
//     }

//     // Additional validation for Bargaining Market
//     if (selectedMarket === 'Bargaining Market') {
//       if (!newProduce.minimum_quantity) {
//         setError('Minimum quantity is required for Bargaining Market');
//         return;
//       }
      
//       if (isNaN(newProduce.minimum_quantity)) {
//         setError('Minimum quantity must be a number');
//         return;
//       }
      
//       if (parseFloat(newProduce.minimum_quantity) < 10) { // Changed to 10kg minimum
//         setError('Minimum quantity must be at least 10kg for Bargaining Market');
//         return;
//       }

//       if (!newProduce.minimum_price) {
//         setError('Minimum price is required for Bargaining Market');
//         return;
//       }
      
//       if (isNaN(newProduce.minimum_price)) {
//         setError('Minimum price must be a valid number');
//         return;
//       }
      
//       if (parseFloat(newProduce.minimum_price) <= 0) {
//         setError('Minimum price must be greater than 0');
//         return;
//       }

//       if (parseFloat(newProduce.minimum_price) >= parseFloat(newProduce.price_per_kg)) {
//         setError('Minimum price must be less than the regular price');
//         return;
//       }
//     }

//     if (!farmer?.farmer_id) {
//       setError('Farmer information not available. Please log in again.');
//       return;
//     }
  
//     try {
//       setIsLoading(true);
//       const produceData = {
//         ...newProduce,
//         farmer_id: farmer.farmer_id,
//         farmer_name: farmer.full_name || `${farmer.first_name} ${farmer.last_name}`,
//         email: farmer.email,
//         availability: parseFloat(newProduce.availability),
//         price_per_kg: parseFloat(newProduce.price_per_kg),
//         market_type: selectedMarket,
//         ...(selectedMarket === 'Bargaining Market' && {
//           minimum_quantity: parseFloat(newProduce.minimum_quantity),
//           minimum_price: parseFloat(newProduce.minimum_price)
//         })
//       };

//       const config = {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       };

//       if (newProduce.id) {
//         await axios.put(
//           `http://localhost:5000/api/produces/${newProduce.id}`,
//           produceData,
//           config
//         );
//       } else {
//         await axios.post(
//           'http://localhost:5000/api/produces',
//           produceData,
//           config
//         );
//       }

//       await loadProduces();
//       setNewProduce({
//         produce_name: '',
//         availability: '',
//         price_per_kg: '',
//         produce_type: 'Standard',
//         market_type: selectedMarket,
//         minimum_quantity: '',
//         minimum_price: ''
//       });
//       setIsFormVisible(false);
//     } catch (err) {
//       console.error('Failed to save produce:', err);
//       setError(err.response?.data?.error || 'Failed to save produce. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const editProduce = (produce) => {
//     setNewProduce({
//       ...produce,
//       id: produce.product_id,
//       minimum_quantity: produce.minimum_quantity || '',
//       minimum_price: produce.minimum_price || ''
//     });
//     setIsFormVisible(true);
//   };

//   const deleteProduce = async (productId) => {
//     if (!window.confirm('Are you sure you want to delete this produce?')) return;
    
//     try {
//       setIsLoading(true);
//       await axios.delete(`http://localhost:5000/api/produces/${productId}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       await loadProduces();
//     } catch (err) {
//       console.error('Failed to delete produce:', err);
//       setError('Failed to delete produce. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Render instructions if showInstructions is true
//   if (showInstructions) {
//     return (
//       <div className="addproduce-instructions">
//         <h2>Instructions for Adding Produce</h2>
//         <div className="instructions-content">
//           <ol>
//             <li>
//               If you add the produce to <strong>KrishiSetu Market</strong>, it will be stored in the KrishiSetu market or warehouses. 
//               If you add the produce to <strong>Bargaining Market</strong>, it will be stored in the bargain marketplace in the consumer 
//               dashboard and it helps for bargaining with consumers.
//             </li>
//             <li>
//               The <strong>minimum price</strong> field is included to remove price conflicts in the bargaining system.
//             </li>
//             <li>
//               For the <strong>Bargaining Market</strong>, the minimum quantity you should add is <strong>10kg</strong>. 
//               This is because to initiate a bargain, the minimum quantity should be 10kg.
//             </li>
//             <li>
//               The minimum price should always be less than the regular price you set for the produce.
//             </li>
//           </ol>
//           <button 
//             className="close-instructions-button"
//             onClick={() => setShowInstructions(false)}
//           >
//             I Understand, Continue to Add Produce
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Regular UI when instructions are closed
//   return (
//     <div className="addproduce-container">
//       <h1>Produces Added to the List</h1>
      
//       {/* Farmer info section */}
//       <div className="farmer-info">
//         {farmerDetails.isLoaded ? (
//           <>
//             {farmerDetails.id && <p>Farmer ID: {farmerDetails.id}</p>}
//             <p>Farmer Name: {farmerDetails.name}</p>
//           </>
//         ) : (
//           <p>Loading farmer information...</p>
//         )}
//       </div>
//       {error && <div className="error-message">{error}</div>}
//       {isLoading && <div className="loading-indicator">Loading...</div>}

//       <div className="addproduce-market-buttons">
//         <button 
//           onClick={() => handleMarketClick('krishisetu')} 
//           className={selectedMarket === 'KrishiSetu Market' ? 'active' : ''}
//           disabled={isLoading}
//         >
//           <img src={KSlogo} alt="KrishiSetu Logo" />
//           KrishiSetu Market
//         </button>
//         <button 
//           onClick={() => handleMarketClick('bargaining')} 
//           className={selectedMarket === 'Bargaining Market' ? 'active' : ''}
//           disabled={isLoading}
//         >
//           <img src={BSimg} alt="Bargaining Logo" />
//           Bargaining Market
//         </button>
//       </div>

//       {selectedMarket && (
//         <>
//           <button 
//             className="addproduce-button" 
//             onClick={() => {
//               setIsFormVisible(!isFormVisible);
//               if (isFormVisible) {
//                 setNewProduce({
//                   produce_name: '',
//                   availability: '',
//                   price_per_kg: '',
//                   produce_type: 'Standard',
//                   market_type: selectedMarket,
//                   minimum_quantity: '',
//                   minimum_price: ''
//                 });
//               }
//             }}
//             disabled={isLoading}
//           >
//             {isFormVisible ? 'Cancel' : 'Add Produce'}
//           </button>

//           {isFormVisible && (
//             <div className="addproduce-form">
//               <h3>{newProduce.id ? 'Edit Produce' : 'Add Produce'} to {selectedMarket}</h3>
//               <form onSubmit={handleSubmit}>
//                 <div>
//                   <label>Produce Name:</label>
//                   <input
//                     type="text"
//                     name="produce_name"
//                     value={newProduce.produce_name}
//                     onChange={handleFormChange}
//                     placeholder="Enter produce name"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Availability (kg):</label>
//                   <input
//                     type="number"
//                     name="availability"
//                     value={newProduce.availability}
//                     onChange={handleFormChange}
//                     placeholder="Enter availability in kg"
//                     min="0.1"
//                     step="0.1"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Price per KG:</label>
//                   <input
//                     type="number"
//                     name="price_per_kg"
//                     value={newProduce.price_per_kg}
//                     onChange={handleFormChange}
//                     placeholder="Enter price per kg"
//                     min="0.01"
//                     step="0.01"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Produce Type:</label>
//                   <select
//                     name="produce_type"
//                     value={newProduce.produce_type}
//                     onChange={handleFormChange}
//                     required
//                     disabled={isLoading}
//                   >
//                     <option value="Standard">Standard</option>
//                     <option value="Organic">Organic</option>
//                   </select>
//                 </div>
                
//                 {selectedMarket === 'Bargaining Market' && (
//                   <>
//                     <div>
//                       <label>Minimum Quantity (kg):</label>
//                       <input
//                         type="number"
//                         name="minimum_quantity"
//                         value={newProduce.minimum_quantity}
//                         onChange={handleFormChange}
//                         placeholder="Minimum 10kg required"
//                         min="10"
//                         step="0.1"
//                         required
//                         disabled={isLoading}
//                       />
//                     </div>
//                     <div>
//                       <label>Minimum Price (per kg):</label>
//                       <input
//                         type="number"
//                         name="minimum_price"
//                         value={newProduce.minimum_price}
//                         onChange={handleFormChange}
//                         placeholder="Enter minimum acceptable price"
//                         min="0.01"
//                         step="0.01"
//                         max={newProduce.price_per_kg ? newProduce.price_per_kg - 0.01 : ''}
//                         required
//                         disabled={isLoading}
//                       />
//                     </div>
//                   </>
//                 )}
                
//                 <button 
//                   type="submit" 
//                   className="addproduce-submit-button"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? 'Saving...' : newProduce.id ? 'Update Produce' : 'Add Produce'}
//                 </button>
//               </form>
//             </div>
//           )}

//           <h3>List of Produces in {selectedMarket}</h3>
//           {produces.length > 0 ? (
//             <table className="addproduce-table">
//               <thead>
//                 <tr>
//                   <th>Produce Name</th>
//                   <th>Type</th>
//                   <th>Availability (kg)</th>
//                   <th>Price per KG</th>
//                   {selectedMarket === 'Bargaining Market' && (
//                     <>
//                       <th>Min Quantity</th>
//                       <th>Min Price</th>
//                     </>
//                   )}
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {produces.map((produce) => (
//                   <tr key={produce.product_id}>
//                     <td>{produce.produce_name}</td>
//                     <td>{produce.produce_type}</td>
//                     <td>{produce.availability} kg</td>
//                     <td>₹{produce.price_per_kg}</td>
//                     {selectedMarket === 'Bargaining Market' && (
//                       <>
//                         <td>{produce.minimum_quantity || 'N/A'} kg</td>
//                         <td>₹{produce.minimum_price || 'N/A'}</td>
//                       </>
//                     )}
//                     <td>
//                       <button
//                         className="addproduce-edit-button"
//                         onClick={() => editProduce(produce)}
//                         disabled={isLoading}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         className="addproduce-remove-button"
//                         onClick={() => deleteProduce(produce.product_id)}
//                         disabled={isLoading}
//                       >
//                         Remove
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No produces added yet for this market.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default AddProduce;


// import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
// import axios from 'axios';
// import './addproduce.css';
// import KSlogo from "../assets/logo.jpg";
// import BSimg from "../assets/bargain.jpeg";
// import { AuthContext } from '../context/AuthContext';
// import micIcon from '../assets/microphone.png'; // Add a microphone icon

// // Helper function to get farmer name
// const getFarmerName = (farmerData) => {
//   if (!farmerData) return 'Farmer';
//   if (farmerData.full_name) return farmerData.full_name;
//   if (farmerData.first_name && farmerData.last_name) {
//     return `${farmerData.first_name} ${farmerData.last_name}`;
//   }
//   return farmerData.first_name || farmerData.last_name || 'Farmer';
// };

// // Voice command processor
// const processVoiceCommand = (command, currentState) => {
//   command = command.toLowerCase().trim();
//   const words = command.split(' ');
  
//   // Market selection commands
//   if (command.includes('krishisetu market') || command.includes('krishi setu market')) {
//     return { action: 'selectMarket', market: 'krishisetu' };
//   }
//   if (command.includes('bargaining market') || command.includes('bargain market')) {
//     return { action: 'selectMarket', market: 'bargaining' };
//   }
  
//   // Form commands
//   if (command.includes('add produce') || command.includes('new produce')) {
//     return { action: 'toggleForm', visible: true };
//   }
//   if (command.includes('cancel') || command.includes('close form')) {
//     return { action: 'toggleForm', visible: false };
//   }
  
//   // Form field commands
//   if (command.includes('produce name')) {
//     const name = command.replace('produce name', '').trim();
//     if (name) return { action: 'setField', field: 'produce_name', value: name };
//   }
//   if (command.includes('availability')) {
//     const match = command.match(/(\d+(\.\d+)?)\s*(kg|kilo|kilos|kilograms?)?/);
//     if (match) return { action: 'setField', field: 'availability', value: match[1] };
//   }
//   if (command.includes('price') || command.includes('rate')) {
//     const match = command.match(/(\d+(\.\d+)?)\s*(rs|rupees?|inr)?/);
//     if (match) return { action: 'setField', field: 'price_per_kg', value: match[1] };
//   }
//   if (command.includes('minimum quantity')) {
//     const match = command.match(/(\d+(\.\d+)?)\s*(kg|kilo|kilos|kilograms?)?/);
//     if (match) return { action: 'setField', field: 'minimum_quantity', value: match[1] };
//   }
//   if (command.includes('minimum price')) {
//     const match = command.match(/(\d+(\.\d+)?)\s*(rs|rupees?|inr)?/);
//     if (match) return { action: 'setField', field: 'minimum_price', value: match[1] };
//   }
//   if (command.includes('produce type')) {
//     if (command.includes('organic')) return { action: 'setField', field: 'produce_type', value: 'Organic' };
//     if (command.includes('standard')) return { action: 'setField', field: 'produce_type', value: 'Standard' };
//   }
  
//   // Form submission
//   if (command.includes('submit') || command.includes('save') || command.includes('add')) {
//     return { action: 'submitForm' };
//   }
  
//   // Edit commands
//   const editMatch = command.match(/edit\s+(.+)/);
//   if (editMatch) {
//     const produceName = editMatch[1].trim();
//     const produce = currentState.produces.find(p => 
//       p.produce_name.toLowerCase().includes(produceName.toLowerCase())
//     );
//     if (produce) return { action: 'editProduce', produce };
//   }
  
//   // Delete commands
//   const deleteMatch = command.match(/delete\s+(.+)/);
//   if (deleteMatch) {
//     const produceName = deleteMatch[1].trim();
//     const produce = currentState.produces.find(p => 
//       p.produce_name.toLowerCase().includes(produceName.toLowerCase())
//     );
//     if (produce) return { action: 'deleteProduce', produceId: produce.product_id };
//   }
  
//   // Help commands
//   if (command.includes('help') || command.includes('instructions')) {
//     return { action: 'showInstructions' };
//   }
  
//   return { action: 'unknown' };
// };

// const AddProduce = () => {
//   // State declarations
//   const [selectedMarket, setSelectedMarket] = useState(null);
//   const [produces, setProduces] = useState([]);
//   const [newProduce, setNewProduce] = useState({
//     produce_name: '',
//     availability: '',
//     price_per_kg: '',
//     produce_type: 'Standard',
//     market_type: '',
//     minimum_quantity: '',
//     minimum_price: '' 
//   });
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [lastCommand, setLastCommand] = useState('');
//   const [showInstructions, setShowInstructions] = useState(true);
//   const [isListening, setIsListening] = useState(false);
//   const [voiceFeedback, setVoiceFeedback] = useState('');
//   const [commandFeedback, setCommandFeedback] = useState('');
//   const recognitionRef = useRef(null);
  
//   // Get farmer from AuthContext
//   const authContext = useContext(AuthContext);
//   const farmer = authContext?.farmer || {};
  
//   // State for farmer details
//   const [farmerDetails, setFarmerDetails] = useState({
//     id: '',
//     name: 'Loading...',
//     isLoaded: false
//   });

//   // Initialize speech recognition
//   const initSpeechRecognition = useCallback(() => {
//     if (!('webkitSpeechRecognition' in window)) {
//       console.warn('Speech recognition not supported');
//       return false;
//     }
    
//     const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
//     recognitionRef.current = new SpeechRecognition();
//     recognitionRef.current.continuous = true;
//     recognitionRef.current.interimResults = true;
//     recognitionRef.current.lang = 'en-IN';
    
//     recognitionRef.current.onresult = (event) => {
//       const transcript = Array.from(event.results)
//         .map(result => result[0])
//         .map(result => result.transcript)
//         .join('');
      
//       setVoiceFeedback(transcript);
      
//       if (event.results[0].isFinal) {
//         const command = processVoiceCommand(transcript, {
//           produces,
//           selectedMarket,
//           isFormVisible,
//           newProduce
//         });
        
//         handleVoiceCommand(command);
//         setLastCommand(transcript);
//         setVoiceFeedback('');
//       }
//     };
    
//     recognitionRef.current.onerror = (event) => {
//       console.error('Speech recognition error', event.error);
//       setIsListening(false);
//       setError(`Voice command error: ${event.error}`);
//       // Attempt to restart if it was a no-speech error
//       if (event.error === 'no-speech' && isListening) {
//         setTimeout(() => recognitionRef.current.start(), 500);
//       }
//     };
    
//     recognitionRef.current.onend = () => {
//       if (isListening) {
//         setTimeout(() => recognitionRef.current.start(), 100);
//       }
//     };
    
//     return true;
//   }, [produces, selectedMarket, isFormVisible, newProduce, isListening]);


//   // Effect to update farmer details when context changes
//   useEffect(() => {
//     if (authContext?.farmer) {
//       setFarmerDetails({
//         id: authContext.farmer.farmer_id || '',
//         name: getFarmerName(authContext.farmer),
//         isLoaded: true
//       });
//     } else {
//       setFarmerDetails({
//         id: '',
//         name: 'Loading...',
//         isLoaded: false
//       });
//     }
//   }, [authContext?.farmer]);

//   useEffect(() => {
//     const isSupported = initSpeechRecognition();
//     return () => {
//       if (isSupported && recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, [initSpeechRecognition]);

//   const loadProduces = useCallback(async () => {
//     if (!selectedMarket || !farmerDetails.id || !farmerDetails.isLoaded) return;
    
//     try {
//       setIsLoading(true);
//       const response = await axios.get(`http://localhost:5000/api/produces`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         params: {
//           farmer_id: farmerDetails.id,
//           market_type: selectedMarket
//         }
//       });
//       setProduces(response.data);
//       setError('');
//     } catch (err) {
//       console.error('Failed to fetch produces:', err);
//       setError('Failed to load produces. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedMarket, farmerDetails.id, farmerDetails.isLoaded]);
//   useEffect(() => {
//     loadProduces();
//   }, [loadProduces]);

//   const toggleVoiceRecognition = () => {
//     if (isListening) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//       setCommandFeedback('Voice commands turned off');
//       setTimeout(() => setCommandFeedback(''), 3000);
//     } else {
//       try {
//         recognitionRef.current.start();
//         setIsListening(true);
//         setError('');
//         setCommandFeedback('Listening... Speak now');
//         setTimeout(() => setCommandFeedback(''), 3000);
//       } catch (err) {
//         console.error('Failed to start recognition:', err);
//         setError('Failed to start voice recognition. Please refresh and try again.');
//       }
//     }
//   };

//   const handleVoiceCommand = (command) => {
//     let feedback = '';
    
//     switch (command.action) {
//       case 'selectMarket':
//         handleMarketClick(command.market);
//         feedback = `Switched to ${command.market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market'}`;
//         break;
        
//       case 'toggleForm':
//         setIsFormVisible(command.visible);
//         if (!command.visible) {
//           setNewProduce({
//             produce_name: '',
//             availability: '',
//             price_per_kg: '',
//             produce_type: 'Standard',
//             market_type: selectedMarket,
//             minimum_quantity: '',
//             minimum_price: ''
//           });
//         }
//         feedback = command.visible ? 'Add produce form opened' : 'Form closed';
//         break;
        
//       case 'setField':
//         setNewProduce(prev => ({
//           ...prev,
//           [command.field]: command.value,
//           market_type: selectedMarket
//         }));
//         feedback = `Set ${command.field.replace('_', ' ')} to ${command.value}`;
//         break;
        
//       case 'submitForm':
//         handleSubmit({ preventDefault: () => {} });
//         feedback = 'Submitting produce...';
//         break;
        
//       case 'editProduce':
//         editProduce(command.produce);
//         feedback = `Editing ${command.produce.produce_name}`;
//         break;
        
//       case 'confirmDelete':
//         setCommandFeedback(`Are you sure you want to delete ${command.produceName}? Say "confirm delete" to proceed.`);
//         setTimeout(() => {
//           if (commandFeedback.includes('confirm delete')) {
//             deleteProduce(command.produceId);
//           } else {
//             setCommandFeedback('Delete cancelled');
//             setTimeout(() => setCommandFeedback(''), 2000);
//           }
//         }, 5000);
//         return;
        
//       case 'showInstructions':
//         setShowInstructions(true);
//         feedback = 'Showing instructions';
//         break;
        
//       case 'unknown':
//         feedback = `Sorry, I didn't understand "${command.command}". Try saying "help" for instructions.`;
//         break;
        
//       default:
//         feedback = 'Please try your command again';
//     }
    
//     setCommandFeedback(feedback);
//     setTimeout(() => setCommandFeedback(''), 3000);
//   };

//   const handleMarketClick = (market) => {
//     const marketType = market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market';
//     setSelectedMarket(marketType);
//     setIsFormVisible(false);
//     setError('');
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setNewProduce({
//       ...newProduce,
//       [name]: value,
//       market_type: selectedMarket
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
    
//     // Basic validation
//     if (!newProduce.produce_name || !newProduce.availability || !newProduce.price_per_kg) {
//       setError('Please fill all the fields');
//       return;
//     }
  
//     if (isNaN(newProduce.availability)) {
//       setError('Availability must be a number');
//       return;
//     }
  
//     if (isNaN(newProduce.price_per_kg)) {
//       setError('Price must be a valid number');
//       return;
//     }

//     // Additional validation for Bargaining Market
//     if (selectedMarket === 'Bargaining Market') {
//       if (!newProduce.minimum_quantity) {
//         setError('Minimum quantity is required for Bargaining Market');
//         return;
//       }
      
//       if (isNaN(newProduce.minimum_quantity)) {
//         setError('Minimum quantity must be a number');
//         return;
//       }
      
//       if (parseFloat(newProduce.minimum_quantity) < 10) {
//         setError('Minimum quantity must be at least 10kg for Bargaining Market');
//         return;
//       }

//       if (!newProduce.minimum_price) {
//         setError('Minimum price is required for Bargaining Market');
//         return;
//       }
      
//       if (isNaN(newProduce.minimum_price)) {
//         setError('Minimum price must be a valid number');
//         return;
//       }
      
//       if (parseFloat(newProduce.minimum_price) <= 0) {
//         setError('Minimum price must be greater than 0');
//         return;
//       }

//       if (parseFloat(newProduce.minimum_price) >= parseFloat(newProduce.price_per_kg)) {
//         setError('Minimum price must be less than the regular price');
//         return;
//       }
//     }

//     if (!farmer?.farmer_id) {
//       setError('Farmer information not available. Please log in again.');
//       return;
//     }
  
//     try {
//       setIsLoading(true);
//       const produceData = {
//         ...newProduce,
//         farmer_id: farmer.farmer_id,
//         farmer_name: farmer.full_name || `${farmer.first_name} ${farmer.last_name}`,
//         email: farmer.email,
//         availability: parseFloat(newProduce.availability),
//         price_per_kg: parseFloat(newProduce.price_per_kg),
//         market_type: selectedMarket,
//         ...(selectedMarket === 'Bargaining Market' && {
//           minimum_quantity: parseFloat(newProduce.minimum_quantity),
//           minimum_price: parseFloat(newProduce.minimum_price)
//         })
//       };

//       const config = {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       };

//       if (newProduce.id) {
//         await axios.put(
//           `http://localhost:5000/api/produces/${newProduce.id}`,
//           produceData,
//           config
//         );
//       } else {
//         await axios.post(
//           'http://localhost:5000/api/produces',
//           produceData,
//           config
//         );
//       }

//       await loadProduces();
//       setNewProduce({
//         produce_name: '',
//         availability: '',
//         price_per_kg: '',
//         produce_type: 'Standard',
//         market_type: selectedMarket,
//         minimum_quantity: '',
//         minimum_price: ''
//       });
//       setIsFormVisible(false);
//     } catch (err) {
//       console.error('Failed to save produce:', err);
//       setError(err.response?.data?.error || 'Failed to save produce. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const editProduce = (produce) => {
//     setNewProduce({
//       ...produce,
//       id: produce.product_id,
//       minimum_quantity: produce.minimum_quantity || '',
//       minimum_price: produce.minimum_price || ''
//     });
//     setIsFormVisible(true);
//   };

//   const deleteProduce = async (productId) => {
//     try {
//       setIsLoading(true);
//       await axios.delete(`http://localhost:5000/api/produces/${productId}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       await loadProduces();
//     } catch (err) {
//       console.error('Failed to delete produce:', err);
//       setError('Failed to delete produce. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Render instructions if showInstructions is true
//   if (showInstructions) {
//     return (
//       <div className="addproduce-instructions">
//         <h2>Instructions for Adding Produce</h2>
//         <div className="instructions-content">
//           <h3>General Instructions</h3>
//           <ol>
//             <li>
//               If you add the produce to <strong>KrishiSetu Market</strong>, it will be stored in the KrishiSetu market or warehouses. 
//               If you add the produce to <strong>Bargaining Market</strong>, it will be stored in the bargain marketplace in the consumer 
//               dashboard and it helps for bargaining with consumers.
//             </li>
//             <li>
//               The <strong>minimum price</strong> field is included to remove price conflicts in the bargaining system.
//             </li>
//             <li>
//               For the <strong>Bargaining Market</strong>, the minimum quantity you should add is <strong>10kg</strong>. 
//               This is because to initiate a bargain, the minimum quantity should be 10kg.
//             </li>
//             <li>
//               The minimum price should always be less than the regular price you set for the produce.
//             </li>
//           </ol>
          
//           <h3>Voice Command Instructions</h3>
//           <ol>
//             <li><strong>"KrishiSetu Market"</strong> - Switch to KrishiSetu Market</li>
//             <li><strong>"Bargaining Market"</strong> - Switch to Bargaining Market</li>
//             <li><strong>"Add produce"</strong> - Open the add produce form</li>
//             <li><strong>"Cancel"</strong> - Close the form</li>
//             <li><strong>"Produce name [name]"</strong> - Set produce name</li>
//             <li><strong>"Availability [number] kg"</strong> - Set availability</li>
//             <li><strong>"Price [number] rupees"</strong> - Set price per kg</li>
//             <li><strong>"Minimum quantity [number] kg"</strong> - Set minimum quantity</li>
//             <li><strong>"Minimum price [number] rupees"</strong> - Set minimum price</li>
//             <li><strong>"Produce type organic"</strong> - Set produce type to organic</li>
//             <li><strong>"Produce type standard"</strong> - Set produce type to standard</li>
//             <li><strong>"Submit"</strong> - Submit the form</li>
//             <li><strong>"Edit [produce name]"</strong> - Edit a produce</li>
//             <li><strong>"Delete [produce name]"</strong> - Delete a produce</li>
//           </ol>
          
//           <button 
//             className="close-instructions-button"
//             onClick={() => setShowInstructions(false)}
//           >
//             I Understand, Continue to Add Produce
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Regular UI when instructions are closed

//     return (
//       <div className="addproduce-container">
//         <h1>Produces Added to the List</h1>
        
//         {/* Enhanced voice controls */}
//         <div className="voice-controls">
//           <button 
//             onClick={toggleVoiceRecognition}
//             className={`voice-button ${isListening ? 'listening' : ''}`}
//             disabled={!('webkitSpeechRecognition' in window)}
//           >
//             <img src={micIcon} alt="Microphone" />
//             {isListening ? 'Listening... (Click to Stop)' : 'Start Voice Commands'}
//           </button>
          
//           <div className="voice-feedback-container">
//             {voiceFeedback && (
//               <div className="voice-feedback">
//                 <p>You said: <strong>{voiceFeedback}</strong></p>
//               </div>
//             )}
//             {commandFeedback && (
//               <div className="command-feedback">
//                 <p>{commandFeedback}</p>
//               </div>
//             )}
//             {lastCommand && (
//               <div className="last-command">
//                 <small>Last command: "{lastCommand}"</small>
//               </div>
//             )}
//           </div>
          
//           {!('webkitSpeechRecognition' in window) && (
//             <p className="voice-warning">Voice commands not supported in your browser. Try Chrome or Edge.</p>
//           )}
//         </div>
      
//       {/* Farmer info section */}
//       <div className="farmer-info">
//         {farmerDetails.isLoaded ? (
//           <>
//             {farmerDetails.id && <p>Farmer ID: {farmerDetails.id}</p>}
//             <p>Farmer Name: {farmerDetails.name}</p>
//           </>
//         ) : (
//           <p>Loading farmer information...</p>
//         )}
//       </div>
//       {error && <div className="error-message">{error}</div>}
//       {isLoading && <div className="loading-indicator">Loading...</div>}

//       <div className="addproduce-market-buttons">
//         <button 
//           onClick={() => handleMarketClick('krishisetu')} 
//           className={selectedMarket === 'KrishiSetu Market' ? 'active' : ''}
//           disabled={isLoading}
//         >
//           <img src={KSlogo} alt="KrishiSetu Logo" />
//           KrishiSetu Market
//         </button>
//         <button 
//           onClick={() => handleMarketClick('bargaining')} 
//           className={selectedMarket === 'Bargaining Market' ? 'active' : ''}
//           disabled={isLoading}
//         >
//           <img src={BSimg} alt="Bargaining Logo" />
//           Bargaining Market
//         </button>
//       </div>

//       {selectedMarket && (
//         <>
//           <button 
//             className="addproduce-button" 
//             onClick={() => {
//               setIsFormVisible(!isFormVisible);
//               if (isFormVisible) {
//                 setNewProduce({
//                   produce_name: '',
//                   availability: '',
//                   price_per_kg: '',
//                   produce_type: 'Standard',
//                   market_type: selectedMarket,
//                   minimum_quantity: '',
//                   minimum_price: ''
//                 });
//               }
//             }}
//             disabled={isLoading}
//           >
//             {isFormVisible ? 'Cancel' : 'Add Produce'}
//           </button>

//           {isFormVisible && (
//             <div className="addproduce-form">
//               <h3>{newProduce.id ? 'Edit Produce' : 'Add Produce'} to {selectedMarket}</h3>
//               <form onSubmit={handleSubmit}>
//                 <div>
//                   <label>Produce Name:</label>
//                   <input
//                     type="text"
//                     name="produce_name"
//                     value={newProduce.produce_name}
//                     onChange={handleFormChange}
//                     placeholder="Enter produce name"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Availability (kg):</label>
//                   <input
//                     type="number"
//                     name="availability"
//                     value={newProduce.availability}
//                     onChange={handleFormChange}
//                     placeholder="Enter availability in kg"
//                     min="0.1"
//                     step="0.1"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Price per KG:</label>
//                   <input
//                     type="number"
//                     name="price_per_kg"
//                     value={newProduce.price_per_kg}
//                     onChange={handleFormChange}
//                     placeholder="Enter price per kg"
//                     min="0.01"
//                     step="0.01"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Produce Type:</label>
//                   <select
//                     name="produce_type"
//                     value={newProduce.produce_type}
//                     onChange={handleFormChange}
//                     required
//                     disabled={isLoading}
//                   >
//                     <option value="Standard">Standard</option>
//                     <option value="Organic">Organic</option>
//                   </select>
//                 </div>
                
//                 {selectedMarket === 'Bargaining Market' && (
//                   <>
//                     <div>
//                       <label>Minimum Quantity (kg):</label>
//                       <input
//                         type="number"
//                         name="minimum_quantity"
//                         value={newProduce.minimum_quantity}
//                         onChange={handleFormChange}
//                         placeholder="Minimum 10kg required"
//                         min="10"
//                         step="0.1"
//                         required
//                         disabled={isLoading}
//                       />
//                     </div>
//                     <div>
//                       <label>Minimum Price (per kg):</label>
//                       <input
//                         type="number"
//                         name="minimum_price"
//                         value={newProduce.minimum_price}
//                         onChange={handleFormChange}
//                         placeholder="Enter minimum acceptable price"
//                         min="0.01"
//                         step="0.01"
//                         max={newProduce.price_per_kg ? newProduce.price_per_kg - 0.01 : ''}
//                         required
//                         disabled={isLoading}
//                       />
//                     </div>
//                   </>
//                 )}
                
//                 <button 
//                   type="submit" 
//                   className="addproduce-submit-button"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? 'Saving...' : newProduce.id ? 'Update Produce' : 'Add Produce'}
//                 </button>
//               </form>
//             </div>
//           )}

//           <h3>List of Produces in {selectedMarket}</h3>
//           {produces.length > 0 ? (
//             <table className="addproduce-table">
//               <thead>
//                 <tr>
//                   <th>Produce Name</th>
//                   <th>Type</th>
//                   <th>Availability (kg)</th>
//                   <th>Price per KG</th>
//                   {selectedMarket === 'Bargaining Market' && (
//                     <>
//                       <th>Min Quantity</th>
//                       <th>Min Price</th>
//                     </>
//                   )}
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {produces.map((produce) => (
//                   <tr key={produce.product_id}>
//                     <td>{produce.produce_name}</td>
//                     <td>{produce.produce_type}</td>
//                     <td>{produce.availability} kg</td>
//                     <td>₹{produce.price_per_kg}</td>
//                     {selectedMarket === 'Bargaining Market' && (
//                       <>
//                         <td>{produce.minimum_quantity || 'N/A'} kg</td>
//                         <td>₹{produce.minimum_price || 'N/A'}</td>
//                       </>
//                     )}
//                     <td>
//                       <button
//                         className="addproduce-edit-button"
//                         onClick={() => editProduce(produce)}
//                         disabled={isLoading}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         className="addproduce-remove-button"
//                         onClick={() => deleteProduce(produce.product_id)}
//                         disabled={isLoading}
//                       >
//                         Remove
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No produces added yet for this market.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default AddProduce;




// import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
// import axios from 'axios';
// import './addproduce.css';
// import KSlogo from "../assets/logo.jpg";
// import BSimg from "../assets/bargain.jpeg";
// import { AuthContext } from '../context/AuthContext';
// import micIcon from '../assets/microphone.png';

// // Helper function to get farmer name
// const getFarmerName = (farmerData) => {
//   if (!farmerData) return 'Farmer';
//   if (farmerData.full_name) return farmerData.full_name;
//   if (farmerData.first_name && farmerData.last_name) {
//     return `${farmerData.first_name} ${farmerData.last_name}`;
//   }
//   return farmerData.first_name || farmerData.last_name || 'Farmer';
// };

// // Enhanced voice command processor
// const processVoiceCommand = (command, currentState) => {
//   command = command.toLowerCase().trim();
  
//   // Remove common filler words
//   const filteredCommand = command.replace(/\b(please|kindly|can you|i want to|i would like to)\b/gi, '').trim();
  
//   // Market selection
//   if (filteredCommand.includes('krishisetu') || filteredCommand.includes('krishi setu') || filteredCommand.includes('krishi market')||filteredCommand.includes('krishi se tu')|| filteredCommand.includes('Krishi set the market')) {
//     return { action: 'selectMarket', market: 'krishisetu' };
//   }
//   if (filteredCommand.includes('bargaining') || filteredCommand.includes('bargain') || filteredCommand.includes('deal market')) {
//     return { action: 'selectMarket', market: 'bargaining' };
//   }
  
//   // Form actions
//   if (filteredCommand.includes('add') || filteredCommand.includes('new') || filteredCommand.includes('create')) {
//     if (filteredCommand.includes('cancel') || filteredCommand.includes('close') || filteredCommand.includes('stop')) {
//       return { action: 'toggleForm', visible: false };
//     }
//     return { action: 'toggleForm', visible: true };
//   }
//   if (filteredCommand.includes('cancel') || filteredCommand.includes('close') || filteredCommand.includes('stop')) {
//     return { action: 'toggleForm', visible: false };
//   }
  
//   // Field setting - more flexible matching
//   const setFieldCommand = (fieldName, synonyms, valueParser = (val) => val) => {
//     for (const synonym of synonyms) {
//       if (filteredCommand.includes(synonym)) {
//         const valuePart = filteredCommand.split(synonym)[1]?.trim() || '';
//         const valueMatch = valuePart.match(/(\d+(\.\d+)?)|(\b\w+\b)/);
//         if (valueMatch) {
//           return {
//             action: 'setField',
//             field: fieldName,
//             value: valueParser(valueMatch[0])
//           };
//         }
//       }
//     }
//     return null;
//   };
  
//   // Try to match field commands
//   const fieldCommands = [
//     setFieldCommand('produce_name', ['name', 'call it', 'label'], (val) => val),
//     setFieldCommand('availability', ['quantity', 'amount', 'available', 'have'], parseFloat),
//     setFieldCommand('price', ['price', 'rate', 'cost', 'per kg'], parseFloat),
//     setFieldCommand('minimum quantity', ['minimum quantity', 'least amount', 'smallest quantity'], parseFloat),
//     setFieldCommand('minimum price', ['minimum price', 'lowest rate', 'least cost'], parseFloat),
//     (filteredCommand.includes('organic') || filteredCommand.includes('natural')) ? 
//       { action: 'setField', field: 'produce_type', value: 'Organic' } : null,
//     (filteredCommand.includes('standard') || filteredCommand.includes('regular')) ? 
//       { action: 'setField', field: 'produce_type', value: 'Standard' } : null
//   ].filter(cmd => cmd !== null);
  
//   if (fieldCommands.length > 0) {
//     return fieldCommands[0];
//   }
  
//   // Form submission
//   if (filteredCommand.includes('save') || filteredCommand.includes('submit') || filteredCommand.includes('done')) {
//     return { action: 'submitForm' };
//   }
  
//   // Edit commands with flexible matching
//   const editMatch = filteredCommand.match(/(edit|change|modify)\s+(.+)/);
//   if (editMatch) {
//     const produceName = editMatch[2].trim();
//     const produce = currentState.produces.find(p => 
//       p.produce_name.toLowerCase().includes(produceName.toLowerCase())
//     );
//     if (produce) return { action: 'editProduce', produce };
//   }
  
//   // Delete commands with confirmation
//   const deleteMatch = filteredCommand.match(/(delete|remove|erase)\s+(.+)/);
//   if (deleteMatch) {
//     const produceName = deleteMatch[2].trim();
//     const produce = currentState.produces.find(p => 
//       p.produce_name.toLowerCase().includes(produceName.toLowerCase())
//     );
//     if (produce) return { action: 'confirmDelete', produceId: produce.product_id, produceName: produce.produce_name };
//   }
  
//   // Help commands
//   if (filteredCommand.includes('help') || filteredCommand.includes('instruction') || filteredCommand.includes('guide')) {
//     return { action: 'showInstructions' };
//   }
  
//   // Fallback - try to interpret numbers as availability or price
//   const numberMatch = filteredCommand.match(/(\d+(\.\d+)?)/);
//   if (numberMatch) {
//     const num = parseFloat(numberMatch[0]);
//     if (currentState.isFormVisible) {
//       if (!currentState.newProduce.availability) {
//         return { action: 'setField', field: 'availability', value: num.toString() };
//       }
//       if (!currentState.newProduce.price_per_kg) {
//         return { action: 'setField', field: 'price_per_kg', value: num.toString() };
//       }
//     }
//   }
  
//   return { action: 'unknown', command: filteredCommand };
// };

// const AddProduce = () => {
//   // State declarations
//   const [selectedMarket, setSelectedMarket] = useState(null);
//   const [produces, setProduces] = useState([]);
//   const [newProduce, setNewProduce] = useState({
//     produce_name: '',
//     availability: '',
//     price_per_kg: '',
//     produce_type: 'Standard',
//     market_type: '',
//     minimum_quantity: '',
//     minimum_price: '' 
//   });
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showInstructions, setShowInstructions] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [voiceFeedback, setVoiceFeedback] = useState('');
//   const [lastCommand, setLastCommand] = useState('');
//   const [commandFeedback, setCommandFeedback] = useState('');
//   const recognitionRef = useRef(null);
  
//   // Get farmer from AuthContext
//   const authContext = useContext(AuthContext);
//   const farmer = authContext?.farmer || {};
  
//   // State for farmer details
//   const [farmerDetails, setFarmerDetails] = useState({
//     id: '',
//     name: 'Loading...',
//     isLoaded: false
//   });

//   // Initialize speech recognition with better error handling
//   const initSpeechRecognition = useCallback(() => {
//     if (!('webkitSpeechRecognition' in window)) {
//       console.warn('Speech recognition not supported');
//       return false;
//     }
    
//     const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
//     recognitionRef.current = new SpeechRecognition();
//     recognitionRef.current.continuous = true;
//     recognitionRef.current.interimResults = false;
//     recognitionRef.current.lang = 'en-IN';
    
//     let isProcessing = false;
    
//     recognitionRef.current.onresult = (event) => {
//       if (isProcessing) return;
//       isProcessing = true;
      
//       const transcript = event.results[event.results.length - 1][0].transcript.trim();
//       setVoiceFeedback(transcript);
//       setLastCommand(transcript);
      
//       const command = processVoiceCommand(transcript, {
//         produces,
//         selectedMarket,
//         isFormVisible,
//         newProduce
//       });
      
//       setTimeout(() => {
//         handleVoiceCommand(command);
//         setVoiceFeedback('');
//         isProcessing = false;
//       }, 300);
//     };
    
//     recognitionRef.current.onerror = (event) => {
//       console.error('Speech recognition error', event.error);
//       if (event.error === 'no-speech') {
//         setTimeout(() => {
//           if (isListening && recognitionRef.current) {
//             recognitionRef.current.start();
//           }
//         }, 500);
//       } else {
//         setIsListening(false);
//         setError(`Voice command error: ${event.error}`);
//       }
//     };
    
//     recognitionRef.current.onend = () => {
//       if (isListening) {
//         recognitionRef.current.start();
//       }
//     };
    
//     return true;
//   }, [produces, selectedMarket, isFormVisible, newProduce, isListening]);

//   // Effect to update farmer details when context changes
//   useEffect(() => {
//     if (authContext?.farmer) {
//       setFarmerDetails({
//         id: authContext.farmer.farmer_id || '',
//         name: getFarmerName(authContext.farmer),
//         isLoaded: true
//       });
//     } else {
//       setFarmerDetails({
//         id: '',
//         name: 'Loading...',
//         isLoaded: false
//       });
//     }
//   }, [authContext?.farmer]);

//   // Initialize speech recognition on mount
//   useEffect(() => {
//     const isSupported = initSpeechRecognition();
//     return () => {
//       if (isSupported && recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, [initSpeechRecognition]);

//   const loadProduces = useCallback(async () => {
//     if (!selectedMarket || !farmerDetails.id || !farmerDetails.isLoaded) return;
    
//     try {
//       setIsLoading(true);
//       const response = await axios.get(`http://localhost:5000/api/produces`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         params: {
//           farmer_id: farmerDetails.id,
//           market_type: selectedMarket
//         }
//       });
//       setProduces(response.data);
//       setError('');
//     } catch (err) {
//       console.error('Failed to fetch produces:', err);
//       setError('Failed to load produces. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedMarket, farmerDetails.id, farmerDetails.isLoaded]);

//   useEffect(() => {
//     loadProduces();
//   }, [loadProduces]);

//   const toggleVoiceRecognition = () => {
//     if (isListening) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//       setCommandFeedback('Voice commands turned off');
//       setTimeout(() => setCommandFeedback(''), 3000);
//     } else {
//       try {
//         recognitionRef.current.start();
//         setIsListening(true);
//         setError('');
//         setCommandFeedback('Listening... Speak now');
//         setTimeout(() => setCommandFeedback(''), 3000);
//       } catch (err) {
//         console.error('Failed to start recognition:', err);
//         setError('Failed to start voice recognition. Please refresh and try again.');
//       }
//     }
//   };

//   const handleVoiceCommand = (command) => {
//     let feedback = '';
    
//     const executeCommand = () => {
//       switch (command.action) {
//         case 'selectMarket':
//           handleMarketClick(command.market);
//           feedback = `Switched to ${command.market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market'}`;
//           break;
          
//         case 'toggleForm':
//           setIsFormVisible(command.visible);
//           if (!command.visible) {
//             setNewProduce({
//               produce_name: '',
//               availability: '',
//               price_per_kg: '',
//               produce_type: 'Standard',
//               market_type: selectedMarket,
//               minimum_quantity: '',
//               minimum_price: ''
//             });
//           }
//           feedback = command.visible ? 'Add produce form opened' : 'Form closed';
//           break;
          
//         case 'setField':
//           setNewProduce(prev => ({
//             ...prev,
//             [command.field]: command.value,
//             market_type: selectedMarket
//           }));
//           feedback = `Set ${command.field.replace('_', ' ')} to ${command.value}`;
//           break;
          
//         case 'submitForm':
//           handleSubmit({ preventDefault: () => {} });
//           feedback = 'Submitting produce...';
//           break;
          
//         case 'editProduce':
//           editProduce(command.produce);
//           feedback = `Editing ${command.produce.produce_name}`;
//           break;
          
//         case 'confirmDelete':
//           setCommandFeedback(`Are you sure you want to delete ${command.produceName}? Say "confirm delete" to proceed.`);
//           const timeout = setTimeout(() => {
//             setCommandFeedback('Delete cancelled');
//             setTimeout(() => setCommandFeedback(''), 2000);
//           }, 5000);
          
//           const originalOnResult = recognitionRef.current.onresult;
          
//           const confirmListener = (e) => {
//             const transcript = e.results[0][0].transcript.toLowerCase();
//             if (transcript.includes('confirm delete')) {
//               clearTimeout(timeout);
//               deleteProduce(command.produceId);
//               setCommandFeedback('Deleting produce...');
//               recognitionRef.current.onresult = originalOnResult;
//             }
//           };
          
//           recognitionRef.current.onresult = confirmListener;
//           return;
          
//         case 'showInstructions':
//           setShowInstructions(true);
//           feedback = 'Showing instructions';
//           break;
          
//         case 'unknown':
//           feedback = `Sorry, I didn't understand "${command.command}". Try saying "help" for instructions.`;
//           break;
          
//         default:
//           feedback = 'Please try your command again';
//       }
      
//       setCommandFeedback(feedback);
//       setTimeout(() => setCommandFeedback(''), 3000);
//     };
    
//     if (commandFeedback) {
//       setTimeout(executeCommand, 3000);
//     } else {
//       executeCommand();
//     }
//   };

//   const handleMarketClick = (market) => {
//     const marketType = market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market';
//     setSelectedMarket(marketType);
//     setIsFormVisible(false);
//     setError('');
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setNewProduce({
//       ...newProduce,
//       [name]: value,
//       market_type: selectedMarket
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
    
//     // Basic validation
//     if (!newProduce.produce_name || !newProduce.availability || !newProduce.price_per_kg) {
//       setError('Please fill all the fields');
//       return;
//     }
  
//     if (isNaN(newProduce.availability)) {
//       setError('Availability must be a number');
//       return;
//     }
  
//     if (isNaN(newProduce.price_per_kg)) {
//       setError('Price must be a valid number');
//       return;
//     }

//     // Additional validation for Bargaining Market
//     if (selectedMarket === 'Bargaining Market') {
//       if (!newProduce.minimum_quantity) {
//         setError('Minimum quantity is required for Bargaining Market');
//         return;
//       }
      
//       if (isNaN(newProduce.minimum_quantity)) {
//         setError('Minimum quantity must be a number');
//         return;
//       }
      
//       if (parseFloat(newProduce.minimum_quantity) < 10) {
//         setError('Minimum quantity must be at least 10kg for Bargaining Market');
//         return;
//       }

//       if (!newProduce.minimum_price) {
//         setError('Minimum price is required for Bargaining Market');
//         return;
//       }
      
//       if (isNaN(newProduce.minimum_price)) {
//         setError('Minimum price must be a valid number');
//         return;
//       }
      
//       if (parseFloat(newProduce.minimum_price) <= 0) {
//         setError('Minimum price must be greater than 0');
//         return;
//       }

//       if (parseFloat(newProduce.minimum_price) >= parseFloat(newProduce.price_per_kg)) {
//         setError('Minimum price must be less than the regular price');
//         return;
//       }
//     }

//     if (!farmer?.farmer_id) {
//       setError('Farmer information not available. Please log in again.');
//       return;
//     }
  
//     try {
//       setIsLoading(true);
//       const produceData = {
//         ...newProduce,
//         farmer_id: farmer.farmer_id,
//         farmer_name: farmer.full_name || `${farmer.first_name} ${farmer.last_name}`,
//         email: farmer.email,
//         availability: parseFloat(newProduce.availability),
//         price_per_kg: parseFloat(newProduce.price_per_kg),
//         market_type: selectedMarket,
//         ...(selectedMarket === 'Bargaining Market' && {
//           minimum_quantity: parseFloat(newProduce.minimum_quantity),
//           minimum_price: parseFloat(newProduce.minimum_price)
//         })
//       };

//       const config = {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       };

//       if (newProduce.id) {
//         await axios.put(
//           `http://localhost:5000/api/produces/${newProduce.id}`,
//           produceData,
//           config
//         );
//       } else {
//         await axios.post(
//           'http://localhost:5000/api/produces',
//           produceData,
//           config
//         );
//       }

//       await loadProduces();
//       setNewProduce({
//         produce_name: '',
//         availability: '',
//         price_per_kg: '',
//         produce_type: 'Standard',
//         market_type: selectedMarket,
//         minimum_quantity: '',
//         minimum_price: ''
//       });
//       setIsFormVisible(false);
//     } catch (err) {
//       console.error('Failed to save produce:', err);
//       setError(err.response?.data?.error || 'Failed to save produce. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const editProduce = (produce) => {
//     setNewProduce({
//       ...produce,
//       id: produce.product_id,
//       minimum_quantity: produce.minimum_quantity || '',
//       minimum_price: produce.minimum_price || ''
//     });
//     setIsFormVisible(true);
//   };

//   const deleteProduce = async (productId) => {
//     try {
//       setIsLoading(true);
//       await axios.delete(`http://localhost:5000/api/produces/${productId}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       await loadProduces();
//       setCommandFeedback('Produce deleted successfully');
//       setTimeout(() => setCommandFeedback(''), 3000);
//     } catch (err) {
//       console.error('Failed to delete produce:', err);
//       setError('Failed to delete produce. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Render instructions if showInstructions is true
//   if (showInstructions) {
//     return (
//       <div className="addproduce-instructions">
//         <h2>Instructions for Adding Produce</h2>
//         <div className="instructions-content">
//           <h3>General Instructions</h3>
//           <ol>
//             <li>
//               If you add the produce to <strong>KrishiSetu Market</strong>, it will be stored in the KrishiSetu market or warehouses. 
//               If you add the produce to <strong>Bargaining Market</strong>, it will be stored in the bargain marketplace in the consumer 
//               dashboard and it helps for bargaining with consumers.
//             </li>
//             <li>
//               The <strong>minimum price</strong> field is included to remove price conflicts in the bargaining system.
//             </li>
//             <li>
//               For the <strong>Bargaining Market</strong>, the minimum quantity you should add is <strong>10kg</strong>. 
//               This is because to initiate a bargain, the minimum quantity should be 10kg.
//             </li>
//             <li>
//               The minimum price should always be less than the regular price you set for the produce.
//             </li>
//           </ol>
          
//           <h3>Voice Command Instructions</h3>
//           <ol>
//             <li><strong>"KrishiSetu Market"</strong> - Switch to KrishiSetu Market</li>
//             <li><strong>"Bargaining Market"</strong> - Switch to Bargaining Market</li>
//             <li><strong>"Add produce"</strong> - Open the add produce form</li>
//             <li><strong>"Cancel"</strong> - Close the form</li>
//             <li><strong>"Produce name [name]"</strong> - Set produce name</li>
//             <li><strong>"Availability [number] kg"</strong> - Set availability</li>
//             <li><strong>"Price [number] rupees"</strong> - Set price per kg</li>
//             <li><strong>"Minimum quantity [number] kg"</strong> - Set minimum quantity</li>
//             <li><strong>"Minimum price [number] rupees"</strong> - Set minimum price</li>
//             <li><strong>"Produce type organic"</strong> - Set produce type to organic</li>
//             <li><strong>"Produce type standard"</strong> - Set produce type to standard</li>
//             <li><strong>"Submit"</strong> - Submit the form</li>
//             <li><strong>"Edit [produce name]"</strong> - Edit a produce</li>
//             <li><strong>"Delete [produce name]"</strong> - Delete a produce</li>
//           </ol>
          
//           <button 
//             className="close-instructions-button"
//             onClick={() => setShowInstructions(false)}
//           >
//             I Understand, Continue to Add Produce
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="addproduce-container">
//       <h1>Produces Added to the List</h1>
      
//       {/* Enhanced voice controls */}
//       <div className="voice-controls">
//         <button 
//           onClick={toggleVoiceRecognition}
//           className={`voice-button ${isListening ? 'listening' : ''}`}
//           disabled={!('webkitSpeechRecognition' in window)}
//         >
//           <img src={micIcon} alt="Microphone" />
//           {isListening ? 'Listening... (Click to Stop)' : 'Start Voice Commands'}
//         </button>
        
//         <div className="voice-feedback-container">
//           {voiceFeedback && (
//             <div className="voice-feedback">
//               <p>You said: <strong>{voiceFeedback}</strong></p>
//             </div>
//           )}
//           {commandFeedback && (
//             <div className="command-feedback">
//               <p>{commandFeedback}</p>
//             </div>
//           )}
//           {lastCommand && (
//             <div className="last-command">
//               <small>Last command: "{lastCommand}"</small>
//             </div>
//           )}
//         </div>
        
//         {!('webkitSpeechRecognition' in window) && (
//           <p className="voice-warning">Voice commands not supported in your browser. Try Chrome or Edge.</p>
//         )}
//       </div>
      
//       {/* Farmer info section */}
//       <div className="farmer-info">
//         {farmerDetails.isLoaded ? (
//           <>
//             {farmerDetails.id && <p>Farmer ID: {farmerDetails.id}</p>}
//             <p>Farmer Name: {farmerDetails.name}</p>
//           </>
//         ) : (
//           <p>Loading farmer information...</p>
//         )}
//       </div>
//       {error && <div className="error-message">{error}</div>}
//       {isLoading && <div className="loading-indicator">Loading...</div>}

//       <div className="addproduce-market-buttons">
//         <button 
//           onClick={() => handleMarketClick('krishisetu')} 
//           className={selectedMarket === 'KrishiSetu Market' ? 'active' : ''}
//           disabled={isLoading}
//         >
//           <img src={KSlogo} alt="KrishiSetu Logo" />
//           KrishiSetu Market
//         </button>
//         <button 
//           onClick={() => handleMarketClick('bargaining')} 
//           className={selectedMarket === 'Bargaining Market' ? 'active' : ''}
//           disabled={isLoading}
//         >
//           <img src={BSimg} alt="Bargaining Logo" />
//           Bargaining Market
//         </button>
//       </div>

//       {selectedMarket && (
//         <>
//           <button 
//             className="addproduce-button" 
//             onClick={() => {
//               setIsFormVisible(!isFormVisible);
//               if (isFormVisible) {
//                 setNewProduce({
//                   produce_name: '',
//                   availability: '',
//                   price_per_kg: '',
//                   produce_type: 'Standard',
//                   market_type: selectedMarket,
//                   minimum_quantity: '',
//                   minimum_price: ''
//                 });
//               }
//             }}
//             disabled={isLoading}
//           >
//             {isFormVisible ? 'Cancel' : 'Add Produce'}
//           </button>

//           {isFormVisible && (
//             <div className="addproduce-form">
//               <h3>{newProduce.id ? 'Edit Produce' : 'Add Produce'} to {selectedMarket}</h3>
//               <form onSubmit={handleSubmit}>
//                 <div>
//                   <label>Produce Name:</label>
//                   <input
//                     type="text"
//                     name="produce_name"
//                     value={newProduce.produce_name}
//                     onChange={handleFormChange}
//                     placeholder="Enter produce name"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Availability (kg):</label>
//                   <input
//                     type="number"
//                     name="availability"
//                     value={newProduce.availability}
//                     onChange={handleFormChange}
//                     placeholder="Enter availability in kg"
//                     min="0.1"
//                     step="0.1"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Price per KG:</label>
//                   <input
//                     type="number"
//                     name="price_per_kg"
//                     value={newProduce.price_per_kg}
//                     onChange={handleFormChange}
//                     placeholder="Enter price per kg"
//                     min="0.01"
//                     step="0.01"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <div>
//                   <label>Produce Type:</label>
//                   <select
//                     name="produce_type"
//                     value={newProduce.produce_type}
//                     onChange={handleFormChange}
//                     required
//                     disabled={isLoading}
//                   >
//                     <option value="Standard">Standard</option>
//                     <option value="Organic">Organic</option>
//                   </select>
//                 </div>
                
//                 {selectedMarket === 'Bargaining Market' && (
//                   <>
//                     <div>
//                       <label>Minimum Quantity (kg):</label>
//                       <input
//                         type="number"
//                         name="minimum_quantity"
//                         value={newProduce.minimum_quantity}
//                         onChange={handleFormChange}
//                         placeholder="Minimum 10kg required"
//                         min="10"
//                         step="0.1"
//                         required
//                         disabled={isLoading}
//                       />
//                     </div>
//                     <div>
//                       <label>Minimum Price (per kg):</label>
//                       <input
//                         type="number"
//                         name="minimum_price"
//                         value={newProduce.minimum_price}
//                         onChange={handleFormChange}
//                         placeholder="Enter minimum acceptable price"
//                         min="0.01"
//                         step="0.01"
//                         max={newProduce.price_per_kg ? newProduce.price_per_kg - 0.01 : ''}
//                         required
//                         disabled={isLoading}
//                       />
//                     </div>
//                   </>
//                 )}
                
//                 <button 
//                   type="submit" 
//                   className="addproduce-submit-button"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? 'Saving...' : newProduce.id ? 'Update Produce' : 'Add Produce'}
//                 </button>
//               </form>
//             </div>
//           )}

//           <h3>List of Produces in {selectedMarket}</h3>
//           {produces.length > 0 ? (
//             <table className="addproduce-table">
//               <thead>
//                 <tr>
//                   <th>Produce Name</th>
//                   <th>Type</th>
//                   <th>Availability (kg)</th>
//                   <th>Price per KG</th>
//                   {selectedMarket === 'Bargaining Market' && (
//                     <>
//                       <th>Min Quantity</th>
//                       <th>Min Price</th>
//                     </>
//                   )}
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {produces.map((produce) => (
//                   <tr key={produce.product_id}>
//                     <td>{produce.produce_name}</td>
//                     <td>{produce.produce_type}</td>
//                     <td>{produce.availability} kg</td>
//                     <td>₹{produce.price_per_kg}</td>
//                     {selectedMarket === 'Bargaining Market' && (
//                       <>
//                         <td>{produce.minimum_quantity || 'N/A'} kg</td>
//                         <td>₹{produce.minimum_price || 'N/A'}</td>
//                       </>
//                     )}
//                     <td>
//                       <button
//                         className="addproduce-edit-button"
//                         onClick={() => editProduce(produce)}
//                         disabled={isLoading}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         className="addproduce-remove-button"
//                         onClick={() => deleteProduce(produce.product_id)}
//                         disabled={isLoading}
//                       >
//                         Remove
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No produces added yet for this market.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default AddProduce;


import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import axios from 'axios';
import './addproduce.css';
import KSlogo from "../assets/logo.jpg";
import BSimg from "../assets/bargain.jpeg";
import { AuthContext } from '../context/AuthContext';
import micIcon from '../assets/microphone.png';

// Helper function to get farmer name
const getFarmerName = (farmerData) => {
  if (!farmerData) return 'Farmer';
  if (farmerData.full_name) return farmerData.full_name;
  if (farmerData.first_name && farmerData.last_name) {
    return `${farmerData.first_name} ${farmerData.last_name}`;
  }
  return farmerData.first_name || farmerData.last_name || 'Farmer';
};

// Enhanced voice command processor with Kannada support
const processVoiceCommand = (command, currentState) => {
  command = command.toLowerCase().trim();
  
  // Remove common filler words in both languages
  const filteredCommand = command.replace(/\b(please|kindly|can you|i want to|i would like to|ದಯವಿಟ್ಟು|ಕೇವಲ)\b/gi, '').trim();
  
  // Market selection - English and Kannada
  if (filteredCommand.includes('krishisetu') || 
      filteredCommand.includes('krishi setu') || 
      filteredCommand.includes('krishi market') ||
      filteredCommand.includes('ಕೃಷಿಸೇತು') ||
      filteredCommand.includes('ಕೃಷಿ, ಸೇತು ಮಾರುಕಟ್ಟೆ') ||
      filteredCommand.includes('ಕೃಷಿ ಸೇತು')) {
    return { action: 'selectMarket', market: 'krishisetu' };
  }
  if (filteredCommand.includes('bargaining') || 
      filteredCommand.includes('bargain') || 
      filteredCommand.includes('deal market') ||
      filteredCommand.includes('ಬಾರ್ಗೇನಿಂಗ್') ||
      filteredCommand.includes('ಸಾಲುಮಾರು')) {
    return { action: 'selectMarket', market: 'bargaining' };
  }
  
  // Form actions - English and Kannada
  if (filteredCommand.includes('add') || 
      filteredCommand.includes('new') || 
      filteredCommand.includes('create') ||
      filteredCommand.includes('ಸೇರಿಸಿ') ||
      filteredCommand.includes('ಹೊಸದು')) {
    if (filteredCommand.includes('cancel') || 
        filteredCommand.includes('close') || 
        filteredCommand.includes('stop') ||
        filteredCommand.includes('ರದ್ದು') ||
        filteredCommand.includes('ನಿಲ್ಲಿಸು')) {
      return { action: 'toggleForm', visible: false };
    }
    return { action: 'toggleForm', visible: true };
  }
  if (filteredCommand.includes('cancel') || 
      filteredCommand.includes('close') || 
      filteredCommand.includes('stop') ||
      filteredCommand.includes('ರದ್ದು') ||
      filteredCommand.includes('ನಿಲ್ಲಿಸು')) {
    return { action: 'toggleForm', visible: false };
  }
  
  // Field setting - more flexible matching with Kannada support
  const setFieldCommand = (fieldName, synonyms, valueParser = (val) => val) => {
    for (const synonym of synonyms) {
      if (filteredCommand.includes(synonym)) {
        const valuePart = filteredCommand.split(synonym)[1]?.trim() || '';
        const valueMatch = valuePart.match(/(\d+(\.\d+)?)|(\b[\w\u0C80-\u0CFF]+\b)/);
        if (valueMatch) {
          return {
            action: 'setField',
            field: fieldName,
            value: valueParser(valueMatch[0])
          };
        }
      }
    }
    return null;
  };
  
  // Try to match field commands in both languages
  const fieldCommands = [
    // Produce name
    setFieldCommand('produce_name', 
      ['name', 'call it', 'label', 'ಹೆಸರು', 'ಉತ್ಪನ್ನದ ಹೆಸರು'], 
      (val) => val),
    
    // Availability
    setFieldCommand('availability', 
      ['quantity', 'amount', 'available', 'have', 'ಲಭ್ಯತೆ', 'ಪ್ರಮಾಣ'], 
      parseFloat),
    
    // Price
    setFieldCommand('price_per_kg', 
      ['price', 'rate', 'cost', 'per kg', 'ಬೆಲೆ', 'ದರ', 'ಕೆಜಿಗೆ ಬೆಲೆ'], 
      parseFloat),
    
    // Minimum quantity
    setFieldCommand('minimum_quantity', 
      ['minimum quantity', 'least amount', 'smallest quantity', 'ಕನಿಷ್ಠ ಪ್ರಮಾಣ', 'ಕನಿಷ್ಠ'], 
      parseFloat),
    
    // Minimum price
    setFieldCommand('minimum_price', 
      ['minimum price', 'lowest rate', 'least cost', 'ಕನಿಷ್ಠ ಬೆಲೆ', 'ಕನಿಷ್ಠ ದರ'], 
      parseFloat),
    
    // Produce type
    (filteredCommand.includes('organic') || filteredCommand.includes('natural') || filteredCommand.includes('ಜೈವಿಕ')) ? 
      { action: 'setField', field: 'produce_type', value: 'Organic' } : null,
    (filteredCommand.includes('standard') || filteredCommand.includes('regular') || filteredCommand.includes('ಸಾಮಾನ್ಯ')) ? 
      { action: 'setField', field: 'produce_type', value: 'Standard' } : null
  ].filter(cmd => cmd !== null);
  
  if (fieldCommands.length > 0) {
    return fieldCommands[0];
  }
  
  // Form submission - English and Kannada
  if (filteredCommand.includes('save') || 
      filteredCommand.includes('submit') || 
      filteredCommand.includes('done') ||
      filteredCommand.includes('ಸೇವ್') ||
      filteredCommand.includes('ಸಲ್ಲಿಸು') ||
      filteredCommand.includes('ಮುಗಿದಿದೆ')) {
    return { action: 'submitForm' };
  }
  
  // Edit commands with flexible matching in both languages
  const editMatch = filteredCommand.match(/(edit|change|modify|ಸಂಪಾದಿಸಿ|ಬದಲಾಯಿಸಿ)\s+(.+)/);
  if (editMatch) {
    const produceName = editMatch[2].trim();
    const produce = currentState.produces.find(p => 
      p.produce_name.toLowerCase().includes(produceName.toLowerCase())
    );
    if (produce) return { action: 'editProduce', produce };
  }
  
  // Delete commands with confirmation in both languages
  const deleteMatch = filteredCommand.match(/(delete|remove|erase|ಅಳಿಸಿ|ತೆಗೆದುಹಾಕಿ)\s+(.+)/);
  if (deleteMatch) {
    const produceName = deleteMatch[2].trim();
    const produce = currentState.produces.find(p => 
      p.produce_name.toLowerCase().includes(produceName.toLowerCase())
    );
    if (produce) return { action: 'confirmDelete', produceId: produce.product_id, produceName: produce.produce_name };
  }
  
  // Help commands in both languages
  if (filteredCommand.includes('help') || 
      filteredCommand.includes('instruction') || 
      filteredCommand.includes('guide') ||
      filteredCommand.includes('ಸಹಾಯ') ||
      filteredCommand.includes('ಮಾರ್ಗದರ್ಶನ')) {
    return { action: 'showInstructions' };
  }
  
  // Fallback - try to interpret numbers as availability or price
  const numberMatch = filteredCommand.match(/(\d+(\.\d+)?)/);
  if (numberMatch) {
    const num = parseFloat(numberMatch[0]);
    if (currentState.isFormVisible) {
      if (!currentState.newProduce.availability) {
        return { action: 'setField', field: 'availability', value: num.toString() };
      }
      if (!currentState.newProduce.price_per_kg) {
        return { action: 'setField', field: 'price_per_kg', value: num.toString() };
      }
    }
  }
  
  return { action: 'unknown', command: filteredCommand };
};

const AddProduce = () => {
  // State declarations
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [produces, setProduces] = useState([]);
  const [newProduce, setNewProduce] = useState({
    produce_name: '',
    availability: '',
    price_per_kg: '',
    produce_type: 'Standard',
    market_type: '',
    minimum_quantity: '',
    minimum_price: '' 
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [commandFeedback, setCommandFeedback] = useState('');
  const [language, setLanguage] = useState('en-IN'); // Default to English-India
  const recognitionRef = useRef(null);
  
  // Get farmer from AuthContext
  const authContext = useContext(AuthContext);
  const farmer = authContext?.farmer || {};
  
  // State for farmer details
  const [farmerDetails, setFarmerDetails] = useState({
    id: '',
    name: 'Loading...',
    isLoaded: false
  });

  // Initialize speech recognition with better error handling
  const initSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return false;
    }
    
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = language; // Use the selected language
    
    let isProcessing = false;
    
    recognitionRef.current.onresult = (event) => {
      if (isProcessing) return;
      isProcessing = true;
      
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      setVoiceFeedback(transcript);
      setLastCommand(transcript);
      
      const command = processVoiceCommand(transcript, {
        produces,
        selectedMarket,
        isFormVisible,
        newProduce
      });
      
      setTimeout(() => {
        handleVoiceCommand(command);
        setVoiceFeedback('');
        isProcessing = false;
      }, 300);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'no-speech') {
        setTimeout(() => {
          if (isListening && recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 500);
      } else {
        setIsListening(false);
        setError(`Voice command error: ${event.error}`);
      }
    };
    
    recognitionRef.current.onend = () => {
      if (isListening) {
        recognitionRef.current.start();
      }
    };
    
    return true;
  }, [produces, selectedMarket, isFormVisible, newProduce, isListening, language]);

  // Effect to update farmer details when context changes
  useEffect(() => {
    if (authContext?.farmer) {
      setFarmerDetails({
        id: authContext.farmer.farmer_id || '',
        name: getFarmerName(authContext.farmer),
        isLoaded: true
      });
    } else {
      setFarmerDetails({
        id: '',
        name: 'Loading...',
        isLoaded: false
      });
    }
  }, [authContext?.farmer]);

  // Initialize speech recognition on mount and when language changes
  useEffect(() => {
    const isSupported = initSpeechRecognition();
    return () => {
      if (isSupported && recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [initSpeechRecognition]);

  const loadProduces = useCallback(async () => {
    if (!selectedMarket || !farmerDetails.id || !farmerDetails.isLoaded) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/produces`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        params: {
          farmer_id: farmerDetails.id,
          market_type: selectedMarket
        }
      });
      setProduces(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch produces:', err);
      setError('Failed to load produces. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMarket, farmerDetails.id, farmerDetails.isLoaded]);

  useEffect(() => {
    loadProduces();
  }, [loadProduces]);

  const toggleVoiceRecognition = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setCommandFeedback(language === 'kn-IN' ? 'ಧ್ವನಿ ಆಜ್ಞೆಗಳು ಆಫ್ ಆಗಿವೆ' : 'Voice commands turned off');
      setTimeout(() => setCommandFeedback(''), 3000);
    } else {
      try {
        recognitionRef.current.lang = language; // Set language before starting
        recognitionRef.current.start();
        setIsListening(true);
        setError('');
        setCommandFeedback(language === 'kn-IN' ? 'ಕೇಳುತ್ತಿದೆ... ಈಗ ಮಾತನಾಡಿ' : 'Listening... Speak now');
        setTimeout(() => setCommandFeedback(''), 3000);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start voice recognition. Please refresh and try again.');
      }
    }
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en-IN' ? 'kn-IN' : 'en-IN';
    setLanguage(newLanguage);
    setCommandFeedback(newLanguage === 'kn-IN' ? 'ಭಾಷೆ ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ' : 'Language changed to English');
    setTimeout(() => setCommandFeedback(''), 3000);
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setTimeout(() => {
        recognitionRef.current.lang = newLanguage;
        recognitionRef.current.start();
      }, 100);
    }
  };

  const handleVoiceCommand = (command) => {
    let feedback = '';
    
    const executeCommand = () => {
      switch (command.action) {
        case 'selectMarket':
          handleMarketClick(command.market);
          feedback = language === 'kn-IN' ? 
            `${command.market === 'krishisetu' ? 'ಕೃಷಿಸೇತು ಮಾರುಕಟ್ಟೆಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ' : 'ಬಾರ್ಗೇನಿಂಗ್ ಮಾರುಕಟ್ಟೆಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ'}` : 
            `Switched to ${command.market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market'}`;
          break;
          
        case 'toggleForm':
          setIsFormVisible(command.visible);
          if (!command.visible) {
            setNewProduce({
              produce_name: '',
              availability: '',
              price_per_kg: '',
              produce_type: 'Standard',
              market_type: selectedMarket,
              minimum_quantity: '',
              minimum_price: ''
            });
          }
          feedback = language === 'kn-IN' ? 
            (command.visible ? 'ಉತ್ಪನ್ನ ಫಾರ್ಮ್ ತೆರೆಯಲಾಗಿದೆ' : 'ಫಾರ್ಮ್ ಮುಚ್ಚಲಾಗಿದೆ') : 
            (command.visible ? 'Add produce form opened' : 'Form closed');
          break;
          
        case 'setField':
          setNewProduce(prev => ({
            ...prev,
            [command.field]: command.value,
            market_type: selectedMarket
          }));
          feedback = language === 'kn-IN' ? 
            `${command.field.replace('_', ' ')} ${command.value} ಗೆ ಹೊಂದಿಸಲಾಗಿದೆ` : 
            `Set ${command.field.replace('_', ' ')} to ${command.value}`;
          break;
          
        case 'submitForm':
          handleSubmit({ preventDefault: () => {} });
          feedback = language === 'kn-IN' ? 'ಉತ್ಪನ್ನವನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Submitting produce...';
          break;
          
        case 'editProduce':
          editProduce(command.produce);
          feedback = language === 'kn-IN' ? 
            `${command.produce.produce_name} ಸಂಪಾದಿಸಲಾಗುತ್ತಿದೆ` : 
            `Editing ${command.produce.produce_name}`;
          break;
          
        case 'confirmDelete':
          setCommandFeedback(language === 'kn-IN' ? 
            `ನೀವು ಖಚಿತವಾಗಿ ${command.produceName} ಅಳಿಸಲು ಬಯಸುವಿರಾ? "ಖಚಿತಪಡಿಸಿ ಅಳಿಸಿ" ಎಂದು ಹೇಳಿ` : 
            `Are you sure you want to delete ${command.produceName}? Say "confirm delete" to proceed.`);
          const timeout = setTimeout(() => {
            setCommandFeedback(language === 'kn-IN' ? 'ಅಳಿಸುವಿಕೆ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ' : 'Delete cancelled');
            setTimeout(() => setCommandFeedback(''), 2000);
          }, 5000);
          
          const originalOnResult = recognitionRef.current.onresult;
          
          const confirmListener = (e) => {
            const transcript = e.results[0][0].transcript.toLowerCase();
            if (transcript.includes('confirm delete') || transcript.includes('ಖಚಿತಪಡಿಸಿ ಅಳಿಸಿ')) {
              clearTimeout(timeout);
              deleteProduce(command.produceId);
              setCommandFeedback(language === 'kn-IN' ? 'ಉತ್ಪನ್ನ ಅಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Deleting produce...');
              recognitionRef.current.onresult = originalOnResult;
            }
          };
          
          recognitionRef.current.onresult = confirmListener;
          return;
          
        case 'showInstructions':
          setShowInstructions(true);
          feedback = language === 'kn-IN' ? 'ಸೂಚನೆಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ' : 'Showing instructions';
          break;
          
        case 'unknown':
          feedback = language === 'kn-IN' ? 
            `ಕ್ಷಮಿಸಿ, ನಾನು "${command.command}" ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಿಲ್ಲ. "ಸಹಾಯ" ಎಂದು ಪ್ರಯತ್ನಿಸಿ` : 
            `Sorry, I didn't understand "${command.command}". Try saying "help" for instructions.`;
          break;
          
        default:
          feedback = language === 'kn-IN' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆಜ್ಞೆಯನ್ನು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 'Please try your command again';
      }
      
      setCommandFeedback(feedback);
      setTimeout(() => setCommandFeedback(''), 3000);
    };
    
    if (commandFeedback) {
      setTimeout(executeCommand, 3000);
    } else {
      executeCommand();
    }
  };

  const handleMarketClick = (market) => {
    const marketType = market === 'krishisetu' ? 'KrishiSetu Market' : 'Bargaining Market';
    setSelectedMarket(marketType);
    setIsFormVisible(false);
    setError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewProduce({
      ...newProduce,
      [name]: value,
      market_type: selectedMarket
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!newProduce.produce_name || !newProduce.availability || !newProduce.price_per_kg) {
      setError(language === 'kn-IN' ? 'ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಫೀಲ್ಡ್ಗಳನ್ನು ತುಂಬಿಸಿ' : 'Please fill all the fields');
      return;
    }
  
    if (isNaN(newProduce.availability)) {
      setError(language === 'kn-IN' ? 'ಲಭ್ಯತೆ ಸಂಖ್ಯೆಯಾಗಿರಬೇಕು' : 'Availability must be a number');
      return;
    }
  
    if (isNaN(newProduce.price_per_kg)) {
      setError(language === 'kn-IN' ? 'ಬೆಲೆ ಮಾನ್ಯ ಸಂಖ್ಯೆಯಾಗಿರಬೇಕು' : 'Price must be a valid number');
      return;
    }

    // Additional validation for Bargaining Market
    if (selectedMarket === 'Bargaining Market') {
      if (!newProduce.minimum_quantity) {
        setError(language === 'kn-IN' ? 
          'ಬಾರ್ಗೇನಿಂಗ್ ಮಾರುಕಟ್ಟೆಗೆ ಕನಿಷ್ಠ ಪ್ರಮಾಣ ಅಗತ್ಯವಿದೆ' : 
          'Minimum quantity is required for Bargaining Market');
        return;
      }
      
      if (isNaN(newProduce.minimum_quantity)) {
        setError(language === 'kn-IN' ? 'ಕನಿಷ್ಠ ಪ್ರಮಾಣ ಸಂಖ್ಯೆಯಾಗಿರಬೇಕು' : 'Minimum quantity must be a number');
        return;
      }
      
      if (parseFloat(newProduce.minimum_quantity) < 10) {
        setError(language === 'kn-IN' ? 
          'ಬಾರ್ಗೇನಿಂಗ್ ಮಾರುಕಟ್ಟೆಗೆ ಕನಿಷ್ಠ ಪ್ರಮಾಣ 10ಕೆಜಿ ಇರಬೇಕು' : 
          'Minimum quantity must be at least 10kg for Bargaining Market');
        return;
      }

      if (!newProduce.minimum_price) {
        setError(language === 'kn-IN' ? 
          'ಬಾರ್ಗೇನಿಂಗ್ ಮಾರುಕಟ್ಟೆಗೆ ಕನಿಷ್ಠ ಬೆಲೆ ಅಗತ್ಯವಿದೆ' : 
          'Minimum price is required for Bargaining Market');
        return;
      }
      
      if (isNaN(newProduce.minimum_price)) {
        setError(language === 'kn-IN' ? 'ಕನಿಷ್ಠ ಬೆಲೆ ಮಾನ್ಯ ಸಂಖ್ಯೆಯಾಗಿರಬೇಕು' : 'Minimum price must be a valid number');
        return;
      }
      
      if (parseFloat(newProduce.minimum_price) <= 0) {
        setError(language === 'kn-IN' ? 'ಕನಿಷ್ಠ ಬೆಲೆ 0 ಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿರಬೇಕು' : 'Minimum price must be greater than 0');
        return;
      }

      if (parseFloat(newProduce.minimum_price) >= parseFloat(newProduce.price_per_kg)) {
        setError(language === 'kn-IN' ? 
          'ಕನಿಷ್ಠ ಬೆಲೆ ಸಾಮಾನ್ಯ ಬೆಲೆಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು' : 
          'Minimum price must be less than the regular price');
        return;
      }
    }

    if (!farmer?.farmer_id) {
      setError(language === 'kn-IN' ? 
        'ರೈತರ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಆಗಿ' : 
        'Farmer information not available. Please log in again.');
      return;
    }
  
    try {
      setIsLoading(true);
      const produceData = {
        ...newProduce,
        farmer_id: farmer.farmer_id,
        farmer_name: farmer.full_name || `${farmer.first_name} ${farmer.last_name}`,
        email: farmer.email,
        availability: parseFloat(newProduce.availability),
        price_per_kg: parseFloat(newProduce.price_per_kg),
        market_type: selectedMarket,
        ...(selectedMarket === 'Bargaining Market' && {
          minimum_quantity: parseFloat(newProduce.minimum_quantity),
          minimum_price: parseFloat(newProduce.minimum_price)
        })
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };

      if (newProduce.id) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/produces/${newProduce.id}`,
          produceData,
          config
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/produces`,
          produceData,
          config
        );
      }

      await loadProduces();
      setNewProduce({
        produce_name: '',
        availability: '',
        price_per_kg: '',
        produce_type: 'Standard',
        market_type: selectedMarket,
        minimum_quantity: '',
        minimum_price: ''
      });
      setIsFormVisible(false);
      setCommandFeedback(language === 'kn-IN' ? 
        'ಉತ್ಪನ್ನ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ' : 
        'Produce added successfully');
      setTimeout(() => setCommandFeedback(''), 3000);
    } catch (err) {
      console.error('Failed to save produce:', err);
      setError(err.response?.data?.error || (language === 'kn-IN' ? 
        'ಉತ್ಪನ್ನವನ್ನು ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 
        'Failed to save produce. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const editProduce = (produce) => {
    setNewProduce({
      ...produce,
      id: produce.product_id,
      minimum_quantity: produce.minimum_quantity || '',
      minimum_price: produce.minimum_price || ''
    });
    setIsFormVisible(true);
  };

  // const deleteProduce = async (productId) => {
  //   try {
  //     setIsLoading(true);
  //     await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/produces/${productId}`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`
  //       }
  //     });
  //     await loadProduces();
  //     setCommandFeedback(language === 'kn-IN' ? 
  //       'ಉತ್ಪನ್ನ ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ' : 
  //       'Produce deleted successfully');
  //     setTimeout(() => setCommandFeedback(''), 3000);
  //   } catch (err) {
  //     console.error('Failed to delete produce:', err);
  //     setError(language === 'kn-IN' ? 
  //       'ಉತ್ಪನ್ನವನ್ನು ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 
  //       'Failed to delete produce. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
const deleteProduce = async (productId) => {
  try {
    setIsLoading(true);
    
    await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/produces/${productId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    await loadProduces(); // Assuming this refreshes the product list
    
    setCommandFeedback(language === 'kn-IN' ? 
      'ಉತ್ಪನ್ನ ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ' : 
      'Produce deleted successfully');

    setTimeout(() => setCommandFeedback(''), 3000);
    
  } catch (err) {
    console.error('Failed to delete produce:', err);

    setError(language === 'kn-IN' ? 
      'ಉತ್ಪನ್ನವನ್ನು ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 
      'Failed to delete produce. Please try again.');
    
  } finally {
    setIsLoading(false);
  }
};

  // Render instructions if showInstructions is true
  if (showInstructions) {
    return (
      <div className="addproduce-instructions">
        <h2>{language === 'kn-IN' ? 'ಉತ್ಪನ್ನ ಸೇರಿಸಲು ಸೂಚನೆಗಳು' : 'Instructions for Adding Produce'}</h2>
        <div className="instructions-content">
          <h3>{language === 'kn-IN' ? 'ಸಾಮಾನ್ಯ ಸೂಚನೆಗಳು' : 'General Instructions'}</h3>
          <ol>
            <li>
              {language === 'kn-IN' ? 
                'ನೀವು ಉತ್ಪನ್ನವನ್ನು <strong>ಕೃಷಿಸೇತು ಮಾರುಕಟ್ಟೆಗೆ</strong> ಸೇರಿಸಿದರೆ, ಅದು ಕೃಷಿಸೇತು ಮಾರುಕಟ್ಟೆ ಅಥವಾ ಗೋದಾಮುಗಳಲ್ಲಿ ಸಂಗ್ರಹಿಸಲ್ಪಡುತ್ತದೆ. ನೀವು ಉತ್ಪನ್ನವನ್ನು <strong>ಬಾರ್ಗೇನಿಂಗ್ ಮಾರುಕಟ್ಟೆಗೆ</strong> ಸೇರಿಸಿದರೆ, ಅದು ಗ್ರಾಹಕರ ಡ್ಯಾಶ್ಬೋರ್ಡ್ನಲ್ಲಿ ಸಂಗ್ರಹಿಸಲ್ಪಡುತ್ತದೆ ಮತ್ತು ಗ್ರಾಹಕರೊಂದಿಗೆ ಬಾರ್ಗೇನಿಂಗ್ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.' : 
                'If you add the produce to <strong>KrishiSetu Market</strong>, it will be stored in the KrishiSetu market or warehouses. If you add the produce to <strong>Bargaining Market</strong>, it will be stored in the bargain marketplace in the consumer dashboard and it helps for bargaining with consumers.'}
            </li>
            <li>
              {language === 'kn-IN' ? 
                'ಬೆಲೆ ಸಂಘರ್ಷಗಳನ್ನು ತೆಗೆದುಹಾಕಲು <strong>ಕನಿಷ್ಠ ಬೆಲೆ</strong> ಫೀಲ್ಡ್ ಅನ್ನು ಸೇರಿಸಲಾಗಿದೆ.' : 
                'The <strong>minimum price</strong> field is included to remove price conflicts in the bargaining system.'}
            </li>
            <li>
              {language === 'kn-IN' ? 
                '<strong>ಬಾರ್ಗೇನಿಂಗ್ ಮಾರುಕಟ್ಟೆಗೆ</strong>, ನೀವು ಸೇರಿಸಬೇಕಾದ ಕನಿಷ್ಠ ಪ್ರಮಾಣ <strong>10ಕೆಜಿ</strong>. ಬಾರ್ಗೇನಿಂಗ್ ಪ್ರಾರಂಭಿಸಲು ಕನಿಷ್ಠ ಪ್ರಮಾಣ 10ಕೆಜಿ ಇರಬೇಕು.' : 
                'For the <strong>Bargaining Market</strong>, the minimum quantity you should add is <strong>10kg</strong>. This is because to initiate a bargain, the minimum quantity should be 10kg.'}
            </li>
            <li>
              {language === 'kn-IN' ? 
                'ಕನಿಷ್ಠ ಬೆಲೆ ಯಾವಾಗಲೂ ನೀವು ಉತ್ಪನ್ನಕ್ಕೆ ಹೊಂದಿಸಿದ ಸಾಮಾನ್ಯ ಬೆಲೆಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು.' : 
                'The minimum price should always be less than the regular price you set for the produce.'}
            </li>
          </ol>
          
          <h3>{language === 'kn-IN' ? 'ಧ್ವನಿ ಆಜ್ಞೆ ಸೂಚನೆಗಳು' : 'Voice Command Instructions'}</h3>
          <ol>
            <li><strong>{language === 'kn-IN' ? '"ಕೃಷಿಸೇತು ಮಾರುಕಟ್ಟೆ"' : '"KrishiSetu Market"'}</strong> - {language === 'kn-IN' ? 'ಕೃಷಿಸೇತು ಮಾರುಕಟ್ಟೆಗೆ ಬದಲಾಯಿಸಿ' : 'Switch to KrishiSetu Market'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಬಾರ್ಗೇನಿಂಗ್ ಮಾರುಕಟ್ಟೆ"' : '"Bargaining Market"'}</strong> - {language === 'kn-IN' ? 'ಬಾರ್ಗೇನಿಂಗ್ ಮಾರುಕಟ್ಟೆಗೆ ಬದಲಾಯಿಸಿ' : 'Switch to Bargaining Market'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಉತ್ಪನ್ನ ಸೇರಿಸಿ"' : '"Add produce"'}</strong> - {language === 'kn-IN' ? 'ಉತ್ಪನ್ನ ಫಾರ್ಮ್ ತೆರೆಯಿರಿ' : 'Open the add produce form'}</li>
            <li><strong>{language === 'kn-IN' ? '"ರದ್ದು"' : '"Cancel"'}</strong> - {language === 'kn-IN' ? 'ಫಾರ್ಮ್ ಮುಚ್ಚಿ' : 'Close the form'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಉತ್ಪನ್ನ ಹೆಸರು [ಹೆಸರು]"' : '"Produce name [name]"'}</strong> - {language === 'kn-IN' ? 'ಉತ್ಪನ್ನದ ಹೆಸರನ್ನು ಹೊಂದಿಸಿ' : 'Set produce name'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಲಭ್ಯತೆ [ಸಂಖ್ಯೆ] ಕೆಜಿ"' : '"Availability [number] kg"'}</strong> - {language === 'kn-IN' ? 'ಲಭ್ಯತೆಯನ್ನು ಹೊಂದಿಸಿ' : 'Set availability'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಬೆಲೆ [ಸಂಖ್ಯೆ] ರೂಪಾಯಿ"' : '"Price [number] rupees"'}</strong> - {language === 'kn-IN' ? 'ಪ್ರತಿ ಕೆಜಿಗೆ ಬೆಲೆಯನ್ನು ಹೊಂದಿಸಿ' : 'Set price per kg'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಕನಿಷ್ಠ ಪ್ರಮಾಣ [ಸಂಖ್ಯೆ] ಕೆಜಿ"' : '"Minimum quantity [number] kg"'}</strong> - {language === 'kn-IN' ? 'ಕನಿಷ್ಠ ಪ್ರಮಾಣವನ್ನು ಹೊಂದಿಸಿ' : 'Set minimum quantity'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಕನಿಷ್ಠ ಬೆಲೆ [ಸಂಖ್ಯೆ] ರೂಪಾಯಿ"' : '"Minimum price [number] rupees"'}</strong> - {language === 'kn-IN' ? 'ಕನಿಷ್ಠ ಬೆಲೆಯನ್ನು ಹೊಂದಿಸಿ' : 'Set minimum price'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಉತ್ಪನ್ನ ಪ್ರಕಾರ ಜೈವಿಕ"' : '"Produce type organic"'}</strong> - {language === 'kn-IN' ? 'ಉತ್ಪನ್ನ ಪ್ರಕಾರವನ್ನು ಜೈವಿಕವಾಗಿ ಹೊಂದಿಸಿ' : 'Set produce type to organic'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಉತ್ಪನ್ನ ಪ್ರಕಾರ ಸಾಮಾನ್ಯ"' : '"Produce type standard"'}</strong> - {language === 'kn-IN' ? 'ಉತ್ಪನ್ನ ಪ್ರಕಾರವನ್ನು ಸಾಮಾನ್ಯವಾಗಿ ಹೊಂದಿಸಿ' : 'Set produce type to standard'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಸಲ್ಲಿಸಿ"' : '"Submit"'}</strong> - {language === 'kn-IN' ? 'ಫಾರ್ಮ್ ಸಲ್ಲಿಸಿ' : 'Submit the form'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಸಂಪಾದಿಸಿ [ಉತ್ಪನ್ನ ಹೆಸರು]"' : '"Edit [produce name]"'}</strong> - {language === 'kn-IN' ? 'ಉತ್ಪನ್ನವನ್ನು ಸಂಪಾದಿಸಿ' : 'Edit a produce'}</li>
            <li><strong>{language === 'kn-IN' ? '"ಅಳಿಸಿ [ಉತ್ಪನ್ನ ಹೆಸರು]"' : '"Delete [produce name]"'}</strong> - {language === 'kn-IN' ? 'ಉತ್ಪನ್ನವನ್ನು ಅಳಿಸಿ' : 'Delete a produce'}</li>
          </ol>
          
          <button 
            className="close-instructions-button"
            onClick={() => setShowInstructions(false)}
          >
            {language === 'kn-IN' ? 'ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ, ಉತ್ಪನ್ನ ಸೇರಿಸಲು ಮುಂದುವರಿಯಿರಿ' : 'I Understand, Continue to Add Produce'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="addproduce-container">
      <h1>{language === 'kn-IN' ? 'ಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾದ ಉತ್ಪನ್ನಗಳು' : 'Produces Added to the List'}</h1>
      
      {/* Enhanced voice controls */}
      <div className="voice-controls">
        <div className="language-toggle">
          <button onClick={toggleLanguage} className="language-button">
            {language === 'kn-IN' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ'}
          </button>
        </div>
        
        <button 
          onClick={toggleVoiceRecognition}
          className={`voice-button ${isListening ? 'listening' : ''}`}
          disabled={!('webkitSpeechRecognition' in window)}
        >
          <img src={micIcon} alt="Microphone" />
          {isListening ? 
            (language === 'kn-IN' ? 'ಕೇಳುತ್ತಿದೆ... (ನಿಲ್ಲಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ)' : 'Listening... (Click to Stop)') : 
            (language === 'kn-IN' ? 'ಧ್ವನಿ ಆಜ್ಞೆಗಳನ್ನು ಪ್ರಾರಂಭಿಸಿ' : 'Start Voice Commands')}
        </button>
        
        <div className="voice-feedback-container">
          {voiceFeedback && (
            <div className="voice-feedback">
              <p>{language === 'kn-IN' ? 'ನೀವು ಹೇಳಿದ್ದು:' : 'You said:'} <strong>{voiceFeedback}</strong></p>
            </div>
          )}
          {commandFeedback && (
            <div className="command-feedback">
              <p>{commandFeedback}</p>
            </div>
          )}
          {lastCommand && (
            <div className="last-command">
              <small>{language === 'kn-IN' ? 'ಕೊನೆಯ ಆಜ್ಞೆ:' : 'Last command:'} "{lastCommand}"</small>
            </div>
          )}
        </div>
        
        {!('webkitSpeechRecognition' in window) && (
          <p className="voice-warning">
            {language === 'kn-IN' ? 
              'ನಿಮ್ಮ ಬ್ರೌಸರ್ನಲ್ಲಿ ಧ್ವನಿ ಆಜ್ಞೆಗಳು ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. Chrome ಅಥವಾ Edge ಅನ್ನು ಪ್ರಯತ್ನಿಸಿ' : 
              'Voice commands not supported in your browser. Try Chrome or Edge.'}
          </p>
        )}
      </div>
      
      {/* Farmer info section */}
      <div className="farmer-info">
        {farmerDetails.isLoaded ? (
          <>
            {farmerDetails.id && <p>{language === 'kn-IN' ? 'ರೈತರ ID:' : 'Farmer ID:'} {farmerDetails.id}</p>}
            <p>{language === 'kn-IN' ? 'ರೈತರ ಹೆಸರು:' : 'Farmer Name:'} {farmerDetails.name}</p>
          </>
        ) : (
          <p>{language === 'kn-IN' ? 'ರೈತರ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Loading farmer information...'}</p>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-indicator">{language === 'kn-IN' ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading...'}</div>}

      <div className="addproduce-market-buttons">
        <button 
          onClick={() => handleMarketClick('krishisetu')} 
          className={selectedMarket === 'KrishiSetu Market' ? 'active' : ''}
          disabled={isLoading}
        >
          <img src={KSlogo} alt="KrishiSetu Logo" />
          {language === 'kn-IN' ? 'ಕೃಷಿಸೇತು ಮಾರುಕಟ್ಟೆ' : 'KrishiSetu Market'}
        </button>
        <button 
          onClick={() => handleMarketClick('bargaining')} 
          className={selectedMarket === 'Bargaining Market' ? 'active' : ''}
          disabled={isLoading}
        >
          <img src={BSimg} alt="Bargaining Logo" />
          {language === 'kn-IN' ? 'ಬಾರ್ಗೇನಿಂಗ್ ಮಾರುಕಟ್ಟೆ' : 'Bargaining Market'}
        </button>
      </div>

      {selectedMarket && (
        <>
          <button 
            className="addproduce-button" 
            onClick={() => {
              setIsFormVisible(!isFormVisible);
              if (isFormVisible) {
                setNewProduce({
                  produce_name: '',
                  availability: '',
                  price_per_kg: '',
                  produce_type: 'Standard',
                  market_type: selectedMarket,
                  minimum_quantity: '',
                  minimum_price: ''
                });
              }
            }}
            disabled={isLoading}
          >
            {isFormVisible ? 
              (language === 'kn-IN' ? 'ರದ್ದು' : 'Cancel') : 
              (language === 'kn-IN' ? 'ಉತ್ಪನ್ನ ಸೇರಿಸಿ' : 'Add Produce')}
          </button>

          {isFormVisible && (
            <div className="addproduce-form">
              <h3>
                {newProduce.id ? 
                  (language === 'kn-IN' ? 'ಉತ್ಪನ್ನವನ್ನು ಸಂಪಾದಿಸಿ' : 'Edit Produce') : 
                  (language === 'kn-IN' ? 'ಉತ್ಪನ್ನವನ್ನು ಸೇರಿಸಿ' : 'Add Produce')} 
                {language === 'kn-IN' ? 
                  (selectedMarket === 'KrishiSetu Market' ? 'ಕೃಷಿಸೇತು ಮಾರುಕಟ್ಟೆಗೆ' : 'ಬಾರ್ಗೇನಿಂಗ್ ಮಾರುಕಟ್ಟೆಗೆ') : 
                  `to ${selectedMarket}`}
              </h3>
              <form onSubmit={handleSubmit}>
                <div>
                  <label>{language === 'kn-IN' ? 'ಉತ್ಪನ್ನದ ಹೆಸರು:' : 'Produce Name:'}</label>
                  <input
                    type="text"
                    name="produce_name"
                    value={newProduce.produce_name}
                    onChange={handleFormChange}
                    placeholder={language === 'kn-IN' ? 'ಉತ್ಪನ್ನದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : 'Enter produce name'}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label>{language === 'kn-IN' ? 'ಲಭ್ಯತೆ (ಕೆಜಿ):' : 'Availability (kg):'}</label>
                  <input
                    type="number"
                    name="availability"
                    value={newProduce.availability}
                    onChange={handleFormChange}
                    placeholder={language === 'kn-IN' ? 'ಕೆಜಿಯಲ್ಲಿ ಲಭ್ಯತೆಯನ್ನು ನಮೂದಿಸಿ' : 'Enter availability in kg'}
                    min="0.1"
                    step="0.1"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label>{language === 'kn-IN' ? 'ಪ್ರತಿ ಕೆಜಿಗೆ ಬೆಲೆ:' : 'Price per KG:'}</label>
                  <input
                    type="number"
                    name="price_per_kg"
                    value={newProduce.price_per_kg}
                    onChange={handleFormChange}
                    placeholder={language === 'kn-IN' ? 'ಪ್ರತಿ ಕೆಜಿಗೆ ಬೆಲೆಯನ್ನು ನಮೂದಿಸಿ' : 'Enter price per kg'}
                    min="0.01"
                    step="0.01"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label>{language === 'kn-IN' ? 'ಉತ್ಪನ್ನ ಪ್ರಕಾರ:' : 'Produce Type:'}</label>
                  <select
                    name="produce_type"
                    value={newProduce.produce_type}
                    onChange={handleFormChange}
                    required
                    disabled={isLoading}
                  >
                    <option value="Standard">{language === 'kn-IN' ? 'ಸಾಮಾನ್ಯ' : 'Standard'}</option>
                    <option value="Organic">{language === 'kn-IN' ? 'ಜೈವಿಕ' : 'Organic'}</option>
                  </select>
                </div>
                
                {selectedMarket === 'Bargaining Market' && (
                  <>
                    <div>
                      <label>{language === 'kn-IN' ? 'ಕನಿಷ್ಠ ಪ್ರಮಾಣ (ಕೆಜಿ):' : 'Minimum Quantity (kg):'}</label>
                      <input
                        type="number"
                        name="minimum_quantity"
                        value={newProduce.minimum_quantity}
                        onChange={handleFormChange}
                        placeholder={language === 'kn-IN' ? 'ಕನಿಷ್ಠ 10ಕೆಜಿ ಅಗತ್ಯವಿದೆ' : 'Minimum 10kg required'}
                        min="10"
                        step="0.1"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label>{language === 'kn-IN' ? 'ಕನಿಷ್ಠ ಬೆಲೆ (ಪ್ರತಿ ಕೆಜಿಗೆ):' : 'Minimum Price (per kg):'}</label>
                      <input
                        type="number"
                        name="minimum_price"
                        value={newProduce.minimum_price}
                        onChange={handleFormChange}
                        placeholder={language === 'kn-IN' ? 'ಕನಿಷ್ಠ ಸ್ವೀಕಾರಾರ್ಹ ಬೆಲೆಯನ್ನು ನಮೂದಿಸಿ' : 'Enter minimum acceptable price'}
                        min="0.01"
                        step="0.01"
                        max={newProduce.price_per_kg ? newProduce.price_per_kg - 0.01 : ''}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}
                
                <button 
                  type="submit" 
                  className="addproduce-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 
                    (language === 'kn-IN' ? 'ಸೇವ್ ಆಗುತ್ತಿದೆ...' : 'Saving...') : 
                    newProduce.id ? 
                      (language === 'kn-IN' ? 'ಉತ್ಪನ್ನವನ್ನು ನವೀಕರಿಸಿ' : 'Update Produce') : 
                      (language === 'kn-IN' ? 'ಉತ್ಪನ್ನವನ್ನು ಸೇರಿಸಿ' : 'Add Produce')}
                </button>
              </form>
            </div>
          )}

          <h3>
            {language === 'kn-IN' ? 
              `${selectedMarket === 'KrishiSetu Market' ? 'ಕೃಷಿಸೇತು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ' : 'ಬಾರ್ಗೇನಿಂಗ್ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ'} ಉತ್ಪನ್ನಗಳ ಪಟ್ಟಿ` : 
              `List of Produces in ${selectedMarket}`}
          </h3>
          {produces.length > 0 ? (
            <table className="addproduce-table">
              <thead>
                <tr>
                  <th>{language === 'kn-IN' ? 'ಉತ್ಪನ್ನದ ಹೆಸರು' : 'Produce Name'}</th>
                  <th>{language === 'kn-IN' ? 'ಪ್ರಕಾರ' : 'Type'}</th>
                  <th>{language === 'kn-IN' ? 'ಲಭ್ಯತೆ (ಕೆಜಿ)' : 'Availability (kg)'}</th>
                  <th>{language === 'kn-IN' ? 'ಪ್ರತಿ ಕೆಜಿಗೆ ಬೆಲೆ' : 'Price per KG'}</th>
                  {selectedMarket === 'Bargaining Market' && (
                    <>
                      <th>{language === 'kn-IN' ? 'ಕನಿಷ್ಠ ಪ್ರಮಾಣ' : 'Min Quantity'}</th>
                      <th>{language === 'kn-IN' ? 'ಕನಿಷ್ಠ ಬೆಲೆ' : 'Min Price'}</th>
                    </>
                  )}
                  <th>{language === 'kn-IN' ? 'ಕ್ರಿಯೆಗಳು' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {produces.map((produce) => (
                  <tr key={produce.product_id}>
                    <td>{produce.produce_name}</td>
                    <td>{language === 'kn-IN' ? 
                          (produce.produce_type === 'Organic' ? 'ಜೈವಿಕ' : 'ಸಾಮಾನ್ಯ') : 
                          produce.produce_type}</td>
                    <td>{produce.availability} {language === 'kn-IN' ? 'ಕೆಜಿ' : 'kg'}</td>
                    <td>₹{produce.price_per_kg}</td>
                    {selectedMarket === 'Bargaining Market' && (
                      <>
                        <td>{produce.minimum_quantity || 'N/A'} {language === 'kn-IN' ? 'ಕೆಜಿ' : 'kg'}</td>
                        <td>₹{produce.minimum_price || 'N/A'}</td>
                      </>
                    )}
                    <td>
                      <button
                        className="addproduce-edit-button"
                        onClick={() => editProduce(produce)}
                        disabled={isLoading}
                      >
                        {language === 'kn-IN' ? 'ಸಂಪಾದಿಸಿ' : 'Edit'}
                      </button>
                      <button
                        className="addproduce-remove-button"
                        onClick={() => deleteProduce(produce.product_id)}
                        disabled={isLoading}
                      >
                        {language === 'kn-IN' ? 'ಅಳಿಸಿ' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>{language === 'kn-IN' ? 
              'ಈ ಮಾರುಕಟ್ಟೆಗೆ ಇನ್ನೂ ಯಾವುದೇ ಉತ್ಪನ್ನಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ' : 
              'No produces added yet for this market.'}</p>
          )}
        </>
      )}
    </div>
  );
};

export default AddProduce;