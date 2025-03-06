import React from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css"; // Import the CSS file

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="language-switcher">
      <label htmlFor="language-select" className="label-text">🌐</label>
      <select id="language-select" onChange={handleLanguageChange} value={i18n.language}>
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="kn">ಕನ್ನಡ</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
