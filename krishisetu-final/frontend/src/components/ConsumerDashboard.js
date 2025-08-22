// import { 
//     faSearch, 
//      faChevronDown, // Add this line
//     faMapMarkerAlt // Add this line if you are using it
// } from '@fortawesome/free-solid-svg-icons';
// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import "../components/ConsumerDashboard.css";
// import { fetchProducts } from '../utils/api';
// import { useCart } from '../context/CartContext';
// import { useAuth } from '../context/AuthContext';
// import { faSpinner } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//   faShoppingCart, 
//   faBolt, 
//   faUsers, 
//   faCalendarAlt,
//   faHandshake,
//   faStar,
//   faStarHalfAlt,
//   faExclamationTriangle,
//   faChevronLeft,
//   faChevronRight
// } from '@fortawesome/free-solid-svg-icons';

// // Import images
// import OrganicBadge from "../assets/organic.jpg";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import Slider from "react-slick";

// const ConsumerDashboard = () => {
//   const [searchQuery, setSearchQuery] = useState("");
// const [selectedCategory, setSelectedCategory] = useState("All Categories");
// const [deliveryLocation, setDeliveryLocation] = useState("Bengaluru 562130");
//  const [searchResults, setSearchResults] = useState([]);
//   const [bargainingProducts, setBargainingProducts] = useState([]);
//   const { consumer } = useAuth();
//   const [products, setProducts] = useState([]);
//   const [farmers, setFarmers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [category, setCategory] = useState("");
//   const [buyType, setBuyType] = useState("");
//   const { addToCart } = useCart();
//   const [productImages, setProductImages] = useState({});
//   const [farmerSearchTerm, setFarmerSearchTerm] = useState("");
//   const [sortPriceOrder, setSortPriceOrder] = useState("");
//   const [sortProduceOrder, setSortProduceOrder] = useState("");
//   const navigate = useNavigate();
//   const [selectedQuantities, setSelectedQuantities] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [imagesLoading, setImagesLoading] = useState(false);
//   const [consumerCoords, setConsumerCoords] = useState(null);
//   const [recommendedProducts, setRecommendedProducts] = useState([]);
//   const [pastOrders, setPastOrders] = useState([]);
// //  const [isLoading, setIsLoading] = useState(true); // Initial state is true
// const [imageCache, setImageCache] = useState(() => {
//   const savedCache = localStorage.getItem('productImageCache');
//   return savedCache ? JSON.parse(savedCache) : {};
// });
// // useEffect(() => {
// //     const fetchBargainingProducts = async () => {
// //       try {
// //         const response = await fetch('http://localhost:5000/api/bargaining-products');
// //         const data = await response.json();
// //         setBargainingProducts(data);
// //       } catch (error) {
// //         console.error("Error fetching bargaining products:", error);
// //       }
// //     };
// //     fetchBargainingProducts();
// //   }, []);

//   // Search handler function
//   const handleSearch = () => {
//     const combinedProducts = [...products, ...bargainingProducts];
    
//     const results = combinedProducts.filter(product => {
//       const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesCategory = selectedCategory === "All Categories" || 
//                             product.category === selectedCategory;
//       return matchesSearch && matchesCategory;
//     });
    
//     setSearchResults(results);
//     // You can then use these results to display or navigate to search results page
//     console.log("Search Results:", results);
//   };

// // Updated Carousel Settings in ConsumerDashboard.js
// const carouselSettings = {
//   dots: true,
//   infinite: true,
//   speed: 800,
//   slidesToShow: 2, // Show 2 products at a time
//   slidesToScroll: 1,
//   autoplay: true,
//   autoplaySpeed: 3000,
//   pauseOnHover: true,
//   cssEase: "cubic-bezier(0.645, 0.045, 0.355, 1)",
//   nextArrow: <SampleNextArrow />,
//   prevArrow: <SamplePrevArrow />,
//   responsive: [
//     {
//       breakpoint: 1024,
//       settings: {
//         slidesToShow: 2
//       }
//     },
//     {
//       breakpoint: 600,
//       settings: {
//         slidesToShow: 1
//       }
//     }
//   ]
// };
// // Add a function to geocode an address
// const geocodeAddress = async (address) => {
//   try {
//     const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
//     const response = await fetch(url);
//     const data = await response.json();
//     if (data.length > 0) {
//       return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
//     }
//     return null;
//   } catch (error) {
//     console.error("Error geocoding address:", error);
//     return null;
//   }
// };
// const fetchUserLocation = () => {
//     setIsLoading(true);
//     setDeliveryLocation("Fetching location...");
    
//     if ("geolocation" in navigator) {
//         navigator.geolocation.getCurrentPosition(
//             // Success callback
//             (position) => {
//                 const latitude = position.coords.latitude;
//                 const longitude = position.coords.longitude;
                
//                 // Store coordinates in state
//                 setConsumerCoords({ lat: latitude, lon: longitude });
                
//                 // Perform reverse geocoding to get a readable address
//                 reverseGeocode(latitude, longitude);
//             },
//             // Error callback
//             (error) => {
//                 console.error("Geolocation error:", error);
//                 setDeliveryLocation("Location not available");
//                 setIsLoading(false); 
                
