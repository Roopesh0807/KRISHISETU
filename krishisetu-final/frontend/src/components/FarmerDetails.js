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
  const [loadingError, setLoadingError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
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
      const response = await axios.get(`http://localhost:5000/reviews/${farmer_id}`);
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
  }, [farmer_id]);

  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/farmer/${farmer_id}`);
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
      setImagePreviews((prevPreviews) => {
        prevPreviews.forEach((preview) => URL.revokeObjectURL(preview));
        return [];
      });
    };
  }, [farmer_id, fetchReviews]);

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
      await axios.post("http://localhost:5000/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewReview({ consumer_name: consumer.name, rating: "", comment: "" });
      setImages([]);
      setImagePreviews([]);
      setShowAddReviewForm(false);
      await fetchReviews();
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
            <img src={Farmer} alt="Farmer" className="farmer-image" />
            <div className="farmer-details">
              <h2>{farmer.farmer_name}</h2>
              <p><span className="detail-label">Location:</span> {farmer.location || 'Not specified'}</p>
              <p><span className="detail-label">Farming Method:</span> {farmer.produce_type || 'Organic'}</p>
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
          </div>

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
                    
                    {review.image_urls && review.image_urls.length > 0 && (
                      <div className="review-images">
                        {review.image_urls.map((img, idx) => {
                          const imageUrl = img.startsWith('/uploads/') 
                            ? `http://localhost:5000${img}`
                            : `http://localhost:5000/uploads/${img}`;
                          
                          return (
                            <img
                              key={idx}
                              src={imageUrl}
                              alt={`Review ${idx}`}
                              onError={(e) => {
                                console.error("Failed to load image:", imageUrl);
                                e.target.style.display = 'none';
                              }}
                            />
                          );
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
    </>
  );
};

export default FarmerDetails;