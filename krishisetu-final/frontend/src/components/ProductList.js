import React from "react";

const ProduceList = ({ addedProduces }) => {
  return (
    <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd" }}>
      <h3>List of Added Produces</h3>
      {addedProduces.length > 0 ? (
        <ul>
          {addedProduces.map((product, index) => (
            <li key={index}>{product}</li>
          ))}
        </ul>
      ) : (
        <p>No produce added yet.</p>
      )}
    </div>
  );
};

export default ProduceList;
