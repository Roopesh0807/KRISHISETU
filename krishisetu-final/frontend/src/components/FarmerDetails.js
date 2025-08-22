// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { useParams, useNavigate , useLocation} from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";
// import "./farmerDetails.css";
// import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
 
//   faHandshake,
 
// } from '@fortawesome/free-solid-svg-icons';


// import Farmer from "../assets/farmer.jpeg";

// const FarmerDetails = () => {
//   const { farmer_id } = useParams();
//   const { consumer } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [farmer, setFarmer] = useState(null);
//   const [loadingError, setLoadingError] = useState(null);
//   const [reviews, setReviews] = useState([]);
//   const [showAddReviewForm, setShowAddReviewForm] = useState(false);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
   

//   const [newReview, setNewReview] = useState({
//     rating: "",
//     comment: "",
//   });
//   const [images, setImages] = useState([]);
//   const [isLoadingReviews, setIsLoadingReviews] = useState(true);
//   const imagePreviewsRef = useRef([]);
//   const [imagePreviews, setImagePreviews] = useState([]);

//   const calculateAverageRating = (reviews) => {
//     if (!reviews || reviews.length === 0) return 0;
//     const total = reviews.reduce((sum, review) => sum + parseFloat(review.rating), 0);
//     const average = total / reviews.length;
//     return Math.round(average * 10) / 10;
//   };

//   const fetchReviews = useCallback(async () => {
//     setIsLoadingReviews(true);
//     try {
//       const response = await axios.get(`http://localhost:5000/reviews/${farmer_id}`,{
//         headers: {
//           "Authorization": `Bearer ${consumer?.token}`,
//         },
//       });
//       setReviews(response.data);
//       const avgRating = calculateAverageRating(response.data);
//       setFarmer(prevFarmer => ({
//         ...prevFarmer,
//         ratings: avgRating
//       }));
//     } catch (error) {
//       console.error('Error fetching reviews:', error);
//       setLoadingError("Failed to load reviews");
//     } finally {
//       setIsLoadingReviews(false);
//     }
//   }, [farmer_id, consumer?.token]);

//   // useEffect(() => {
//   //   const fetchFarmerData = async () => {
//   //     try {
//   //       const response = await axios.get(`http://localhost:5000/farmer/${farmer_id}`);
//   //       if (response.data) {
//   //         const reviewsResponse = await axios.get(`http://localhost:5000/reviews/${farmer_id}`);
//   //         const averageRating = calculateAverageRating(reviewsResponse.data);
//   //         setFarmer({
//   //           ...response.data,
//   //           ratings: averageRating
//   //         });
//   //         await fetchReviews();
//   //       } else {
//   //         setLoadingError("Farmer data not found");
//   //       }
//   //     } catch (error) {
//   //       console.error("Error fetching farmer details:", error);
//   //       setLoadingError("Failed to load farmer details");
//   //     }
//   //   };
  
//   //   fetchFarmerData();
  
//   //   return () => {
//   //     setImagePreviews((prevPreviews) => {
//   //       prevPreviews.forEach((preview) => URL.revokeObjectURL(preview));
//   //       return [];
//   //     });
//   //   };
//   // }, [farmer_id, fetchReviews]);

//   useEffect(() => {
//     const fetchFarmerData = async () => {
     
  
//       try {
//         const response = await axios.get(`http://localhost:5000/farmer/${farmer_id}`, {
//           headers: {
//             "Authorization": `Bearer ${consumer?.token}`
//           }
//         });
  
//         if (response.data) {
//            // Only fetch products with market_type = 'Bargaining Market'
//       const productsResponse = await axios.get(`http://localhost:5000/api/produces`, {
//         headers: {
//           "Authorization": `Bearer ${consumer?.token}`,
//         },
//         params: {
//           farmer_id: farmer_id,
//           market_type: 'Bargaining Market'
//         }
//       });
//           const reviewsResponse = await axios.get(`http://localhost:5000/reviews/${farmer_id}`, {
//             headers: {
//               "Authorization": `Bearer ${consumer?.token}`,
//             },
//           });
  
