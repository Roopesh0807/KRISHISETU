const Community = require("../models/Community");
const Member = require("../models/Member");
const User = require("../models/User");
const { queryDatabase } = require('../config/db'); // Adjust the path if needed

// ✅ Create Community
exports.createCommunity = async (req, res) => {
  try {
    const { name, password, adminId } = req.body;

    if (!name || !password || !adminId) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const query = `INSERT INTO Communities (name, password, admin_id) VALUES (?, ?, ?)`;
    const result = await queryDatabase(query, [name, password, adminId]);

    res.status(201).json({
      message: "Community created successfully!",
      id: result.insertId
    });
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get Community Details
exports.getCommunityDetails = async (req, res) => {
  const { communityId } = req.params;

  try {
    const query = `
      SELECT 
        Communities.*,
        Users.name AS admin_name
      FROM Communities
      JOIN Users ON Communities.admin_id = Users.id
      WHERE Communities.id = ?
    `;
    const result = await queryDatabase(query, [communityId]);

    if (result.length === 0) {
      return res.status(404).json({ error: "Community not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error fetching community details:", error);
    res.status(500).json({ error: "Error fetching community details" });
  }
};

// ✅ Get Community Members
exports.getCommunityMembers = async (req, res) => {
  const { communityId } = req.params;

  try {
    const query = `
      SELECT 
        Members.id,
        Members.name,
        Members.phone
      FROM Members
      WHERE Members.community_id = ?
    `;
    const result = await queryDatabase(query, [communityId]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching community members:", error);
    res.status(500).json({ error: "Error fetching community members" });
  }
};

// ✅ Add Member to Community
exports.addMember = async (req, res) => {
  const { communityId, userId, name, email, phone } = req.body;

  if (!communityId || !userId || !name || !email || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if user exists
    const userResult = await queryDatabase("SELECT * FROM Users WHERE email = ?", [email]);

    let userIdToUse = userId;

    if (userResult.length === 0) {
      // If user doesn't exist, create a new user
      const newUser = await queryDatabase(
        "INSERT INTO Users (name, email, phone) VALUES (?, ?, ?)",
        [name, email, phone]
      );
      userIdToUse = newUser.insertId;
    } else {
      userIdToUse = userResult[0].id;
    }

    // Add member to the community
    const memberResult = await queryDatabase(
      "INSERT INTO Members (community_id, user_id, name, email, phone) VALUES (?, ?, ?, ?, ?)",
      [communityId, userIdToUse, name, email, phone]
    );

    res.status(201).json({
      message: "Member added successfully",
      memberId: memberResult.insertId
    });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Error adding member" });
  }
};

// ✅ Remove Member from Community
exports.removeMember = async (req, res) => {
  const { communityId, memberId } = req.params;

  if (!communityId || !memberId) {
    return res.status(400).json({ error: "Community ID and Member ID are required" });
  }

  try {
    const query = "DELETE FROM Members WHERE id = ? AND community_id = ?";
    const result = await queryDatabase(query, [memberId, communityId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Member not found in the specified community" });
    }

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Error removing member" });
  }
};

// ✅ Update Community Details
exports.updateCommunityDetails = async (req, res) => {
  const { communityId } = req.params;
  const { address, deliveryDate, deliveryTime } = req.body;

  if (!address || !deliveryDate || !deliveryTime) {
    return res.status(400).json({ error: "All fields are required: address, deliveryDate, deliveryTime" });
  }

  try {
    const query = `
      UPDATE Communities 
      SET address = ?, delivery_date = ?, delivery_time = ? 
      WHERE id = ?
    `;
    await queryDatabase(query, [address, deliveryDate, deliveryTime, communityId]);

    res.status(200).json({ message: "Community details updated successfully" });
  } catch (error) {
    console.error("Error updating community details:", error);
    res.status(500).json({ error: "Error updating community details" });
  }
};

// ✅ Join Community
exports.joinCommunity = async (req, res) => {
  const { communityName, password, userEmail } = req.body;

  if (!communityName || !password || !userEmail) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const userResult = await queryDatabase("SELECT * FROM Users WHERE email = ?", [userEmail]);

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    const user = userResult[0];

    const communityResult = await queryDatabase("SELECT * FROM Communities WHERE name = ?", [communityName]);

    if (communityResult.length === 0) {
      return res.status(404).json({ error: "Community not found" });
    }

    const community = communityResult[0];

    if (community.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const memberResult = await queryDatabase(
      "SELECT * FROM Members WHERE community_id = ? AND user_id = ?",
      [community.id, user.id]
    );

    if (memberResult.length > 0) {
      return res.status(400).json({ error: "User is already a member of this community" });
    }

    await queryDatabase(
      "INSERT INTO Members (community_id, user_id, name, email, phone) VALUES (?, ?, ?, ?, ?)",
      [community.id, user.id, user.name, user.email, user.phone]
    );

    res.status(200).json({
      message: "Joined community successfully",
      communityId: community.id
    });
  } catch (error) {
    console.error("Error joining community:", error);
    res.status(500).json({ error: "Error joining community" });
  }
};