//                 if (error.code === error.PERMISSION_DENIED) {
//                     alert("Location access denied. Please update your location manually.");
//                 }
//             },
//             // Options for geolocation
//             {
//                 enableHighAccuracy: true,
//                 timeout: 10000,
//                 maximumAge: 0
//             }
//         );
//     } else {
//         console.log("Geolocation is not supported by this browser.");
//         setDeliveryLocation("Geolocation not supported");
//         setIsLoading(false);
//     }
// };

// const reverseGeocode = async (latitude, longitude) => {
//     try {
//         const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
//         const response = await fetch(url);
//         const data = await response.json();

//         if (data.address) {
//             const address = data.address;
//             const displayAddress = [
//                 address.road,
//                 address.suburb,
//                 address.city || address.town || address.village,
//                 address.state,
//                 address.postcode
//             ].filter(Boolean).join(', ');

//             setDeliveryLocation(displayAddress || "Location not found");
//         } else {
//             setDeliveryLocation("Location not found");
//         }
//     } catch (error) {
//         console.error("Error during reverse geocoding:", error);
//         setDeliveryLocation("Error fetching location");
//     } finally {
//         setIsLoading(false);
//     }
// };

// // Initial fetch when the component mounts
// useEffect(() => {
//     fetchUserLocation();
// }, []); // Empty dependency array means this runs once on mount
// // Enhanced Arrow Components
// function SampleNextArrow(props) {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={className}
//       style={{ 
//         ...style, 
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         right: "-25px",
//         width: "40px",
//         height: "40px",
//         background: "rgba(255,255,255,0.9)",
//         borderRadius: "50%",
//         boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
//         zIndex: 1,
//         transform: "scale(1.2)"
//       }}
//       onClick={onClick}
//     >
//       <FontAwesomeIcon 
//         icon={faChevronRight} 
//         style={{ color: "#2e7d32", fontSize: "16px" }} 
//       />
//     </div>
//   );
// }
// // Haversine formula to calculate the distance between two lat/lon points
// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371; // Radius of the Earth in kilometers
//   const dLat = toRadians(lat2 - lat1);
//   const dLon = toRadians(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c; // Distance in km
//   return distance;
// }

// // Converts numeric degrees to radians
// function toRadians(deg) {
//   return deg * (Math.PI / 180);
// }
// function SamplePrevArrow(props) {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={className}
//       style={{ 
//         ...style, 
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         left: "-25px",
//         width: "40px",
//         height: "40px",
//         background: "rgba(255,255,255,0.9)",
//         borderRadius: "50%",
//         boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
//         zIndex: 1,
//         transform: "scale(1.2)"
//       }}
//       onClick={onClick}
//     >
//       <FontAwesomeIcon 
//         icon={faChevronLeft} 
//         style={{ color: "#2e7d32", fontSize: "16px" }} 
//       />
//     </div>
//   );
// }
// // New `useEffect` for fetching location on mount
// useEffect(() => {
//   setIsLoading(true); // Start loading animation
//   // Inside your `return` statement:
// if (isLoading) {
//   return (
//     <div className="ks-loading-overlay">
//       <div className="ks-loading-spinner">
//         <FontAwesomeIcon icon={faSpinner} spin size="3x" />
//       </div>
//       <p>Fetching your location to show products near you...</p>
//     </div>
//   );
// }

// // ... rest of your component
//   if ("geolocation" in navigator) {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         reverseGeocode(position.coords.latitude, position.coords.longitude);
//       },
//       (error) => {
//         console.error("Geolocation error:", error);
//         setDeliveryLocation("Location not available");
//         setIsLoading(false); // End loading on error
//       }
//     );
//   } else {
//     setDeliveryLocation("Geolocation not supported");
//     setIsLoading(false); // End loading if not supported
//   }
// }, []);
// useEffect(() => {
//   // Check if the browser supports the Geolocation API
//   if ("geolocation" in navigator) {
//     // Request the user's current position
//     navigator.geolocation.getCurrentPosition(
//       // Success callback
//       (position) => {
//         const latitude = position.coords.latitude;
//         const longitude = position.coords.longitude;
//         // Now, you'll need to convert these coordinates to a readable address.
//         // This is a process called 'reverse geocoding.'
//         reverseGeocode(latitude, longitude);
//       },
//       // Error callback
//       (error) => {
//         console.error("Geolocation error:", error);
//         // Handle specific errors, e.g., user denied permission
//         if (error.code === error.PERMISSION_DENIED) {
//           alert("Location access denied. Please update your location manually.");
//         }
//       }
//     );
//   } else {
//     // Geolocation is not supported by the browser
//     console.log("Geolocation is not supported by this browser.");
//   }
// }, []);
//   // Fetch past orders for recommendations
//   useEffect(() => {
//     const fetchPastOrders = async () => {
//       if (!consumer?.consumer_id) return;
      
//       try {
//         const response = await fetch(`http://localhost:5000/api/orders?consumer_id=${consumer.consumer_id}`, {
//           headers: {
//             "Authorization": `Bearer ${consumer.token}`,
//           },
//         });
        
//         if (response.ok) {
//           const data = await response.json();
//           setPastOrders(data);
//         }
//       } catch (error) {
//         console.error("Error fetching past orders:", error);
//       }
//     };
    
