// const { queryDatabase } = require("../config/db");

// class Member {
//   // Add a new member to the community
//   static async addMember({ communityId, userId, name, email, phone }) {
//     const checkQuery = `
//       SELECT * FROM Members WHERE community_id = ? AND email = ?
//     `;

//     try {
//       // Check if the member already exists in the community
//       const existingMember = await queryDatabase(checkQuery, [communityId, email]);

//       if (existingMember.length > 0) {
//         throw new Error("Member with this email already exists in the community");
//       }

//       // Insert new member if email is unique within the community
//       const insertQuery = `
//         INSERT INTO Members (community_id, user_id, name, email, phone)
//         VALUES (?, ?, ?, ?, ?)
//       `;

//       const result = await queryDatabase(insertQuery, [communityId, userId, name, email, phone]);
//       return result;
//     } catch (error) {
//       console.error("Error adding member:", error);
//       throw error;
//     }
//   }

//   // Remove a member from the community
//   static async removeMember(memberId) {
//     const query = `DELETE FROM Members WHERE id = ?`;

//     try {
//       const result = await queryDatabase(query, [memberId]);
//       return result;
//     } catch (error) {
//       console.error("Error removing member:", error);
//       throw error;
//     }
//   }

//   // Fetch members by community ID
//   static async findByCommunity(communityId) {
//     const query = `
//       SELECT 
//         members.member_id, 
//         members.consumer_id, 
//         members.member_name AS name, 
//         members.member_email AS email, 
//         members.phone_number AS phone
//       FROM members
//       WHERE members.community_id = ?
//     `;

//     try {
//       const members = await queryDatabase(query, [communityId]);
//       return members;
//     } catch (error) {
//       console.error("Error fetching members by community ID:", error);
//       throw error;
//     }
//   }
// }

// module.exports = Member;



// const db = require("../config/db");

// class Member {
//   static async addMember({ communityId, consumerId, name, email, phone }) {
//     const checkQuery = `
//       SELECT * FROM Members WHERE community_id = ? AND consumer_id = ?
//     `;

//     try {
//       const existingMember = await db.query(checkQuery, [communityId, consumerId]);

//       if (existingMember.length > 0) {
//         throw new Error("Member already exists in the community");
//       }

//       const insertQuery = `
//         INSERT INTO Members (community_id, consumer_id, member_name, member_email, phone_number)
//         VALUES (?, ?, ?, ?, ?)
//       `;

//       const [result] = await db.query(insertQuery, [
//         communityId,
//         consumerId,
//         name,
//         email,
//         phone,
//       ]);
//       return result;
//     } catch (error) {
//       console.error("Error adding member:", error);
//       throw error;
//     }
//   }

//   static async removeMember(memberId, communityId) {
//     const query = `DELETE FROM Members WHERE member_id = ? AND community_id = ?`;

//     try {
//       const [result] = await db.query(query, [memberId, communityId]);
//       return result;
//     } catch (error) {
//       console.error("Error removing member:", error);
//       throw error;
//     }
//   }

//   static async findByCommunity(communityId) {
//     const query = `
//       SELECT 
//         members.member_id, 
//         members.consumer_id, 
//         members.member_name AS name, 
//         members.member_email AS email, 
//         members.phone_number AS phone
//       FROM members
//       WHERE members.community_id = ?
//     `;

//     try {
//       const [members] = await db.query(query, [communityId]);
//       return members;
//     } catch (error) {
//       console.error("Error fetching members by community ID:", error);
//       throw error;
//     }
//   }

//   static async getMemberByMemberId(memberId) {
//     const query = `
//       SELECT 
//         m.member_id, 
//         m.member_name, 
//         m.member_email, 
//         m.phone_number
//       FROM members m
//       WHERE m.member_id = ?
//     `;

//     try {
//       const [member] = await db.query(query, [memberId]);
//       return member[0];
//     } catch (error) {
//       console.error("Error fetching member details:", error);
//       throw error;
//     }
//   }
// }

// module.exports = Member;


const { queryDatabase } = require("../config/db");

class Member {
  static async addMember({ communityId, consumerId, name, email, phone }) {
    const checkQuery = `
      SELECT * FROM Members WHERE community_id = ? AND consumer_id = ?
    `;

    try {
      const existingMember = await queryDatabase(checkQuery, [communityId, consumerId]);

      if (existingMember.length > 0) {
        throw new Error("Member already exists in the community");
      }

      const insertQuery = `
        INSERT INTO Members (community_id, consumer_id, member_name, member_email, phone_number)
        VALUES (?, ?, ?, ?, ?)
      `;

      const [result] = await queryDatabase(insertQuery, [
        communityId,
        consumerId,
        name,
        email,
        phone,
      ]);
      return result;
    } catch (error) {
      console.error("Error adding member:", error);
      throw error;
    }
  }

  static async removeMember(memberId, communityId) {
    const query = `DELETE FROM Members WHERE member_id = ? AND community_id = ?`;

    try {
      const [result] = await queryDatabase(query, [memberId, communityId]);
      return result;
    } catch (error) {
      console.error("Error removing member:", error);
      throw error;
    }
  }

  static async findByCommunity(communityId) {
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

    try {
      const [members] = await queryDatabase(query, [communityId]);
      return members;
    } catch (error) {
      console.error("Error fetching members by community ID:", error);
      throw error;
    }
  }

  static async getMemberByMemberId(memberId) {
    const query = `
      SELECT 
        m.member_id, 
        m.member_name, 
        m.member_email, 
        m.phone_number
      FROM members m
      WHERE m.member_id = ?
    `;

    try {
      const [member] = await queryDatabase(query, [memberId]);
      return member[0];
    } catch (error) {
      console.error("Error fetching member details:", error);
      throw error;
    }
  }
}

module.exports = Member;