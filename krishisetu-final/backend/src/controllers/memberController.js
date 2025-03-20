const Member = require("../models/Member");

exports.addMember = (req, res) => {
  const { communityId, name, email, phone } = req.body;

  if (!communityId || !name || !email || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  Member.addMember({ communityId, name, email, phone }, (err, result) => {
    if (err) {
      console.error("Error adding member:", err);
      return res.status(500).json({ error: "Error adding member" });
    }

    res.status(201).json({ message: "Member added successfully" });
  });
};

exports.getMembers = (req, res) => {
  const { communityId } = req.params;
  Member.findByCommunity(communityId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching members" });
    }
    res.status(200).json(result);
  });
};

exports.removeMember = async (req, res) => {
  const { memberId, communityId } = req.params;

  if (!memberId || !communityId) {
    return res.status(400).json({ error: "Member ID and Community ID are required" });
  }

  try {
    const query = "DELETE FROM Members WHERE member_id = ? AND community_id = ?";
    const [result] = await db.execute(query, [memberId, communityId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Member not found in the specified community" });
    }

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};