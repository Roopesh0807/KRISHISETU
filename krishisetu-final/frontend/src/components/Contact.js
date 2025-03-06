// // src/components/ContactUs.js
// import React, { useState } from "react";
// import { submitContactForm } from "../services/contactApi"; // Import the API function
// import "./styles.css";

// const ContactUs = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     message: ""
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await submitContactForm(formData); // Call the API
//       alert(response.message || "Message sent successfully!");

//       setFormData({ name: "", email: "", phone: "", message: "" });
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       alert("Failed to send message. Please try again.");
//     }
//   };

//   return (
//     <div className="contact-container">
//       <h2>Contact Us</h2>
//       <p>Address: Krishisetu, Opp. to Hotel Empire, Anand Rao Circle, Bengaluru - 560009</p>
//       <p>Contact: 9110823741</p>
//       <form className="contact-form" onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>Name</label>
//           <input type="text" name="name" value={formData.name} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <label>Email</label>
//           <input type="email" name="email" value={formData.email} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <label>Phone</label>
//           <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <label>Message</label>
//           <textarea name="message" value={formData.message} onChange={handleChange} required></textarea>
//         </div>
//         <button type="submit">SUBMIT</button>
//       </form>
//       <div className="social-icons">
//         <p>FOLLOW US ON</p>
//         <span>📷</span> <span>📘</span> <span>🐦</span>
//       </div>
//     </div>
//   );
// };

// export default ContactUs;
// src/components/ContactUs.js
import React, { useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa"; // Import icons
import axios from "axios"; // Import axios for API calls
import "./styles.css";

const ContactUs = () => {
  const [state, handleSubmit] = useForm("xbldnpvk"); // Replace with your Formspree form ID

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Submit to Formspree
    await handleSubmit(e);

    // If Formspree submission is successful, send data to your backend
    if (state.succeeded) {
      try {
        // Send data to your backend API
        const response = await axios.post("http://localhost:5000/api/contact", formData); // Replace with your backend URL
        console.log("Data saved to database:", response.data);

        // Reset form
        setFormData({ name: "", email: "", phone: "", message: "" });

        // Show success message
        alert("Message sent and saved successfully!");
      } catch (error) {
        console.error("Error saving data to database:", error);
        alert("Message sent, but failed to save to database. Please try again.");
      }
    }
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p>Address: Krishisetu, Opp. to Hotel Empire, Anand Rao Circle, Bengaluru - 560009</p>
      <p>Contact: 9110823741</p>
      <form className="contact-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} />
        </div>
        <button type="submit" disabled={state.submitting}>
          SUBMIT
        </button>
      </form>
      <div className="social-icons">
        <p>FOLLOW US ON</p>
        <a
          href="https://www.facebook.com/yourpage" // Replace with your Facebook page URL
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook className="icon" />
        </a>
        <a
          href="https://www.instagram.com/yourpage" // Replace with your Instagram page URL
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram className="icon" />
        </a>
        <a
          href="https://twitter.com/yourpage" // Replace with your Twitter/X page URL
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter className="icon" />
        </a>
      </div>
    </div>
  );
};

export default ContactUs;