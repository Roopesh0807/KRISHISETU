import React from "react";
import ReactDOM from 'react-dom/client'; 
import App from "./App";

// Create a root container for React to render the App
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
