// // ./src/controllers/smsController.js (FINAL WORKING VERSION)

// require("dotenv").config();
// const axios = require('axios');
// const { queryDatabase } = require('../config/db'); 

// // -------------------------------------------------------------------
// // --- 1. UTILITY FUNCTIONS (Defined here to ensure local scope) ---
// // -------------------------------------------------------------------













// async function sendSms(phoneNumber, message) {
//     const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY; 

//     // ⚠️ DEVELOPMENT/FREE MODE: SIMULATE SMS SENDING
//     if (!FAST2SMS_API_KEY || process.env.NODE_ENV !== 'production') {
//         console.log("-----------------------------------------");
//         console.log("✅ SMS SIMULATION MODE ACTIVE (Development Only)");
//         console.log(`To: ${phoneNumber}`);
//         console.log(`Message: ${message}`);
//         console.log("-----------------------------------------");
//         return { success: true, simulated: true };
//     }
    
//     // 🚀 PRODUCTION/PAID MODE (Placeholder)
//     // ... (Your real API logic would go here)
//     return { success: false, error: "Live SMS configured but not implemented." };
// }










// // async function sendSms(phoneNumber, message) {
// //     const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || 'YOUR_FALLBACK_KEY'; 
// //     const FAST2SMS_API_URL = 'https://www.fast2sms.com/dev/bulkV2';

// //     // 1. Check for API Key and run in simulation if missing/in development
// //     if (process.env.NODE_ENV !== 'production' && !FAST2SMS_API_KEY) {
// //         console.log("-----------------------------------------");
// //         console.log("✅ SMS SIMULATION MODE ACTIVE (No API Key in ENV)");
// //         console.log(`To: ${phoneNumber}`);
// //         console.log(`Message: ${message}`);
// //         console.log("-----------------------------------------");
// //         return { success: true, simulated: true };
// //     }

// //     // 2. Execute LIVE SMS Call (This assumes you have Fast2SMS credits)
// //     try {
// //         const response = await axios.post(
// //             FAST2SMS_API_URL,
// //             {
// //                 // Note: Fast2SMS typically expects numbers as a comma-separated string
// //                 route: 'v3', // Transactional Route (Check if you have an approved template/route)
// //                 sender_id: 'FSTSMS', // Default Sender ID, replace with yours if necessary
// //                 message: message,
// //                 language: 'english',
// //                 flash: 0,
// //                 numbers: phoneNumber 
// //             },
// //             {
// //                 headers: {
// //                     'authorization': FAST2SMS_API_KEY,
// //                     'Content-Type': 'application/json'
// //                 }
// //             }
// //         );
        
// //         // Log the actual response from the SMS gateway
// //         const apiResponse = response.data;
        
// //         if (apiResponse.return === true) {
// //             console.log(`\n🚀 LIVE SMS SUCCESS to ${phoneNumber}: Status: ${apiResponse.message}`);
// //             return { success: true, api_status: apiResponse.message };
// //         } else {
// //             console.error(`\n❌ LIVE SMS FAILED to ${phoneNumber}: Reason: ${apiResponse.message}`);
// //             return { success: false, api_error: apiResponse.message };
// //         }
        
// //     } catch (error) {
// //         // Log Axios network errors or connection issues
// //         console.error(`\n❌ CRITICAL SMS NETWORK ERROR to ${phoneNumber}:`, error.response ? error.response.data : error.message);
// //         return { success: false, api_error: "Network or API service failure." };
// //     }
// // }















// function generatePriceSuggestions(basePrice, bidPrice) {
//     const numericBase = parseFloat(basePrice);
//     const numericBid = parseFloat(bidPrice);
//     if (isNaN(numericBase) || isNaN(numericBid) || numericBase <= numericBid) {
//       return [];
//     }
    
//     const diff = numericBase - numericBid;
//     const interval = diff / 10; 
    
//     const finalSuggestions = [];
//     for (let i = 1; i <= 10; i++) { 
//         const newPrice = numericBid + (interval * i);
//         finalSuggestions.push(newPrice.toFixed(2));
//     }
//     finalSuggestions.push(numericBase.toFixed(2)); // Index 10 is the original price

//     return finalSuggestions; // Array length will be 11 (Indices 0 to 10)
// }

// // -------------------------------------------------------------------
// // --- 2. CORE INBOUND HANDLERS ---
// // -------------------------------------------------------------------

// // Helper to process the farmer's command and update the DB
// async function processSmsBargainUpdate(fromNumber, farmerId, bargainId, action, counterIndex, io) {
    
