import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import "./FarmerReview.css";

const FarmerReview = () => {
    const { user } = useContext(AuthContext); // Get logged-in user
    const loggedInFarmerId = user?.farmer_id; // Ensure correct farmer ID
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!loggedInFarmerId) return; // Prevent API call if ID is missing

            try {
                const response = await fetch(`/api/reviews/farmer/${loggedInFarmerId}`);
                const data = await response.json();
                console.log("Fetched Reviews:", data);
                setReviews(data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };

        fetchReviews();
    }, [loggedInFarmerId]);

    return (
        <div className="farmer-reviews">
            <h2>My Reviews</h2>
            {reviews.length > 0 ? (
                reviews.map((review, index) => (
                    <div key={index} className="review-card">
                        <h3>{review.consumer_name}</h3>
                        <p className="rating">⭐ {review.rating}</p>
                        <p>{review.comment.replace(/\r\n/g, " ")}</p>
                    </div>
                ))
            ) : (
                <p>No reviews yet.</p>
            )}
        </div>
    );
};

export default FarmerReview;
