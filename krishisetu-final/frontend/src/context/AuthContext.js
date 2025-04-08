import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext(
  {
    consumer: null,
    farmer: null,
    registerConsumer: () => console.warn("No authprovider found"),

  }
);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [consumer, setConsumer] = useState(() => {
    try {
      const storedConsumer = localStorage.getItem("consumer");
      if (!storedConsumer) return null;

      const parsedConsumer = JSON.parse(storedConsumer);
      
      return {
        token: parsedConsumer.token || "",
        consumer_id: parsedConsumer.consumer_id || "",
        email: parsedConsumer.email || "",
        phone_number: parsedConsumer.phone_number || "",
        first_name: parsedConsumer.first_name || "",
        last_name: parsedConsumer.last_name || "",
        full_name: `${parsedConsumer.first_name || ""} ${parsedConsumer.last_name || ""}`.trim(),  ...parsedConsumer
      };
    } catch (error) {
      console.error("Error parsing consumer data:", error);
      localStorage.removeItem("consumer"); // Clean up invalid data
      return null;
    }
  });
  
 // ✅ Farmer State (NEW)
// ✅ Farmer State (Updated)
const [farmer, setFarmer] = useState(() => {
  try {
    console.log("🔍 Fetching farmer from localStorage...");
    const storedFarmer = localStorage.getItem("farmer");
    
    if (!storedFarmer) {
      console.log("📌 No farmer found in localStorage");
      return null;
    }

    console.log("📌 Stored Farmer Data:", storedFarmer);
    const parsedFarmer = JSON.parse(storedFarmer);
    
    // Ensure required fields exist for farmer
    parsedFarmer.first_name = parsedFarmer.first_name || "";
    parsedFarmer.last_name = parsedFarmer.last_name || "";
    parsedFarmer.full_name = `${parsedFarmer.first_name} ${parsedFarmer.last_name}`.trim();
    // parsedFarmer.email = parsedFarmer.email || "";
    // parsedFarmer.phone_number = parsedFarmer.phone_number || "";

    return parsedFarmer;
  } catch (error) {
    console.error("❌ Error parsing farmer data:", error);
    localStorage.removeItem("farmer"); // Clean up invalid data
    return null;
  }
});