//     // 1. Fetch Session Data
//     const [session] = await queryDatabase(`
//         SELECT 
//             bsp.current_offer AS current_bid,
//             ap.price_per_kg AS original_price
//         FROM bargain_sessions bs
//         JOIN bargain_session_products bsp ON bs.bargain_id = bsp.bargain_id
//         JOIN add_produce ap ON bsp.product_id = ap.product_id
//         WHERE bs.bargain_id = ? AND bs.farmer_id = ?
//     `, [bargainId, farmerId]);

//     if (!session) {
//         return await sendSms(fromNumber, `Error: Bargain ${bargainId} not found.`);
//     }

//     const currentBid = parseFloat(session.current_bid);
//     const originalPrice = parseFloat(session.original_price);
    
//     // 2. Determine Final Price and Content
//     let finalPrice = currentBid;
//     let messageType = action; 
//     let messageContent = '';
//     let successMessage = '';
    
//     if (action === 'counter_offer') {
//         const suggestions = generatePriceSuggestions(originalPrice, currentBid);
        
//         if (counterIndex >= 0 && counterIndex <= 10 && counterIndex < suggestions.length) {
//             finalPrice = parseFloat(suggestions[counterIndex]);
//             messageContent = `💰 Farmer counters with ₹${finalPrice}/kg (SMS command C${counterIndex})`;
//             successMessage = `Success: Counter offer of ₹${finalPrice} sent for ${bargainId}.`;
//         } else {
//             return await sendSms(fromNumber, `Error: Suggestion C${counterIndex} is out of range for this bargain.`);
//         }
//     } else if (action === 'accept') {
//         finalPrice = currentBid; 
//         messageContent = `✅ Farmer accepted the offer at ₹${finalPrice}/kg (SMS command A)`;
//         successMessage = `Success: Bargain ${bargainId} accepted! Order processing initiated.`;
//     } else if (action === 'reject') {
//         finalPrice = currentBid; 
//         messageContent = `❌ Farmer rejected the offer (SMS command R)`;
//         successMessage = `Success: Bargain ${bargainId} rejected.`;
//     }
    
//     try {
//         await queryDatabase(`START TRANSACTION`);
        
//         // 3. Insert Message
//         await queryDatabase(`
//             INSERT INTO bargain_messages (bargain_id, sender_role, sender_id, message_content, price_suggestion, message_type)
//             VALUES (?, 'farmer', ?, ?, ?, ?)
//         `, [bargainId, farmerId, messageContent, finalPrice, messageType]);
        
//         // 4. Update Current Offer in DB (Only for counter_offer)
//         if (action === 'counter_offer') {
//              await queryDatabase(`
//                  UPDATE bargain_session_products SET current_offer = ? WHERE bargain_id = ?
//              `, [finalPrice, bargainId]);
//         }

//         await queryDatabase(`COMMIT`);

//         // 5. Send Confirmation SMS back to the Farmer
//         await sendSms(fromNumber, successMessage);
        
//         // 6. EMIT SOCKET EVENT TO UPDATE CONSUMER UI (CRITICAL)
//         const room = `bargain_${bargainId}`;
        
//         // Emit final status or counter status
//         io.to(room).emit("bargainStatusUpdate", {
//             bargainId: bargainId,
//             status: action === 'counter_offer' ? 'countered' : action,
//             currentPrice: finalPrice,
//             initiatedBy: 'farmer',
//             timestamp: new Date().toISOString()
//         });

//         // Emit message content for the chat window if it was a counter
//         if (action === 'counter_offer') {
//              io.to(room).emit("bargainMessage", {
//                 bargain_id: bargainId,
//                 sender_role: 'farmer',
//                 message_content: messageContent,
//                 price_suggestion: finalPrice,
//                 message_type: 'counter_offer',
//                 created_at: new Date().toISOString()
//             });
//         }

//     } catch (error) {
//         await queryDatabase(`ROLLBACK`);
//         console.error("Bargain SMS Processing Error:", error);
//         return await sendSms(fromNumber, `System Error: Failed to process command for ${bargainId}.`);
//     }
// }


// // The Webhook Entry Point
// async function handleInboundSms(fromNumber, message, io) {
//     const trimmedMessage = message.trim().toUpperCase();
    
//     // Find the Farmer
//     const [farmer] = await queryDatabase(
//         "SELECT farmer_id FROM farmerregistration WHERE phone_number = ?",
//         [fromNumber]
//     );

//     if (!farmer) {
//         return await sendSms(fromNumber, "Error: You are not a registered farmer.");
//     }
    
//     // Parse Commands
//     const matchAccept = trimmedMessage.match(/^A\s+(\w+)$/);
//     const matchReject = trimmedMessage.match(/^R\s+(\w+)$/);
//     const matchCounter = trimmedMessage.match(/^C(\d+)\s+(\w+)$/);

//     if (matchAccept || matchReject || matchCounter) {
//         let bargainId, action, index = null;

