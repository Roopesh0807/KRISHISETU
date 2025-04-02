const socketIo = require('socket.io');
const { pool } = require('./src/config/db');  // Import your database connection

let farmerSockets = {};

function setupSockets(server) {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Store the farmer's socket connection
    socket.on('farmerConnected', (farmerId) => {
      farmerSockets[farmerId] = socket.id;
    });

    // Handle consumer sending a bargain request
    socket.on('bargainRequest', async (data) => {
      const { consumerId, farmerId, productId, quantity } = data;
      
      // Save this request to the database
      const query = 'INSERT INTO bargain_sessions (consumer_id, farmer_id, product_id, quantity, status) VALUES (?, ?, ?, ?, ?)';
      await pool.query(query, [consumerId, farmerId, productId, quantity, 'requested']);

      // Notify the farmer
      if (farmerSockets[farmerId]) {
        io.to(farmerSockets[farmerId]).emit('newBargainRequest', data);
      }
    });

    // Handle farmer's response to bargain request (accept or reject)
    socket.on('farmerResponse', async (data) => {
      const { consumerId, farmerId, response } = data;
      const status = response === 'accepted' ? 'accepted' : 'rejected';

      // Update the database
      const query = 'UPDATE bargain_sessions SET status = ? WHERE consumer_id = ? AND farmer_id = ?';
      await pool.query(query, [status, consumerId, farmerId]);

      // Notify the consumer
      io.to(consumerId).emit('bargainResponse', { response: status });

      // If accepted, send price suggestions
      if (response === 'accepted') {
        const priceSuggestions = generatePriceSuggestions(data.productId);
        io.to(consumerId).emit('priceSuggestions', priceSuggestions);
      }
    });

    // Handle consumer selecting a price suggestion
    socket.on('consumerPriceChoice', async (data) => {
      const { consumerId, farmerId, selectedPrice } = data;

      // Notify the farmer of the selected price
      if (farmerSockets[farmerId]) {
        io.to(farmerSockets[farmerId]).emit('consumerSelectedPrice', { consumerId, selectedPrice });
      }
    });

    // Handle farmer's response to consumer price selection (accept, reject, or counter)
    socket.on('farmerResponseToPrice', async (data) => {
      const { consumerId, farmerId, response, counterPrice } = data;

      // Notify consumer
      io.to(consumerId).emit('farmerResponseToPrice', { response, counterPrice });

      // Update database if needed
      const query = 'UPDATE bargain_sessions SET status = ? WHERE consumer_id = ? AND farmer_id = ?';
      await pool.query(query, [response, consumerId, farmerId]);
    });

    // Handle finalizing the bargain when both agree
    socket.on('finalizeBargain', async (data) => {
      const { consumerId, farmerId, agreedPrice } = data;

      // Update the bargain session status
      const query = 'UPDATE bargain_sessions SET status = ?, final_price = ? WHERE consumer_id = ? AND farmer_id = ?';
      await pool.query(query, ['finalized', agreedPrice, consumerId, farmerId]);

      // Notify both parties
      io.to(consumerId).emit('bargainFinalized', { agreedPrice });
      io.to(farmerId).emit('bargainFinalized', { agreedPrice });
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
}

// Price suggestion generator
function generatePriceSuggestions(productId) {
  const basePrice = 100; // Simulating price fetch from DB
  return [basePrice - 4, basePrice + 4, basePrice - 2, basePrice + 2];
}

module.exports = setupSockets;
