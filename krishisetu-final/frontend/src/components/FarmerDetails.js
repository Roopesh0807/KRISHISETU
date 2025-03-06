import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function FarmerProfile() {
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/farmers/${id}`)
      .then((response) => setFarmer(response.data))
      .catch((error) => console.error("Error fetching farmer details:", error));
  }, [id]);

  if (!farmer) return <div className="text-center text-lg font-semibold">Loading farmer details...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-4xl p-6">
        
        {/* Farmer Profile */}
        <div className="flex items-center space-x-6 border-b pb-4">
          <img
            src={farmer.image }
            alt={farmer.name}
            className="w-24 h-24 rounded-full border"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{farmer.name}</h2>
            <p className="text-gray-600">🌾 Farming Method: {farmer.farmingMethod}</p>
            <p className="text-yellow-500 font-semibold">⭐ {farmer.ratings} / 5</p>
          </div>
        </div>

        {/* Produce List */}
        <h3 className="text-xl font-semibold mt-6 mb-4">🌿 Available Produce</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {farmer.produce.map((item, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-md hover:scale-105 transition-transform">
              <h4 className="font-semibold text-gray-800">🥦 {item.name}</h4>
              <p className="text-gray-600">📦 {item.availability} kg available</p>
              <p className="text-green-600 font-bold">💰 ₹{item.price} per kg</p>
              <button className="mt-2 bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition">
                🔥 Bargain
              </button>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => window.history.back()}
          >
            ⬅ Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default FarmerProfile;