//         if (matchAccept) {
//             bargainId = matchAccept[1];
//             action = 'accept';
//         } else if (matchReject) {
//             bargainId = matchReject[1];
//             action = 'reject';
//         } else if (matchCounter) {
//             index = parseInt(matchCounter[1]);
//             bargainId = matchCounter[2];
//             action = 'counter_offer';
//             if (isNaN(index) || index < 0 || index > 10) {
//                 return await sendSms(fromNumber, `Invalid counter index C${index}. Must be C0 to C10.`);
//             }
//         }
        
//         return await processSmsBargainUpdate(fromNumber, farmer.farmer_id, bargainId, action, index, io); 

//     } else {
//         return await sendSms(fromNumber, "Unrecognized command. Reply A [ID], R [ID], or C[0-10] [ID].");
//     }
// }


// // --- EXPORTS (MUST BE AT THE VERY END) ---
// module.exports = {
//     sendSms,
//     handleInboundSms
// };










// ./src/controllers/smsController.js (FINAL WORKING VERSION with TWILIO)

require("dotenv").config();
const axios = require('axios');
const twilio = require('twilio'); // Import Twilio
const { queryDatabase } = require('../config/db'); 

// Twilio Setup (Accessing variables from .env)
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_NUMBER = process.env.TWILIO_NUMBER; 

// Initialize Twilio client only if credentials are set
const twilioClient = (TWILIO_SID && TWILIO_AUTH_TOKEN) 
    ? twilio(TWILIO_SID, TWILIO_AUTH_TOKEN) 
    : null;


// -------------------------------------------------------------------
// --- 1. UTILITY FUNCTIONS (Defined for Export) ---
// -------------------------------------------------------------------

