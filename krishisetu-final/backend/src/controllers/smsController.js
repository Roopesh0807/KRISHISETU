// src/controllers/smsController.js
// NOTE: axios dependency is only needed if making a real, live SMS API call.
// Since we are operating in FREE mode, we simulate the outbound call with console logs.
// If you revert to paid mode, uncomment the axios line and paste the API call logic.
// const axios = require('axios'); 
const { queryDatabase } = require('../config/db'); 

// --- 1. Outgoing SMS Function (Notifications) ---
/**
 * Sends an SMS using console simulation in FREE mode.
 * @param {string} phoneNumber - The recipient phone number.
 * @param {string} message - The content of the SMS.
 */
const sendSms = async (phoneNumber, message) => {
    // --- SIMULATION MODE ACTIVE (FREE ONLY) ---
    console.log("-----------------------------------------");
    console.log(`✅ OUTGOING SMS SIMULATION SUCCESSFUL!`);
    console.log(`[TO: ${phoneNumber}]`);
    console.log(`[MSG: ${message}]`);
    console.log("-----------------------------------------");
    // If you switch to paid mode, replace this entire function body with the axios logic.
    // try {
    //     const response = await axios.get(url, { params });
    //     console.log(`✅ SMS sent to ${phoneNumber}. Status: ${response.data.message}`);
    // } catch (error) {
    //     console.error(`❌ Failed to send SMS to ${phoneNumber}. Error:`, error.response?.data || error.message);
    // }
};

// --- 2. Incoming SMS Handler (Commands) ---
/**
 * Processes incoming SMS from farmers and executes commands (ADD, UPDATE, STATUS, REPLY).
 * Note: This must be triggered by an external webhook (Ngrok -> /api/sms/inbound).
 * @param {string} from - The sender's phone number (must match a farmerregistration entry).
 * @param {string} message - The content of the SMS command.
 */
