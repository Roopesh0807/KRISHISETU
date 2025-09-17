import React, { useState } from "react"; // Added useState import
import "../src/i18n";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar1 from "./components/Navbar1"; 
import Navbar2 from "./components/Navbar2";
import Navbar3 from "./components/Navbar3";
import Cart from "./components/Cart";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
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
import Help from "./components/Help";
import Subscription from "./components/Subscribe";
import AddProduce from "./components/AddProduce"; 
import ProductDetails from "./components/ProductDetails"; 
import Sidebar from "./components/Sidebar"; 
import FarmerReviews from "./components/FarmerReview";
import Payment from "./components/payment";
import "./components/styles.css";
import ViewProfile from "./components/ViewProfile";
import Notifications from "./components/Notifications";
import Feeds from "./components/Feeds";
import OrderPage from "./components/OrderPage";
import Chatbot from "./components/Chatbot";
import HelpFarmers from "./components/HelpFarmers"


//bargaining
import ConsumerChatList from './components/bargaining/ConsumerChatList';
import ConsumerChatWindow from './components/bargaining/ConsumerChatWindow';
import FarmerChatList from './components/bargaining/FarmerChatList';
import FarmerChatWindow from './components/bargaining/FarmerChatWindow';
import FarmerBargainOrders from './components/bargaining/farmerbargainorders';
import ConsumerBargainOrders from './components/bargaining/consumerbargainorders';
import BargainCart from './components/bargaining/bargainCart';
import BargainOrderPage from './components/bargaining/bargainOrderPage';
import BargainPopup from './components/bargaining/BargainPopup';
import FarmerChatDashboard from './components/bargaining/FarmerChatDashboard';

import HomePageC from './pages/HomePage';
import JoinCommunity from './pages/JoinCommunity';
import CreateCommunity from './pages/CreateCommunity';
import CommunityDetails from './pages/CommunityDetails';
import AdminCommunityPage from './pages/AdminCommunityPage';
import MemberCommunityPage from './pages/MemberCommunityPage';
import OrderPageC from './pages/OrderPage';
import MemberOrderPage from "./pages/MemberOrderPage";
import CommunityOrderPage from "./pages/CommunityFlashDealsOrderPage";

// In your main App.js or routing file
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailed from './components/PaymentFailed';
import GoogleTranslate from "./components/GoogleTranslate";


import MyOrders from './components/MyOrders';
import Transactions from './components/Transactions';

import CommunityFlashDealsOrderPage from "./components/CommunityFlashDealsOrderPage";
import CommunityFlashDeals from "./components/CommunityFlashDeals";
import CombinedOrderPage from './components/CombinedOrderPage';

function App() {
  return (
    <ProductProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Main />
            <GoogleTranslate />
            
          </Router>
        </CartProvider>
      </AuthProvider>
    </ProductProvider>
  );
}

