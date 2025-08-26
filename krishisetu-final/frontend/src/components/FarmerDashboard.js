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

  const youtubeUrl = "https://youtu.be/THElR3lX_0E?si=RQ_6xxy1Tzs4IGku";
  const videoId = youtubeUrl.split('/').pop().split('?')[0];

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
        `${process.env.REACT_APP_BACKEND_URL}/api/getFarmerDetails?farmer_id=${farmer_id}`,
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
          `${process.env.REACT_APP_BACKEND_URL}/api/farmer/orders/${farmer_id}`,
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
    <div className="ks-farmer-dashboard">
      <div className="ks-dashboard-content">
        {/* Welcome Section */}
        <div className="ks-welcome-section">
          <div className="ks-welcome-header">
            <h1 className="ks-welcome-title">
              Welcome back, <span className="ks-farmer-name">{farmerName || "Farmer"}</span>
            </h1>
            <div className="ks-language-switcher-container">
              <LanguageSwitcher />
            </div>
          </div>
          <p className="ks-welcome-subtitle">Here's what's happening with your farm today</p>
        </div>

        {/* Weather Forecast Section */}
        <section className="ks-section ks-weather-section">
          <div className="ks-section-header">
            <h2 className="ks-section-title">
              <i className="fas fa-cloud-sun ks-section-icon"></i> Weather Forecast
            </h2>
            <p className="ks-section-subtitle">Plan your farming activities with upcoming weather</p>
          </div>
          
          {loading ? (
            <div className="ks-loading-state">
              <div className="ks-spinner"></div>
              <p>Loading weather data...</p>
            </div>
          ) : forecast.length > 0 ? (
            <div className="ks-weather-cards">
              {formatForecast(forecast).map((day, index) => (
                <div key={index} className="ks-weather-card">
                  <div className="ks-weather-card-header">
                    <span className="ks-weather-icon">{getWeatherIcon(day.weather?.[0]?.description)}</span>
                    <div>
                      <h3 className="ks-weather-day">{getDayOfWeek(day.dt_txt)}</h3>
                      <p className="ks-weather-date">{new Date(day.dt_txt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="ks-weather-details">
                    <div className="ks-weather-detail">
                      <span className="ks-weather-label">Temperature:</span>
                      <span className="ks-weather-value">{day.main.temp}°C</span>
                    </div>
                    <div className="ks-weather-detail">
                      <span className="ks-weather-label">Humidity:</span>
                      <span className="ks-weather-value">{day.main.humidity}%</span>
                    </div>
                    <div className="ks-weather-detail">
                      <span className="ks-weather-label">Wind:</span>
                      <span className="ks-weather-value">{day.wind.speed} m/s</span>
                    </div>
                    <div className="ks-weather-detail">
                      <span className="ks-weather-label">Condition:</span>
                      <span className="ks-weather-value">{day.weather?.[0]?.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ks-error-state">
              <i className="fas fa-exclamation-triangle ks-error-icon"></i>
              <p>Unable to load weather data. Please try again later.</p>
            </div>
          )}
        </section>

        {/* Order History Section */}
        <section className="ks-section ks-orders-section">
          <div className="ks-section-header">
            <h2 className="ks-section-title">
              <i className="fas fa-clipboard-list ks-section-icon"></i> Recent Orders
            </h2>
            <p className="ks-section-subtitle">View and manage your farm produce orders</p>
          </div>

          {ordersLoading ? (
            <div className="ks-loading-state">
              <div className="ks-spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : ordersError ? (
            <div className="ks-error-state">
              <i className="fas fa-exclamation-triangle ks-error-icon"></i>
              <p>{ordersError}</p>
              <button className="ks-retry-btn" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          ) : orders.length > 0 ? (
            <div className="ks-orders-table-container">
              <table className="ks-orders-table">
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
                    <tr key={order.orderid}>
                      <td data-label="Order ID">{order.orderid}</td>
                      <td data-label="Date">{new Date(order.order_date).toLocaleDateString()}</td>
                      <td data-label="Product">{order.produce_name}</td>
                      <td data-label="Quantity">{order.quantity} kg</td>
                      <td data-label="Amount">₹{order.amount}</td>
                      <td data-label="Status">
                        <span className={`ks-status-badge ks-status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td data-label="Payment">
                        <span className={`ks-payment-badge ks-payment-${order.payment_status.toLowerCase()}`}>
                          {order.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="ks-empty-state">
              <i className="fas fa-clipboard ks-empty-icon"></i>
              <p>No orders found</p>
              <button className="ks-primary-btn" onClick={() => navigate("/add-produce")}>
                Add Your Produce
              </button>
            </div>
          )}
        </section>

        {/* Tutorial Section */}
        <section className="ks-section ks-tutorial-section">
          <div className="ks-section-header">
            <h2 className="ks-section-title">
              <i className="fas fa-graduation-cap ks-section-icon"></i> Farming Tutorials
            </h2>
            <p className="ks-section-subtitle">Learn how to use our platform effectively</p>
          </div>
          
          <div className="ks-tutorial-content">
            <div className="ks-video-container">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Farmer tutorial"
                className="ks-tutorial-video"
              ></iframe>
            </div>
            
            <div className="ks-tips-container">
              <h3 className="ks-tips-title">Quick Farming Tips</h3>
              <ul className="ks-tips-list">
                <li className="ks-tip-item">
                  <i className="fas fa-check-circle ks-tip-icon"></i>
                  Upload your produce with clear images for better visibility
                </li>
                <li className="ks-tip-item">
                  <i className="fas fa-check-circle ks-tip-icon"></i>
                  Update your inventory regularly to reflect accurate stock
                </li>
                <li className="ks-tip-item">
                  <i className="fas fa-check-circle ks-tip-icon"></i>
                  Check orders daily and update status promptly
                </li>
                <li className="ks-tip-item">
                  <i className="fas fa-check-circle ks-tip-icon"></i>
                  Use the weather forecast to plan your harvest
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;