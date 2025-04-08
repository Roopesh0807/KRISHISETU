import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import "./FarmerReview.css";

const FarmerReview = () => {
    const { user , consumer} = useContext(AuthContext);
    const loggedInFarmerId = user?.farmer_id;
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //     const fetchReviews = async () => {
    //         if (!loggedInFarmerId) {
    //             setIsLoading(false);
    //             return;
    //         }

    //         try {
    //             setIsLoading(true);
    //             const response = await fetch(`/api/reviews/farmer/${loggedInFarmerId}`);
    //             const data = await response.json();
    //             setReviews(data);
    //         } catch (error) {
    //             console.error("Error fetching reviews:", error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };

    //     fetchReviews();
    // }, [loggedInFarmerId]);


    useEffect(() => {
        const fetchReviews = async () => {
            if (!loggedInFarmerId) {
                setIsLoading(false);
                return;
            }
    
            try {
                setIsLoading(true);
    
                // Get token from localStorage (or sessionStorage if you're using that)
                // const token = localStorage.getItem("token");
    
                const response = await fetch(`/api/reviews/farmer/${loggedInFarmerId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${consumer.token}`
                    }
                });
    
                if (!response.ok) {
                    throw new Error("Failed to fetch reviews");
                }
    
                const data = await response.json();
                setReviews(data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchReviews();
    }, [loggedInFarmerId]);
    
    return (
        <>
            
            <div className="farmer-reviews-container">
                <div className="farmer-reviews">
                    <div className="reviews-header">
                        <h2 className="section-title">
                            <span className="title-icon">📝</span> Customer Reviews
                            {reviews.length > 0 && <span className="review-count">{reviews.length} reviews</span>}
                        </h2>
                    </div>
                    
                    {isLoading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading reviews...</p>
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="reviews-list">
                            {reviews.map((review, index) => (
                                <div key={index} className="review-card">
                                    <div className="reviewer-info">
                                        <div className="reviewer-avatar">
                                            {review.consumer_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="reviewer-main">
                                            <div className="reviewer-top">
                                                <h3 className="reviewer-name">{review.consumer_name}</h3>
                                                <div className="rating">
                                                    {Array(5).fill(0).map((_, i) => (
                                                        <span 
                                                            key={i} 
                                                            className={i < review.rating ? "star-filled" : "star-empty"}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            {review.created_at && (
                                                <span className="review-date">
                                                    {new Date(review.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-reviews">
                            <img src="/images/no-reviews.svg" alt="No reviews" className="no-reviews-img" />
                            <p>No reviews yet. Your customers haven't left any feedback.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FarmerReview;