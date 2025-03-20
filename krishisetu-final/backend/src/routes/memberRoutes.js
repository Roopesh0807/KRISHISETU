const express = require("express");
const memberController = require("../controllers/memberController");

const router = express.Router();
const app = express();
router.post("/add-member", memberController.addMember);
router.get("/:communityId", memberController.getMembers);
//router.delete("/remove-member/:memberId", memberController.removeMember);
router.delete("/:communityId/remove-member/:memberId", memberController.removeMember);
router.delete("/:id", memberController.removeMember);


// router.delete("/community/:memberId/remove-member", async (req, res) => {
//     const { memberId } = req.params;
  
//     if (!memberId) {
//       return res.status(400).json({ error: "Member ID is required" });
//     }
  
//     try {
//       const result = await db.query("DELETE FROM Members WHERE id = ?", [memberId]);
      
//       if (result.affectedRows === 0) {
//         return res.status(404).json({ error: "Member not found" });
//       }
  
//       res.json({ message: "Member removed successfully!" });
//     } catch (error) {
//       console.error("Error deleting member:", error);
//       res.status(500).json({ error: "Server error while deleting member" });
//     }
//   });
  
// app.delete('/remove-member/:memberId', async (req, res) => {
//     const { memberId } = req.params;

//     try {
//         console.log(`Attempting to remove member with ID: ${memberId}`);

//         const query = 'DELETE FROM Members WHERE member_id = ?';
//         const result = await db.execute(query, [memberId]);

//         if (result.affectedRows > 0) {
//             res.json({ success: true, message: "Member removed successfully" });
//         } else {
//             res.status(404).json({ success: false, message: "Member not found or already removed" });
//         }
//     } catch (error) {
//         console.error("Error removing member:", error);
//         res.status(500).json({ success: false, message: "Server error while removing member" });
//     }
// });

module.exports = router;