const handleInboundSms = async (from, message) => {
    const parts = message.trim().toUpperCase().split(/\s+/); 
    const command = parts[0];
    const phoneNumber = from;

    try {
        const [farmer] = await queryDatabase(
            'SELECT farmer_id, first_name, email FROM farmerregistration WHERE phone_number = ?', 
            [phoneNumber]
        );

        if (!farmer) {
            await sendSms(phoneNumber, "Namaste, aap KrishiSetu par registered nahi hai. Kripya registration ke liye support ko call karein.");
            return;
        }

        const { farmer_id: farmerId, first_name: farmerName, email: farmerEmail } = farmer;

        switch (command) {
            case 'ADD':
                // Format: ADD [PRODUCE_NAME] [QUANTITY] [PRICE]
                if (parts.length < 4) {
                    await sendSms(phoneNumber, "Invalid format. Use: ADD [NAME] [QTY(kg)] [PRICE/kg].");
                    return;
                }
                const produceName = parts[1];
                const quantity = parseInt(parts[2]);
                const price = parseFloat(parts[3]);

                if (isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
                    await sendSms(phoneNumber, "Invalid number. QTY and PRICE must be positive numbers.");
                    return;
                }
                
                const minQuantity = Math.max(1, Math.floor(quantity * 0.1)); 
                const minPrice = (price * 0.90).toFixed(2);
                
                await queryDatabase(
                    `INSERT INTO add_produce 
                     (farmer_id, farmer_name, produce_name, availability, price_per_kg, produce_type, market_type, email, minimum_quantity, minimum_price) 
                     VALUES (?, ?, ?, ?, ?, 'Standard', 'Bargaining Market', ?, ?, ?)`,
                    [farmerId, farmerName, produceName, quantity, price, farmerEmail, minQuantity, minPrice]
                );
                await sendSms(phoneNumber, `Produce '${produceName}' added. QTY: ${quantity}kg, Price: Rs.${price}/kg. (Bargaining Enabled)`);
                break;

            case 'UPDATE':
                // Format: UPDATE [PRODUCE_NAME] [NEW_PRICE]
                if (parts.length < 3) {
                    await sendSms(phoneNumber, "Invalid format. Use: UPDATE [NAME] [NEW_PRICE/kg].");
                    return;
                }
                const updateProduceName = parts[1];
                const newPrice = parseFloat(parts[2]);

                if (isNaN(newPrice) || newPrice <= 0) {
                    await sendSms(phoneNumber, "Invalid price. Price must be a positive number.");
                    return;
                }

                const result = await queryDatabase(
                    'UPDATE add_produce SET price_per_kg = ? WHERE farmer_id = ? AND produce_name = ?',
                    [newPrice, farmerId, updateProduceName]
                );

                if (result.affectedRows > 0) {
                     await sendSms(phoneNumber, `Price for '${updateProduceName}' updated to Rs. ${newPrice}/kg.`);
                } else {
                     await sendSms(phoneNumber, `Produce '${updateProduceName}' not found or no change needed.`);
                }
                break;
                
            case 'STATUS':
                // Format: STATUS
                const [lastSale] = await queryDatabase(
                    `SELECT produce_name, status, created_at AS time FROM bargain_orders WHERE farmer_id = ?
                     UNION ALL 
                     SELECT produce_name, status, created_at FROM farmer_notifications WHERE farmer_id = ?
                     ORDER BY time DESC LIMIT 1`,
                    [farmerId, farmerId]
                );
                
                if (lastSale) {
                    await sendSms(phoneNumber, `Your last sale for ${lastSale.produce_name} is: ${lastSale.status}. Check app for full details.`);
                } else {
                    await sendSms(phoneNumber, "You have no recent orders or active sales.");
                }
                break;

            case 'REPLY':
                // Format: REPLY [BARGAIN_ID] [ACCEPT|REJECT|COUNTER] [OPTIONAL_PRICE]
                if (parts.length < 3) {
                    await sendSms(phoneNumber, "Invalid format. Use: REPLY [ID] [ACCEPT|REJECT|COUNTER PRICE].");
                    return;
                }
                const bargainId = parseInt(parts[1]);
                const action = parts[2];
                const optionalPrice = parts[3] ? parseFloat(parts[3]) : null;

                const [bargain] = await queryDatabase('SELECT 1 FROM bargain_sessions WHERE bargain_id = ? AND farmer_id = ?', [bargainId, farmerId]);

                if (!bargain) {
                    await sendSms(phoneNumber, `Bargain ID ${bargainId} not found or you are not authorized.`);
                    return;
                }

                if (action === 'ACCEPT' || action === 'REJECT' || (action === 'COUNTER' && optionalPrice > 0)) {
                    const messageType = action === 'COUNTER' ? 'counter_offer' : action.toLowerCase();
                    const messageContent = action === 'COUNTER' ? `Countered with price: Rs. ${optionalPrice}/kg` : `${action}ed the offer.`;
                    
                    await queryDatabase(
                        `INSERT INTO bargain_messages 
                         (bargain_id, sender_role, sender_id, message_content, price_suggestion, message_type)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [bargainId, 'farmer', farmerId, messageContent, optionalPrice, messageType]
                    );
                    
                    await sendSms(phoneNumber, `Reply sent. Bargain ID ${bargainId} status set to ${action}.`);
                } else {
                    await sendSms(phoneNumber, "Invalid action or missing counter price. Use ACCEPT, REJECT, or COUNTER [PRICE].");
                }
                break;
                
            case 'HELP':
                await sendSms(phoneNumber, "Commands: ADD [NAME] [QTY] [PRICE]. UPDATE [NAME] [PRICE]. STATUS. REPLY [ID] [ACCEPT|REJECT|COUNTER PRICE].");
                break;
                
            default:
                await sendSms(phoneNumber, "Unknown command. Type 'HELP' for a list of commands.");
                break;
        }

    } catch (err) {
        console.error("Critical error in inbound SMS handler:", err);
        await sendSms(phoneNumber, "An unexpected error occurred. Please contact support.");
    }
};

module.exports = { sendSms, handleInboundSms };