//           const averageRating = calculateAverageRating(reviewsResponse.data);
//           setFarmer({
//             ...response.data,
//             products: productsResponse.data, // Only bargaining market products
//             ratings: averageRating,
//           });
  
//           await fetchReviews(); // if fetchReviews internally makes requests, make sure it also uses the token
//         } else {
//           setLoadingError("Farmer data not found");
//         }
//       } catch (error) {
//         console.error("Error fetching farmer details:", error);
//         setLoadingError("Failed to load farmer details");
//       }
//     };
  
//     fetchFarmerData();
  
//     return () => {
//       setImagePreviews((prevPreviews) => {
//         prevPreviews.forEach((preview) => URL.revokeObjectURL(preview));
//         return [];
//       });
//     };
//   }, [farmer_id, fetchReviews, consumer?.token]);
  
//   const handleImageChange = (e) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       setImages(files);
//       const newPreviews = files.map(file => URL.createObjectURL(file));
//       imagePreviewsRef.current.forEach(URL.revokeObjectURL);
//       imagePreviewsRef.current = newPreviews;
//       setImagePreviews(newPreviews);
//     }
//   };

//   const handleBargainClick = async (farmer, product, e) => {
//     e.stopPropagation();
//     setError(null);
//     setIsLoading(true);
  
//     try {
//       if (!consumer?.token) {
//         navigate('/loginpage', { state: { from: location.pathname } });
//         return;
//       }
  
//       const quantity = 10;
  
//       const response = await fetch('http://localhost:5000/api/create-bargain', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${consumer.token}`
//         },
//         body: JSON.stringify({
//           farmer_id: farmer.farmer_id,
//           initiator: "consumer",
//         })
//       });
  
//       // const rawText = await response.text();
//       // console.log("🐞 Raw Response:", rawText);
  
//       // if (!response.ok) {
//       //   throw new Error(`Server responded with ${response.status}: ${rawText}`);
//       // }
  
//       // if (!rawText || rawText.trim() === "") {
//       //   throw new Error("Empty response received from server.");
//       // }
  
//       // let data;
//       // try {
//       //   data = JSON.parse(rawText);
//       // } catch (err) {
//       //   console.error("❌ JSON Parse Error:", err.message);
//       //   setError("Server returned invalid JSON: " + err.message);
//       //   return;
//       // }
//       const text = await response.text();
//       console.log("📦 Raw Response Text:", text);

//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch (err) {
//         console.error("❌ Failed to parse JSON:", err);
//       }

//       console.log("📄 Parsed Data:", data);
        
//       if (!data.bargainId) {
//         throw new Error("Missing bargainId in server response.");
//       }
  
//       // ✅ Now navigate with data
//       navigate(`/bargain/${data.bargainId}`, {
//         state: {
//           product,
//           farmer,
//           quantity,
//           originalPrice: data.originalPrice,
//           isNewBargain: true
//         }
//       });
  
