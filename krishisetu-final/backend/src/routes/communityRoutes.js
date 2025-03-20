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
module.exports = router;