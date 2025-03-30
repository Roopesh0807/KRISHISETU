import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./farmerDetails.css";

import Farmer from "../assets/farmer.jpeg";

const FarmerDetails = () => {
  const { farmer_id } = useParams();
  const { consumer } = useAuth();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  // const [consumer] = useState(null);
  const [loadingError, setLoadingError] = useState(null);
  const [reviews, setReviews] = useState([]);
  // const [, setConsumerName] = useState(
  //    sessionStorage.getItem("consumer_name") );
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: "",
    comment: "",
  });
  const [images, setImages] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const imagePreviewsRef = useRef([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  // Get consumer info directly from session storage
  // const consumer_id = sessionStorage.getItem("consumer_id");
  // const consumer_name = sessionStorage.getItem("consumer_name") || "Guest"; console.log("Farmer ID from URL:", farmer_id);

const fetchReviews = useCallback(async () => {
  console.log(`[Frontend] Fetching reviews for farmer_id: ${farmer_id}`);
  setIsLoadingReviews(true);
  
  try {
    const response = await axios.get(`http://localhost:5000/reviews/${farmer_id}`);
    console.log(`/reviews/${farmer_id}`);

    console.log('[Frontend] Received:', response.data);

    // Client-side verification
    const incorrectReviews = response.data.filter(review => review.farmer_id !== farmer_id);
    if (incorrectReviews.length > 0) {
      console.error('[Frontend] Found reviews for wrong farmers:', incorrectReviews);
    }

    setReviews(response.data);

    // Calculate and update farmer rating
    const avgRating = calculateAverageRating(response.data);
    setFarmer(prevFarmer => ({
      ...prevFarmer,
      ratings: avgRating
    }));
  } catch (error) {
    console.error('[Frontend] Error:', {
      config: error.config,
      response: error.response?.data
    });
    setLoadingError("Failed to load reviews");
  } finally {
    setIsLoadingReviews(false);
  }
}, [farmer_id]);

// const fetchConsumerName = useCallback(async () => {
//   try {
//     // 1. First try sessionStorage
//     // let name = sessionStorage.getItem("consumer_name") ||
//     // localStorage.getItem("consumer_name");
    
//     // // 2. If not found, try localStorage
//     // if (!name && consumer_id) {
//     //   name = localStorage.getItem("consumer_name");
//     //   if (name) sessionStorage.setItem("consumer_name", name);
//     // }
    
//     // 3. If still not found and we have consumer_id, fetch from API
//     // if (!name && consumer_id) {
//     //   const response = await axios.get(`http://localhost:5000/api/consumerregistration/${consumer_id}`);
//     //   name = `${response.data.first_name} ${response.data.last_name}`;
//     //   sessionStorage.setItem("consumer_name", name);
//     // }
    
//     // 4. Set the name (or fallback if all failed)
//     const finalName = name ;
//     setConsumerName(finalName);
//     setNewReview(prev => ({ ...prev, consumer_name: finalName }));
//   } catch (error) {
//     console.error("Error getting consumer name:", error);
//   }
// }, [consumer_id]);  // Proper useCallback dependency array
  
// Add this function to calculate average rating
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => sum + parseFloat(review.rating), 0);
  const average = total / reviews.length;
  return Math.round(average * 10) / 10; // Round to 1 decimal place
};

  // useEffect(() => {
  //   fetchConsumerName();
  // }, [fetchConsumerName]);


  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        console.log("Fetching farmer data...");
        const response = await axios.get(`http://localhost:5000/farmer/${farmer_id}`)
        console.log("Farmer response:", response.data);
        if (response.data) {
          const reviewsResponse = await axios.get(`http://localhost:5000/reviews/${farmer_id}`);
          const averageRating = calculateAverageRating(reviewsResponse.data);
          
          setFarmer({
            ...response.data,
            ratings: averageRating
          });
          
          await fetchReviews();
        } else {
          setLoadingError("Farmer data not found");
        }
      } catch (error) {
        console.error("Error fetching farmer details:", error);
        setLoadingError("Failed to load farmer details");
      }
    };
  
    fetchFarmerData();
  
    return () => {
      // Revoke image previews safely using a callback function
      setImagePreviews((prevPreviews) => {
        prevPreviews.forEach((preview) => URL.revokeObjectURL(preview));
        return []; // Clear previews
      });
    };
  }, [farmer_id, fetchReviews]); // Do NOT include imagePreviews
  
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

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);  // Revoke before removal
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
    formData.append("consumer_name", consumer.full_name || "Anonymous"); // Use full_name from context
    formData.append("rating", newReview.rating);
    formData.append("comment", newReview.comment);
    images.forEach((image) => {
      formData.append("images", image);

    });
    console.log("📤 Sending Review Data:", Object.fromEntries(formData.entries()));
    

    try {
      await axios.post("http://localhost:5000/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewReview({ consumer_name:consumer.name, rating: "", comment: "" });
      setImages([]);
      setImagePreviews([]);
      setShowAddReviewForm(false);
      await fetchReviews();

     
      alert("✅ Review added successfully!");
    } catch (error) {
      console.error("❌ Error adding review:", error);
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
            {/* You could add a spinner here */}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="farmer-details-page">
      <div className="farmer-profile-card">
        <div className="farmer-info">
          <img src={Farmer} alt="Farmer" className="farmer-image" />
          <div className="farmer-details">
            <h2>{farmer.farmer_name}</h2>
            <p><span className="detail-label">Farmer ID:</span> {farmer.farmer_id}</p>
            <p><span className="detail-label">Farming Method:</span> {farmer.produce_type}</p>
            <div className="rating-container">
              <span className="detail-label">Overall Rating:</span>
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

        {/* Produce Details */}
        <div className="section-container">
          <h3 className="section-title">Available Products</h3>
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
              {farmer.products.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.product_id}</td>
                  <td>{product.produce_name}</td>
                  <td>{product.produce_type}</td>
                  <td>₹{product.price_per_kg}</td>
                  <td>{product.availability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={() => navigate(`/consumer-dashboard`)}
            className="action-button back-button"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => navigate(`/bargain/${farmer.farmer_id}`)}
            className="action-button bargain-button"
          >
            Bargain Now
          </button>
          
        </div>

        {/* Add Review Form */}
        {showAddReviewForm && (
        <div className="add-review-form">
          <h3>Add Your Review</h3>
          
          {/* Name Input */}
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              value={consumer?.full_name || "Guest (please login)"}
              readOnly
              className="readonly-input"
            />
          </div>
          
          {/* Rating Input */}
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
          
          {/* Comment Input */}
          <div className="form-group">
            <label>Your Review *</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              required
            />
          </div>
          
          {/* Image Upload */}
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

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h3>Customer Reviews</h3>
          <span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
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
    
    {review.image_urls && review.image_urls.length > 0 && (
  <div className="review-images">
    {review.image_urls.map((img, idx) => {
      try {
        const imageUrl = img.startsWith('/uploads/') 
          ? `http://localhost:5000${img}`
          : `http://localhost:5000/uploads/${img}`;
        
        return (
          <img
            key={idx}
            src={imageUrl}
            alt={`Review ${idx}`}
            style={{ 
              width: "100px", 
              height: "100px", 
              objectFit: "cover", 
              margin: "5px" 
            }}
            onError={(e) => {
              console.error("Failed to load image:", imageUrl);
              e.target.style.display = 'none';
            }}
          />
        );
      } catch (error) {
        console.error("Error rendering image:", error);
        return null;
      }
    })}
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
  );
};

export default FarmerDetails;