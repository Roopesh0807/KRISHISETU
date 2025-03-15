import React, { createContext, useState, useEffect } from "react"; // Added useEffect import
import axios from "axios"; // Add this line

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [farmer, setFarmer] = useState(null);

  // Fetch farmer from localStorage when component mounts
  useEffect(() => {
    const storedFarmer = localStorage.getItem("farmer");
    if (storedFarmer) {
      setFarmer(JSON.parse(storedFarmer));
    }
  }, []);

  // Load consumer data from localStorage
  const [consumer, setConsumer] = useState(() => {
    const storedConsumer = localStorage.getItem("consumer");
    return storedConsumer ? JSON.parse(storedConsumer) : null;
  });

  // Login functions for both consumer and farmer
  const loginConsumer = (consumerData) => {
    setConsumer(consumerData);
    localStorage.setItem("consumer", JSON.stringify(consumerData));
  };

  const loginFarmer = async (emailOrPhone, password) => {
    try {
      const response = await axios.post("/api/farmerlogin", { emailOrPhone, password });
      if (response.data.success) {
        const farmerData = {
          farmer_id: response.data.farmer_id,
          full_name: response.data.full_name,
        };
        setFarmer(farmerData); // Set the farmer state
        localStorage.setItem("farmer", JSON.stringify(farmerData)); // Store in localStorage
      } else {
        console.error("Login failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error logging in farmer:", error);
    }
  };

  // Logout functions for both consumer and farmer
  const logout = () => {
    setConsumer(null);
    setFarmer(null);
    localStorage.removeItem("consumer");
    localStorage.removeItem("farmer");
  };

  return (
    <AuthContext.Provider value={{ consumer, farmer, loginConsumer, loginFarmer, logout }}>
      {children} {/* Render the children components here */}
    </AuthContext.Provider>
  );
};