//     fetchPastOrders();
//   }, [consumer]);

//   // Generate recommendations based on past orders
//   useEffect(() => {
//     if (pastOrders.length > 0 && products.length > 0) {
//       // Get most frequently ordered categories
//       const categoryCounts = {};
//       pastOrders.forEach(order => {
//         const category = order.category || 'vegetables'; // default category
//         categoryCounts[category] = (categoryCounts[category] || 0) + 1;
//       });
      
//       // Sort categories by frequency
//       const sortedCategories = Object.keys(categoryCounts)
//         .sort((a, b) => categoryCounts[b] - categoryCounts[a]);
      
//       // Get top 2 categories
//       const topCategories = sortedCategories.slice(0, 2);
      
//       // Filter products by these categories
//       const recommended = products.filter(product => 
//         topCategories.includes(product.category.toLowerCase())
//       ).slice(0, 8); // Limit to 8 products
      
//       setRecommendedProducts(recommended);
//     } else {
//       // Fallback to popular products if no orders
//       const popular = [...products]
//         .sort((a, b) => b.ratings - a.ratings)
//         .slice(0, 8);
//       setRecommendedProducts(popular);
//     }
//   }, [pastOrders, products]);

//   // Rest of your existing code (fetchProducts, fetchProductImage, etc.) remains the same
//   // ... [keep all your existing functions and effects]
// // Update your useEffect
// useEffect(() => {
//   const loadProductImages = async () => {
//     setImagesLoading(true);
//     const images = {};
//     for (const product of products) {
//       images[product.product_id] = await fetchProductImage(product.product_name);
//     }
//     setProductImages(images);
//     setImagesLoading(false);
//   };

//   if (products.length > 0) {
//     loadProductImages();
//   }
// }, [products]);
//   // const [, setMessages] = useState([]);

//   // useEffect(() => {
//   //   const fetchProducts = async () => {
//   //     try {
//   //       const response = await fetch("http://localhost:5000/api/products", {
//   //         method: "GET",
//   //         credentials: "include",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //           "Authorization": `Bearer ${consumer?.token}`,
//   //         },
//   //       });
  
//   //       if (!response.ok) {
//   //         throw new Error("Failed to fetch products");
//   //       }
  
//   //       const data = await response.json();
//   //       setProducts(data);
//   //     } catch (error) {
//   //       console.error("Error fetching products:", error);
//   //       alert("Failed to load products. Please refresh the page.");
//   //     }
//   //   };
  
//   //   if (consumer?.token) {
//   //     fetchProducts(); // Call only when token is available
//   //   }
//   // }, [consumer?.token]);

//   const fetchProductImage = async (productName) => {
//     // Check cache first
//     if (imageCache[productName]) {
//       return imageCache[productName];
//     }
  
//     try {
//       const response = await fetch(
//         `https://api.pexels.com/v1/search?query=${encodeURIComponent(productName)}&per_page=1`,
//         {
//           headers: {
//             Authorization: 'uONxxczjZM1uaDw2jsGQPV70vtBfQbuyHcKeJ0aaCwsK0xxbo5HDpamR'
//           }
//         }
//       );
      
//       const data = await response.json();
//       const imageUrl = data.photos[0]?.src.medium || 'https://via.placeholder.com/300?text=No+Image';
      
//       // Update cache
//       const newCache = { ...imageCache, [productName]: imageUrl };
//       setImageCache(newCache);
//       localStorage.setItem('productImageCache', JSON.stringify(newCache));
      
//       return imageUrl;
//     } catch (error) {
//       console.error('Error fetching image:', error);
//       return 'https://via.placeholder.com/300?text=No+Image';
//     }
//   };
//   useEffect(() => {
//     const loadProductImages = async () => {
//       const images = {};
//       for (const product of products) {
//         images[product.product_id] = await fetchProductImage(product.product_name);
//       }
//       setProductImages(images);
//     };
  
//     if (products.length > 0) {
//       loadProductImages();
//     }
//   }, [products]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/api/products", {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${consumer?.token}`,
//           },
//         });
  
//         if (!response.ok) {
//           throw new Error("Failed to fetch products");
//         }
  
//         const text = await response.text(); // 🔍 safer than .json()
  
//         if (!text) {
//           throw new Error("Empty response body"); // 👈 triggers catch block
//         }
  
//         const data = JSON.parse(text);
//         setProducts(data);
//       } catch (error) {
//         console.error("❌ Error fetching products:", error);
//         alert("Failed to load products. Please refresh the page.");
//       }
//     };
  
//     if (consumer?.token) {
//       fetchProducts();
//     }
//   }, [consumer?.token]);
  
//   useEffect(() => {
//     const fetchFarmers = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/farmers', {
//           method: "GET",
//           credentials: 'include',
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${consumer?.token}`,
//           },
//         });        

//         if (!response.ok) {
//           throw new Error('Failed to fetch farmers');
//         }

//         const data = await response.json();

//         // Fetch ratings, products, and profile photo for each farmer
//         const farmersWithData = await Promise.all(
//           data.map(async (farmer) => {
//             try {
//               // Fetch personal details including profile photo
//               const personalResponse = await fetch(
//                 `http://localhost:5000/api/farmerprofile/${farmer.farmer_id}/personal`,
//                 {
//                   headers: {
//                     "Authorization": `Bearer ${consumer?.token}`,
//                   },
//                 }
//               );
//               const personalData = await personalResponse.json();