//     } catch (error) {
//       console.error("🔥 Bargain initiation failed:", error.message);
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   const removeImage = (index) => {
//     URL.revokeObjectURL(imagePreviews[index]);
//     setImages(prev => prev.filter((_, i) => i !== index));
//     setImagePreviews(prev => prev.filter((_, i) => i !== index));
//   };
  
//   // const handleAddReview = async () => {
//   //   if (!consumer) {
//   //     alert("Please login to submit a review");
//   //     navigate("/consumer-login");
//   //     return;
//   //   }
  
//   //   if (!newReview.rating || !newReview.comment) {
//   //     alert("Please fill all required fields");
//   //     return;
//   //   }
  
//   //   if (!farmer_id || farmer_id === '0') {
//   //     alert("Invalid farmer selection");
//   //     return;
//   //   }
    
//   //   const formData = new FormData();
//   //   formData.append("farmer_id", farmer_id);
//   //   formData.append("consumer_id", consumer.consumer_id);
//   //   formData.append("consumer_name", consumer.full_name || "Anonymous");
//   //   formData.append("rating", newReview.rating);
//   //   formData.append("comment", newReview.comment);
//   //   images.forEach((image) => formData.append("images", image));

//   //   try {
//   //     await axios.post("http://localhost:5000/reviews", formData, {
//   //       headers: { "Authorization": `Bearer ${consumer?.token}`,
//   //                  "Content-Type": "multipart/form-data" 
                   
//   //       },
      
//   //     });

//   //     setNewReview({ consumer_name: consumer.name, rating: "", comment: "" });
//   //     setImages([]);
//   //     setImagePreviews([]);
//   //     setShowAddReviewForm(false);
//   //     await fetchReviews();
//   //     alert("✅ Review added successfully!");
//   //   } catch (error) {
//   //     console.error("Error adding review:", error);
//   //     alert("Failed to add review. Please try again.");
//   //   }
//   // };
//   const handleAddReview = async () => {
//     if (!consumer) {
//       alert("Please login to submit a review");
//       navigate("/consumer-login");
//       return;
//     }
  
//     if (!newReview.rating || !newReview.comment) {
//       alert("Please fill all required fields");
//       return;
//     }
  
//     if (!farmer_id || farmer_id === '0') {
//       alert("Invalid farmer selection");
//       return;
//     }
    
//     const formData = new FormData();
//     formData.append("farmer_id", farmer_id);
//     formData.append("consumer_id", consumer.consumer_id);
//     formData.append("consumer_name", consumer.full_name || "Anonymous");
//     formData.append("rating", newReview.rating);
//     formData.append("comment", newReview.comment);
//     images.forEach((image) => formData.append("images", image));
  
//     try {
//       const response = await axios.post("http://localhost:5000/reviews", formData, {
//         headers: { 
//           "Authorization": `Bearer ${consumer?.token}`,
//           "Content-Type": "multipart/form-data" 
//         },
//       });
  
//       // Update the reviews state with the new review
//       setReviews(prevReviews => [response.data, ...prevReviews]);
      
//       // Update the average rating
//       const avgRating = calculateAverageRating([response.data, ...reviews]);
//       setFarmer(prevFarmer => ({
//         ...prevFarmer,
//         ratings: avgRating
//       }));
  
//       setNewReview({ consumer_name: consumer.name, rating: "", comment: "" });
//       setImages([]);
//       setImagePreviews([]);
//       setShowAddReviewForm(false);
      
//       alert("✅ Review added successfully!");
//     } catch (error) {
//       console.error("Error adding review:", error);
//       alert("Failed to add review. Please try again.");
//     }
//   };
//   if (!farmer) {
//     return (
//       <div className="loading-container">
//         {loadingError ? (
//           <div className="error-message">
//             <p>{loadingError}</p>
//             <button onClick={() => window.location.reload()}>Retry</button>
//           </div>
//         ) : (
//           <div className="loading-spinner">
//             <p>Loading farmer details...</p>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <>
    
//       <div className="farmer-details-page">
//         <div className="farmer-profile-card">
//           <div className="farmer-info">
//             <img src={Farmer} alt="Farmer" className="farmer-image" />
//             <div className="farmer-details">
//               <h2>{farmer.farmer_name}</h2>
//               {/* <p><span className="detail-label">Location:</span> {farmer.location || 'Not specified'}</p> */}
//               <p><span className="detail-label">Farming Method:</span> {farmer.produce_type || 'Organic'}</p>
//               <div className="rating-container">
//                 <span className="detail-label">Rating:</span>
//                 <span className="rating-stars">
//                   {Array.from({ length: 5 }).map((_, i) => (
//                     <span 
//                       key={i} 
//                       className={i < Math.floor(farmer.ratings) ? "star-filled" : "star-empty"}
//                     >
//                       {i < Math.floor(farmer.ratings) ? "★" : "☆"}
//                     </span>
//                   ))}
//                   <span className="rating-value">({farmer.ratings.toFixed(1)})</span>
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="section-container">
//             <h3 className="section-title">Available Products</h3>
//             {farmer.products && farmer.products.length > 0 ? (
//             <table className="produce-table">
//               <thead>
//                 <tr>
//                   <th>Produce</th>
//                   <th>Type</th>
//                   <th>Price (₹/kg)</th>
//                   <th>Availability (kg)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {farmer.products.map((product) => (
//                   <tr key={product.product_id}>
//                     <td>{product.produce_name}</td>
//                     <td>{product.produce_type}</td>
//                     <td>₹{product.price_per_kg}</td>
//                     <td>{product.availability}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             ):(
//               <p className="no-products">No products available for bargaining at this time.</p>
//             )}
//           </div>

//           <div className="action-buttons">
//             <button
//               onClick={() => navigate(`/consumer-dashboard`)}
//               className="action-button back-button"
//             >
//               ← Back to Dashboard
//             </button>
//             {farmer.products && farmer.products.length > 0 && (
//                               <button 
//                                 onClick={(e) => handleBargainClick(farmer, farmer.products[0], e)} 
//                                 className="ks-farmer-action-btn ks-bargain-btn"
//                                 disabled={isLoading}
//                               >
//                                 {isLoading ? (
//                                   <FontAwesomeIcon icon={faSpinner} spin />
//                                 ) : (
//                                   <>
//                                     <FontAwesomeIcon icon={faHandshake} /> Bargain
//                                   </>
//                                 )}
//                               </button>
//             )}
//           </div>

//           {showAddReviewForm && (
//             <div className="add-review-form">
//               <h3>Add Your Review</h3>
              
//               <div className="form-group">
//                 <label>Your Name *</label>
//                 <input
//                   type="text"
//                   value={consumer?.full_name || "Guest (please login)"}
//                   readOnly
//                   className="readonly-input"
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label>Rating *</label>
//                 <div className="star-rating">
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <span
//                       key={star}
//                       className={star <= newReview.rating ? "selected" : ""}
//                       onClick={() => setNewReview({...newReview, rating: star})}
//                     >
//                       ★
//                     </span>
//                   ))}
//                 </div>
//               </div>
              
//               <div className="form-group">
//                 <label>Your Review *</label>
//                 <textarea
//                   value={newReview.comment}
//                   onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
//                   required
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label>Upload Images (Max 5)</label>
//                 <input
//                   type="file"
//                   onChange={handleImageChange}
//                   accept="image/*"
//                   multiple
//                 />
//                 <div className="image-previews">
//                   {imagePreviews.map((preview, index) => (
//                     <div key={index} className="image-preview">
//                       <img src={preview} alt={`Preview ${index}`} />
//                       <button 
//                         type="button"
//                         onClick={() => removeImage(index)}
//                         className="remove-image"
//                       >
//                         ×
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
              
//               <div className="form-actions">
//                 <button onClick={handleAddReview}>Submit Review</button>
//                 <button 
//                   type="button"
//                   onClick={() => setShowAddReviewForm(false)}
//                   className="cancel-button"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className="reviews-section">
//             <div className="reviews-header">
//               <h3>Customer Reviews</h3>
//               <span className="review-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
//               <button 
//                 onClick={() => setShowAddReviewForm(true)}
//                 className="add-review-button"
//               >
//                 + Add Review
//               </button>
//             </div>
            
//             {isLoadingReviews ? (
//               <div className="loading">Loading reviews...</div>
//             ) : reviews.length > 0 ? (
//               <div className="reviews-list">
//                 {reviews.map((review) => (
//                   <div key={review.review_id} className="review-card">
//                     <div className="review-header">
//                       <div className="reviewer-info">
//                         <h4>{review.consumer_name}</h4>
//                         <div className="review-rating">
//                           {Array(5).fill(0).map((_, i) => (
//                             <span key={i} className={i < review.rating ? 'filled' : ''}>
//                               {i < review.rating ? '★' : '☆'}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                       <div className="review-date">
//                         {new Date(review.created_at).toLocaleString('en-US', {
//                           year: 'numeric',
//                           month: 'short',
//                           day: 'numeric',
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}
//                       </div>
//                     </div>
                    
