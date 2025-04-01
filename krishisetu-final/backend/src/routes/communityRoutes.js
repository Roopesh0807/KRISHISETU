// const express = require("express");
// const communityController = require("../controllers/communityController");

// const router = express.Router();

// router.post("/create", communityController.createCommunity);
// router.get("/:communityId", communityController.getCommunityDetails);
// router.get("/:communityId/members", communityController.getCommunityMembers);
// router.post("/:communityId/add-member", communityController.addMember);
// //router.delete("/:communityId/remove-member/:memberId", communityController.removeMember);
// router.delete("/community/:memberId/remove-member", communityController.removeMember);

// router.put("/:communityId/update-details", communityController.updateCommunityDetails);
// router.post("/join", communityController.joinCommunity);

// module.exports = router;

const express = require("express");
const communityController = require("../controllers/communityController");

const router = express.Router();

router.post("/create", communityController.createCommunity);
router.get("/:communityId", communityController.getCommunityDetails);
router.get("/:communityId/members", communityController.getCommunityMembers);
router.post("/:communityId/add-member", communityController.addMember);
router.delete("/:communityId/remove-member/:memberId", communityController.removeMember); // Corrected route
router.put("/:communityId/update-details", communityController.updateCommunityDetails);
router.post("/join", communityController.joinCommunity);
router.post('/verify-access', communityController.verifyCommunityAccess);
// Add this route in communityRoutes.js
// router.get("/:communityId/member/:memberId", communityController.getMemberOrders);
// Update this in communityRoutes.js
router.get("/:communityId/member/:memberId/orders", communityController.getMembersOrders);
router.get('/consumer/:consumerId/communities', communityController.getConsumerCommunities);
router.get("/community/create", async (req, res) => {
    try {
      const query = "SELECT * FROM communities";
      const communities = await queryDatabase(query);
  
      res.status(200).json({
        success: true,
        message: "Communities fetched successfully",
        data: communities,
      });
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });
  
  // POST to create a new community
  router.post("/community/create", async (req, res) => {
    const { name, password, adminId } = req.body;
  
    if (!name || !password || !adminId) {
      return res.status(400).json({ error: "Name, password, and adminId are required" });
    }
  
    try {
      const query = `
        INSERT INTO communities (name, password, admin_id)
        VALUES (?, ?, ?)
      `;
      const result = await queryDatabase(query, [name, password, adminId]);
  
      res.status(201).json({
        success: true,
        message: "Community created successfully",
        communityId: result.insertId,
      });
    } catch (error) {
      console.error("Error creating community:", error);
      res.status(500).json({ error: "Failed to create community" });
    }
  });

  router.post("/join", async (req, res) => {
    const { communityName, password, userEmail } = req.body;
  
    try {
      // Check if the community exists
      const communityQuery = "SELECT * FROM communities WHERE name = ? AND password = ?";
      const [community] = await queryDatabase(communityQuery, [communityName, password]);
  
      if (!community) {
        return res.status(404).json({ error: "Community not found or invalid password" });
      }
  
      // Fetch the consumerId for the logged-in user using their email
      const consumerQuery = "SELECT consumer_id, name, email, phone FROM consumers WHERE email = ?";
      const [consumer] = await queryDatabase(consumerQuery, [userEmail]);
  
      if (!consumer) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Add the user to the community members table
      const addMemberQuery = `
        INSERT INTO members (community_id, consumer_id, member_name, member_email, phone_number)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await queryDatabase(addMemberQuery, [
        community.community_id,
        consumer.consumer_id,
        consumer.name,
        consumer.email,
        consumer.phone,
      ]);
  
      // Debugging: Log the inserted memberId
      console.log("Inserted memberId:", result.insertId);
  
      // Return the communityId and memberId
      res.status(200).json({
        message: "Joined community successfully",
        communityId: community.community_id,
        memberId: result.insertId, // Ensure memberId is returned
      });
    } catch (error) {
      console.error("Error joining community:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get("/:communityId/members", async (req, res) => {
    const { communityId } = req.params;
  
    try {
      const query = `
        SELECT 
          members.member_id, 
          members.consumer_id, 
          members.member_name AS name, 
          members.member_email AS email, 
          members.phone_number AS phone
        FROM members
        WHERE members.community_id = ?
      `;
  
      const result = await queryDatabase(query, [communityId]);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching community members:", error);
      res.status(500).json({ error: "Error fetching community members" });
    }
  });


  router.get("/member/:memberId", async (req, res) => {
    const { memberId } = req.params;
  
    try {
      const query = `
        SELECT 
          orders.order_id,
          orders.product_id,
          orders.quantity,
          orders.price
        FROM orders
        WHERE orders.member_id = ?
      `;
  
      const orders = await queryDatabase(query, [memberId]);
      res.status(200).json({ orders });
    } catch (error) {
      console.error("Error fetching member details:", error);
      res.status(500).json({ error: "Error fetching member details" });
    }
  });


// Simplified routes for testing
router.get("/test/:communityId", async (req, res) => {
  try {
    const { communityId } = req.params;
    const query = `
      SELECT 
        c.community_id,
        c.community_name,
        c.address,
        c.delivery_date,
        c.delivery_time,
        CONCAT(cr.first_name, ' ', cr.last_name) AS admin_name
      FROM Communities c
      JOIN consumerregistration cr ON c.admin_id = cr.consumer_id
      WHERE c.community_id = ?
    `;
    const [result] = await queryDatabase(query, [communityId]);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// // Add this route to communityRoutes.js

// Add this route to verify email matches consumer ID
router.post("/verify-email", async (req, res) => {
  const { consumerId, email } = req.body;

  try {
    const query = "SELECT email FROM consumerregistration WHERE consumer_id = ?";
    const [user] = await queryDatabase(query, [consumerId]);

    if (!user) {
      return res.status(404).json({ match: false, error: "User not found" });
    }

    if (user.email !== email) {
      return res.json({ match: false });
    }

    res.json({ match: true });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;