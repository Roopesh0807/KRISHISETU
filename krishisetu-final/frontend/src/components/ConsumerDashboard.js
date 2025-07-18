// import React, { useState, useEffect } from "react";
// import { useNavigate,useLocation } from "react-router-dom";
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
//   //faUser,
//   faHandshake,
//   // faComments,
//   faStar,
//   faStarHalfAlt,
//   faExclamationTriangle,
//   // faTimes
// } from '@fortawesome/free-solid-svg-icons';

// // Import images
// // import Farmer from "../assets/farmer.jpeg";
// import OrganicBadge from "../assets/organic.jpg";
// // import Tomato from "../assets/tomato.jpg";
// // import Apple from "../assets/apple.jpg";
// // import Banana from "../assets/banana.jpg";
// // import Butter from "../assets/butter.jpg";
// // import Cheese from "../assets/cheese.jpg";
// // import Chilly from "../assets/chilly.jpg";
// // import Cumin from "../assets/cuminseeds.jpg";
// // import Ghee from "../assets/ghee.jpg";
// // import Ginger from "../assets/ginger.jpg";
// // import Grapes from "../assets/grapes.jpg";
// // import Onion from "../assets/onion.jpg";
// // import Potato from "../assets/potato.jpg";
// // import Rice from "../assets/rice.jpg";
// // import Turmeric from "../assets/turmeric.jpg";
// // import Wheat from "../assets/wheat.png";
// // import Pomegranate from "../assets/pomegranate.jpg";
// // import MasoorDal from "../assets/masoordal.jpg";
// // import Uraddal from "../assets/uraddal.jpg";
// // import Redchilly from "../assets/redchilly.jpg";
// // import Garlic from "../assets/garlic.jpg";
// // import Coriander from "../assets/coriander.jpg";
// // import Avocado from "../assets/avocado.png";
// // import Capsicum from "../assets/capsicum.jpg";
// // import Carrot from "../assets/carrot.jpg";
// // import Cauliflower from "../assets/cauliflower.webp";
// // import Curd from "../assets/curd.jpg";
// // import Lentils from "../assets/lentils.jpg";
// // import Mango from "../assets/mango.jpg";
// // import Milk from "../assets/milk.jpg";
// // import BlackPepper from "../assets/blackpepper.jpg"; 
// // import BargainChatWindow from "./bargaining/ConsumerChatWindow";

// // const productImages = {
// //   BlackPepper,
// //   Mango,
// //   Milk,
// //   Lentils,
// //   Curd,
// //   Cauliflower,
// //   Carrot,
// //   Capsicum,
// //   Avocado,
// //   MasoorDal,
// //   Uraddal,
// //   Redchilly,
// //   Garlic,
// //   Coriander,
// //   Tomato,
// //   Apple,
// //   Banana,
// //   Butter,
// //   Cheese,
// //   Chilly,
// //   Cumin,
// //   Ghee,
// //   Ginger,
// //   Grapes,
// //   Onion,
// //   Potato,
// //   Rice,
// //   Turmeric,
// //   Wheat,
// //   Pomegranate,
// // };
// // In your component file (e.g., ConsumerDashboard.js)

// // Remove the local image imports and replace with:

// const ConsumerDashboard = () => {


//   // Add this at the top of your component
// const [imageCache, setImageCache] = useState(() => {
//   const savedCache = localStorage.getItem('productImageCache');
//   return savedCache ? JSON.parse(savedCache) : {};
// });

// // Update your fetchProductImage function

//   const { consumer } = useAuth();
//   // const token = consumer?.token;
//   // console.log("Consumer token:", token);
//   console.log("🔍 Consumer from AuthContext:", consumer);
//   // const location = useLocation();
//   const [products, setProducts] = useState([]);
//   const [farmers, setFarmers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [category, setCategory] = useState("");
//   const [buyType, setBuyType] = useState("");
//   const { addToCart } = useCart();
//   const location = useLocation();
//   const [productImages, setProductImages] = useState({});
//   // const { bargainId } = useParams();
//   // const [, setIsBargainPopupOpen] = useState(false);
//   // const [, setSelectedFarmer] = useState(null);
//   // const [selectedProduct, setSelectedProduct] = useState(null);
//   // const [quantity, setQuantity] = useState(1);
//   const [farmerSearchTerm, setFarmerSearchTerm] = useState("");
//   const [sortPriceOrder, setSortPriceOrder] = useState("");
//   const [sortProduceOrder, setSortProduceOrder] = useState("");
//   const navigate = useNavigate();
//   const [selectedQuantities, setSelectedQuantities] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [imagesLoading, setImagesLoading] = useState(false);


import { faSearch } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/ConsumerDashboard.css";
import { fetchProducts } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faBolt, 
  faUsers, 
  faCalendarAlt,
  faHandshake,
  faStar,
  faStarHalfAlt,
  faExclamationTriangle,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

// Import images
import OrganicBadge from "../assets/organic.jpg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const ConsumerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
const [selectedCategory, setSelectedCategory] = useState("All Categories");
const [deliveryLocation, setDeliveryLocation] = useState("Bengaluru 562130");
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
const [imageCache, setImageCache] = useState(() => {
  const savedCache = localStorage.getItem('productImageCache');
  return savedCache ? JSON.parse(savedCache) : {};
});
// useEffect(() => {
//     const fetchBargainingProducts = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/bargaining-products');
//         const data = await response.json();
//         setBargainingProducts(data);
//       } catch (error) {
//         console.error("Error fetching bargaining products:", error);
//       }
//     };
//     fetchBargainingProducts();
//   }, []);

  // Search handler function
  const handleSearch = () => {
    const combinedProducts = [...products, ...bargainingProducts];
    
    const results = combinedProducts.filter(product => {
      const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All Categories" || 
                            product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    setSearchResults(results);
    // You can then use these results to display or navigate to search results page
    console.log("Search Results:", results);
  };

// Updated Carousel Settings in ConsumerDashboard.js
const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 2, // Show 2 products at a time
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  pauseOnHover: true,
  cssEase: "cubic-bezier(0.645, 0.045, 0.355, 1)",
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1
      }
    }
  ]
};

