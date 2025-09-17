import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = ({ userType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  // Use useEffect to display a welcome message when the chatbot is opened
  useEffect(() => {
    if (isOpen) {
      const welcomeMessage = {
        sender: "bot",
        text: userType === "farmer"
          ? "Welcome, farmer! How can I assist you today?"
          : "Welcome to KrishiSetu! How can I help you?",
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, userType]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // List of keywords related to farming, agriculture, e-commerce, and greetings
  const allowedKeywords = [
    // Farming & Agriculture
    "farm", "farmer", "agriculture", "crop", "harvest", "fertilizer", "soil",
    "pesticide", "weather", "yield", "seeds", "organic", "irrigation", "drought",
    "livestock", "dairy", "farming techniques", "climate", "storage",
    "supply chain", "pesticide safety", "seasonal farming", "best farming practices",
    "crop rotation", "greenhouse", "compost", "weed control", "pest control",
    "soil health", "water management", "sustainable farming", "crop insurance",
    "government schemes", "subsidy", "loan", "credit", "market access",

    // E-commerce & Consumer Queries (KrishiSetu Platform)
    "buy", "sell", "market price", "order", "delivery", "payment", "price",
    "transaction", "discount", "refund", "customer support", "return policy",
    "shipping", "product quality", "fresh produce", "supply chain", "packaging",
    "KrishiSetu", "seller", "buyer", "farmer marketplace", "product listing",
    "order tracking", "payment methods", "cash on delivery", "online payment",
    "customer review", "rating", "product category", "search", "filter",
    "wishlist", "cart", "checkout", "order history", "invoice", "receipt",

    // Greetings & Common Queries
    "hello", "hi", "good morning", "good evening", "good night", "how are you",
    "thank you", "bye", "welcome", "help", "support", "assistance",
    "customer care", "farmer support", "contact", "FAQ", "how does it work",
    "KrishiSetu help", "about us", "terms and conditions", "privacy policy",
    "feedback", "complaint", "suggestion", "report issue", "contact us"
  ];

  // Predefined responses for common queries
  const predefinedResponses = {
    "hello": "Hello! How can I assist you today?",
    
    "good morning": "Good morning! How can I assist you today?",
    "good evening": "Good evening! How can I help you?",
    "good night": "Good night! Have a great day ahead!",
    "how are you": "I'm just a bot, but I'm here to help you! How can I assist you?",
    "thank you": "You're welcome! If you have any more questions, feel free to ask.",
    "bye": "Goodbye! Have a great day!",
    "welcome": "You're welcome! How can I assist you today?",
    "help": "Sure, I'm here to help! What do you need assistance with?",
    "support": "I'm here to support you. What do you need help with?",
    "assistance": "How can I assist you today?",
    "customer care": "Our customer care team is here to help. What do you need assistance with?",
    "farmer support": "I'm here to support farmers. How can I assist you?",
    "contact": "You can contact us at support@krishisetu.com or call us at +91-6361334856.",
    "FAQ": "You can find answers to common questions in our FAQ section at https://krishisetu.com/faq.",
    "how does it work": "KrishiSetu is a platform that connects farmers and consumers. Farmers can list their products, and consumers can buy directly from them. How can I assist you further?",
    "KrishiSetu help": "I'm here to help with KrishiSetu. What do you need assistance with?",
    "about us": "KrishiSetu is a platform dedicated to connecting farmers and consumers, promoting sustainable agriculture, and supporting local farming communities. How can I assist you further?",
    "terms and conditions": "You can find our terms and conditions at https://krishisetu.com/terms.",
    "privacy policy": "You can find our privacy policy at https://krishisetu.com/privacy.",
    "feedback": "We value your feedback! Please share your thoughts at feedback@krishisetu.com.",
    "complaint": "We're sorry to hear that. Please share your complaint at support@krishisetu.com, and we'll address it promptly.",
    "suggestion": "We appreciate your suggestions! Please share them at feedback@krishisetu.com.",
    "report issue": "Please report any issues to support@krishisetu.com, and we'll assist you.",
    "contact us": "You can contact us at support@krishisetu.com or call us at +91-1234567890.",
    "krishisetu": "KrishiSetu is a platform that connects farmers and consumers, promoting sustainable agriculture and supporting local farming communities. How can I assist you further?",
    "tell me more about krishisetu": "KrishiSetu is a platform dedicated to connecting farmers and consumers. It allows farmers to list their products and sell directly to consumers, ensuring fair prices and fresh produce. How can I assist you further?",
    "how does krishisetu help farmers": "KrishiSetu helps farmers by providing a platform to sell their products directly to consumers, eliminating middlemen and ensuring fair prices. It also offers resources and support for sustainable farming practices. How can I assist you further?"
  };

  // Function to check if the question is relevant
  const isRelevantQuestion = (text) => {
    return allowedKeywords.some((keyword) =>
      text.toLowerCase().includes(keyword)
    );
  };

  // Function to handle predefined responses
  const handlePredefinedResponse = (text) => {
    const lowerCaseText = text.toLowerCase();
    for (const key in predefinedResponses) {
      if (lowerCaseText.includes(key)) {
        return predefinedResponses[key];
      }
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return;

    const userMessage = { sender: "user", text: inputText };
    setMessages([...messages, userMessage]);
    setInputText("");

    // Check if the question is relevant
    if (!isRelevantQuestion(inputText)) {
      const errorMessage = {
        sender: "bot",
        text: "I'm sorry, but I am only trained to assist with farming, agriculture, consumer-related topics, and KrishiSetu platform support.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      return;
    }

    // Check for predefined responses
    const predefinedResponse = handlePredefinedResponse(inputText);
    if (predefinedResponse) {
      const botMessage = { sender: "bot", text: predefinedResponse };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      return;
    }

   try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: inputText }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

      const botMessage = {
        sender: "bot",
        text:
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I'm sorry, I couldn't generate a response.",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response from Gemini API:", error);
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I am unable to respond. Please try again later.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div>
      {/* Floating Chat Icon */}
      <button className="chatbot-icon" onClick={toggleChatbot}>
        💬
      </button>

      {/* Chat Window (Only visible when isOpen is true) */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>KrishiBot</h3>
            <button onClick={toggleChatbot} className="close-btn">✖</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask about farming, e-commerce, or KrishiSetu support..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;