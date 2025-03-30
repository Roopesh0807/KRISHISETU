import React from 'react';

const PriceSuggestions = ({ basePrice, onSelect, actionText = 'Offer' }) => {
  const suggestions = [
    { amount: -4, label: '₹' + (basePrice - 4) },
    { amount: -2, label: '₹' + (basePrice - 2) },
    { amount: +2, label: '₹' + (basePrice + 2) },
    { amount: +4, label: '₹' + (basePrice + 4) },
  ].filter(s => (basePrice + s.amount) > 0); // Filter out negative prices

  return (
    <div className="price-suggestions">
      <h4>Suggested Prices:</h4>
      <div className="suggestion-buttons">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(basePrice + suggestion.amount)}
            className="suggestion-btn"
          >
            {actionText} {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriceSuggestions;