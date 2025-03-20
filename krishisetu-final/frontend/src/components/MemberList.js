import React from 'react';
import '../styles/MemberList.css';

function MemberList({ members }) {
  if (!members || !Array.isArray(members)) {
    return <p>No members available.</p>; // Handle undefined or non-array values
  }
  console.log("Members data:", members);

  return (
    <div className="member-list">
      {members.length === 0 ? (
        <p>No members in this community.</p>
      ) : (
        members.map((member, index) => (
          <div key={index} className="member">
            <p>{member.name} - {member.phoneNumber}</p>
            <button>Remove Member</button>
          </div>
        ))
      )}
    </div>
  );
}


export default MemberList;