//               // Fetch ratings
//               const ratingsResponse = await fetch(
//                 `http://localhost:5000/reviews/${farmer.farmer_id}`,
//                 {
//                   headers: {
//                     "Authorization": `Bearer ${consumer?.token}`,
//                   },
//                 }
//               );
//               const ratingsData = await ratingsResponse.json();
              
//               // Calculate average rating
//               const averageRating = ratingsData.length > 0 
//                 ? ratingsData.reduce((sum, review) => sum + parseFloat(review.rating), 0) / ratingsData.length
//                 : 0;

//               // Fetch products
//               const productsResponse = await fetch(
//                 `http://localhost:5000/api/produces?farmer_id=${farmer.farmer_id}&market_type=Bargaining Market`,
//                 {
//                   headers: {
//                     "Authorization": `Bearer ${consumer?.token}`,
//                   },
//                 }
//               );
              
//               const productsData = await productsResponse.json();
//               const farmerAddress = farmResponse.data.farm_address;
//         const farmerCoords = farmerAddress ? await geocodeAddress(farmerAddress) : null;
        
//         // Calculate distance if both consumer and farmer coordinates are available
//         const distance = (consumerCoords && farmerCoords) 
//           ? calculateDistance(consumerCoords.lat, consumerCoords.lon, farmerCoords.lat, farmerCoords.lon)
//           : null;
//               return {
//                 ...farmer,
//                 profile_photo: personalData.profile_photo 
//                   ? `http://localhost:5000${personalData.profile_photo}`
//                   : null,
//                 products: productsData,
//                 average_rating: parseFloat(averageRating.toFixed(1)),
//                 farm_address: farmerAddress,
//           farmer_coords: farmerCoords,
//           distance_km: distance,
//               };
//             } catch (error) {
//               console.error(`Error fetching data for farmer ${farmer.farmer_id}:`, error);
//               return {
//                 ...farmer,
//                 profile_photo: null,
//                 products: [],
//                 average_rating: 0
//               };
//             }
//           })
//         );
//  // Filter farmers based on distance
//     const filteredFarmers = farmersWithData.filter(farmer => 
//       !farmer.distance_km || farmer.distance_km <= 20 // Keep farmers within 20km or those with unknown distance
//     );
//         setFarmers(filteredFarmers);
//       } catch (error) {
//         console.error("Error fetching farmers:", error);
//         alert("Failed to load farmers. Please refresh the page.");
//       }
//     };

//   // Only fetch farmers if consumer coordinates are available
//   if (consumer?.token && consumerCoords) {
//     fetchFarmers();
//   } else if (consumer?.token && !consumerCoords) {
//     // Wait for consumerCoords to be set
//   }
// }, [consumer?.token, consumerCoords]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // const token = localStorage.getItem("token"); // or get from cookies
  
//         const productData = await fetchProducts("http://localhost:5000/api/products", {  
//           headers: {
         
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${consumer?.token}`,
//           }
//         });
  
//         setProducts(productData);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       }
//     };
  
//     fetchData();
//   }, []);
  
// const handleBargainClick = async (product, e) => {
//   if (e) e.stopPropagation(); // Stop event propagation if 'e' is provided
//   setError(null);
//   setIsLoading(true);

//   try {
//     // Ensure consumer token is available
//     if (!consumer?.token) {
//       navigate('/loginpage', { state: { from: location.pathname } });
//       return;
//     }

//     // Ensure farmer data is loaded from state
//     if (!farmer) {
//       throw new Error("Farmer details not loaded yet. Please wait.");
//     }

//     const quantity = 10; // Default quantity for the bargain product

//     // 1. Create bargain session
//     const response = await fetch(`http://localhost:5000/api/create-bargain`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${consumer.token}`
//       },
//       body: JSON.stringify({
//         farmer_id: farmer.farmer_id, // Access farmer_id directly from the 'farmer' state
//         initiator: "consumer",
//       })
//     });

//     const text = await response.text();
//     console.log("📦 Raw Response Text (create-bargain):", text);

//     let data;
//     try {
//       data = JSON.parse(text);
//     } catch (err) {
//       console.error("❌ Failed to parse JSON response for create-bargain:", err);
//       throw new Error("Invalid response from server when creating bargain session.");
//     }

//     if (!data.success) {
//       throw new Error(data.error || 'Failed to create bargain session');
//     }
    
//     if (!data.bargainId) {
//       throw new Error("Missing bargainId in server response after creating session.");
//     }

//     // 2. Add product to bargain session
//     const productResponse = await fetch(`http://localhost:5000/api/add-bargain-product`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${consumer.token}`
//       },
//       body: JSON.stringify({
//         bargain_id: data.bargainId,
//         product_id: product.product_id,
//         quantity: quantity
//       })
//     });

//     const productText = await productResponse.text();
//     console.log("📦 Raw Response Text (add-bargain-product):", productText);

//     let productData;
//     try {
//       productData = JSON.parse(productText);
//     } catch (err) {
//       console.error("❌ Failed to parse JSON response for add-bargain-product:", err);
//       throw new Error("Invalid response from server when adding product to bargain.");
//     }
    