//                     <p className="review-comment">{review.comment}</p>
//                     {review.image_urls?.length > 0 && (
//                       <div className="review-images">
//                         {review.image_urls.map((imgPath, i) => {
//                           // Handle both full URLs and relative paths
//                           let imgUrl = imgPath;
//                           if (!imgPath.startsWith('http') && !imgPath.startsWith('/uploads')) {
//                             imgUrl = `/uploads/${imgPath}`;
//                           }
//                           return (
//                             <div key={i} className="review-image-container">
//                               <img
//                                   src={`http://localhost:5000${imgPath}`}
//                                   alt={`Review image ${i + 1}`}
//                                   onError={(e) => {
//                                     e.target.onerror = null;
//                                     e.target.src = 'https://via.placeholder.com/100?text=Not+Found'; // temporary fallback
//                                   }}
//                                   style={{
//                                     width: "100px",
//                                     height: "100px",
//                                     objectFit: "cover",
//                                     borderRadius: "8px",
//                                     border: "1px solid #ccc"
//                                   }}
//                                 />

//                             </div>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="no-reviews">
//                 <p>No reviews yet. Be the first to review this farmer!</p>
//                 <button 
//                   onClick={() => setShowAddReviewForm(true)}
//                   className="add-review-button"
//                 >
//                   + Add Review
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default FarmerDetails;
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate , useLocation} from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./farmerDetails.css";
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshake } from '@fortawesome/free-solid-svg-icons';

