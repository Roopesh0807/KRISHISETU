import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL}/api/bargain`;

export const getBargainSessions = async (userType) => {
  const response = await axios.get(`${API_BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

export const getBargainSession = async (sessionId) => {
  const response = await axios.get(`${API_BASE_URL}/${sessionId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

export const initiateBargain = async (productId, quantity) => {
  const response = await axios.post(`${API_BASE_URL}/initiate`, 
    { productId, quantity },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
};

export const submitOffer = async (sessionId, offerPrice) => {
  const response = await axios.post(`${API_BASE_URL}/${sessionId}/offers`, 
    { offerPrice },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
};

export const respondToBargain = async (sessionId, accept) => {
  const response = await axios.post(`${API_BASE_URL}/${sessionId}/respond`, 
    { accept },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
};

export const finalizeBargain = async (sessionId) => {
  const response = await axios.post(`${API_BASE_URL}/${sessionId}/finalize`, 
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
};