//     if (!productData.success) {
//       throw new Error(productData.error || 'Failed to add product to bargain');
//     }

//     // 3. Navigate to chat window
//     navigate(`/bargain/${data.bargainId}`, {
//       state: {
//         farmer: farmer, // Pass the 'farmer' state variable to the next route
//         product: {
//           ...product,
//           price_per_kg: productData.price_per_kg,
//           quantity: productData.quantity
//         },
//         originalPrice: productData.price_per_kg, // Use the product's price from the response
//         isNewBargain: true
//       }
//     });

//   } catch (error) {
//     setError(error.message);
//     console.error("Bargain initiation error:", error);
//   } finally {
//     setIsLoading(false);
//   }
// };
  
  
// useEffect(() => {
//   // Get the stored consumer data from localStorage
//   const storedConsumer = localStorage.getItem("consumer");
  
//   if (!storedConsumer) {
//     console.error("❌ No consumer session found!");
//     navigate("/consumer-login");
//     return;
//   }

//   try {
//     const consumerData = JSON.parse(storedConsumer);
//     const token = consumerData.token;
    
//     if (!token) {
//       console.error("❌ No token found in consumer data!");
//       navigate("/consumer-login");
//       return;
//     }

//     // Verify token payload
//     const payload = JSON.parse(atob(token.split('.')[1]));
    
//     if (payload.farmer_id) {
//       alert("Farmers cannot initiate bargains");
//       localStorage.removeItem("consumer");
//       navigate("/consumer-login");
//     }
//   } catch (e) {
//     console.error("❌ Error parsing token:", e);
//     localStorage.removeItem("consumer");
//     navigate("/consumer-login");
//   }
// }, [navigate]);

//   const handleQuantityChange = (productId, event) => {
//     const value = parseInt(event.target.value, 10);
//     if (!isNaN(value)) {
//       setSelectedQuantities(prev => ({
//         ...prev,
//         [productId]: value
//       }));
//     }
//   };

//   const handleBuyNow = (product, e) => {
//     e.stopPropagation();
//     const quantity = selectedQuantities[product.product_id] || 1;
//     addToCart(product, quantity);
//     navigate("/cart");
//   };

//   const handleProductClick = (productId, productImage) => {
//     navigate(`/productDetails/${productId}`, { 
//       state: { 
//         productImage: productImage || 'https://via.placeholder.com/300?text=No+Image'
//       } 
//     });
//   };

//   const handleFarmerClick = (farmerId) => {
//     navigate(`/farmerDetails/${farmerId}`);
//   };

//   const handleAddToCommunityOrders = () => {
//     navigate(`/community-home`);
//   };

//   const handleSubscribe =  (productId) => {
//     navigate(`/productDetails/${productId}`);
//   };


//   const filteredProducts = products.filter((product) => {
//     return (
//       product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
//       (category === "" || product.category.toLowerCase() === category.toLowerCase()) &&
//       (buyType === "" || product.buy_type.toLowerCase() === buyType.toLowerCase())
//     );
//   });
  
//   const filteredFarmers = farmers
//   .map((farmer) => {
//     const parsedProducts = Array.isArray(farmer.products)
//       ? farmer.products
//       : JSON.parse(farmer.products || "[]");
//     return { ...farmer, products: parsedProducts };
//   })
//   .filter((farmer) => {
//     const term = farmerSearchTerm.toLowerCase();
//     const matchesFarmer = 
//       farmer.farmer_name?.toLowerCase().includes(term) ||
//       farmer.farmer_id?.toString().toLowerCase().includes(term);
    
//     const matchesProducts = farmer.products.some((product) => {
//       return (
//         product.produce_id?.toLowerCase().includes(term) ||
//         product.produce_name?.toLowerCase().includes(term) ||
//         product.produce_type?.toLowerCase().includes(term) ||
//         product.price_per_kg?.toString().includes(term) ||
//         product.product_id?.toString().includes(term)
//       );
//     });
    
//     return matchesFarmer || matchesProducts;
//   })
//   .sort((a, b) => {
//     if (sortPriceOrder) {
//       const aMinPrice = Math.min(...a.products.map(p => p.price_per_kg));
//       const bMinPrice = Math.min(...b.products.map(p => p.price_per_kg));
//       return sortPriceOrder === "asc" ? aMinPrice - bMinPrice : bMinPrice - aMinPrice;
//     }
//     if (sortProduceOrder) {
//       const aProduceType = a.products[0]?.produce_type || "";
//       const bProduceType = b.products[0]?.produce_type || "";
//       return sortProduceOrder === "asc"
//         ? aProduceType.localeCompare(bProduceType)
//         : bProduceType.localeCompare(aProduceType);
//     }
//     return 0;
//   });

//   const renderRatingStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating || 0);
//     const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
//     for (let i = 0; i < fullStars; i++) {
//       stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} className="ks-star-filled" />);
//     }
    
//     if (hasHalfStar) {
//       stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className="ks-star-filled" />);
//     }
    
//     const emptyStars = 5 - stars.length;
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="ks-star" />);
//     }
    
//     return stars;
//   };
// return (
  
