export async function fetchProducts() {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${consumer?.token}`, // or localStorage.getItem("token")
      },
    });
        if (!response.ok) throw new Error("Failed to fetch products");
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
