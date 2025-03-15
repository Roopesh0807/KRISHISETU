import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next"; // Import translation hook
import "./../styles/FarmerDashboard.css";
import LanguageSwitcher from "./LanguageSwitcher";
import { useNavigate } from "react-router-dom";

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
  const { t } = useTranslation(); // Initialize translation
  const [loading, setLoading] = useState(true);
  const [priceComparison, setPriceComparison] = useState([]);
  const [farmerName, setFarmerName] = useState("");
  const [forecast, setForecast] = useState([]); // 4-day weather forecast
  const navigate = useNavigate();


  useEffect(() => {
    const storedName = localStorage.getItem("farmerName");
    console.log("Retrieved Farmer Name from Storage:", storedName); // Debug log

    if (!storedName || storedName === "undefined") {
      alert("Session expired. Please log in again.");
      navigate("/farmer-login");
    } else {
      setFarmerName(storedName);
    }
  }, [navigate]);

  // ✅ Fetch Farmer Name
const fetchFarmerDetails = async () => {
    const farmer_id = localStorage.getItem("farmerID");

    if (!farmer_id) {
      console.error("No farmer ID found in localStorage");
      alert("Please log in again!");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/getFarmerDetails?farmer_id=${farmer_id}`);
      if (response.data.success) {
        setFarmerName(response.data.farmerName);
      } else {
        console.error("Failed to fetch farmer details:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching farmer details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerDetails(); // Call the function to fetch data on component mount
  }, []);


  // ✅ Fetch Weather Data and Forecast
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = "a503bef3f061aa75947fe09b8f6938c4"; // Replace with a valid API Key
        const city = "Karwar";

        // Fetch 5-day weather forecast
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

  // ✅ Fetch Price Comparison Data (Mock API)
  useEffect(() => {
    const fetchPriceComparison = async () => {
      try {
        // Sample Data for Price Comparison
        const data = [
          { product: "Tomato", marketPrice: 30, farmerPrice: 25 },
          { product: "Potato", marketPrice: 40, farmerPrice: 35 },
          { product: "Onion", marketPrice: 45, farmerPrice: 38 },
          { product: "Carrot", marketPrice: 50, farmerPrice: 42 },
          { product: "Cabbage", marketPrice: 35, farmerPrice: 30 },
        ];
        setPriceComparison(data);
      } catch (error) {
        console.error("Error fetching price data:", error);
      }
    };

    fetchPriceComparison();
  }, []);

  // 🌤 Get Weather Icon Based on Condition
  const getWeatherIcon = (condition) => {
    if (!condition) return "☁️";
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes("rain")) return "🌧️";
    if (lowerCondition.includes("cloud")) return "☁️";
    if (lowerCondition.includes("clear")) return "☀️";
    return "🌥️";
  };

  // Format Forecast Data for Display (4 days)
  const formatForecast = (forecast) => {
    const groupedForecast = {};
    forecast.forEach((item) => {
      const date = item.dt_txt.split(" ")[0]; // Extract date
      if (!groupedForecast[date]) {
        groupedForecast[date] = item;
      }
    });
    return Object.values(groupedForecast).slice(0, 4); // Return 4 days
  };

  // Get Day of the Week
  const getDayOfWeek = (date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date(date).getDay()];
  };

  const statsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: t("total sales"),
        data: [200000, 250000, 300000, 350000, 400000, 420000],
        borderColor: "#36A2EB",
        fill: false,
      },
      {
        label: t("total profit"),
        data: [50000, 60000, 70000, 80000, 85000, 90000],
        borderColor: "#FF6384",
        fill: false,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="main-dashboard">
        <div className="dashboard-content">
          {/* Welcome Message */}
          <h2>Welcome, {farmerName || "Farmer"} </h2>
          <LanguageSwitcher />

          {/* 🌤 Weather Forecast Section */}
          <div className="weather-forecast">
            <h3>{t("weather forecast")}</h3>
            
            {loading ? (
              <p>{t("loading weather")}</p>
            ) : forecast.length > 0 ? (
              <div className="forecast-grid">
                {formatForecast(forecast).map((day, index) => (
                  <div key={index} className="forecast-card">
                    <div className="weather-header">
                      <span className="weather-icon">{getWeatherIcon(day.weather?.[0]?.description)}</span>
                      <h4>{getDayOfWeek(day.dt_txt)}</h4>
                      <p>{new Date(day.dt_txt).toLocaleDateString()}</p>
                    </div>
                    <div className="weather-details">
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

          {/* 📊 Sales & Profit Chart */}
          <div className="chart-box">
            <h3>{t("sales profit overview")}</h3>
            <div className="chart-wrapper">
              <Line data={statsData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* 🏷️ Price Comparison Table */}
          <div className="price-comparison">
            <h3>{t("price comparison")}</h3>
            <table>
              <thead>
                <tr>
                  <th>{t("product")}</th>
                  <th>{t("market price")}</th>
                  <th>{t("krishisetu price")}</th>
                  <th>{t("profit per kg")}</th>
                </tr>
              </thead>
              <tbody>
                {priceComparison.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product}</td>
                    <td>{item.marketPrice}</td>
                    <td>{item.farmerPrice}</td>
                    <td>{item.marketPrice - item.farmerPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;