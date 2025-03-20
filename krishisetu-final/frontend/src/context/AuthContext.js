import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [consumer, setConsumer] = useState(() => {
    console.log("🔍 Fetching consumer from localStorage...");
    const storedConsumer = localStorage.getItem("consumer");
    console.log("📌 Stored Consumer Data:", storedConsumer);
    return storedConsumer ? JSON.parse(storedConsumer) : null;
  });

  useEffect(() => {
    console.log("🔄 Updated Consumer in AuthContext:", consumer);
  }, [consumer]);

  const loginConsumer = (consumerData) => {
    console.log("✅ Consumer Data Received for Login:", consumerData);

    if (!consumerData || !consumerData.consumer_id) {
      console.error("❌ Invalid consumerData! API might be incorrect.");
      return;
    }

    setConsumer(consumerData);
    localStorage.setItem("consumer", JSON.stringify(consumerData));
    console.log("✅ LocalStorage Updated:", localStorage.getItem("consumer"));
  };

  const logout = () => {
    setConsumer(null);
    localStorage.removeItem("consumer");
  };

  return (
    <AuthContext.Provider value={{ consumer, loginConsumer, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
