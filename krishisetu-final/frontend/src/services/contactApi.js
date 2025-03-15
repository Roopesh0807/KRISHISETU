// src/api/contactApi.js

export const submitContactForm = async (formData) => {
  try {
    const response = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send message: ${errorText}`);
    }

    // Return the JSON response if successful
    return await response.json();
  } catch (error) {
    console.error("Error in API call:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};
