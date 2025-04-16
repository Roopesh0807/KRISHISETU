import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./FarmerReview.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FarmerReview = () => {
    const { farmer, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Enhanced farmer authentication check
                if (!farmer || (!farmer.farmer_id && !farmer.id) || !farmer.token) {
                    console.warn("Farmer not properly authenticated", farmer);
                    //setError("Please log in as a farmer");
                    setIsLoading(false);
                    
                    // Check if we have partial farmer data (might need refresh)
                    if (farmer && (farmer.farmer_id || farmer.id)) {
                        setTimeout(() => window.location.reload(), 1000);
                    }
                    return;
                }

                setIsLoading(true);
                setError(null);

                // Get the correct farmer ID (support both farmer_id and id)
                const farmerId = farmer.farmer_id || farmer.id;
                console.log(`Fetching reviews for farmer ID: ${farmerId}`);
                
                const response = await axios.get(
                    `http://localhost:5000/reviews/${farmerId}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${farmer.token}`,
                        },
                    }
                );

                setReviews(response.data || []);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
                
                if (error.response?.status === 401) {
                    setError("Session expired. Please log in again.");
                    logout();
                    setTimeout(() => navigate("/farmer-login"), 2000);
                } else {
                    setError(error.response?.data?.error || "Failed to load reviews");
                }
            } finally {
                setIsLoading(false);
            }
        };

        // Add slight delay to ensure AuthContext is fully initialized
        const timer = setTimeout(fetchReviews, 100);
        return () => clearTimeout(timer);
    }, [farmer, navigate, logout]);

    // Helper function to create image URLs
    const createImageUrl = (imgPath) => {
        if (!imgPath) return "";
        if (imgPath.startsWith("http")) return imgPath;
        if (imgPath.startsWith("uploads/")) return `http://localhost:5000/${imgPath}`;
        if (imgPath.startsWith("/uploads")) return `http://localhost:5000${imgPath}`;
        return `http://localhost:5000/uploads/${imgPath}`;
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading your reviews...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <div className="error-actions">
                    <button onClick={() => window.location.reload()}>
                        Retry
                    </button>
                    {error.includes("log in") && (
                        <button 
                            onClick={() => navigate("/farmer-login")}
                            className="login-button"
                        >
                            Go to Login
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Main content
    return (
        <div className="farmer-reviews-container">
            <div className="farmer-reviews">
                <div className="reviews-header">
                    <h2>
                        <span>📝</span> Your Customer Reviews
                        {reviews.length > 0 && (
                            <span className="review-count">
                                ({reviews.length})
                            </span>
                        )}
                    </h2>
                </div>

                {reviews.length > 0 ? (
                    <div className="reviews-list">
                        {reviews.map((review) => (
                            <div key={review.review_id} className="review-card">
                                <div className="reviewer-info">
                                    <div className="reviewer-avatar">
                                        {review.consumer_name?.charAt(0)?.toUpperCase() || 'C'}
                                    </div>
                                    <div className="reviewer-details">
                                        <h3>{review.consumer_name || "Anonymous"}</h3>
                                        <div className="rating">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    className={star <= review.rating ? "filled" : ""}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        <span className="review-date">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                                {review.image_urls?.length > 0 && (
                                    <div className="review-images">
                                        {review.image_urls.map((img, i) => (
                                            <img
                                                key={i}
                                                src={createImageUrl(img)}
                                                alt={`Review ${i + 1}`}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://via.placeholder.com/100?text=Image+Not+Found";
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-reviews">
                        <img
                            src="/images/no-reviews.svg"
                            alt="No reviews yet"
                        />
                        <p>No reviews yet from your customers</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerReview;