import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { faArrowLeft, faBolt, faShoppingCart, faTimesCircle, faFire, faCheckCircle, faSpinner, faShareAlt, faCopy, faLock, faStar, faStarHalfAlt, faCamera, faQuestionCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './CommunityFlashDeals.css';

const CommunityFlashDeals = () => {
    const { consumer } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isFlashDealActive, setIsFlashDealActive] = useState(false);
    const [shareableLink, setShareableLink] = useState('');
    const [whatsappLink, setWhatsappLink] = useState('');
    const [showQuantityPopup, setShowQuantityPopup] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [imagesCache, setImagesCache] = useState({});
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showReviewsPopup, setShowReviewsPopup] = useState(false);
    const [selectedProductForReviews, setSelectedProductForReviews] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showFarmPhotosPopup, setShowFarmPhotosPopup] = useState(false);
    const [selectedProductForFarmPhotos, setSelectedProductForFarmPhotos] = useState(null);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        const hasSeenInstructions = localStorage.getItem('hasSeenFlashDealInstructions');
        if (!hasSeenInstructions) {
            setShowInstructions(true);
            localStorage.setItem('hasSeenFlashDealInstructions', 'true');
        }
    }, []);

    // Function to generate a unique community ID
    const getOrCreateCommunityId = () => {
        let communityId = localStorage.getItem('userCommunityId');
        if (!communityId) {
            communityId = `COMM-${Date.now()}-${Math.floor(Math.random() * 10)}`;
            localStorage.setItem('userCommunityId', communityId);
        }
        return communityId;
    };

    const fetchProductImage = async (productName) => {
        if (imagesCache[productName]) {
            return imagesCache[productName];
        }
        try {
            const response = await fetch(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(productName)}&per_page=1`,
                {
                    headers: {
                        Authorization: 'uONxxczjZM1uaDw2jsGQPV70vtBfQbuyHcKeJ0aaCwsK0xxbo5HDpamR'
                    }
                }
            );
            const data = await response.json();
            const imageUrl = data.photos[0]?.src.medium || 'https://via.placeholder.co/300x200?text=Image+Not+Found';
            setImagesCache(prev => ({ ...prev, [productName]: imageUrl }));
            return imageUrl;
        } catch (error) {
            console.error('Error fetching image:', error);
            return 'https://via.placeholder.co/300x200?text=Image+Not+Found';
        }
    };

    const handleCopyLink = (event) => {
        event.stopPropagation();
        navigator.clipboard.writeText(shareableLink);
        setToastMessage('Link copied to clipboard!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} className="star filled-star" />);
        }
        if (halfStar) {
            stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className="star half-star" />);
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={farStar} className="star empty-star" />);
        }
        return <div className="star-rating">{stars}</div>;
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAddToCart = async () => {
        if (!selectedProduct || !consumer?.consumer_id) {
            setToastMessage("User or product data is missing.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        const communityId = getOrCreateCommunityId();
        
        setLoading(true);
        setShowQuantityPopup(false);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community-cart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${consumer.token}`
                },
                body: JSON.stringify({
                    community_id: communityId,
                    product_id: selectedProduct.product_id,
                    consumer_id: consumer.consumer_id,
                    quantity: quantity,
                    price: selectedProduct.minimum_price
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add to cart');
            }

            setToastMessage(`${selectedProduct.produce_name} added to community cart successfully!`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            setError(err.message);
            setToastMessage(`Error: ${err.message}`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        } finally {
            setLoading(false);
        }
    };

    const DealCard = ({ deal, isAvailable }) => {
        const { produce_name, price_per_kg, minimum_price, availability, farmer_name, produce_type, average_rating, farm_address, profile_photo, farm_photographs } = deal;
        const [imageSrc, setImageSrc] = useState('https://via.placeholder.com/300?text=Loading...');

        useEffect(() => {
            fetchProductImage(produce_name).then(url => setImageSrc(url));
        }, [produce_name]);
        
        const discount = price_per_kg > 0 ? (((price_per_kg - minimum_price) / price_per_kg) * 100).toFixed(0) : 0;
        const buttonClass = `deal-action-btn ${!isAvailable ? 'deal-unavailable' : ''}`;

        const openQuantityPopup = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isAvailable) {
                setSelectedProduct(deal);
                setQuantity(1);
                setShowQuantityPopup(true);
            }
        };

        const handleShowReviews = () => {
            setSelectedProductForReviews(deal);
            setShowReviewsPopup(true);
        };
        
        const handleShowFarmPhotos = () => {
            let photos = [];
            if (typeof farm_photographs === 'string' && farm_photographs.length > 0) {
                photos = farm_photographs.split(',').map(p => p.trim());
            } else if (Array.isArray(farm_photographs)) {
                photos = farm_photographs;
            }
            setSelectedProductForFarmPhotos({ ...deal, farm_photographs: photos });
            setShowFarmPhotosPopup(true);
        };
        
        const defaultFarmerPhoto = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        const numericRating = Number(average_rating) || 0;

        return (
            <div className="deal-card">
                <div className="deal-image-container">
                    <img
                        src={imagesCache[produce_name] || 'https://source.unsplash.com/300x200/?vegetables,fruits'}
                        alt={produce_name}
                        className="deal-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://source.unsplash.com/300x200/?${encodeURIComponent(produce_name)}`;
                        }}
                    />
                    <div className="deal-overlay"></div>
                    <div className={`produce-type-tag ${produce_type?.toLowerCase() || ''}`}>
                        {produce_type}
                    </div>
                    <div className="discount-tag">-{discount}% OFF</div>
                </div>
                <div className="deal-content">
                    <div className="farmer-info-header">
                        <img
                            src={profile_photo || defaultFarmerPhoto}
                            alt={farmer_name || 'Farmer Avatar'}
                            className="farmer-profile-photo"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultFarmerPhoto;
                            }}
                        />
                        <div className="farmer-details">
                            <h3>{produce_name}</h3>
                            <p className="farmer-name">by {farmer_name || 'N/A'}</p>
                            {numericRating > 0 ? (
                                <div className="rating-display">
                                    {renderStars(numericRating)}
                                    <span className="rating-text">({numericRating.toFixed(1)})</span>
                                </div>
                            ) : (
                                <p className="no-ratings-text">No ratings yet</p>
                            )}
                        </div>
                    </div>
                    <p className="farm-location">
                        <FontAwesomeIcon icon={faLock} /> {farm_address || 'N/A'}
                    </p>
                    <div className="product-details">
                        <p className="deal-price">
                            <span className="original-price">₹{price_per_kg}/kg</span>
                            <span className="flash-price">₹{minimum_price}/kg</span>
                        </p>
                        <div className="availability-bar">
                            <div className="availability-fill" style={{ width: `${(availability / 50) * 100}%` }}></div>
                            <span className="availability-text">Only {availability} kg left</span>
                        </div>
                    </div>
                    <div className="deal-actions-container">
                        <button className="farm-photos-btn" onClick={handleShowFarmPhotos}>
                            <FontAwesomeIcon icon={faCamera} /> Farm Photos
                        </button>
                        <button className="reviews-btn" onClick={handleShowReviews}>Reviews</button>
                        <button className={buttonClass} onClick={openQuantityPopup}>
                            <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ToastNotification = ({ message, show, onClose }) => {
        return (
            <div className={`toast-notification ${show ? 'show' : ''}`}>
                <div className="toast-content">
                    <FontAwesomeIcon icon={faCheckCircle} className="toast-icon" />
                    <span>{message}</span>
                </div>
                <button className="toast-close" onClick={onClose}>×</button>
            </div>
        );
    };

    const InstructionsPopup = ({ onClose }) => (
        <div className="instructions-popup-overlay">
            <div className="instructions-popup-content">
                <button className="close-btn" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimesCircle} />
                </button>
                <h3>📢 How Flash Deals Work</h3>
                <div className="instruction-item">
                    <h4>Group Ordering Benefit</h4>
                    <p>Flash Deals are available when people in the same location order together. Once a group is formed, Flash Deals open for that area.</p>
                </div>
                <div className="instruction-item">
                    <h4>Not Eligible Yet?</h4>
                    <p>If you’re not eligible right now, simply share your community link with friends or neighbors. When they join, you’ll also unlock Flash Deals offers.</p>
                </div>
                <div className="instruction-item">
                    <h4>Fresh from Farmers</h4>
                    <p>All products come directly from farmers — ensuring quality and fair prices.</p>
                </div>
                <div className="instruction-item">
                    <h4>Limited Time Offer ⏳</h4>
                    <p>Each Flash Deal is open for 24 hours only, so make sure to place your order before it closes.</p>
                </div>
                <div className="instruction-item">
                    <h4>More Savings, More Freshness</h4>
                    <p>Enjoy extra discounts, lower delivery charges, and fresh produce with every Flash Deal.</p>
                </div>
            </div>
        </div>
    );
    
    const FarmPhotosPopup = ({ onClose, photos }) => (
        <div className="reviews-popup">
            <div className="reviews-popup-content">
                <button onClick={onClose} className="reviews-popup-close-btn">
                    <FontAwesomeIcon icon={faTimesCircle} />
                </button>
                <h3>Farm Photos</h3>
                <div className="farm-photos-container">
                    {photos && photos.length > 0 ? (
                        photos.map((photo, index) => (
                            <img
                                key={index}
                                src={`${process.env.REACT_APP_BACKEND_URL}${photo}`}
                                alt={`Farm Photo ${index + 1}`}
                                className="farm-photo-item"
                            />
                        ))
                    ) : (
                        <p className="no-photos-message">No farm photos available for this farmer.</p>
                    )}
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        const fetchDealsAndStatus = async () => {
            if (!consumer?.consumer_id || !consumer?.token) {
                setLoading(false);
                return;
            }
            
            const token = consumer.token;

            try {
                const profileResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/consumer/${consumer.consumer_id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const profileData = await profileResponse.json();
                const consumerPincode = profileData.pincode;
                
                const communityId = getOrCreateCommunityId();
                const baseShareLink = `http://localhost:3000/community-flash-deals`;
                setShareableLink(baseShareLink);
                setWhatsappLink(`https://wa.me/?text=${encodeURIComponent("Join me for exclusive flash deals! " + baseShareLink)}`);
                
                if (!consumerPincode || consumerPincode === '000000' || isNaN(consumerPincode)) {
                    setIsFlashDealActive(false);
                } else {
                    const statusResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community-flash-deals-status/${consumerPincode}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    const statusData = await statusResponse.json();
                    setIsFlashDealActive(statusData.showFlashDeal);

                    if (statusData.timerData) {
                        const startTime = new Date(statusData.timerData.start_time).getTime();
                        const now = new Date().getTime();
                        const activeDuration = 24 * 60 * 60 * 1000;
                        const frozenDuration = 72 * 60 * 60 * 1000;
                        const cycleDuration = activeDuration + frozenDuration;
                        const elapsedTimeInCycle = (now - startTime) % cycleDuration;

                        if (elapsedTimeInCycle < activeDuration) {
                            setTimeLeft(Math.floor((activeDuration - elapsedTimeInCycle) / 1000));
                        } else {
                            // This is the cool-down period. Calculate time until the next active phase.
                    const timeToNextActive = cycleDuration - elapsedTimeInCycle;
                    setTimeLeft(Math.floor(timeToNextActive / 1000));}
                    }
                }

                const dealsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community-flashdeals`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!dealsResponse.ok) {
                    throw new Error('Failed to fetch bargaining products');
                }
                const dealsData = await dealsResponse.json();
                setDeals(dealsData);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching data:", err);
                if (err.message.includes('401')) {
                    alert('Session expired. Please log in again.');
                    navigate('/consumer-login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDealsAndStatus();

        const timer = setInterval(() => {
            setTimeLeft(prevTime => Math.max(0, prevTime - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [consumer, navigate]);

    const handleGoBack = () => {
        navigate(-1);
    };
    
    const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`;
    const instagramLink = `https://www.instagram.com/?url=${encodeURIComponent(shareableLink)}`;
    const smsLink = `sms:?&body=${encodeURIComponent("Join me for exclusive flash deals in our community! Click the link to participate: " + shareableLink)}`;

    if (!consumer) {
        return (
            <div className="flash-deal-page-container">
                <div className="auth-required">
                    <h2>Please log in to view flash deals</h2>
                    <Link to="/consumer-login" className="login-link">Login Now</Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flash-deal-page-container">
            <ToastNotification message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
            
            <header className="dashboard-header">
                <div className="header-top">  
                    <div className="nav-actions">
                    </div>
                </div>
            </header>

            <main className="flash-deal-main">
                <div className="page-header">
                    <div className="header-decoration">
                        <div className="decoration-circle circle-1"></div>
                        <div className="decoration-circle circle-2"></div>
                        <div className="decoration-circle circle-3"></div>
                    </div>
                    <h2 className="main-heading">
                        <span className="heading-line-1">Flash Deals</span>
                        <span className="heading-line-2">Limited Time Offers</span>
                    </h2>
                    <div className="timer-display">
                        <FontAwesomeIcon icon={faFire} className="timer-icon" />
                        <span className="timer-text">
                            {isFlashDealActive ? `Time Left: ${formatTime(timeLeft)}` : `Deals start in: ${formatTime(timeLeft)}`}
                        </span>
                    </div>
                    <p className="page-description">
                        Welcome to the Flash Deal page! Here you can find exclusive, time-sensitive offers on a variety of fresh produce directly from our farmers.
                    </p>
                </div>
                
                <div className="link-and-info-container">
                    <div className="shareable-link-container">
                        <div className="short-url">
                            {shareableLink ? shareableLink : 'Fetching link...'}
                        </div>
                        <div className="share-buttons">
                            <button onClick={() => setShowSharePopup(true)} className="share-btn">
                                <FontAwesomeIcon icon={faShareAlt} /> Share
                            </button>
                            <button onClick={handleCopyLink} className="share-btn copy">
                                <FontAwesomeIcon icon={faCopy} /> Copy
                            </button>
                        </div>
                    </div>
                    <button className="how-it-works-btn" onClick={() => setShowInstructions(true)}>
                        <FontAwesomeIcon icon={faInfoCircle} /> How it Works
                    </button>
                </div>

                <div className={`page-status-overlay ${!isFlashDealActive ? 'show' : ''}`}>
                    <div className="status-message-box">
                        <FontAwesomeIcon icon={faLock} className="lock-icon" />
                        <p>Your location is not yet eligible for Flash Deals.</p>
                        <p>Share this link with friends and neighbors in your area to unlock flash deals for your community!</p>
                    </div>
                </div>
                
                {loading && (
                    <div className="loading-container">
                        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                        <p>Loading deals...</p>
                    </div>
                )}

                {error && (
                    <div className="error-container">
                        <FontAwesomeIcon icon={faTimesCircle} size="2x" />
                        <p>Error: {error}</p>
                    </div>
                )}
                
                {!loading && !error && (
                    <div className="deal-card-list">
                        {deals.length > 0 ? (
                            deals.map(deal => (
                                <DealCard key={deal.product_id} deal={deal} isAvailable={isFlashDealActive && deal.availability > 0} />
                            ))
                        ) : (
                            <p className="no-deals-message">No flash deals are available at the moment. Please check back later!</p>
                        )}
                    </div>
                )}
            </main>
            
            {showQuantityPopup && selectedProduct && (
                <div className="quantity-popup-overlay">
                    <div className="quantity-popup-content">
                        <button onClick={() => setShowQuantityPopup(false)} className="popup-close-btn">
                            <FontAwesomeIcon icon={faTimesCircle} />
                        </button>
                        <h3>Select Quantity for {selectedProduct.produce_name}</h3>
                        <img
                            src={imagesCache[selectedProduct.produce_name] || 'https://source.unsplash.com/300x200/?vegetables,fruits'}
                            alt={selectedProduct.produce_name}
                            className="popup-image"
                        />
                        <div className="quantity-controls">
                            <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" />
                            <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
                        </div>
                        <div className="price-details">
                            <p>Price per kg: ₹{selectedProduct.minimum_price}</p>
                            <p>Total Price: ₹{(selectedProduct.minimum_price * quantity).toFixed(2)}</p>
                        </div>
                        <div className="popup-actions">
                            <button onClick={() => setShowQuantityPopup(false)} className="cancel-btn">Cancel</button>
                            <button className="add-to-cart-btn" onClick={handleAddToCart}>
                                <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSharePopup && (
                <div className="share-popup show">
                    <div className="share-popup-content">
                        <button onClick={() => setShowSharePopup(false)} className="share-popup-close-btn">
                            <FontAwesomeIcon icon={faTimesCircle} />
                        </button>
                        <h3>Share in a post</h3>
                        <p className="share-link-label">Flash deal page link</p>
                        <div className="share-link-input-container">
                            <input type="text" readOnly value={shareableLink} className="share-link-input" />
                            <button onClick={handleCopyLink} className="share-link-copy-btn">Copy</button>
                        </div>
                        <div className="share-app-icons-container">
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="share-app-btn whatsapp">
                                <i className="fab fa-whatsapp"></i>
                                <span>WhatsApp</span>
                            </a>
                            <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="share-app-btn facebook">
                                <i className="fab fa-facebook-f"></i>
                                <span>Facebook</span>
                            </a>
                            <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="share-app-btn instagram">
                                <i className="fab fa-instagram"></i>
                                <span>Instagram</span>
                            </a>
                            <a href={smsLink} className="share-app-btn sms">
                                <FontAwesomeIcon icon={faShareAlt} />
                                <span>Message</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
            
            {showReviewsPopup && selectedProductForReviews && (
              <div className="reviews-popup">
                <div className="reviews-popup-content">
                  <button onClick={() => setShowReviewsPopup(false)} className="reviews-popup-close-btn">
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                  <h3>Reviews for {selectedProductForReviews.produce_name}</h3>
                  <p className="reviews-for-farmer">from farmer {selectedProductForReviews.farmer_name || 'N/A'}</p>
                  
                  {selectedProductForReviews.reviews && selectedProductForReviews.reviews.length > 0 ? (
                    <div className="review-list-container">
                      {selectedProductForReviews.reviews.map((review, index) => (
                        <div key={index} className="review-item">
                          <div className="review-header">
                            <span className="review-consumer">{review.consumer_name}</span>
                            <div className="review-rating-stars">{renderStars(review.rating)}</div>
                          </div>
                          <p className="review-comment">"{review.comment}"</p>
                          <p className="review-date">Reviewed on {new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-reviews-message">No reviews available for this product yet.</p>
                  )}
                </div>
              </div>
            )}
            
            {showFarmPhotosPopup && selectedProductForFarmPhotos && (
                <FarmPhotosPopup
                    onClose={() => setShowFarmPhotosPopup(false)}
                    photos={selectedProductForFarmPhotos.farm_photographs}
                />
            )}
            {showInstructions && <InstructionsPopup onClose={() => setShowInstructions(false)} />}
        </div>
    );
};

export default CommunityFlashDeals;