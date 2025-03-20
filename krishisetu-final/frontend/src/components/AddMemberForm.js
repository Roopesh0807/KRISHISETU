import React, { useState } from 'react';
import '../styles/AddMemberForm.css';

function AddMemberForm({ onAddMember, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddMember({ name, email, phone });
    onClose();
  };

  return (
    <div className="krishi-add-member-form">
      <div className="krishi-form-container">
        <h2>Add New Member</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Member Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="krishi-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="krishi-input"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="krishi-input"
            required
          />
          <div className="krishi-button-group">
            <button type="submit" className="krishi-submit-button">Add Member</button>
            <button type="button" onClick={onClose} className="krishi-cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMemberForm;