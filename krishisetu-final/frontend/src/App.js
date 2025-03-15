import React from "react";
import "../src/i18n";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar1 from "./components/Navbar1"; 
import Navbar2 from "./components/Navbar2";
import Navbar3 from "./components/Navbar3";
import Cart from "./components/Cart";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./components/Home"; 
import ScrollSection from "./components/ScrollSection";  
import Contact from "./components/Contact";  
import LoginPage from "./components/LoginPage";
import FarmerLogin from "./pages/FarmerLogin";
import FarmerRegister from "./pages/FarmerRegister";
import ConsumerLogin from "./pages/ConsumerLogin";
import ConsumerRegister from "./pages/ConsumerRegister";
import FarmerDashboard from "./components/FarmerDashboard";
import ConsumerDashboard from "./components/ConsumerDashboard";
import FarmerProfile from "./components/FarmerDetails";
import FarmerDetails from "./components/FarmerDetails";
import ConsumerProfile from "./components/Consumer-profile";
import Profile from "./pages/Profile";
import OrderReview from "./pages/OrderReview";
import BargainChat from "./components/BargainingChat";
import Help from "./components/Help";
import Subscription from "./components/Subscribe";
import AddProduce from "./components/AddProduce"; 
import ProductDetails from "./components/ProductDetails"; 
import Sidebar from "./components/Sidebar"; 
import Payment from "./components/payment";
import "./components/styles.css";
import ViewProfile from "./components/ViewProfile";
import Notifications from "./components/Notifications";
import Feeds from "./components/Feeds";
import OrderPage from "./components/OrderPage";
import Bargain from "./components/BargainChatF";
import BargainChatC from "./components/ChatWindowBargainF";
import Bargaining from "./components/BargainingChat"
import Chatbot from "./components/Chatbot"; // Import the Chatbot component

function App() {
  return (
    <AuthProvider>
    <CartProvider>
      <Router>
        <Main />
      </Router>
    </CartProvider>
  </AuthProvider>
  );
}


const Main = () => {
  const location = useLocation();

  // 🟢 Dynamic Navbar Rendering
  const getNavbar = () => {
    const path = location.pathname;

    // Navbar2 for Farmer Pages
    if (
      path.startsWith("/farmer-dashboard") ||
      path.startsWith("/add-produce") ||
      path.startsWith("/profile") ||
      path.startsWith("/help") ||
      path.startsWith("/community") ||
      path.startsWith("/view-profile") ||
      path.startsWith("/order-review") ||
      path.startsWith("/notifications") ||
      path.startsWith("/feeds") ||
      path.startsWith("/consumerprof") ||
      path.startsWith("/bargain_farmer") ||
      path.startsWith("/chat") ||
    /\/profile\/[A-Za-z0-9]+/.test(path) ||
    /\/farmer\/[A-Za-z0-9]+\/personal-details/.test(path) ||
    /\/farmer\/[A-Za-z0-9]+\/farm-details/.test(path)  
    ) {
      return <Navbar2 />;
    }

    // Navbar3 for Consumer Pages
    if (
      path.startsWith("/consumer-dashboard") ||
      /\/productDetails\/[A-Za-z0-9]+/.test(path) ||
      /\/consumerprofile\/[A-Za-z0-9]+/.test(path) || // Matches alphanumeric consumer_id
      /\/farmerDetails\/[A-Za-z0-9]+/.test(path) || // Matches alphanumeric farmer_id
      path.startsWith("/farmer/") ||
      path.startsWith("/payment") ||
      path.startsWith("/orderpage") ||
      path.startsWith("/cart") ||
      path.startsWith("/bargain_consumer") ||
      path.startsWith("/bargain") ||
      path === "/subscribe"
    ) {
      return <Navbar3 />;
    }

    // Navbar1 for Home, Login, etc.
    return <Navbar1 isLoginPage={path === "/LoginPage"} 
                    isAuthPage={path.startsWith("/farmer-login") || 
                                path.startsWith("/farmer-register") || 
                                path.startsWith("/consumer-login") || 
                                path.startsWith("/consumer-register")} />;
  };

  // 🟢 Sidebar appears for all farmer-related pages
  const showSidebar = () => {
    const path = location.pathname;
    return (
      path.startsWith("/farmer-dashboard") ||
      path.startsWith("/add-produce") ||
      path.startsWith("/profile") ||
      path.startsWith("/help") ||
      path.startsWith("/community") ||
      path.startsWith("/view-profile") ||
      path.startsWith("/order-review") ||
      path.startsWith("/notifications") ||
      path.startsWith("/feeds") ||
      path.startsWith("/chat")
    );
  };

  // 🟢 Chatbot appears on specific pages
  const showChatbot = () => {
    const path = location.pathname;
    return (
      path.startsWith("/farmer-dashboard") || 
      path.startsWith("/consumer-dashboard")
    );
  };

  return (
    <div>
      {/* Render the appropriate navbar */}
      {getNavbar()}

      {/* Render Sidebar for farmer-related pages */}
      {showSidebar() && <Sidebar />}

      {/* Main Content Wrapper */}
      <div className="main-content">
        <Routes>
          {/* 🏡 Home & Authentication */}
          <Route path="/" element={<HomePage />} />
          <Route path="/ScrollSection" element={<ScrollSection />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/farmer-login" element={<FarmerLogin />} />
          <Route path="/farmer-register" element={<FarmerRegister />} />
          <Route path="/consumer-login" element={<ConsumerLogin />} />
          <Route path="/consumer-register" element={<ConsumerRegister />} />

          {/* 📌 Dashboards */}
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/consumer-dashboard" element={<ConsumerDashboard />} />

          {/* 🛒 Products & Farmer Details */}
          <Route path="/farmer" element={<FarmerProfile />} />

          {/* 🛍️ Subscriptions & Cart */}
          <Route path="/subscribe" element={<Subscription />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile/:farmer_id" element={<Profile />} />
          <Route path="/consumerprofile/:consumer_id" element={<ConsumerProfile />} />

          <Route path="/bargain/:farmer_id" element={<BargainChat />} />
          <Route path="/consumerprof/:consumer_id" element={<BargainChatC />} />
          <Route path="/bargain" element = {<Bargaining />} />
          <Route path="/consumerprof" element={<Bargain />} />


          {/* 👤 Profile, Orders, Bargain, Community & Support */}
          <Route path="/view-profile" element={<ViewProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/order-review" element={<OrderReview />} />
          <Route path="/chat" element={<Bargain />} />
          <Route path="/feeds" element={<Feeds />} />
          <Route path="/help" element={<Help />} />

          {/* 🌿 Farmer Features */}
          <Route path="/add-produce" element={<AddProduce />} />
          <Route path="/productDetails/:product_id" element={<ProductDetails />} />
          <Route path="/farmerDetails/:farmer_id" element={<FarmerDetails />} />
          {/* 🤖 Chatbot */}
          <Route path="/chatbot" element={<Chatbot />} />

          {/* 💬 Chat System */}
          <Route path="/orderpage" element={<OrderPage />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>

        {/* Render Chatbot on specific pages */}
        {showChatbot() && <Chatbot />}
      </div>
    </div>
  );
};

export default App;