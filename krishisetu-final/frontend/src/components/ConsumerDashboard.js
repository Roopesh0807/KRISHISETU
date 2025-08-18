import {
    faSearch,
    faChevronDown,
    faMapMarkerAlt,
    faShoppingCart,
    faBolt,
    faUsers,
    faCalendarAlt,
    faHandshake,
    faStar,
    faStarHalfAlt,
    faExclamationTriangle,
    faChevronLeft,
    faChevronRight,
    faSpinner,
    faTimes, // Added for close button in subscription popup
    faCheckCircle // Added for success message in subscription popup
} from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/ConsumerDashboard.css";
import { fetchProducts } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OrganicBadge from "../assets/organic.jpg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Calendar from 'react-calendar'; // Import Calendar
import 'react-calendar/dist/Calendar.css'; // Import Calendar CSS

const ConsumerDashboard = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [deliveryLocation, setDeliveryLocation] = useState("Fetching location...");
    const [searchResults, setSearchResults] = useState([]);
    const [bargainingProducts, setBargainingProducts] = useState([]);
    const { consumer } = useAuth();
    const [products, setProducts] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");
    const [buyType, setBuyType] = useState("");
    const { addToCart } = useCart();
    const [productImages, setProductImages] = useState({});
    const [farmerSearchTerm, setFarmerSearchTerm] = useState("");
    const [sortPriceOrder, setSortPriceOrder] = useState("");
    const [sortProduceOrder, setSortProduceOrder] = useState("");
    const navigate = useNavigate();
    const [selectedQuantities, setSelectedQuantities] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [consumerCoords, setConsumerCoords] = useState(null);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [pastOrders, setPastOrders] = useState([]);
    const [imageCache, setImageCache] = useState(() => {
        const savedCache = localStorage.getItem('productImageCache');
        return savedCache ? JSON.parse(savedCache) : {};
    });

    // Function to get the initial default date based on cutoff time
    const getInitialSubscriptionDate = () => {
        const now = new Date();
        const cutoffHour = 22; // 10 PM
        const cutoffMinute = 30; // 30 minutes

        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Normalize to start of day

        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(now.getDate() + 2);
        dayAfterTomorrow.setHours(0, 0, 0, 0); // Normalize to start of day

        if (now.getHours() > cutoffHour || (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute)) {
            // After 10:30 PM today, default to day after tomorrow
            return dayAfterTomorrow;
        } else {
            // Before or at 10:30 PM today, default to tomorrow
            return tomorrow;
        }
    };

    // State for subscription popup
    const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
    const [selectedProductForSubscription, setSelectedProductForSubscription] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    // Initialize selectedDate with the calculated initial date
    const [selectedDate, setSelectedDate] = useState(getInitialSubscriptionDate());
    const [subscriptionConfirmed, setSubscriptionConfirmed] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [dateSelectionError, setDateSelectionError] = useState("");
    const [selectedFrequency, setSelectedFrequency] = useState("");


    // Haversine formula to calculate the distance between two lat/lon points
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };
    
    // Geocoding and Reverse Geocoding functions (using proxy for Nominatim)
    const geocodeAddress = async (address) => {
        try {
            const url = `http://localhost:5000/api/geocode/forward?q=${encodeURIComponent(address)}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
            return null;
        } catch (error) {
            console.error("Error geocoding address via proxy:", error);
            return null;
        }
    };

    const reverseGeocode = async (latitude, longitude) => {
        try {
            const url = `http://localhost:5000/api/geocode/reverse?lat=${latitude}&lon=${longitude}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.address) {
                const address = data.address;
                const displayAddress = [
                    address.road,
                    address.suburb,
                    address.city || address.town || address.village,
                    address.state,
                    address.postcode
                ].filter(Boolean).join(', ');
                setDeliveryLocation(displayAddress || "Location not found");
            } else {
                setDeliveryLocation("Location not found");
            }
        } catch (error) {
            console.error("Error during reverse geocoding via proxy:", error);
            setDeliveryLocation("Error fetching location");
        } finally {
            setIsLoading(false);
        }
    };

    // Function to fetch user's current location
    const fetchUserLocation = () => {
        setIsLoading(true);
        setDeliveryLocation("Fetching location...");

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    setConsumerCoords({ lat: latitude, lon: longitude });
                    reverseGeocode(latitude, longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setDeliveryLocation("Location not available");
                    setIsLoading(false);
                    if (error.code === error.PERMISSION_DENIED) {
                        alert("Location access denied. Please update your location manually.");
                    }
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
            setDeliveryLocation("Geolocation not supported");
            setIsLoading(false);
        }
    };
    
    // Initial data fetching on component mount
    useEffect(() => {
        fetchUserLocation(); // Fetch user location first

        const fetchAllData = async () => {
            if (!consumer?.token) {
                console.warn("Authentication token is not yet available. Skipping protected API calls.");
                return;
            }

            try {
                const productData = await fetchProducts("http://localhost:5000/api/products", {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${consumer.token}`,
                    }
                });
                setProducts(productData);
            } catch (error) {
                console.error("Error fetching products:", error);
                if (error.message.includes('401')) {
                    alert('Session expired. Please log in again.');
                    navigate('/consumer-login');
                }
            }

            try {
                const response = await fetch(`http://localhost:5000/api/orders?consumer_id=${consumer.consumer_id}`, {
                    headers: { "Authorization": `Bearer ${consumer.token}` },
                });
                if (!response.ok) {
                    console.error("Failed to fetch past orders:", response.status, response.statusText);
                    if (response.status === 404) {
                        setPastOrders([]); // No past orders found
                    }
                    return;
                }
                const data = await response.json();
                setPastOrders(data);
            } catch (error) {
                console.error("Error fetching past orders:", error);
            }
        };

        // Fetch all data once consumer token is available
        if (consumer?.token) {
            fetchAllData();
        }
    }, [consumer, navigate]);

    // Fetch farmers based on consumer location
    useEffect(() => {
        const fetchFarmers = async () => {
            if (!consumer?.token || !consumerCoords) return; // Ensure token and coords are available

            try {
                const response = await fetch('http://localhost:5000/api/farmers', {
                    method: "GET",
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${consumer?.token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch farmers');
                }

                const data = await response.json();

                const farmersWithData = await Promise.all(
                    data.map(async (farmer) => {
                        try {
                            const personalResponse = await fetch(
                                `http://localhost:5000/api/farmerprofile/${farmer.farmer_id}/personal`,
                                { headers: { "Authorization": `Bearer ${consumer?.token}` } }
                            );
                            const personalData = await personalResponse.json();

                            const ratingsResponse = await fetch(
                                `http://localhost:5000/reviews/${farmer.farmer_id}`,
                                { headers: { "Authorization": `Bearer ${consumer?.token}` } }
                            );
                            const ratingsData = await ratingsResponse.json();

                            const averageRating = ratingsData.length > 0
                                ? ratingsData.reduce((sum, review) => sum + parseFloat(review.rating), 0) / ratingsData.length
                                : 0;

                            const productsResponse = await fetch(
                                `http://localhost:5000/api/produces?farmer_id=${farmer.farmer_id}&market_type=Bargaining Market`,
                                { headers: { "Authorization": `Bearer ${consumer?.token}` } }
                            );
                            const productsData = await productsResponse.json();
                            
                            const farmResponse = await fetch(
                                `http://localhost:5000/api/farmerprofile/${farmer.farmer_id}/farm`,
                                { headers: { "Authorization": `Bearer ${consumer?.token}` } }
                            );
                            const farmData = await farmResponse.json();
                            
                            const farmerCoords = farmData.farm_address ? await geocodeAddress(farmData.farm_address) : null;
                            
                            let distance = null;
                            if (consumerCoords && farmerCoords) {
                                distance = calculateDistance(consumerCoords.lat, consumerCoords.lon, farmerCoords.lat, farmerCoords.lon);
                            }

                            return {
                                ...farmer,
                                profile_photo: personalData.profile_photo
                                    ? `http://localhost:5000${personalData.profile_photo}`
                                    : null,
                                products: productsData,
                                average_rating: parseFloat(averageRating.toFixed(1)),
                                farm_address: farmData.farm_address,
                                distance_km: distance
                            };
                        } catch (error) {
                            console.error(`Error fetching data for farmer ${farmer.farmer_id}:`, error);
                            return {
                                ...farmer,
                                profile_photo: null,
                                products: [],
                                average_rating: 0
                            };
                        }
                    })
                );

                // Filter farmers based on distance (within 20km or unknown distance)
                const filteredByDistance = farmersWithData.filter(farmer =>
                    farmer.distance_km === null || farmer.distance_km <= 20
                );
                
                setFarmers(filteredByDistance);
            } catch (error) {
                console.error("Error fetching farmers:", error);
                alert("Failed to load farmers. Please refresh the page.");
            }
        };

        if (consumer?.token && consumerCoords) {
            fetchFarmers();
        }
    }, [consumer?.token, consumerCoords]);

    // Search handler for the main search bar
    const handleSearch = () => {
        const combinedProducts = [...products, ...bargainingProducts];
        const results = combinedProducts.filter(product => {
            const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All Categories" ||
                product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
        setSearchResults(results);
        console.log("Search Results:", results);
    };

    // Carousel Settings for Recommended Products
    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        cssEase: "cubic-bezier(0.645, 0.045, 0.355, 1)",
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 600, settings: { slidesToShow: 1 } }
        ]
    };

    // Custom arrow components for the carousel
    function SampleNextArrow(props) {
        const { className, style, onClick } = props;
        return (
            <div
                className={className}
                style={{
                    ...style,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    right: "-25px",
                    width: "40px",
                    height: "40px",
                    background: "rgba(255,255,255,0.9)",
                    borderRadius: "50%",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    zIndex: 1,
                    transform: "scale(1.2)"
                }}
                onClick={onClick}
            >
                <FontAwesomeIcon
                    icon={faChevronRight}
                    style={{ color: "#2e7d32", fontSize: "16px" }}
                />
            </div>
        );
    }

    function SamplePrevArrow(props) {
        const { className, style, onClick } = props;
        return (
            <div
                className={className}
                style={{
                    ...style,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    left: "-25px",
                    width: "40px",
                    height: "40px",
                    background: "rgba(255,255,255,0.9)",
                    borderRadius: "50%",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    zIndex: 1,
                    transform: "scale(1.2)"
                }}
                onClick={onClick}
            >
                <FontAwesomeIcon
                    icon={faChevronLeft}
                    style={{ color: "#2e7d32", fontSize: "16px" }}
                />
            </div>
        );
    }

    // Generate recommendations based on past orders or popular products
    useEffect(() => {
        if (pastOrders.length > 0 && products.length > 0) {
            const categoryCounts = {};
            pastOrders.forEach(order => {
                const category = order.category || 'vegetables';
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });
            const sortedCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);
            const topCategories = sortedCategories.slice(0, 2);
            const recommended = products.filter(product =>
                topCategories.includes(product.category.toLowerCase())
            ).slice(0, 8);
            setRecommendedProducts(recommended);
        } else {
            const popular = [...products].sort((a, b) => b.ratings - a.ratings).slice(0, 8);
            setRecommendedProducts(popular);
        }
    }, [pastOrders, products]);

    // Fetch product images from Pexels API and cache them
    const fetchProductImage = async (productName) => {
        if (imageCache[productName]) {
            return imageCache[productName];
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
            const imageUrl = data.photos[0]?.src.medium || 'https://via.placeholder.com/300?text=No+Image';
            const newCache = { ...imageCache, [productName]: imageUrl };
            setImageCache(newCache);
            localStorage.setItem('productImageCache', JSON.stringify(newCache));
            return imageUrl;
        } catch (error) {
            console.error('Error fetching image:', error);
            return 'https://via.placeholder.com/300?text=No+Image';
        }
    };
    
    // Load product images for displayed products
    useEffect(() => {
        const loadProductImages = async () => {
            const images = {};
            for (const product of products) {
                images[product.product_id] = await fetchProductImage(product.product_name);
            }
            setProductImages(images);
        };
        if (products.length > 0) {
            loadProductImages();
        }
    }, [products]);

    // Handle bargain initiation
    const handleBargainClick = async (farmer, product, e) => {
        if (e) e.stopPropagation();
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:5000/api/create-bargain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${consumer.token}`
                },
                body: JSON.stringify({
                    farmer_id: farmer.farmer_id
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to create bargain session');
            }
            
            const productResponse = await fetch(`http://localhost:5000/api/add-bargain-product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${consumer.token}`
                },
                body: JSON.stringify({
                    bargain_id: data.bargainId,
                    product_id: product.product_id,
                    quantity: 10
                })
            });
            
            const productData = await productResponse.json();
            
            if (!productData.success) {
                throw new Error(productData.error || 'Failed to add product');
            }
            
            navigate(`/bargain/${data.bargainId}`, {
                state: {
                    farmer,
                    product: {
                        ...product,
                        price_per_kg: productData.price_per_kg,
                        quantity: productData.quantity
                    }
                }
            });
            
        } catch (error) {
            setError(error.message);
            console.error("Bargain error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Authentication check for consumer
    useEffect(() => {
        const storedConsumer = localStorage.getItem("consumer");
        if (!storedConsumer) {
            console.error("❌ No consumer session found!");
            navigate("/consumer-login");
            return;
        }
        try {
            const consumerData = JSON.parse(storedConsumer);
            const token = consumerData.token;
            if (!token) {
                console.error("❌ No token found in consumer data!");
                navigate("/consumer-login");
                return;
            }
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.farmer_id) {
                alert("Farmers cannot initiate bargains");
                localStorage.removeItem("consumer");
                navigate("/consumer-login");
            }
        } catch (e) {
            console.error("❌ Error parsing token:", e);
            localStorage.removeItem("consumer");
            navigate("/consumer-login");
        }
    }, [navigate]);

    // Handle quantity change for products
    const handleQuantityChange = (productId, event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value)) {
            setSelectedQuantities(prev => ({
                ...prev,
                [productId]: value
            }));
        }
    };

    // Handle "Buy Now" action
    const handleBuyNow = (product, e) => {
        e.stopPropagation();
        const quantity = selectedQuantities[product.product_id] || 1;
        addToCart(product, quantity);
        navigate("/cart");
    };

    // Handle product card click (for general product details, not subscription)
    const handleProductClick = (productId, productImage) => {
        navigate(`/productDetails/${productId}`, {
            state: {
                productImage: productImage || 'https://via.placeholder.com/300?text=No+Image'
            }
        });
    };

    // Handle farmer card click
    const handleFarmerClick = (farmerId) => {
        navigate(`/farmerDetails/${farmerId}`);
    };

    // Handle "Add to Community Orders" action
    const handleAddToCommunityOrders = () => {
        navigate(`/community-home`);
    };

    // New subscription handlers
    const handleSubscribeClick = (product, e) => {
        e.stopPropagation();
        if (!consumer) {
            alert("Please login first");
            navigate("/consumer-login");
            return;
        }
        setSelectedProductForSubscription(product);
        setShowSubscriptionPopup(true);
        setShowCalendar(false); // Reset calendar view
        setSubscriptionConfirmed(false); // Reset confirmation view
        setSelectedFrequency(""); // Reset frequency
        setSelectedDate(getInitialSubscriptionDate()); // Set initial default date here
        setDateSelectionError(""); // Clear any previous errors
    };

    const handleFrequencySelect = (frequency) => {
        setSelectedFrequency(frequency);
        setShowCalendar(true);
        setDateSelectionError("");
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setDateSelectionError("");
    };

    const isPastCutoffTime = () => {
        const now = new Date();
        const cutoffHour = 22; // 10 PM
        const cutoffMinute = 30; // 30 minutes
        return now.getHours() > cutoffHour || 
                (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute);
    };

    const confirmSubscriptionDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const selectedDay = new Date(selectedDate);
        selectedDay.setHours(0, 0, 0, 0);
        
        // This check ensures that the selected date is not in the past relative to the minimum allowed date.
        // The getMinDate() function already handles the "today blocked" and "tomorrow blocked after cutoff" logic.
        if (selectedDay < getMinDate()) {
            setDateSelectionError("Please select a valid start date.");
            return;
        }
        
        setShowCalendar(false);
        setSubscriptionConfirmed(true);
        setDateSelectionError("");
    };

    // Calculate discounted price (5% off)
    const calculateDiscountedPrice = (price) => {
        return price * 0.95;
    };

    const saveSubscription = async () => {
        try {
            const consumerData = JSON.parse(localStorage.getItem('consumer'));
            if (!consumerData) {
                alert("Please login first");
                navigate("/consumer-login");
                return;
            }
        
            const getBackendSubscriptionType = (frequency) => {
                switch(frequency) {
                    case 'daily': return 'Daily';
                    case 'alternate-days': return 'Alternate Days';
                    case 'weekly': return 'Weekly';
                    case 'monthly': return 'Monthly';
                    default: return frequency;
                }
            };
            
            const quantity = selectedQuantities[selectedProductForSubscription.product_id] || 1;
            const originalPrice = selectedProductForSubscription.price_1kg * quantity;
            const discountedPrice = calculateDiscountedPrice(originalPrice);

            const subscriptionType = getBackendSubscriptionType(selectedFrequency);
            
            // --- FIX APPLIED HERE ---
            // Manually construct the date string to avoid timezone issues.
            const date = new Date(selectedDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const startDateString = `${year}-${month}-${day}`;

            const subscriptionData = {
                consumer_id: consumerData.consumer_id,
                subscription_type: subscriptionType,
                product_id: selectedProductForSubscription.product_id,
                product_name: selectedProductForSubscription.product_name,
                quantity: quantity,
                original_price: originalPrice,
                price: discountedPrice,
                start_date: startDateString, // Use the manually formatted date string
                discount_applied: 5
            };
        
            const response = await fetch("http://localhost:5000/api/subscriptions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${consumerData?.token}`,
                },
                body: JSON.stringify(subscriptionData)
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save subscription");
            }
        
            const data = await response.json();
            console.log("Subscription created:", data);
        
            setShowSuccessMessage(true);
            setShowSubscriptionPopup(false);
            setSubscriptionConfirmed(false);
            setSelectedFrequency("");
            setSelectedProductForSubscription(null);

            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 1500);
        } catch (error) {
            console.error("Subscription error:", error);
            alert(`Subscription failed: ${error.message}`);
        }
    };

    // Corrected getMinDate function to block today and tomorrow after cutoff
    const getMinDate = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Normalize to start of day

        const dayAfterTomorrow = new Date(now);
        dayAfterTomorrow.setDate(now.getDate() + 2);
        dayAfterTomorrow.setHours(0, 0, 0, 0); // Normalize to start of day

        if (isPastCutoffTime()) {
            // If it's past 10:30 PM today, min date is day after tomorrow
            return dayAfterTomorrow;
        } else {
            // If it's before or at 10:30 PM today, min date is tomorrow
            return tomorrow;
        }
    };

    // Filter products based on search and filter terms
    const filteredProducts = products.filter((product) => {
        return (
            product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (category === "" || product.category.toLowerCase() === category.toLowerCase()) &&
            (buyType === "" || product.buy_type.toLowerCase() === buyType.toLowerCase())
        );
    });

    // Filter and sort farmers
    const filteredFarmers = farmers
        .map((farmer) => {
            const parsedProducts = Array.isArray(farmer.products)
                ? farmer.products
                : JSON.parse(farmer.products || "[]");
            return { ...farmer, products: parsedProducts };
        })
        .filter((farmer) => {
            const term = farmerSearchTerm.toLowerCase();
            const matchesFarmer =
                farmer.farmer_name?.toLowerCase().includes(term) ||
                farmer.farmer_id?.toString().toLowerCase().includes(term);

            const matchesProducts = farmer.products.some((product) => {
                return (
                    product.produce_id?.toLowerCase().includes(term) ||
                    product.produce_name?.toLowerCase().includes(term) ||
                    product.produce_type?.toLowerCase().includes(term) ||
                    product.price_per_kg?.toString().includes(term) ||
                    product.product_id?.toString().includes(term)
                );
            });
            return matchesFarmer || matchesProducts;
        })
        .sort((a, b) => {
            if (sortPriceOrder) {
                const aMinPrice = Math.min(...a.products.map(p => p.price_per_kg));
                const bMinPrice = Math.min(...b.products.map(p => p.price_per_kg));
                return sortPriceOrder === "asc" ? aMinPrice - bMinPrice : bMinPrice - aMinPrice;
            }
            if (sortProduceOrder) {
                const aProduceType = a.products[0]?.produce_type || "";
                const bProduceType = b.products[0]?.produce_type || "";
                return sortProduceOrder === "asc"
                    ? aProduceType.localeCompare(bProduceType)
                    : bProduceType.localeCompare(aProduceType);
            }
            return 0;
        });

    // Render star ratings
    const renderRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        const hasHalfStar = (rating || 0) % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} className="ks-star-filled" />);
        }
        if (hasHalfStar) {
            stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className="ks-star-filled" />);
        }
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="ks-star" />);
        }
        return stars;
    };

    // Calculate current product quantity and prices for subscription popup display
    const currentProductQuantity = selectedProductForSubscription ? (selectedQuantities[selectedProductForSubscription.product_id] || 1) : 1;
    const currentProductPrice = selectedProductForSubscription ? selectedProductForSubscription.price_1kg : 0;
    const currentTotalPrice = currentProductQuantity * currentProductPrice;
    const currentDiscountedPrice = calculateDiscountedPrice(currentTotalPrice);

    // Loading overlay
    if (isLoading) {
        return (
            <div className="ks-loading-overlay">
                <div className="ks-loading-spinner">
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" />
                </div>
                <p>Fetching your location to show products near you...</p>
            </div>
        );
    }

    return (
        <div className="ks-consumer-dashboard">
            {/* Success Message Overlay for Subscription */}
            {showSuccessMessage && (
                <div className="ks-success-overlay">
                    <div className="ks-success-message">
                        <FontAwesomeIcon icon={faCheckCircle} className="ks-success-icon" />
                        <p>Subscription plan has been saved successfully!</p>
                    </div>
                </div>
            )}

            {/* Subscription Popup */}
            {showSubscriptionPopup && selectedProductForSubscription && (
                <div className="ks-subscription-popup">
                    <div className="ks-subscription-container">
                        <button
                            className="ks-close-btn"
                            onClick={() => {
                                setShowSubscriptionPopup(false);
                                setShowCalendar(false);
                                setSubscriptionConfirmed(false);
                                setSelectedFrequency("");
                                setDateSelectionError("");
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        
                        <h2>Subscribe to {selectedProductForSubscription.product_name}</h2>
                        
                        {!showCalendar && !subscriptionConfirmed ? (
                            <div className="ks-frequency-options">
                                <div
                                    className={`ks-frequency-option ${selectedFrequency === 'daily' ? 'active' : ''}`}
                                    onClick={() => handleFrequencySelect('daily')}
                                >
                                    Daily
                                </div>
                                <div
                                    className={`ks-frequency-option ${selectedFrequency === 'alternate-days' ? 'active' : ''}`}
                                    onClick={() => handleFrequencySelect('alternate-days')}
                                >
                                    Alternate Days
                                </div>
                                <div
                                    className={`ks-frequency-option ${selectedFrequency === 'weekly' ? 'active' : ''}`}
                                    onClick={() => handleFrequencySelect('weekly')}
                                >
                                    Weekly
                                </div>
                                <div
                                    className={`ks-frequency-option ${selectedFrequency === 'monthly' ? 'active' : ''}`}
                                    onClick={() => handleFrequencySelect('monthly')}
                                >
                                    Monthly
                                </div>
                            </div>
                        ) : showCalendar ? (
                            <div className="ks-calendar-section">
                                <h3>Select Start Date</h3>
                                {isPastCutoffTime() ? (
                                    <p className="ks-cutoff-message">
                                        Orders for today are closed (after 10:30 PM). Please select tomorrow's date or later.
                                    </p>
                                ) : (
                                    <p>Please choose today's date (before 10:30 PM) or a future date</p>
                                )}
                                <Calendar
                                    onChange={handleDateChange}
                                    value={selectedDate}
                                    minDate={getMinDate()} // Use the corrected getMinDate
                                />
                                {dateSelectionError && (
                                    <div className="ks-date-error">{dateSelectionError}</div>
                                )}
                                <button
                                    className="ks-confirm-date-btn"
                                    onClick={confirmSubscriptionDate}
                                >
                                    Confirm Date
                                </button>
                            </div>
                        ) : (
                            <div className="ks-subscription-confirmation">
                                <p>Subscribe to {selectedProductForSubscription.product_name} ({currentProductQuantity}kg) {selectedFrequency} starting from {selectedDate.toDateString()}</p>
                                <div className="ks-subscription-price">
                                    <span className="ks-original-price">Original Price: ₹{currentTotalPrice.toFixed(2)}</span>
                                    <span className="ks-discounted-price">Discounted Price: ₹{currentDiscountedPrice.toFixed(2)} (5% off)</span>
                                </div>
                                <button
                                    className="ks-save-subscription-btn"
                                    onClick={saveSubscription}
                                >
                                    Save Subscription
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Location and Search Bar Section */}
            <div className="ks-search-location-bar">
                <div className="ks-delivery-info">
                    <span className="ks-deliver-to">Deliver to</span>
                    <button
                        className="ks-location-display-button"
                        onClick={fetchUserLocation}
                    >
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="ks-location-icon" />
                        <span className="ks-current-location">{deliveryLocation}</span>
                        <FontAwesomeIcon icon={faChevronDown} className="ks-dropdown-arrow" />
                    </button>
                </div>

                <div className="ks-search-container">
                    <div className="ks-search-categories">
                        <select
                            className="ks-category-dropdown"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option>All Categories</option>
                            <option>Vegetables</option>
                            <option>Fruits</option>
                            <option>Grains & Pulses</option>
                            <option>Dairy</option>
                            <option>Spices</option>
                        </select>
                        <div className="ks-dropdown-arrow">▼</div>
                    </div>
                    <input
                        type="text"
                        placeholder="Search products in KrishiSetu and Bargaining markets..."
                        className="ks-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        className="ks-search-button"
                        onClick={handleSearch}
                    >
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>
            </div>
            {/* Recommendation Carousel Section - Always visible */}
            {recommendedProducts.length > 0 && (
                <div className="ks-recommendation-section">
                    <h2 className="ks-section-title">Recommended For You</h2>
                    <div className="ks-recommendation-carousel">
                        <Slider {...carouselSettings}>
                            {recommendedProducts.map((product) => (
                                <div key={`rec-${product.product_id}`} className="ks-recommendation-item">
                                    <div
                                        className="ks-product-image-container"
                                        onClick={() => handleProductClick(product.product_id, productImages[product.product_id])}
                                    >
                                        <img
                                            src={productImages[product.product_id] || 'https://via.placeholder.com/300?text=Loading...'}
                                            alt={product.product_name}
                                            className="ks-product-image"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                                            }}
                                        />
                                        {product.buy_type === "organic" && (
                                            <img
                                                src={OrganicBadge}
                                                alt="Organic"
                                                className="ks-organic-badge"
                                            />
                                        )}
                                    </div>
                                    <div className="ks-recommendation-details">
                                        <h3>{product.product_name}</h3>
                                        <div className="ks-recommendation-price">
                                            ₹{product.price_1kg}/kg
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(product, 1);
                                            }}
                                            className="ks-recommendation-add-btn"
                                        >
                                            <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>
            )}
            <div className="ks-main-content">
                <div className="ks-market-section">
                    <h2 className="ks-section-title">KrishiSetu Marketplace</h2>
                    <div className="ks-search-filter-container">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="ks-search-input"
                        />
                        <div className="ks-filter-group">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="ks-filter-select"
                            >
                                <option value="">All Categories</option>
                                <option value="vegetables">Vegetables</option>
                                <option value="fruits">Fruits</option>
                                <option value="grains">Grains</option>
                                <option value="dairy">Dairy</option>
                                <option value="spices">Spices</option>
                            </select>
                            <select
                                value={buyType}
                                onChange={(e) => setBuyType(e.target.value)}
                                className="ks-filter-select"
                            >
                                <option value="">All Types</option>
                                <option value="organic">Organic</option>
                                <option value="standard">Standard</option>
                            </select>
                        </div>
                    </div>

                    <div className="ks-products-grid">
                        {filteredProducts.map((product) => {
                            const quantityForSubscriptionDisplay = selectedQuantities[product.product_id] || 1;
                            const originalPriceForSubscriptionDisplay = product.price_1kg * quantityForSubscriptionDisplay;
                            const discountedPriceForDisplay = calculateDiscountedPrice(originalPriceForSubscriptionDisplay);

                            return (
                                <div key={product.product_id} className="ks-product-card">
                                    <div
                                        className="ks-product-image-container"
                                        onClick={() => handleProductClick(product.product_id, productImages[product.product_id])}
                                    >
                                        <img
                                            src={productImages[product.product_id] || 'https://via.placeholder.com/300?text=Loading...'}
                                            alt={product.product_name}
                                            className="ks-product-image"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                                            }}
                                        />
                                        {product.buy_type === "organic" && (
                                            <img
                                                src={OrganicBadge}
                                                alt="Organic"
                                                className="ks-organic-badge"
                                            />
                                        )}
                                    </div>
                                    <div className="ks-product-details">
                                        <h3 className="ks-product-name">{product.product_name}</h3>
                                        <div className="ks-product-meta">
                                            <span className={`ks-product-type ${product.buy_type}`}>
                                                {product.buy_type}
                                            </span>
                                            <span className="ks-product-category">{product.category}</span>
                                        </div>
                                        <div className="ks-price-container">
                                            <span className="ks-price-label">From:</span>
                                            <span className="ks-price-value">₹{product.price_1kg}/kg</span>
                                        </div>
                                        <div className="ks-quantity-selector">
                                            <select
                                                value={selectedQuantities[product.product_id] || 1}
                                                onChange={(e) => handleQuantityChange(product.product_id, e)}
                                                className="ks-quantity-dropdown"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="1">1kg - ₹{product.price_1kg}</option>
                                                <option value="2">2kg - ₹{product.price_2kg}</option>
                                                <option value="5">5kg - ₹{product.price_5kg}</option>
                                            </select>
                                        </div>
                                        <div className="ks-product-actions">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(product, selectedQuantities[product.product_id] || 1);
                                                }}
                                                className="ks-action-btn ks-cart-btn"
                                            >
                                                <FontAwesomeIcon icon={faShoppingCart} /> Cart
                                            </button>
                                            <button
                                                onClick={(e) => handleBuyNow(product, e)}
                                                className="ks-action-btn ks-buy-btn"
                                            >
                                                <FontAwesomeIcon icon={faBolt} /> Buy Now
                                            </button>
                                            <button
                                                onClick={(e) => handleAddToCommunityOrders(product, e)}
                                                className="ks-action-btn ks-community-btn"
                                            >
                                                <FontAwesomeIcon icon={faUsers} /> Community
                                            </button>
                                            <button
                                                onClick={(e) => handleSubscribeClick(product, e)}
                                                className="ks-action-btn ks-subscribe-btn"
                                            >
                                                <FontAwesomeIcon icon={faCalendarAlt} /> Subscribe @ ₹{discountedPriceForDisplay.toFixed(2)}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="ks-bargaining-section">
                    <h2 className="ks-section-title">Bargaining Marketplace</h2>
                    <div className="ks-farmer-search-container">
                        <input
                            type="text"
                            placeholder="Search farmers or products..."
                            value={farmerSearchTerm}
                            onChange={(e) => setFarmerSearchTerm(e.target.value)}
                            className="ks-search-input"
                        />
                        <div className="ks-farmer-filters">
                            <select
                                value={sortPriceOrder}
                                onChange={(e) => setSortPriceOrder(e.target.value)}
                                className="ks-filter-select"
                            >
                                <option value="">Sort by Price</option>
                                <option value="asc">Low to High</option>
                                <option value="desc">High to Low</option>
                            </select>
                            <select
                                value={sortProduceOrder}
                                onChange={(e) => setSortProduceOrder(e.target.value)}
                                className="ks-filter-select"
                            >
                                <option value="">Sort by Type</option>
                                <option value="asc">Organic</option>
                                <option value="desc">Standard</option>
                            </select>
                        </div>
                    </div>

                    <div className="ks-farmers-list">
                        {filteredFarmers
                            .filter(farmer => farmer.products && farmer.products.length > 0)
                            .map((farmer) => (
                                <div
                                    key={farmer.farmer_id}
                                    className="ks-farmer-card"
                                    onClick={() => handleFarmerClick(farmer.farmer_id)}
                                >
                                    <div className="ks-farmer-header">
                                        <div className="ks-farmer-avatar-container">
                                            {farmer.profile_photo ? (
                                                <img
                                                    src={farmer.profile_photo}
                                                    alt="Farmer"
                                                    className="ks-farmer-avatar"
                                                />
                                            ) : (
                                                <div className="ks-farmer-avatar-placeholder"></div>
                                            )}
                                        </div>
                                        <div className="ks-farmer-basic-info">
                                            <h3 className="ks-farmer-name">{farmer.farmer_name}</h3>
                                            <div className="ks-farmer-meta">
                                                <span className="ks-farmer-id">ID: {farmer.farmer_id}</span>
                                                <span className="ks-farmer-rating">
                                                    {renderRatingStars(farmer.average_rating || 0)}
                                                    <span className="ks-rating-value">({farmer.average_rating?.toFixed(1) || 0})</span>
                                                </span>
                                            </div>
                                            {farmer.distance_km !== null && (
                                                <div className="ks-farmer-distance">
                                                    {farmer.distance_km.toFixed(1)} km away
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="ks-products-table-container">
                                        <table className="ks-products-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Type</th>
                                                    <th>Price/kg</th>
                                                    <th>Available</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {farmer.products.map((product) => (
                                                    <tr key={`${product.product_id}-${product.produce_name}`}>
                                                        <td>{product.produce_name}</td>
                                                        <td>{product.produce_type}</td>
                                                        <td>₹{product.price_per_kg}</td>
                                                        <td>{product.availability}kg</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div className="ks-farmer-actions">
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
                                        {error && (
                                            <div className="error-message">
                                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                                <div>
                                                    <p>Session initialization error</p>
                                                    <button onClick={() => window.location.reload()}>Refresh Page</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsumerDashboard;