import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [consumer, setConsumer] = useState(() => {
    try {
      console.log("🔍 Fetching consumer from localStorage...");
      const storedConsumer = localStorage.getItem("consumer");
      
      if (!storedConsumer) {
        console.log("📌 No consumer found in localStorage");
        return null;
      }

      console.log("📌 Stored Consumer Data:", storedConsumer);
      const parsedConsumer = JSON.parse(storedConsumer);
      
      // Ensure required fields exist
      parsedConsumer.first_name = parsedConsumer.first_name || "";
      parsedConsumer.last_name = parsedConsumer.last_name || "";
      parsedConsumer.full_name = `${parsedConsumer.first_name} ${parsedConsumer.last_name}`.trim();
      
      return parsedConsumer;
    } catch (error) {
      console.error("❌ Error parsing consumer data:", error);
      localStorage.removeItem("consumer"); // Clean up invalid data
      return null;
    }
  });

  useEffect(() => {
    console.log("🔄 Updated Consumer in AuthContext:", consumer);
  }, [consumer]);

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

  const loginConsumer = (data) => {
    try {
      console.log("✅ Consumer Data Received for Login:", data);
      
      const normalizedData = {
        token: data.token,
        consumer_id: data.consumer_id,
        email: data.email || "",
        phone_number: data.phone_number || "",
        first_name: data.first_name || data.firstName || "",
        last_name: data.last_name || data.lastName || "",
        full_name: `${data.first_name || data.firstName || ""} ${data.last_name || data.lastName || ""}`.trim(),
        ...data // include any additional fields
      };

      console.log("📌 Normalized Login Data:", normalizedData);
      setConsumer(normalizedData);
      localStorage.setItem("consumer", JSON.stringify(normalizedData));
    } catch (error) {
      console.error("❌ Error during login:", error);
      throw error;
    }
  };

  const logout = () => {
    try {
      setConsumer(null);
      localStorage.removeItem("consumer");
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        consumer, 
        registerConsumer, 
        loginConsumer, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
// import React, { createContext, useState, useEffect, useContext } from "react";

// export const AuthContext = createContext();

// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// export const AuthProvider = ({ children }) => {
//   const [consumer, setConsumer] = useState(() => {
//     console.log("🔍 Fetching consumer from localStorage...");
//     const storedConsumer = localStorage.getItem("consumer");
//     console.log("📌 Stored Consumer Data:", storedConsumer);
//     const parsedConsumer = storedConsumer ? JSON.parse(storedConsumer) : null;
    
//     if (parsedConsumer) {
//       parsedConsumer.full_name = `${parsedConsumer.first_name || ""} ${parsedConsumer.last_name || ""}`.trim();
//     }
    
//     return parsedConsumer;
//   });

//   useEffect(() => {
//     console.log("🔄 Updated Consumer in AuthContext:", consumer);
//   }, [consumer]);

//   const registerConsumer = (consumerData) => {
//     console.log("✅ Consumer Data Received for Registration:", consumerData);
  
//     consumerData.farmer_id = consumerData.farmer_id || null;
//     consumerData.first_name = consumerData.first_name || "";
//     consumerData.last_name = consumerData.last_name || "";
//     consumerData.full_name = `${consumerData.first_name} ${consumerData.last_name}`.trim();
  
//     console.log("✅ First Name:", consumerData.first_name);
//     console.log("✅ Last Name:", consumerData.last_name);
//     console.log("✅ Full Name:", consumerData.full_name);
  
//     setConsumer(consumerData);
//     localStorage.setItem("consumer", JSON.stringify(consumerData));
//     console.log("✅ LocalStorage Updated with Registration Data");
//   };
//   const loginConsumer = (data) => {
//     console.log("✅ Consumer Data Received for Login:", data);
  
//     const { 
//       token, 
//       consumer_id, 
//       first_name = "", 
//       last_name = "", 
//       email = "", 
//       phone_number = "",
//       ...rest 
//     } = data;
  
//     const consumerData = {
//       token,
//       consumer_id,
//       email,
//       phone_number,
//       first_name: first_name || rest.firstName || "", // handle different casing
//       last_name: last_name || rest.lastName || "",
//       full_name: `${first_name || rest.firstName || ""} ${last_name || rest.lastName || ""}`.trim(),
//       ...rest // include any additional fields
//     };
  
//     console.log("📌 Updated Consumer Data:", consumerData);
//     setConsumer(consumerData);
//     localStorage.setItem("consumer", JSON.stringify(consumerData));
//   };

//   const logout = () => {
//     setConsumer(null);
//     localStorage.removeItem("consumer");
//   };

//   return (
//     <AuthContext.Provider value={{ consumer, registerConsumer, loginConsumer, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
// import React, { createContext, useState, useEffect, useContext } from "react";

// export const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser) : null;
//   });

//   useEffect(() => {
//     console.log("🔄 User state updated:", user);
//   }, [user]);

//   /**
//    * Handles user registration (both consumers and farmers)
//    */
//   const register = (userData, userType) => {
//     const userProfile = {
//       ...userData,
//       userType, // 'consumer' or 'farmer'
//       name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userType,
//       // For farmers
//       ...(userType === 'farmer' && { farmer_id: userData.farmer_id }),
//       // For consumers
//       ...(userType === 'consumer' && { consumer_id: userData.consumer_id })
//     };

//     console.log("✅ Registering user:", userProfile);
//     setUser(userProfile);
//     localStorage.setItem("user", JSON.stringify(userProfile));
//   };

//   /**
//    * Handles user login (both consumers and farmers)
//    */
//   const loginconsumer = (credentials, userType) => {
//     const userProfile = {
//       userType,
//       // Common fields
//       email: credentials.email,
//       phone_number: credentials.phone_number,
//       // For farmers
//       ...(userType === 'farmer' && { 
//         farmer_id: credentials.farmer_id,
//         name: credentials.farmer_name 
//       }),
//       // For consumers
//       ...(userType === 'consumer' && {
//         consumer_id: credentials.consumer_id,
//         name: credentials.consumer_name
//       })
//     };

//     console.log("✅ Logging in user:", userProfile);
//     setUser(userProfile);
//     localStorage.setItem("user", JSON.stringify(userProfile));
//   };

//   const logout = () => {
//     console.log("🚪 Logging out user");
//     setUser(null);
//     localStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider value={{ 
//       user,
//       isAuthenticated: !!user,
//       isConsumer: user?.userType === 'consumer',
//       isFarmer: user?.userType === 'farmer',
//       register,
//       login,
//       logout
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };