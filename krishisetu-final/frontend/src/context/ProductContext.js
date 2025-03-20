import { createContext, useState } from "react";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductPrice, setSelectedProductPrice] = useState(null); // ✅ Make sure this exists

  return (
    <ProductContext.Provider
      value={{
        selectedProductId,
        setSelectedProductId,
        selectedProductPrice, // ✅ Include this
        setSelectedProductPrice, // ✅ Include setter function
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