useEffect(() => {
  console.log("🔄 Updated Consumer in AuthContext:", consumer);
  console.log("🔄 Updated Farmer in AuthContext:", farmer);
}, [consumer, farmer]);


  const registerConsumer = (consumerData) => {
    try {
      console.log("✅ Consumer Data Received for Registration:", consumerData);
      
      const normalizedData = {
        ...consumerData,
        farmer_id: consumerData.farmer_id || null,
        first_name: consumerData.first_name || "",
        last_name: consumerData.last_name || "",
        full_name: `${consumerData.first_name || ""} ${consumerData.last_name || ""}`.trim()
      };

      console.log("✅ Normalized Registration Data:", normalizedData);
      setConsumer(normalizedData);
      localStorage.setItem("consumer", JSON.stringify(normalizedData));
      console.log("✅ LocalStorage Updated with Registration Data");
    } catch (error) {
      console.error("❌ Error during registration:", error);
      throw error;
    }
  };

  // const loginConsumer = async (data) => {
  //   try {
  //     console.group("🔐 loginConsumer");
  //     console.log("📥 Raw login data received:", data);
  
  //     // Validate required fields
  //     if (!data?.token) {
  //       const error = new Error("No authentication token received");
  //       console.error("❌ Validation error:", error.message);
  //       console.groupEnd();
  //       throw error;
  //     }
  
  //     if (!data.consumer_id) {
  //       console.warn("⚠️ Missing consumer_id in login response");
  //     }
  
  //     // Normalize data with fallbacks
  //     const normalizedData = {
  //       token: data.token,
  //       consumer_id: data.consumer_id || "",
  //       email: data.email || "",
  //       phone_number: data.phone_number || "",
  //       // first_name: data.first_name && data.first_name.trim() !== "" ? data.first_name : (data.firstName || ""),
  //       // last_name: data.last_name && data.last_name.trim() !== "" ? data.last_name : (data.lastName || ""),        
  //       // full_name: `${data.first_name || data.firstName || ""} ${
  //       //   data.last_name || data.lastName || ""
  //       // }`.trim(),
  //       first_name: data.first_name ,
  //       last_name: data.last_name ,
  //       full_name: `${data.first_name } ${data.last_name }`.trim(),

  //       // Preserve other fields but don't overwrite core fields
  //       ...Object.fromEntries(
  //         Object.entries(data).filter(
  //           ([key]) =>
  //             ![
  //               "token",
  //               "consumer_id",
  //               "email",
  //               "phone_number",
  //               "first_name",
  //               "last_name",
  //              "full_name",
  //              "name",
  //             ].includes(key)
  //         )
  //       ),
  //     };
  
  //     console.log("🔄 Normalized consumer data:", normalizedData);
  
  //     // Verify token structure (basic check)
  //     if (typeof normalizedData.token !== "string" || !normalizedData.token.includes(".")) {
  //       console.warn("⚠️ Token structure appears invalid");
  //     }
  
  //     // Update state and storage
  //     setConsumer(normalizedData);
  //     localStorage.setItem("consumer", JSON.stringify(normalizedData));
  
  //     // Verify storage
  //     const storedData = localStorage.getItem("consumer");
  //     if (!storedData) {
  //       console.error("❌ Failed to persist consumer data");
  //     } else {
  //       console.log("💾 Successfully stored consumer data");
  //     }
  
  //     console.groupEnd();
  //     return normalizedData;
  //   } catch (error) {
  //     console.error("🔥 Critical login error:", error);
  
  //     // Clean up on error
  //     setConsumer(null);
  //     localStorage.removeItem("consumer");
  
  //     // Re-throw with additional context
  //     error.message = `Login failed: ${error.message}`;
  //     throw error;
  //   }
  // };

  const loginConsumer = async (data) => {
    try {
      console.group("🔐 loginConsumer");
      console.log("📥 Raw login data received:", data);
  
      // Validate required fields
      if (!data?.token) {
        const error = new Error("No authentication token received");
        console.error("❌ Validation error:", error.message);
        console.groupEnd();
        throw error;
      }
  
      // Decode token to get payload
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      console.log("🔍 Token payload:", payload);
  
      // Normalize data with fallbacks - use payload data first, then response data
      const normalizedData = {
        token: data.token,
        consumer_id: payload.consumer_id || data.consumer_id || "",
        email: payload.email || data.email || "",
        phone_number: payload.phone_number || data.phone_number || "",
        first_name: payload.first_name || data.first_name || "",
        last_name: payload.last_name || data.last_name || "",
        full_name: payload.full_name || 
                  `${payload.first_name || data.first_name || ""} ${payload.last_name || data.last_name || ""}`.trim(),
        // Preserve other fields
        ...data
      };
  
      console.log("🔄 Normalized consumer data:", normalizedData);
  
      // Update state and storage
      setConsumer(normalizedData);
      localStorage.setItem("consumer", JSON.stringify(normalizedData));
  
      console.groupEnd();
      return normalizedData;
    } catch (error) {
      console.error("🔥 Critical login error:", error);
      setConsumer(null);
      localStorage.removeItem("consumer");
      error.message = `Login failed: ${error.message}`;
      throw error;
    }
  };

  // ✅ Farmer Authentication (NEW)
const registerFarmer = (farmerData) => {
  try {
    console.log("✅ Farmer Data Received for Registration:", farmerData);

    const normalizedFarmer = {
      ...farmerData,
      farmer_id: farmerData.farmer_id || "",
      name: farmerData.name || "Farmer",
      first_name: farmerData.first_name || "",
      last_name: farmerData.last_name || "",
    };

    setFarmer(normalizedFarmer);
    localStorage.setItem("farmer", JSON.stringify(normalizedFarmer));
    console.log("✅ LocalStorage Updated with Farmer Data");
  } catch (error) {
    console.error("❌ Error during farmer registration:", error);
    throw error;
  }
};
const loginFarmer = (data) => {
  try {
    console.log("✅ Farmer Data Received for Login:", data);
    
    const normalizedFarmer = {
      token: data.token || "",
      farmer_id: data.farmer_id || "",
      email: data.email || "",
      phone_number: data.phone_number || "",
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      full_name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      ...data
    };
    
    // Log the normalized data before setting it
    console.log("📌 Normalized Farmer Data:", normalizedFarmer);

    // Set the farmer data in state and localStorage
    setFarmer(normalizedFarmer);
    localStorage.setItem("farmer", JSON.stringify(normalizedFarmer));

  } catch (error) {
    console.error("❌ Error during farmer login:", error);
    throw error;
  }
};



   // ✅ Logout for Both Farmers & Consumers
   const logout = () => {
    try {
      setConsumer(null);
      setFarmer(null);
      localStorage.removeItem("consumer");
      localStorage.removeItem("farmer");
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        consumer,
        farmer, // ✅ Added farmer authentication support
        setFarmer, 
        registerConsumer,
        loginConsumer,
        registerFarmer, // ✅ New
        loginFarmer, // ✅ New
        logout,
        token: consumer?.token || farmer?.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