//   <div className="ks-consumer-dashboard">
//   {/* Location and Search Bar Section */}
//       <div className="ks-search-location-bar">
//         <div className="ks-delivery-info">
//           <span className="ks-deliver-to">Deliver to</span>
//     <button 
//       className="ks-location-display-button"
//       onClick={fetchUserLocation}
//     >
//       <FontAwesomeIcon icon={faMapMarkerAlt} className="ks-location-icon" />
//       <span className="ks-current-location">{deliveryLocation}</span>
//       <FontAwesomeIcon icon={faChevronDown} className="ks-dropdown-arrow" />
//     </button>
//         </div>
        
//         <div className="ks-search-container">
//           <div className="ks-search-categories">
//             <select 
//               className="ks-category-dropdown"
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//             >
//               <option>All Categories</option>
//               <option>Vegetables</option>
//               <option>Fruits</option>
//               <option>Grains & Pulses</option>
//               <option>Dairy</option>
//               <option>Spices</option>
//             </select>
//             <div className="ks-dropdown-arrow">▼</div>
//           </div>
//           <input 
//             type="text" 
//             placeholder="Search products in KrishiSetu and Bargaining markets..." 
//             className="ks-search-input"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//           />
//           <button 
//             className="ks-search-button"
//             onClick={handleSearch}
//           >
//             <FontAwesomeIcon icon={faSearch} />
//           </button>
//         </div>
//       </div>
//     {/* Recommendation Carousel Section - Always visible */}
//     {recommendedProducts.length > 0 && (
//       <div className="ks-recommendation-section">
//         <h2 className="ks-section-title">Recommended For You</h2>
//         <div className="ks-recommendation-carousel">
//           <Slider {...carouselSettings}>
//             {recommendedProducts.map((product) => (
//               <div key={`rec-${product.product_id}`} className="ks-recommendation-item">
//                   <div 
//                     className="ks-product-image-container"
//                     onClick={() => handleProductClick(product.product_id, productImages[product.product_id])}
//                   >
//                     <img
//                       src={productImages[product.product_id] || 'https://via.placeholder.com/300?text=Loading...'}
//                       alt={product.product_name}
//                       className="ks-product-image"
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = 'https://via.placeholder.com/300?text=No+Image';
//                       }}
//                     />
//                     {product.buy_type === "organic" && (
//                       <img 
//                         src={OrganicBadge} 
//                         alt="Organic" 
//                         className="ks-organic-badge"
//                       />
//                     )}
//                   </div>
//                   <div className="ks-recommendation-details">
//                     <h3>{product.product_name}</h3>
//                     <div className="ks-recommendation-price">
//                       ₹{product.price_1kg}/kg
//                     </div>
//                     <button 
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         addToCart(product, 1);
//                       }}
//                       className="ks-recommendation-add-btn"
//                     >
//                       <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </Slider>
//           </div>
//         </div>
//       )}
//       {/* Product Section */}
//       <div className="ks-main-content">
//       <div className="ks-market-section">
//         <h2 className="ks-section-title">KrishiSetu Marketplace</h2>
//         <div className="ks-search-filter-container">
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="ks-search-input"
//           />
//           <div className="ks-filter-group">
//             <select 
//               value={category} 
//               onChange={(e) => setCategory(e.target.value)}
//               className="ks-filter-select"
//             >
//               <option value="">All Categories</option>
//               <option value="vegetables">Vegetables</option>
//               <option value="fruits">Fruits</option>
//               <option value="grains">Grains</option>
//               <option value="dairy">Dairy</option>
//               <option value="spices">Spices</option>
//             </select>
//             <select 
//               value={buyType} 
//               onChange={(e) => setBuyType(e.target.value)}
//               className="ks-filter-select"
//             >
//               <option value="">All Types</option>
//               <option value="organic">Organic</option>
//               <option value="standard">Standard</option>
//             </select>
//           </div>
//         </div>
        
//         <div className="ks-products-grid">
//         {filteredProducts.map((product) => (
//     <div key={product.product_id} className="ks-product-card">
//       <div 
//         className="ks-product-image-container"
//         onClick={() => handleProductClick(product.product_id, productImages[product.product_id])}

//       >
//         <img
//           src={productImages[product.product_id] || 'https://via.placeholder.com/300?text=Loading...'}
//           alt={product.product_name}
//           className="ks-product-image"
//           onError={(e) => {
//             e.target.onerror = null;
//             e.target.src = 'https://via.placeholder.com/300?text=No+Image';
//           }}
//         />
//         {product.buy_type === "organic" && (
//           <img 
//             src={OrganicBadge} 
//             alt="Organic" 
//             className="ks-organic-badge"
//             onClick={(e) => {
//               e.stopPropagation(); // Prevent triggering the parent click
//               handleProductClick(product.product_id);
//             }}
//           />
//         )}
//       </div>
//               <div className="ks-product-details">
//                 <h3 className="ks-product-name">{product.product_name}</h3>
//                 <div className="ks-product-meta">
//                   <span className={`ks-product-type ${product.buy_type}`}>
//                     {product.buy_type}
//                   </span>
//                   <span className="ks-product-category">{product.category}</span>
//                 </div>
                
//                 <div className="ks-price-container">
//                   <span className="ks-price-label">From:</span>
//                   <span className="ks-price-value">₹{product.price_1kg}/kg</span>
//                 </div>
                
