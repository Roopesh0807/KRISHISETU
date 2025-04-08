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

    // Debug farmer authentication status
    console.log("Current farmer auth status:", {
        isAuthenticated: !!farmer,
        farmerId: farmer?.farmer_id,
        hasToken: !!farmer?.token
    });

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // 1. Validate farmer authentication
                if (!farmer || !farmer.farmer_id || !farmer.token) {
                    console.warn("Farmer not properly authenticated", farmer);
                    setError("Please log in as a farmer");
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                setError(null);

                console.log(`Fetching reviews for farmer ID: ${farmer.farmer_id}`);
                
                // 2. Make authenticated request
                const response = await axios.get(
                    `http://localhost:5000/reviews/${farmer.farmer_id}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${farmer.token}`,
                        },
                    }
                );

                console.log("Received reviews:", response.data);
                setReviews(response.data || []);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
                
                // Handle specific error cases
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

        fetchReviews();
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