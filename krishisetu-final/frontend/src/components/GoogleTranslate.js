import { useEffect } from "react";
import "./GoogleTranslator.css";
const GoogleTranslate = () => {
useEffect(() => {
  const existingScript = document.querySelector('script[src*="translate_a/element.js"]');
  if (existingScript) return;

  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  script.onerror = () => console.warn("Google Translate script failed to load.");
  document.body.appendChild(script);

  let retries = 0;
  const maxRetries = 5;

  const tryInitialize = () => {
    if (
      window.google?.translate?.TranslateElement &&
      typeof window.google.translate.TranslateElement === "function"
    ) {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,kn",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      } catch (e) {
        console.error("Google Translate init error:", e);
      }
    } else if (retries < maxRetries) {
      retries++;
      console.log(`Retrying Google Translate init (${retries}/${maxRetries})`);
      setTimeout(tryInitialize, 1000);
    } else {
      console.warn("Google Translate failed after retries.");
    }
  };

  window.googleTranslateElementInit = tryInitialize;
}, []);


  return <div id="google_translate_element" style={{ float: "right", margin: "10px" }} />;
};

export default GoogleTranslate;
