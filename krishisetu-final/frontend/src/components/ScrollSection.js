import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { Carousel } from "bootstrap"; // Import Bootstrap's Carousel component
import "./styles.css";

// Importing all the images
import slide1 from '../assets/slide1.jpg';
import slide2 from '../assets/slide2.jpg';
import slide3 from '../assets/slide3.jpg';
import slide4 from '../assets/slide4.jpg';
import slide6 from '../assets/slide6.jpg';

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
      heading: "BARGAINING SYSTEM", 
      description: "Negotiate prices directly with farmers or consumers for the best deals, fair for both sides.",
    },
    { 
      img: slide4, 
      heading: "ORGANIC PRODUCTS", 
      description: "Shop for certified organic produce to ensure health and sustainability for your family.",
    },
    { 
      img: slide6, 
      heading: "FARMER COMMUNITY", 
      description: "Join a thriving community to share knowledge, resources, and success stories.",
    },
  ];

  // Re-enable automatic sliding after manual interaction
  useEffect(() => {
    const carouselElement = document.getElementById("carouselExampleCaptions");
    if (carouselElement) {
      const carousel = new Carousel(carouselElement, {
        interval: 2000, // Set interval to 2 seconds
        ride: "carousel", // Enable automatic sliding
      });

      // Re-enable automatic sliding after manual interaction
      carouselElement.addEventListener("slid.bs.carousel", () => {
        carousel.cycle(); // Re-enable automatic sliding
      });

      // Initialize the carousel
      carousel.cycle();
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