//                 <div className="ks-quantity-selector">
//                   <select
//                     value={selectedQuantities[product.product_id] || 1}
//                     onChange={(e) => handleQuantityChange(product.product_id, e)}
//                     className="ks-quantity-dropdown"
//                     onClick={(e) => e.stopPropagation()}
//                   >
//                     <option value="1">1kg - ₹{product.price_1kg}</option>
//                     <option value="2">2kg - ₹{product.price_2kg}</option>
//                     <option value="5">5kg - ₹{product.price_5kg}</option>
//                   </select>
//                 </div>
                
//                 <div className="ks-product-actions">
//                   <button 
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       addToCart(product, selectedQuantities[product.product_id] || 1);
//                     }}
//                     className="ks-action-btn ks-cart-btn"
//                   >
//                     <FontAwesomeIcon icon={faShoppingCart} /> Cart
//                   </button>
//                   <button
//                     onClick={(e) => handleBuyNow(product, e)}
//                     className="ks-action-btn ks-buy-btn"
//                   >
//                     <FontAwesomeIcon icon={faBolt} /> Buy
//                   </button>
//                   <button 
//                     onClick={(e) => handleAddToCommunityOrders(product, e)}
//                     className="ks-action-btn ks-community-btn"
//                   >
//                     <FontAwesomeIcon icon={faUsers} /> Community
//                   </button>
//                   <button
//                     onClick={(e) => handleSubscribe(product.product_id, e)}
//                     className="ks-action-btn ks-subscribe-btn"
//                   >
//                     <FontAwesomeIcon icon={faCalendarAlt} /> Subscribe
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Bargaining Market Section */}
//       <div className="ks-bargaining-section">
//         <h2 className="ks-section-title">Bargaining Marketplace</h2>
//         <div className="ks-farmer-search-container">
//           <input
//             type="text"
//             placeholder="Search farmers or products..."
//             value={farmerSearchTerm}
//             onChange={(e) => setFarmerSearchTerm(e.target.value)}
//             className="ks-search-input"
//           />
//           <div className="ks-farmer-filters">
//             <select
//               value={sortPriceOrder}
//               onChange={(e) => setSortPriceOrder(e.target.value)}
//               className="ks-filter-select"
//             >
//               <option value="">Sort by Price</option>
//               <option value="asc">Low to High</option>
//               <option value="desc">High to Low</option>
//             </select>
//             <select
//               value={sortProduceOrder}
//               onChange={(e) => setSortProduceOrder(e.target.value)}
//               className="ks-filter-select"
//             >
//               <option value="">Sort by Type</option>
//               <option value="asc">Organic</option>
//               <option value="desc">Standard</option>
//             </select>
//           </div>
//         </div>
        
//         <div className="ks-farmers-list">
//         {filteredFarmers
//             .filter(farmer => farmer.products && farmer.products.length > 0)
//             .map((farmer) => (
//               <div 
//                 key={farmer.farmer_id} 
//                 className="ks-farmer-card"
//                 onClick={() => handleFarmerClick(farmer.farmer_id)}
//               >
//                 <div className="ks-farmer-header">
//                   <div className="ks-farmer-avatar-container">
//                     {farmer.profile_photo ? (
//                       <img 
//                         src={farmer.profile_photo} 
//                         alt="Farmer" 
//                         className="ks-farmer-avatar"
//                       />
//                     ) : (
//                       <div className="ks-farmer-avatar-placeholder"></div>
//                     )}
//                   </div>
//                   <div className="ks-farmer-basic-info">
//                     <h3 className="ks-farmer-name">{farmer.farmer_name}</h3>
//                     <div className="ks-farmer-meta">
//                       <span className="ks-farmer-id">ID: {farmer.farmer_id}</span>
//                       <span className="ks-farmer-rating">
//                         {renderRatingStars(farmer.average_rating || 0)}
//                         <span className="ks-rating-value">({farmer.average_rating?.toFixed(1) || 0})</span>
//                       </span>
//                     </div>
//                   </div>
//                 </div>
                
        
//         <div className="ks-products-table-container">
//           <table className="ks-products-table">
//             <thead>
//               <tr>
//                 <th>Product</th>
//                 <th>Type</th>
//                 <th>Price/kg</th>
//                 <th>Available</th>
//               </tr>
//             </thead>
//             <tbody>
//               {farmer.products.map((product) => (
//                 <tr key={`${product.product_id}-${product.produce_name}`}>
//                   <td>{product.produce_name}</td>
//                   <td>{product.produce_type}</td>
//                   <td>₹{product.price_per_kg}</td>
//                   <td>{product.availability}kg</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
        
//         <div className="ks-farmer-actions">
//           <button 
//             onClick={(e) => handleBargainClick(farmer, farmer.products[0], e)} 
//             className="ks-farmer-action-btn ks-bargain-btn"
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <FontAwesomeIcon icon={faSpinner} spin />
//             ) : (
//               <>
//                 <FontAwesomeIcon icon={faHandshake} /> Bargain
//               </>
//             )}
//           </button>
//           {error && (
//             <div className="error-message">
//               <FontAwesomeIcon icon={faExclamationTriangle} />
//               <div>
//                 {error.includes('initiator') ? (
//                   <>
//                     <p>Session initialization error</p>
//                     <button onClick={() => window.location.reload()}>Refresh Page</button>
//                   </>
//                 ) : (
//                   error
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     ))}
// </div>
//       </div>
// </div>
     
