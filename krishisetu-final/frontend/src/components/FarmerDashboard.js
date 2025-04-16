// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { Line } from "react-chartjs-2";
// import { useTranslation } from "react-i18next"; // Import translation hook
// import "./../styles/FarmerDashboard.css";
// import LanguageSwitcher from "./LanguageSwitcher";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// const Dashboard = () => {
//   const {  setFarmer } = useAuth();
//   const { t } = useTranslation(); // Initialize translation
//   const [loading, setLoading] = useState(true);
//   const [priceComparison, setPriceComparison] = useState([]);
//   const [farmerName, setFarmerName] = useState("");
//   const [forecast, setForecast] = useState([]); // 4-day weather forecast
//   const navigate = useNavigate();

//    // First useEffect to fetch Farmer Details
  
//   // Second useEffect to set farmer's name
//   useEffect(() => {
//     const storedName = localStorage.getItem("farmerName");
//     if (!storedName || storedName === "undefined") {
//       alert("Session expired. Please log in again.");
//       navigate("/farmer-login");
//     } else {
//       setFarmerName(storedName);
//     }
//   }, [navigate]);

//   // ✅ Fetch Farmer Name
//  // Memoize the fetchFarmerDetails function to avoid dependency warnings
//  const fetchFarmerDetails = useCallback(async () => {
//   const farmer_id = localStorage.getItem("farmerID");

//   if (!farmer_id) {
//     console.error("No farmer ID found in localStorage");
//     alert("Please log in again!");
//     return;
//   }

//   try {
//     const response = await axios.get(`http://localhost:5000/api/getFarmerDetails?farmer_id=${farmer_id}`,
//     {
     
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`
//       }
//     });
//     console.log("API Response:", response.data); // ✅ Logs the API response

//     if (response.data.success) {
//       console.log("Setting farmer in AuthContext:", response.data.farmer); // ✅ Log before setting state
//       setFarmer(response.data.farmer); // Update AuthContext
//     } else {
//       console.error("Failed to fetch farmer details:", response.data.message);
//     }
//   } catch (error) {
//     console.error("Error fetching farmer details:", error);
//   }
// }, [setFarmer]);


// useEffect(() => {
//   const storedFarmerID = localStorage.getItem("farmerID");
//   if (!storedFarmerID) {
//     alert("No farmer ID found, please login again!");
//     navigate("/loginPage");
//   } else {
//     fetchFarmerDetails(storedFarmerID);  // Fetch details based on stored ID
//   }
// }, [navigate, fetchFarmerDetails]); // Add fetchFarmerDetails to dependency array

//   // ✅ Fetch Weather Data and Forecast
//   useEffect(() => {
//     const fetchWeather = async () => {
//       try {
//         const apiKey = "a503bef3f061aa75947fe09b8f6938c4"; // Replace with a valid API Key
//         const city = "Karwar";

//         // Fetch 5-day weather forecast
//         const forecastResponse = await axios.get(
//           `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
//         );

//         if (forecastResponse.data) {
//           setForecast(forecastResponse.data.list);
//         } else {
//           console.error("Weather data is not in the expected format.");
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching weather data:", error);
//         setLoading(false);
//       }
//     };

//     fetchWeather();
//   }, []);

//   // ✅ Fetch Price Comparison Data (Mock API)
//   useEffect(() => {
//     const fetchPriceComparison = async () => {
//       try {
//         // Sample Data for Price Comparison
//         const data = [
//           { product: "Tomato", marketPrice: 30, farmerPrice: 25 },
//           { product: "Potato", marketPrice: 40, farmerPrice: 35 },
//           { product: "Onion", marketPrice: 45, farmerPrice: 38 },
//           { product: "Carrot", marketPrice: 50, farmerPrice: 42 },
//           { product: "Cabbage", marketPrice: 35, farmerPrice: 30 },
//         ];
//         setPriceComparison(data);
//       } catch (error) {
//         console.error("Error fetching price data:", error);
//       }
//     };

//     fetchPriceComparison();
//   }, []);

//   // 🌤 Get Weather Icon Based on Condition
//   const getWeatherIcon = (condition) => {
//     if (!condition) return "☁️";
//     const lowerCondition = condition.toLowerCase();
//     if (lowerCondition.includes("rain")) return "🌧️";
//     if (lowerCondition.includes("cloud")) return "☁️";
//     if (lowerCondition.includes("clear")) return "☀️";
//     return "🌥️";
//   };

