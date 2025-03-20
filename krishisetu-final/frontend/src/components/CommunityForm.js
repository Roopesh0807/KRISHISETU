import React, { useState, useEffect } from 'react';
import '../styles/CommunityForm.css';

function CommunityForm({ type, onSubmit }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [communityMembers, setCommunityMembers] = useState([]); // Ensure it's an array

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, password, confirmPassword, userId });
  };

  useEffect(() => {
    fetch('/api/community/members')
      .then(response => response.json())
      .then(data => setCommunityMembers(data || [])) // Ensure data is an array
      .catch(error => {
        console.error("Error fetching members:", error);
        setCommunityMembers([]); // Set to an empty array on error
      });
  }, []);

  return (
    <form className="community-form" onSubmit={handleSubmit}>
      <h2>{type === 'create' ? 'Create Community' : 'Join Community'}</h2>
      <input
        type="text"
        placeholder="Community Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {type === 'create' && (
        <>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </>
      )}
      <button type="submit">{type === 'create' ? 'Create Community' : 'Join Community'}</button>
    </form>
  );
}

export default CommunityForm;