//     </div>
//   );
// };

// export default ConsumerDashboard;
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
    faSpinner
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
    
    const geocodeAddress = async (address) => {
        try {
            const url = `${process.env.REACT_APP_BACKEND_URL}/api/geocode/forward?q=${encodeURIComponent(address)}`;
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
            const url = `${process.env.REACT_APP_BACKEND_URL}/api/geocode/reverse?lat=${latitude}&lon=${longitude}`;
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
    
    useEffect(() => {
        fetchUserLocation();

        const fetchAllData = async () => {
            if (!consumer?.token) {
                console.warn("Authentication token is not yet available. Skipping protected API calls.");
                return;
            }

            try {
                const productData = await fetchProducts(`${process.env.REACT_APP_BACKEND_URL}/api/products`, {
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
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders?consumer_id=${consumer.consumer_id}`, {
                    headers: { "Authorization": `Bearer ${consumer.token}` },
                });
                if (!response.ok) {
                    console.error("Failed to fetch past orders:", response.status, response.statusText);
                    if (response.status === 404) {
                        setPastOrders([]);
                    }
                    return;
                }
                const data = await response.json();
                setPastOrders(data);
            } catch (error) {
                console.error("Error fetching past orders:", error);
            }
        };

        fetchAllData();
    }, [consumer, navigate]);

    useEffect(() => {
        const fetchFarmers = async () => {
            if (!consumer?.token || !consumerCoords) return;

            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/farmers`, {
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
                                `${process.env.REACT_APP_BACKEND_URL}/api/farmerprofile/${farmer.farmer_id}/personal`,
                                { headers: { "Authorization": `Bearer ${consumer?.token}` } }
                            );
                            const personalData = await personalResponse.json();

                            const ratingsResponse = await fetch(
                                `${process.env.REACT_APP_BACKEND_URL}/reviews/${farmer.farmer_id}`,
                                { headers: { "Authorization": `Bearer ${consumer?.token}` } }
                            );
                            const ratingsData = await ratingsResponse.json();

                            const averageRating = ratingsData.length > 0
                                ? ratingsData.reduce((sum, review) => sum + parseFloat(review.rating), 0) / ratingsData.length
                                : 0;

                            const productsResponse = await fetch(
                                `${process.env.REACT_APP_BACKEND_URL}/api/produces?farmer_id=${farmer.farmer_id}&market_type=Bargaining Market`,
                                { headers: { "Authorization": `Bearer ${consumer?.token}` } }
                            );
                            const productsData = await productsResponse.json();
                            
                            const farmResponse = await fetch(
                                `${process.env.REACT_APP_BACKEND_URL}/api/farmerprofile/${farmer.farmer_id}/farm`,
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
                                    ? `${process.env.REACT_APP_BACKEND_URL}${personalData.profile_photo}`
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

    const handleBargainClick = async (farmer, product, e) => {
        if (e) e.stopPropagation();
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/create-bargain`, {
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
            
            const productResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/add-bargain-product`, {
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

    const handleQuantityChange = (productId, event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value)) {
            setSelectedQuantities(prev => ({
                ...prev,
                [productId]: value
            }));
        }
    };

    const handleBuyNow = (product, e) => {
        e.stopPropagation();
        const quantity = selectedQuantities[product.product_id] || 1;
        addToCart(product, quantity);
        navigate("/cart");
    };

    const handleProductClick = (productId, productImage) => {
        navigate(`/productDetails/${productId}`, {
            state: {
                productImage: productImage || 'https://via.placeholder.com/300?text=No+Image'
            }
        });
    };

    const handleFarmerClick = (farmerId) => {
        navigate(`/farmerDetails/${farmerId}`);
    };

    const handleAddToCommunityOrders = () => {
        navigate(`/community-home`);
    };

    const handleSubscribe = (productId) => {
        navigate(`/productDetails/${productId}`);
    };

    const filteredProducts = products.filter((product) => {
        return (
            product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (category === "" || product.category.toLowerCase() === category.toLowerCase()) &&
            (buyType === "" || product.buy_type.toLowerCase() === buyType.toLowerCase())
        );
    });

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
                        {filteredProducts.map((product) => (
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
                                            <FontAwesomeIcon icon={faBolt} /> Buy
                                        </button>
                                        <button
                                            onClick={(e) => handleAddToCommunityOrders(product, e)}
                                            className="ks-action-btn ks-community-btn"
                                        >
                                            <FontAwesomeIcon icon={faUsers} /> Community
                                        </button>
                                        <button
                                            onClick={(e) => handleSubscribe(product.product_id, e)}
                                            className="ks-action-btn ks-subscribe-btn"
                                        >
                                            <FontAwesomeIcon icon={faCalendarAlt} /> Subscribe
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                                    {error.includes('initiator') ? (
                                                        <>
                                                            <p>Session initialization error</p>
                                                            <button onClick={() => window.location.reload()}>Refresh Page</button>
                                                        </>
                                                    ) : (
                                                        error
                                                    )}
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