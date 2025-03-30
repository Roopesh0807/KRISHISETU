// const db = require("../models"); // Import your database models
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


// Get member details by consumer_id
exports.getMemberByMemberId = async (req, res) => {
  const { memberId } = req.params;

  try {
    // Fetch member details by member_id
    const query = `
      SELECT 
        m.member_id, 
        m.member_name, 
        m.member_email, 
        m.phone_number
      FROM members m
      WHERE m.member_id = ?
    `;

    // Execute the query
    const [member] = await queryDatabase(query, [memberId]);

    if (!member || member.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(member[0]); // Return the member details
  } catch (error) {
    console.error("Error fetching member details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.getCommunityMembers = async (req, res) => {
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
};

exports.getMemberOrders = async (req, res) => {
  const { communityId, consumerId } = req.params;

  try {
    const query = `
      SELECT 
        o.order_id AS orderId,
        o.product_id AS product,
        o.quantity,
        o.price
      FROM orders o
      JOIN members m ON o.member_id = m.member_id
      WHERE o.community_id = ? AND m.consumer_id = ?;
    `;

    const orders = await queryDatabase(query, [communityId, consumerId]);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching member orders:", error);
    res.status(500).json({ error: "Error fetching member orders" });
  }
};