import axios from "axios";

const API_URL = "http://localhost:5000/api/bargain";

export const getBargainMessages = async (roomId) => {
  const res = await axios.get(`${API_URL}/messages/${roomId}`);
  return res.data;
};

export const sendBargainMessage = async (roomId, senderId, messageType, messageText, priceOffer) => {
  await axios.post(`${API_URL}/messages`, {
    roomId,
    senderId,
    messageType,
    messageText,
    priceOffer,
  });
};

export const getPriceSuggestions = async (roomId) => {
  const res = await axios.get(`${API_URL}/suggestions/${roomId}`);
  return res.data;
};