//   // Format Forecast Data for Display (4 days)
//   const formatForecast = (forecast) => {
//     const groupedForecast = {};
//     forecast.forEach((item) => {
//       const date = item.dt_txt.split(" ")[0]; // Extract date
//       if (!groupedForecast[date]) {
//         groupedForecast[date] = item;
//       }
//     });
//     return Object.values(groupedForecast).slice(0, 4); // Return 4 days
//   };

//   // Get Day of the Week
//   const getDayOfWeek = (date) => {
//     const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     return days[new Date(date).getDay()];
//   };

//   const statsData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     datasets: [
//       {
//         label: t("total sales"),
//         data: [200000, 250000, 300000, 350000, 400000, 420000],
//         borderColor: "#36A2EB",
//         fill: false,
//       },
//       {
//         label: t("total profit"),
//         data: [50000, 60000, 70000, 80000, 85000, 90000],
//         borderColor: "#FF6384",
//         fill: false,
//       },
//     ],
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="main-dashboard">
//         <div className="dashboard-content">
//           {/* Welcome Message */}
//           <h2>Welcome, {farmerName || "Farmer"}</h2>
//           <LanguageSwitcher />

//           {/* 🌤 Weather Forecast Section */}
//           <div className="weather-forecast">
//             <h3>{t("weather forecast")}</h3>
            
//             {loading ? (
//               <p>{t("loading weather")}</p>
//             ) : forecast.length > 0 ? (
//               <div className="forecast-grid">
//                 {formatForecast(forecast).map((day, index) => (
//                   <div key={index} className="forecast-card">
//                     <div className="weather-header">
//                       <span className="weather-icon">{getWeatherIcon(day.weather?.[0]?.description)}</span>
//                       <h4>{getDayOfWeek(day.dt_txt)}</h4>
//                       <p>{new Date(day.dt_txt).toLocaleDateString()}</p>
//                     </div>
//                     <div className="weather-details">
//                       <p><strong>{t("temperature")}:</strong> {day.main.temp}°C</p>
//                       <p><strong>{t("humidity")}:</strong> {day.main.humidity}%</p>
//                       <p><strong>{t("wind speed")}:</strong> {day.wind.speed} m/s</p>
//                       <p><strong>{t("condition")}:</strong> {day.weather?.[0]?.description}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p>{t("weather error")}</p>
//             )}
//           </div>

//           {/* 📊 Sales & Profit Chart */}
//           <div className="chart-box">
//             <h3>{t("sales profit overview")}</h3>
//             <div className="chart-wrapper">
//               <Line data={statsData} options={{ maintainAspectRatio: false }} />
//             </div>
//           </div>

