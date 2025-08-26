import React, { useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./HelpFarmers.css";

const MarketPrice = () => {
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const getLivePrices = async () => {
    setLoading(true);
    setError("");

    const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/api/agmarknet-prices`;

    try {
      const response = await fetch(backendUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch market data from server.");
      }
      const data = await response.json();
      setPrices(data);
    } catch (err) {
      setError(`Error: ${err.message}. Please check if the backend server is running.`);
      console.error("Frontend fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sort prices by commodity name
  const sortedPrices = prices ? [...prices].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.commodity.localeCompare(b.commodity);
    } else {
      return b.commodity.localeCompare(a.commodity);
    }
  }) : null;

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="ks-market-container">
      <div className="ks-market-header">
        <h2 className="ks-market-title">Live Market Prices</h2>
        <p className="ks-market-subtitle">
          Prices for all commodities in Karnataka, fetched from OGD Platform.
        </p>
      </div>

      <div className="ks-market-content">
        <div className="ks-location-display">
          <FaMapMarkerAlt className="ks-location-icon" />
          <p>
            Fetching all available prices for Karnataka state.
          </p>
        </div>

        <button onClick={getLivePrices} className="ks-refresh-btn" disabled={loading}>
          {loading ? "Loading..." : "Get Live Prices"}
        </button>

        {error && <div className="ks-error-message">{error}</div>}

        {sortedPrices && sortedPrices.length > 0 ? (
          <div className="ks-price-table-container">
            <h3>Current Prices:</h3>
            <table className="ks-price-table">
              <thead>
                <tr>
                  <th onClick={toggleSortOrder}>
                    Commodity {sortOrder === "asc" ? "▲" : "▼"}
                  </th>
                  <th>Market</th>
                  <th>Min Price</th>
                  <th>Max Price</th>
                  <th>Modal Price</th>
                </tr>
              </thead>
              <tbody>
                {sortedPrices.map((item, index) => (
                  <tr key={index}>
                    <td>{item.commodity}</td>
                    <td>{item.market}</td>
                    <td>₹{item.min_price}</td>
                    <td>₹{item.max_price}</td>
                    <td>₹{item.modal_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && !error && (
            <div className="ks-info-message">
              No live prices available for this combination.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MarketPrice;