export async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:5000/products");
    if (!response.ok) throw new Error("Failed to fetch products");
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