async function sendSms(phoneNumber, message) {
    // 1. Check for live credentials/client
    if (!twilioClient) {
        // ⚠️ DEVELOPMENT/FREE MODE: SIMULATE SMS SENDING
        console.log("-----------------------------------------");
        console.log("✅ SMS SIMULATION MODE ACTIVE (Twilio not configured)");
        console.log(`To: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        console.log("-----------------------------------------");
        return { success: true, simulated: true };
    }
    
    // 2. Execute LIVE TWILIO Call
    try {
        // Twilio requires phone numbers to start with the country code (+)
        const formattedToNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`; 

        const twilioResponse = await twilioClient.messages.create({
            body: message,
            from: TWILIO_NUMBER, // Your Twilio Trial Number
            to: formattedToNumber
        });
        
        console.log(`\n🚀 LIVE TWILIO SUCCESS to ${phoneNumber}. SID: ${twilioResponse.sid}`);
        return { success: true, sid: twilioResponse.sid };
        
    } catch (error) {
        // Log Twilio API errors
        console.error(`\n❌ LIVE TWILIO FAILED to ${phoneNumber}:`, error.message);
        // Twilio errors often include a status and code in the message for debugging
        return { success: false, api_error: error.message };
    }
}

function generatePriceSuggestions(basePrice, bidPrice) {
    // ... (Your price calculation logic remains unchanged here) ...
    const numericBase = parseFloat(basePrice);
    const numericBid = parseFloat(bidPrice);
    if (isNaN(numericBase) || isNaN(numericBid) || numericBase <= numericBid) {
      return [];
    }
    
    const diff = numericBase - numericBid;
    const interval = diff / 10; 
    
    const finalSuggestions = [];
    for (let i = 1; i <= 10; i++) { 
        const newPrice = numericBid + (interval * i);
        finalSuggestions.push(newPrice.toFixed(2));
    }
    finalSuggestions.push(numericBase.toFixed(2)); 

    return finalSuggestions;
}


// -------------------------------------------------------------------
// --- 2. CORE INBOUND HANDLERS (Unchanged Logic) ---
// -------------------------------------------------------------------

async function processSmsBargainUpdate(fromNumber, farmerId, bargainId, action, counterIndex, io) {
    
    // ... (Your processSmsBargainUpdate logic remains here, using sendSms and queryDatabase) ...
    
    // 1. Fetch Session Data
    const [session] = await queryDatabase(`
        SELECT 
            bsp.current_offer AS current_bid,
            ap.price_per_kg AS original_price
        FROM bargain_sessions bs
        JOIN bargain_session_products bsp ON bs.bargain_id = bsp.bargain_id
        JOIN add_produce ap ON bsp.product_id = ap.product_id
        WHERE bs.bargain_id = ? AND bs.farmer_id = ?
    `, [bargainId, farmerId]);

    if (!session) {
        return await sendSms(fromNumber, `Error: Bargain ${bargainId} not found.`);
    }

    const currentBid = parseFloat(session.current_bid);
    const originalPrice = parseFloat(session.original_price);
    
    // 2. Determine Final Price and Content
    let finalPrice = currentBid;
    let messageType = action; 
    let messageContent = '';
    let successMessage = '';
    
    if (action === 'counter_offer') {
        const suggestions = generatePriceSuggestions(originalPrice, currentBid);
        
        if (counterIndex >= 0 && counterIndex <= 10 && counterIndex < suggestions.length) {
            finalPrice = parseFloat(suggestions[counterIndex]);
            messageContent = `💰 Farmer counters with ₹${finalPrice}/kg (SMS command C${counterIndex})`;
            successMessage = `Success: Counter offer of ₹${finalPrice} sent for ${bargainId}.`;
        } else {
            return await sendSms(fromNumber, `Error: Suggestion C${counterIndex} is out of range for this bargain.`);
        }
    } else if (action === 'accept') {
        finalPrice = currentBid; 
        messageContent = `✅ Farmer accepted the offer at ₹${finalPrice}/kg (SMS command A)`;
        successMessage = `Success: Bargain ${bargainId} accepted! Order processing initiated.`;
    } else if (action === 'reject') {
        finalPrice = currentBid; 
        messageContent = `❌ Farmer rejected the offer (SMS command R)`;
        successMessage = `Success: Bargain ${bargainId} rejected.`;
    }
    
    try {
        await queryDatabase(`START TRANSACTION`);
        
        // 3. Insert Message
        await queryDatabase(`
            INSERT INTO bargain_messages (bargain_id, sender_role, sender_id, message_content, price_suggestion, message_type)
            VALUES (?, 'farmer', ?, ?, ?, ?)
        `, [bargainId, farmerId, messageContent, finalPrice, messageType]);
        
        // 4. Update Current Offer in DB (Only for counter_offer)
        if (action === 'counter_offer') {
             await queryDatabase(`
                 UPDATE bargain_session_products SET current_offer = ? WHERE bargain_id = ?
             `, [finalPrice, bargainId]);
        }

        await queryDatabase(`COMMIT`);

        // 5. Send Confirmation SMS back to the Farmer
        await sendSms(fromNumber, successMessage);
        
        // 6. EMIT SOCKET EVENT TO UPDATE CONSUMER UI (CRITICAL)
        const room = `bargain_${bargainId}`;
        
        // Emit final status or counter status
        io.to(room).emit("bargainStatusUpdate", {
            bargainId: bargainId,
            status: action === 'counter_offer' ? 'countered' : action,
            currentPrice: finalPrice,
            initiatedBy: 'farmer',
            timestamp: new Date().toISOString()
        });

        // Emit message content for the chat window if it was a counter
        if (action === 'counter_offer') {
             io.to(room).emit("bargainMessage", {
                bargain_id: bargainId,
                sender_role: 'farmer',
                message_content: messageContent,
                price_suggestion: finalPrice,
                message_type: 'counter_offer',
                created_at: new Date().toISOString()
            });
        }

    } catch (error) {
        await queryDatabase(`ROLLBACK`);
        console.error("Bargain SMS Processing Error:", error);
        return await sendSms(fromNumber, `System Error: Failed to process command for ${bargainId}.`);
    }
}

async function handleInboundSms(fromNumber, message, io) {
    // ... (Your handleInboundSms logic remains here, using the updated processSmsBargainUpdate) ...
    const trimmedMessage = message.trim().toUpperCase();
    
    // Find the Farmer
    const [farmer] = await queryDatabase(
        "SELECT farmer_id FROM farmerregistration WHERE phone_number = ?",
        [fromNumber]
    );

    if (!farmer) {
        return await sendSms(fromNumber, "Error: You are not a registered farmer.");
    }
    
    // Parse Commands
    const matchAccept = trimmedMessage.match(/^A\s+(\w+)$/);
    const matchReject = trimmedMessage.match(/^R\s+(\w+)$/);
    const matchCounter = trimmedMessage.match(/^C(\d+)\s+(\w+)$/);

    if (matchAccept || matchReject || matchCounter) {
        let bargainId, action, index = null;

        if (matchAccept) {
            bargainId = matchAccept[1];
            action = 'accept';
        } else if (matchReject) {
            bargainId = matchReject[1];
            action = 'reject';
        } else if (matchCounter) {
            index = parseInt(matchCounter[1]);
            bargainId = matchCounter[2];
            action = 'counter_offer';
            if (isNaN(index) || index < 0 || index > 10) {
                return await sendSms(fromNumber, `Invalid counter index C${index}. Must be C0 to C10.`);
            }
        }
        
        return await processSmsBargainUpdate(fromNumber, farmer.farmer_id, bargainId, action, index, io); 

    } else {
        return await sendSms(fromNumber, "Unrecognized command. Reply A [ID], R [ID], or C[0-10] [ID].");
    }
}


// --- EXPORTS (MUST BE AT THE VERY END) ---
module.exports = {
    sendSms,
    handleInboundSms
};