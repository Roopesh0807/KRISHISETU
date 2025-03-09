import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { Carousel } from "bootstrap"; // Import Bootstrap's Carousel component
import "./styles.css";

// Importing all the images
import slide1 from '../assets/slide1.jpg';
import slide2 from '../assets/slide2.jpg';
import slide3 from '../assets/slide3.jpg'; // Replace with actual image
import slide4 from '../assets/slide4.jpg'; // Replace with actual image
import slide5 from '../assets/slide5.jpg'; // Replace with actual image
import slide6 from '../assets/slide6.jpg'; // Replace with actual image
import slide7 from '../assets/slide7.jpg'; // Replace with actual image
import slide8 from '../assets/slide8.jpg'; // Replace with actual image

const ContactUsPage = () => {
  const slides = [
    { 
      img: slide1, 
      heading: "WELCOME", 
      description: "Welcome to KrishiSetu – Revolutionizing farming and shopping by connecting farmers and consumers directly!",
    },
    { 
      img: slide2, 
      heading: "DIRECT TRADE ADVANTAGE", 
      description: "Eliminate middlemen! Farmers earn fair prices, and consumers get fresh produce at better rates.",
    },
    { 
      img: slide3, 
      heading: "COMMUNITY ORDERS", 
      description: "Stronger Together, Smarter Savings! Community Orders allow neighbors to combine purchases for better discounts and reduced delivery charges.",
    },
    { 
      img: slide4, 
      heading: "FARMER'S COMMUNITY", 
      description: "Connect, Share, Grow! A dedicated space for farmers to share insights, ask questions, and support each other in their agricultural journey.",
    },
    { 
      img: slide5, 
      heading: "SUBSCRIPTION", 
      description: "Hassle-Free Deliveries, Just for You! Flexible subscription plans for daily, weekly, or custom deliveries, ensuring fresh farm produce at your doorstep.",
    },
    { 
      img: slide6, 
      heading: "BARGAINING SYSTEM", 
      description: "Fair Prices, Your Way! Negotiate prices directly with farmers to get the best deals while ensuring fair earnings for them.",
    },
    { 
      img: slide7, 
      heading: "AI CHATBOT", 
      description: "Instant Farming Assistance! 24/7 AI-powered chatbot providing expert agricultural advice, market trends, and farming tips.",
    },
    { 
      img: slide8, 
      heading: "PLANT DISEASE DETECTION", 
      description: "Healthy Crops, Higher Yields! AI-powered disease detection helps farmers identify and prevent plant diseases early for better productivity.",
    },
  ];

  useEffect(() => {
    const carouselElement = document.getElementById("carouselExampleCaptions");
    if (carouselElement) {
      const carousel = new Carousel(carouselElement, {
        interval: 3000, // Set interval to 3 seconds
        ride: "carousel", // Enable automatic sliding
      });

      // Re-enable automatic sliding after manual interaction
      carouselElement.addEventListener("slide.bs.carousel", () => {
        carousel.cycle(); // Re-enable automatic sliding
      });
    }
  }, []);

  return (
    <div className="contact-us-container">
      {/* About Us Section */}
      <div className="about-us-container">
        <h2 className="about-us-heading">About Us</h2>
        <p className="about-us-description">
          We are KrishiSetu, an innovative platform designed to bridge the gap between farmers and consumers. Our mission is to enable direct trade, providing fresh produce at better rates while ensuring fair deals for both sides.
        </p>
      </div>

      {/* Bootstrap Carousel */}
      <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
        {/* Carousel Indicators */}
        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#carouselExampleCaptions"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>

        {/* Carousel Items */}
        <div className="carousel-inner">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
            >
              <img src={slide.img} className="d-block w-100" alt={slide.heading} />
              <div className="carousel-caption d-none d-md-block">
                <h5>{slide.heading}</h5>
                <p>{slide.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Navigation Arrows */}
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
};

export default ContactUsPage;