const Main = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [language, setLanguage] = useState('en');

  const path = location.pathname;

  // // Initialize Google Translate
  // useEffect(() => {
  //   const addGoogleTranslateScript = () => {
  //     const script = document.createElement('script');
  //     script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  //     script.async = true;
  //     document.body.appendChild(script);
      
  //     window.googleTranslateElementInit = () => {
  //       new window.google.translate.TranslateElement(
  //         {
  //           pageLanguage: 'en',
  //           includedLanguages: 'en,hi,kn',
  //           layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
  //         },
  //         'google_translate_element'
  //       );
  //     };
  //   };

  //   addGoogleTranslateScript();

  //   return () => {
  //     // Cleanup function
  //     const googleTranslateScript = document.querySelector('script[src*="translate.google.com"]');
  //     if (googleTranslateScript) {
  //       document.body.removeChild(googleTranslateScript);
  //     }
  //     delete window.googleTranslateElementInit;
  //   };
  // }, []);


  const getNavbar = () => {
    const path = location.pathname;

    if (
      path.startsWith("/farmer/") ||
      path.startsWith("/farmer-dashboard") ||
      path.startsWith("/farmers/my-reviews") ||
      path.startsWith("/helpfarmers/") ||
      path.startsWith("/add-produce") ||
      path.startsWith("/profile") ||
      path.startsWith("/help") ||
     
      path.startsWith("/view-profile") ||
      path.startsWith("/order-review") ||
      path.startsWith("/notifications") ||
      path.startsWith("/feeds") ||
      path.startsWith("/farmer-orders") ||
      path.startsWith("/bargain_farmer") ||
      path.startsWith("/chat") ||
      /\/profile\/[A-Za-z0-9]+/.test(path) ||
      /\/farmer\/[A-Za-z0-9]+\/personal-details/.test(path) ||
      /\/farmer\/[A-Za-z0-9]+\/farm-details/.test(path)  
    ) {
      return (
        <>
          <Navbar2 />
          
        </>
      );
    }
    if (
      path.startsWith("/consumer-dashboard") ||
      /\/productDetails\/[A-Za-z0-9]+/.test(path) ||
      /\/consumerprofile\/[A-Za-z0-9]+/.test(path) ||
      /\/farmerDetails\/[A-Za-z0-9]+/.test(path) ||
      path.startsWith("/payment") ||
      path.startsWith("/orderpage") ||
      path.startsWith("/consumerprofile")||
      path.startsWith("/cart") ||
      path.startsWith("/bargain_consumer") ||
      path.startsWith("/bargain") ||
      path.startsWith("/community-home") ||
      path.startsWith("/consumer-orders") ||
      path.startsWith("/my-orders") ||
      path.startsWith("/transactions") ||
       path.startsWith("/community-flash-deals") ||
      path === "/subscribe"
    ) {
      return (
        <>
          <Navbar3 />
          
       </>
      );
    }

    return (
      <>
        <Navbar1
          isLoginPage={path === "/LoginPage"}
          isAuthPage={
            path.startsWith("/farmer-login") ||
            path.startsWith("/farmer-register") ||
            path.startsWith("/consumer-login") ||
            path.startsWith("/consumer-register")
          }
        />
        {/* <div id="google_translate_element" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}></div> */}
      </>
    );
  };

  const showSidebar = () =>
    path.startsWith("/farmer-dashboard") ||
    path.startsWith("/farmer/") ||
    path.startsWith("/add-produce") ||
    path.startsWith("/FarmerProfile") ||
    path.startsWith("/help") ||
    path.startsWith("/view-profile") ||
    path.startsWith("/order-review") ||
    path.startsWith("/notifications") ||
    path.startsWith("/feeds") ||
    path.startsWith("/farmers/my-reviews") ||
    path.startsWith("/chat") ||
    path.startsWith("/farmer-orders");

  const showChatbot = () =>
    path.startsWith("/farmer-dashboard") || path.startsWith("/consumer-dashboard");

  return (
    <div>
      {getNavbar()}
      {showSidebar() && (
        <Sidebar
          farmerId={location.state?.farmerId}
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      )}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ScrollSection" element={<ScrollSection />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/farmer-login" element={<FarmerLogin />} />
          <Route path="/farmer-register" element={<FarmerRegister />} />
          <Route path="/consumer-login" element={<ConsumerLogin />} />
          <Route path="/consumer-register" element={<ConsumerRegister />} />

          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/consumer-dashboard" element={<ConsumerDashboard />} />

          <Route path="/farmer" element={<FarmerProfile />} />
          <Route path="/subscribe" element={<Subscription />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/farmer/:farmer_id/profile" element={<Profile />} />
          <Route path="/consumerprofile/:consumer_id" element={<ConsumerProfile />} />
          

          <Route path="/HelpFarmers" element={<HelpFarmers />} />
          <Route path="/farmers/my-reviews" element={<FarmerReviews />} />
          <Route path="/view-profile" element={<ViewProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/order-review" element={<OrderReview isSidebarOpen={sidebarOpen} />} />
          <Route path="/feeds" element={<Feeds />} />
          <Route path="/help" element={<Help />} />

          <Route path="/community-home" element={<HomePageC />} />
          <Route path="/join-community" element={<JoinCommunity />} />
          <Route path="/create-community" element={<CreateCommunity />} />
          <Route path="/community-details" element={<CommunityDetails />} />
          <Route path="/community-page/:communityId/admin" element={<AdminCommunityPage />} />
          <Route path="/community-page/:communityId/member" element={<MemberCommunityPage />} />
          <Route path="/order/:communityId" element={<OrderPageC />} />
          <Route path="/community/:communityId/member/:memberId" element={<MemberOrderPage />} />
          {/* <Route path="/community/:communityId/order/:orderId" element={<CommunityOrderPage />} /> */}
        <Route path="/community-flash-deals-orderpage" element={<CommunityFlashDealsOrderPage />} />  
<Route path="/community-flash-deals" element={<CommunityFlashDeals />} />
          // Add these to your routes
<Route path="/payment-success" element={<PaymentSuccess />} />
<Route path="/payment-failed" element={<PaymentFailed />} />

<Route path="/combined-checkout" element={<CombinedOrderPage />} />


        <Route path="/bargain" element={<ConsumerChatList />} />
        {/* <Route path="/bargain/:session_id" element={<ConsumerChatWindow />} /> */}

        <Route path="/bargain/:bargainId" element={<ConsumerChatWindow />} />
        <Route path="/initiate-bargain/:farmerId" element={<BargainPopup />} />
        {/* Farmer Routes */}
        <Route path="/farmer/bargain" element={<FarmerChatList />} />
        {/* // In your router configuration */}
        <Route path="/farmer/bargain/:bargainId" element={<FarmerChatWindow />} />
        {/* /farmer/bargain/${chat.id} */}
        {/* /farmer/bargain/:bargainId */}

          {/* 🌿 Farmer Features */}

          <Route path="/bargain" element={<ConsumerChatList />} />
          <Route path="/bargain/:bargainId" element={<ConsumerChatWindow />} />
          <Route path="/farmer/bargain" element={<FarmerChatList />} />
          <Route path="/farmer/:bargainId" element={<FarmerChatWindow />} />
          <Route path="/farmer-orders" element={<FarmerBargainOrders />} />
          <Route path="/consumer-orders" element={<ConsumerBargainOrders />} />
          <Route path="/bargain-cart" element={<BargainCart />} />
          <Route path="/bargain-orderpage" element={<BargainOrderPage />} />
          <Route path="/initiate-bargain/:farmerId" element={<BargainPopup />} />
          <Route path="bargain/dashboard/:farmerId" element={<FarmerChatDashboard />} />
           

          <Route path="/add-produce" element={<AddProduce />} />
          <Route path="/productDetails/:product_id" element={<ProductDetails />} />
          <Route path="/farmerDetails/:farmer_id" element={<FarmerDetails />} />
          <Route path="/chatbot" element={<Chatbot />} />

          <Route path="/orderpage" element={<OrderPage />} />
          <Route path="/payment" element={<Payment />} />

          <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/transactions" element={<Transactions />} />
     
        </Routes>

        {showChatbot() && <Chatbot />}
      </div>
    </div>
  );
};

export default App;