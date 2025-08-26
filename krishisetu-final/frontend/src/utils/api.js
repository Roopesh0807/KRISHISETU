export const fetchProducts = async () => {
    const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/products`; // Replace this with your actual API URL
    try {
      const response = await fetch(endpoint);
  
      if (!response.ok) {
        // Log the status code if the response is not okay
        throw new Error(`Failed to fetch products, status: ${response.status}`);
      }
  
      // Check if the content type is JSON
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON, but received: ${contentType}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return []; // Return an empty array if there's an error
    }
  };
  