const FarmerDetails = () => {
  const { farmer_id } = useParams();
  const { consumer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [loadingError, setLoadingError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newReview, setNewReview] = useState({
    rating: "",
    comment: "",
  });
  const [images, setImages] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const imagePreviewsRef = useRef([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + parseFloat(review.rating), 0);
    const average = total / reviews.length;
    return Math.round(average * 10) / 10;
  };

  const fetchReviews = useCallback(async () => {
    setIsLoadingReviews(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/reviews/${farmer_id}`,{
        headers: {
          "Authorization": `Bearer ${consumer?.token}`,
        },
      });
      setReviews(response.data);
      const avgRating = calculateAverageRating(response.data);
      setFarmer(prevFarmer => ({
        ...prevFarmer,
        ratings: avgRating
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoadingError("Failed to load reviews");
    } finally {
      setIsLoadingReviews(false);
    }
  }, [farmer_id, consumer?.token]);

  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        // Fetch personal details
        const personalResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/farmerprofile/${farmer_id}/personal`, {
          headers: {
            "Authorization": `Bearer ${consumer?.token}`
          }
        });
        
        // Fetch farm details
        const farmResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/farmerprofile/${farmer_id}/farm`, {
          headers: {
            "Authorization": `Bearer ${consumer?.token}`
          }
        });
        
        // Fetch products with market_type = 'Bargaining Market'
        const productsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/produces`, {
          headers: {
            "Authorization": `Bearer ${consumer?.token}`,
          },
          params: {
            farmer_id: farmer_id,
            market_type: 'Bargaining Market'
          }
        });

        // Fetch reviews
        const reviewsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/reviews/${farmer_id}`, {
          headers: {
            "Authorization": `Bearer ${consumer?.token}`,
          },
        });

        const averageRating = calculateAverageRating(reviewsResponse.data);
        
        // Combine all data into farmer object
        setFarmer({
          farmer_id: farmer_id,
          farmer_name: personalResponse.data.name,
          email: personalResponse.data.email,
          profile_photo: personalResponse.data.profile_photo 
            ? `${process.env.REACT_APP_BACKEND_URL}${personalResponse.data.profile_photo}`
            : null,
          gender: personalResponse.data.gender,
          upi_id: personalResponse.data.upi_id,
          farming_method: farmResponse.data.farming_method,
          products: productsResponse.data,
          ratings: averageRating,
          // Include other fields you want to display
          contact_no: personalResponse.data.contact_no,
          farm_address: farmResponse.data.farm_address,
          crops_grown: farmResponse.data.crops_grown
        });

        await fetchReviews();
      } catch (error) {
        console.error("Error fetching farmer details:", error);
        setLoadingError("Failed to load farmer details");
      }
    };

    fetchFarmerData();

    return () => {
      setImagePreviews((prevPreviews) => {
        prevPreviews.forEach((preview) => URL.revokeObjectURL(preview));
        return [];
      });
    };
  }, [farmer_id, fetchReviews, consumer?.token]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      imagePreviewsRef.current.forEach(URL.revokeObjectURL);
      imagePreviewsRef.current = newPreviews;
      setImagePreviews(newPreviews);
    }
  };

  const handleBargainClick = async (farmer, product, e) => {
    e.stopPropagation();
    setError(null);
    setIsLoading(true);
  
    try {
      if (!consumer?.token) {
        navigate('/loginpage', { state: { from: location.pathname } });
        return;
      }
  
      const quantity = 10;

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/create-bargain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify({
          farmer_id: farmer.farmer_id,
          initiator: "consumer",
        })
      });

      const text = await response.text();
      console.log("📦 Raw Response Text:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("❌ Failed to parse JSON:", err);
      }

      console.log("📄 Parsed Data:", data);
        
      if (!data.bargainId) {
        throw new Error("Missing bargainId in server response.");
      }
  
      navigate(`/bargain/${data.bargainId}`, {
        state: {
          product,
          farmer,
          quantity,
          originalPrice: data.originalPrice,
          isNewBargain: true
        }
      });
  
    } catch (error) {
      console.error("🔥 Bargain initiation failed:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddReview = async () => {
    if (!consumer) {
      alert("Please login to submit a review");
      navigate("/consumer-login");
      return;
    }
  
    if (!newReview.rating || !newReview.comment) {
      alert("Please fill all required fields");
      return;
    }
  
    if (!farmer_id || farmer_id === '0') {
      alert("Invalid farmer selection");
      return;
    }
    
    const formData = new FormData();
    formData.append("farmer_id", farmer_id);
    formData.append("consumer_id", consumer.consumer_id);
    formData.append("consumer_name", consumer.full_name || "Anonymous");
    formData.append("rating", newReview.rating);
    formData.append("comment", newReview.comment);
    images.forEach((image) => formData.append("images", image));
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/reviews`, formData, {
        headers: { 
          "Authorization": `Bearer ${consumer?.token}`,
          "Content-Type": "multipart/form-data" 
        },
      });
  
      setReviews(prevReviews => [response.data, ...prevReviews]);
      
      const avgRating = calculateAverageRating([response.data, ...reviews]);
      setFarmer(prevFarmer => ({
        ...prevFarmer,
        ratings: avgRating
      }));
  
      setNewReview({ consumer_name: consumer.name, rating: "", comment: "" });
      setImages([]);
      setImagePreviews([]);
      setShowAddReviewForm(false);
      
      alert("✅ Review added successfully!");
    } catch (error) {
      console.error("Error adding review:", error);
      alert("Failed to add review. Please try again.");
    }
  };

  if (!farmer) {
    return (
      <div className="loading-container">
        {loadingError ? (
          <div className="error-message">
            <p>{loadingError}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className="loading-spinner">
            <p>Loading farmer details...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="farmer-details-page">
        <div className="farmer-profile-card">
          <div className="farmer-info">
            {farmer.profile_photo ? (
              <img 
                src={farmer.profile_photo} 
                alt="Farmer" 
                className="farmer-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=No+Photo';
                }}
              />
            ) : (
              <div className="farmer-image-placeholder">
                <div className="placeholder-icon">👨‍🌾</div>
              </div>
            )}
            <div className="farmer-details">
              <h2>{farmer.farmer_name}</h2>
              <p><span className="detail-label">Gender:</span> {farmer.gender || 'Not specified'}</p>
              {/* <p><span className="detail-label">Contact:</span> {farmer.contact_no || 'Not specified'}</p> */}
              <p><span className="detail-label">UPI ID:</span> {farmer.upi_id || 'Not specified'}</p>
              <p><span className="detail-label">Farming Method:</span> {farmer.farming_method || 'Not specified'}</p>
              <p><span className="detail-label">Farm Location:</span> {farmer.farm_address || 'Not specified'}</p>
              <p><span className="detail-label">Crops Grown:</span> {farmer.crops_grown || 'Not specified'}</p>
              
              <div className="rating-container">
                <span className="detail-label">Rating:</span>
                <span className="rating-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={i < Math.floor(farmer.ratings) ? "star-filled" : "star-empty"}
                    >
                      {i < Math.floor(farmer.ratings) ? "★" : "☆"}
                    </span>
                  ))}
                  <span className="rating-value">({farmer.ratings.toFixed(1)})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="section-container">
            <h3 className="section-title">Available Products</h3>
            {farmer.products && farmer.products.length > 0 ? (
            <table className="produce-table">
              <thead>
                <tr>
                  <th>Produce</th>
                  <th>Type</th>
                  <th>Price (₹/kg)</th>
                  <th>Availability (kg)</th>
                </tr>
              </thead>
              <tbody>
                {farmer.products.map((product) => (
                  <tr key={product.product_id}>
                    <td>{product.produce_name}</td>
                    <td>{product.produce_type}</td>
                    <td>₹{product.price_per_kg}</td>
                    <td>{product.availability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            ):(
              <p className="no-products">No products available for bargaining at this time.</p>
            )}
          </div>

          <div className="action-buttons">
            <button
              onClick={() => navigate(`/consumer-dashboard`)}
              className="action-button back-button"
            >
              ← Back to Dashboard
            </button>
            {farmer.products && farmer.products.length > 0 && (
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
            )}
          </div>

          {showAddReviewForm && (
            <div className="add-review-form">
              <h3>Add Your Review</h3>
              
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  value={consumer?.full_name || "Guest (please login)"}
                  readOnly
                  className="readonly-input"
                />
              </div>
              
              <div className="form-group">
                <label>Rating *</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= newReview.rating ? "selected" : ""}
                      onClick={() => setNewReview({...newReview, rating: star})}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Your Review *</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Upload Images (Max 5)</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                />
                <div className="image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Preview ${index}`} />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-actions">
                <button onClick={handleAddReview}>Submit Review</button>
                <button 
                  type="button"
                  onClick={() => setShowAddReviewForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="reviews-section">
            <div className="reviews-header">
              <h3>Customer Reviews</h3>
              <span className="review-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
              <button 
                onClick={() => setShowAddReviewForm(true)}
                className="add-review-button"
              >
                + Add Review
              </button>
            </div>
            
            {isLoadingReviews ? (
              <div className="loading">Loading reviews...</div>
            ) : reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.review_id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <h4>{review.consumer_name}</h4>
                        <div className="review-rating">
                          {Array(5).fill(0).map((_, i) => (
                            <span key={i} className={i < review.rating ? 'filled' : ''}>
                              {i < review.rating ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="review-date">
                        {new Date(review.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <p className="review-comment">{review.comment}</p>
                    {review.image_urls?.length > 0 && (
                      <div className="review-images">
                        {review.image_urls.map((imgPath, i) => (
                          <div key={i} className="review-image-container">
                            <img
                              src={`${process.env.REACT_APP_BACKEND_URL}${imgPath}`}
                              alt={`Review image ${i + 1}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/100?text=Not+Found';
                              }}
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "1px solid #ccc"
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review this farmer!</p>
                <button 
                  onClick={() => setShowAddReviewForm(true)}
                  className="add-review-button"
                >
                  + Add Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FarmerDetails;