// Enhanced Arrow Components
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

  // Fetch past orders for recommendations
  useEffect(() => {
    const fetchPastOrders = async () => {
      if (!consumer?.consumer_id) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/orders?consumer_id=${consumer.consumer_id}`, {
          headers: {
            "Authorization": `Bearer ${consumer.token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setPastOrders(data);
        }
      } catch (error) {
        console.error("Error fetching past orders:", error);
      }
    };
    
    fetchPastOrders();
  }, [consumer]);

  // Generate recommendations based on past orders
  useEffect(() => {
    if (pastOrders.length > 0 && products.length > 0) {
      // Get most frequently ordered categories
      const categoryCounts = {};
      pastOrders.forEach(order => {
        const category = order.category || 'vegetables'; // default category
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Sort categories by frequency
      const sortedCategories = Object.keys(categoryCounts)
        .sort((a, b) => categoryCounts[b] - categoryCounts[a]);
      
      // Get top 2 categories
      const topCategories = sortedCategories.slice(0, 2);
      
      // Filter products by these categories
      const recommended = products.filter(product => 
        topCategories.includes(product.category.toLowerCase())
      ).slice(0, 8); // Limit to 8 products
      
      setRecommendedProducts(recommended);
    } else {
      // Fallback to popular products if no orders
      const popular = [...products]
        .sort((a, b) => b.ratings - a.ratings)
        .slice(0, 8);
      setRecommendedProducts(popular);
    }
  }, [pastOrders, products]);

  // Rest of your existing code (fetchProducts, fetchProductImage, etc.) remains the same
  // ... [keep all your existing functions and effects]
// Update your useEffect
useEffect(() => {
  const loadProductImages = async () => {
    setImagesLoading(true);
    const images = {};
    for (const product of products) {
      images[product.product_id] = await fetchProductImage(product.product_name);
    }
    setProductImages(images);
    setImagesLoading(false);
  };

  if (products.length > 0) {
    loadProductImages();
  }
}, [products]);
  // const [, setMessages] = useState([]);

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       const response = await fetch("http://localhost:5000/api/products", {
  //         method: "GET",
  //         credentials: "include",
  //         headers: {
  //           "Content-Type": "application/json",
  //           "Authorization": `Bearer ${consumer?.token}`,
  //         },
  //       });
  
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch products");
  //       }
  
  //       const data = await response.json();
  //       setProducts(data);
  //     } catch (error) {
  //       console.error("Error fetching products:", error);
  //       alert("Failed to load products. Please refresh the page.");
  //     }
  //   };
  
  //   if (consumer?.token) {
  //     fetchProducts(); // Call only when token is available
  //   }
  // }, [consumer?.token]);

  const fetchProductImage = async (productName) => {
    // Check cache first
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
      
      // Update cache
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${consumer?.token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
  
        const text = await response.text(); // 🔍 safer than .json()
  
        if (!text) {
          throw new Error("Empty response body"); // 👈 triggers catch block
        }
  
        const data = JSON.parse(text);
        setProducts(data);
      } catch (error) {
        console.error("❌ Error fetching products:", error);
        alert("Failed to load products. Please refresh the page.");
      }
    };
  
    if (consumer?.token) {
      fetchProducts();
    }
  }, [consumer?.token]);
  
  useEffect(() => {
    const fetchFarmers = async () => {
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

        // Fetch ratings, products, and profile photo for each farmer
        const farmersWithData = await Promise.all(
          data.map(async (farmer) => {
            try {
              // Fetch personal details including profile photo
              const personalResponse = await fetch(
                `http://localhost:5000/api/farmerprofile/${farmer.farmer_id}/personal`,
                {
                  headers: {
                    "Authorization": `Bearer ${consumer?.token}`,
                  },
                }
              );
              const personalData = await personalResponse.json();

              // Fetch ratings
              const ratingsResponse = await fetch(
                `http://localhost:5000/reviews/${farmer.farmer_id}`,
                {
                  headers: {
                    "Authorization": `Bearer ${consumer?.token}`,
                  },
                }
              );
              const ratingsData = await ratingsResponse.json();
              
              // Calculate average rating
              const averageRating = ratingsData.length > 0 
                ? ratingsData.reduce((sum, review) => sum + parseFloat(review.rating), 0) / ratingsData.length
                : 0;

              // Fetch products
              const productsResponse = await fetch(
                `http://localhost:5000/api/produces?farmer_id=${farmer.farmer_id}&market_type=Bargaining Market`,
                {
                  headers: {
                    "Authorization": `Bearer ${consumer?.token}`,
                  },
                }
              );
              
              const productsData = await productsResponse.json();
              
              return {
                ...farmer,
                profile_photo: personalData.profile_photo 
                  ? `http://localhost:5000${personalData.profile_photo}`
                  : null,
                products: productsData,
                average_rating: parseFloat(averageRating.toFixed(1))
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

        setFarmers(farmersWithData);
      } catch (error) {
        console.error("Error fetching farmers:", error);
        alert("Failed to load farmers. Please refresh the page.");
      }
    };

    fetchFarmers();
  }, [consumer?.token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const token = localStorage.getItem("token"); // or get from cookies
  
        const productData = await fetchProducts("http://localhost:5000/api/products", {  
          headers: {
         
            "Content-Type": "application/json",
            "Authorization": `Bearer ${consumer?.token}`,
          }
        });
  
        setProducts(productData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
  
    fetchData();
  }, []);
  
  const handleBargainClick = async (farmer, product) => {
    try {
      setIsLoading(true);
      setError(null);
  
      // 1. Create bargain session
      const response = await fetch(`http://localhost:5000/api/create-bargain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify({
          farmer_id: farmer.farmer_id // Only send farmer_id
        })
      });
  
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create bargain session');
      }
  
      // 2. Add product to bargain
      const productResponse = await fetch(`http://localhost:5000/api/add-bargain-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${consumer.token}`
        },
        body: JSON.stringify({
          bargain_id: data.bargainId,
          product_id: product.product_id,
          quantity: 10 // Default quantity
        })
      });
  
      const productData = await productResponse.json();
      
      if (!productData.success) {
        throw new Error(productData.error || 'Failed to add product');
      }
  
      // 3. Navigate to chat window
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
  // Get the stored consumer data from localStorage
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

    // Verify token payload
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

  const handleSubscribe =  (productId) => {
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
return (
  
  <div className="ks-consumer-dashboard">
  {/* Location and Search Bar Section */}
      <div className="ks-search-location-bar">
        <div className="ks-delivery-info">
          <span className="ks-deliver-to">Deliver to</span>
          <div className="ks-location-selector">
            <span className="ks-location-icon">📍</span>
            <span className="ks-current-location">{deliveryLocation}</span>
            <button 
              className="ks-update-location"
              onClick={() => {
                const newLocation = prompt("Enter your pincode:", deliveryLocation);
                if (newLocation) setDeliveryLocation(newLocation);
              }}
            >
              Update
            </button>
          </div>
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
      {/* Product Section */}
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
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent click
              handleProductClick(product.product_id);
            }}
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
                    onClick={(e) => handleSubscribe(product, e)}
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

      {/* Bargaining Market Section */}
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