import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Create a root container for React to render the App
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Scroll Animations using Intersection Observer API
const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.5 } // Trigger when 50% of the section is visible
);

sections.forEach((section) => {
  observer.observe(section);
});