//           {/* 🏷️ Price Comparison Table */}
//           <div className="price-comparison">
//             <h3>{t("price comparison")}</h3>
//             <table>
//               <thead>
//                 <tr>
//                   <th>{t("product")}</th>
//                   <th>{t("market price")}</th>
//                   <th>{t("krishisetu price")}</th>
//                   <th>{t("profit per kg")}</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {priceComparison.map((item, index) => (
//                   <tr key={index}>
//                     <td>{item.product}</td>
//                     <td>{item.marketPrice}</td>
//                     <td>{item.farmerPrice}</td>
//                     <td>{item.marketPrice - item.farmerPrice}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import "./../styles/FarmerDashboard.css";
import LanguageSwitcher from "./LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { setFarmer } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [farmerName, setFarmerName] = useState("");
  const [forecast, setForecast] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const navigate = useNavigate();

  // Fetch Farmer Details
  const fetchFarmerDetails = useCallback(async () => {
    const farmer_id = localStorage.getItem("farmerID");

    if (!farmer_id) {
      console.error("No farmer ID found in localStorage");
      alert("Please log in again!");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/getFarmerDetails?farmer_id=${farmer_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setFarmer(response.data.farmer);
      } else {
        console.error("Failed to fetch farmer details:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching farmer details:", error);
    }
  }, [setFarmer]);

  useEffect(() => {
    const storedFarmerID = localStorage.getItem("farmerID");
    if (!storedFarmerID) {
      alert("No farmer ID found, please login again!");
      navigate("/loginPage");
    } else {
      fetchFarmerDetails(storedFarmerID);
    }
  }, [navigate, fetchFarmerDetails]);

  // Set farmer's name
  useEffect(() => {
    const storedName = localStorage.getItem("farmerName");
    if (!storedName || storedName === "undefined") {
      alert("Session expired. Please log in again.");
      navigate("/farmer-login");
    } else {
      setFarmerName(storedName);
    }
  }, [navigate]);

  // Fetch Weather Data and Forecast
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = "a503bef3f061aa75947fe09b8f6938c4";
        const city = "Karwar";

        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        );

        if (forecastResponse.data) {
          setForecast(forecastResponse.data.list);
        } else {
          console.error("Weather data is not in the expected format.");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const farmer_id = localStorage.getItem("farmerID");
        if (!farmer_id) {
          throw new Error("Farmer ID is required. Please ensure you're logged in.");
        }

        const response = await axios.get(
          `http://localhost:5000/api/farmer/orders/${farmer_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setOrders(response.data);
        setOrdersError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrdersError(err.response?.data?.error || err.message);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getWeatherIcon = (condition) => {
    if (!condition) return "☁️";
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes("rain")) return "🌧️";
    if (lowerCondition.includes("cloud")) return "☁️";
    if (lowerCondition.includes("clear")) return "☀️";
    return "🌥️";
  };

  const formatForecast = (forecast) => {
    const groupedForecast = {};
    forecast.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!groupedForecast[date]) {
        groupedForecast[date] = item;
      }
    });
    return Object.values(groupedForecast).slice(0, 4);
  };

  const getDayOfWeek = (date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date(date).getDay()];
  };

  return (
    <div className="krishi-dashboard-container">
      <div className="krishi-main-dashboard">
        <div className="krishi-dashboard-content">
          {/* Welcome Message */}
          <h2 className="krishi-welcome-title">Welcome, {farmerName || "Farmer"}</h2>
          <LanguageSwitcher />

          {/* Weather Forecast Section */}
          <div className="krishi-weather-forecast">
            <h3>{t("weather forecast")}</h3>
            
            {loading ? (
              <p>{t("loading weather")}</p>
            ) : forecast.length > 0 ? (
              <div className="krishi-forecast-grid">
                {formatForecast(forecast).map((day, index) => (
                  <div key={index} className="krishi-forecast-card">
                    <div className="krishi-weather-header">
                      <span className="krishi-weather-icon">
                        {getWeatherIcon(day.weather?.[0]?.description)}
                      </span>
                      <h4>{getDayOfWeek(day.dt_txt)}</h4>
                      <p>{new Date(day.dt_txt).toLocaleDateString()}</p>
                    </div>
                    <div className="krishi-weather-details">
                      <p><strong>{t("temperature")}:</strong> {day.main.temp}°C</p>
                      <p><strong>{t("humidity")}:</strong> {day.main.humidity}%</p>
                      <p><strong>{t("wind speed")}:</strong> {day.wind.speed} m/s</p>
                      <p><strong>{t("condition")}:</strong> {day.weather?.[0]?.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>{t("weather error")}</p>
            )}
          </div>

          {/* Order History Section */}
          <div className="krishi-order-history">
            <h3>Order History</h3>
            <p>View and manage your farm produce orders</p>

            {ordersLoading ? (
              <div className="krishi-loading-container">
                <div className="krishi-spinner"></div>
                <p>Loading orders...</p>
              </div>
            ) : ordersError ? (
              <div className="krishi-error-container">
                <i className="fas fa-exclamation-triangle"></i>
                <p>{ordersError}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : orders.length > 0 ? (
              <div className="krishi-orders-table-container">
                <table className="krishi-orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.orderid} className="krishi-order-item">
                        <td>{order.orderid}</td>
                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                        <td>{order.produce_name}</td>
                        <td>{order.quantity} kg</td>
                        <td>₹{order.amount}</td>
                        <td>
                          <span className={`krishi-status-badge krishi-${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span className={`krishi-payment-badge krishi-${order.payment_status.toLowerCase()}`}>
                            {order.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="krishi-no-orders">
                <i className="fas fa-clipboard"></i>
                <p>No orders found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;