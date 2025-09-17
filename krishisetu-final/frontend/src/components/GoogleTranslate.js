// GoogleTranslate.js
import { useEffect, useRef } from "react";
import "./GoogleTranslator.css";

const GoogleTranslate = () => {
  const translateElementRef = useRef(null);
  const hideIntervalRef = useRef(null); // Ref to store the interval ID

  // Function to aggressively hide the Google Translate banner iframe
  const aggressivelyHideGoogleTranslateBar = () => {
    // These are common selectors for the banner iframe.
    // We try to cover different potential Google-injected elements.
    const selectors = [
      '.goog-te-banner-frame', // Main banner iframe class
      'iframe[src*="translate.google.com/translate_static/css/"]', // Iframe based on source
      'body > .skiptranslate.goog-te-spinner-pos', // Main div for the banner
      '#goog-gt-vt', // Another possible ID for the top bar
      '.VIpgJd-yAWLgf' // Another class Google uses for the top bar
    ];

    let hiddenCount = 0;
    selectors.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        // Apply inline styles directly and forcefully
        element.style.setProperty('display', 'none', 'important');
        element.style.setProperty('visibility', 'hidden', 'important');
        element.style.setProperty('height', '0px', 'important');
        element.style.setProperty('min-height', '0px', 'important');
        element.style.setProperty('overflow', 'hidden', 'important');
        element.style.setProperty('border', 'none', 'important');
        element.style.setProperty('margin', '0px', 'important');
        element.style.setProperty('padding', '0px', 'important');
        hiddenCount++;
      }
    });

    if (hiddenCount > 0) {
      console.log(`Google Translate banner hidden. Elements found: ${hiddenCount}`);
    }
  };

  useEffect(() => {
    // --- Google Translate Widget Initialization Logic ---
    const existingScript = document.querySelector(
      'script[src*="translate.google.com/translate_a/element.js"]'
    );

    const tryInitialize = () => {
      if (
        window.google?.translate?.TranslateElement &&
        typeof window.google.translate.TranslateElement === "function"
      ) {
        const targetElement = document.getElementById("google_translate_element");
        if (targetElement) {
          if (!targetElement.querySelector(".goog-te-combo")) {
            try {
              new window.google.translate.TranslateElement(
                {
                  pageLanguage: "en",
                  includedLanguages: "en,hi,kn",
                  layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false, // Prevents the full translation banner from appearing initially
                },
                "google_translate_element"
              );
              console.log("Google Translate dropdown initialized successfully.");
            } catch (e) {
              console.error("Google Translate initialization error:", e);
            }
          }
        } else {
          console.warn("Target element #google_translate_element not found. Retrying initialization...");
          setTimeout(tryInitialize, 500);
        }
      } else {
        console.log("Google Translate API not ready. Retrying...");
        setTimeout(tryInitialize, 500);
      }
    };

    // Assign the initialization function to the global window object.
    window.googleTranslateElementInit = tryInitialize;

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () => console.warn("Google Translate script failed to load.");
      document.body.appendChild(script);
    } else {
      tryInitialize();
    }

    // Start the continuous hiding interval
    // This interval will run periodically to ensure the banner is hidden
    if (hideIntervalRef.current) {
      clearInterval(hideIntervalRef.current); // Clear any existing interval
    }
    hideIntervalRef.current = setInterval(aggressivelyHideGoogleTranslateBar, 200); // Check and hide every 200ms

    // --- Draggable Functionality Logic (from previous versions) ---
    const element = translateElementRef.current;
    if (!element) return;

    let isDragging = false;
    let offsetX, offsetY;

    const savedPosition = localStorage.getItem('googleTranslatePosition');
    if (savedPosition) {
      const { top, left } = JSON.parse(savedPosition);
      element.style.top = `${top}px`;
      element.style.left = `${left}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    }

    const onMouseDown = (e) => {
      // Prevent dragging if clicking directly on the dropdown or its arrow
      if (e.target.closest('.goog-te-combo') || e.target.closest('.VIpgJd-ZVi9od-xl07Ob-LgbsSe-Bz112c')) {
        return;
      }
      isDragging = true;
      offsetX = e.clientX - element.getBoundingClientRect().left;
      offsetY = e.clientY - element.getBoundingClientRect().top;
      element.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft + rect.width > viewportWidth) newLeft = viewportWidth - rect.width;
      if (newTop + rect.height > viewportHeight) newTop = viewportHeight - rect.height;

      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    };

    const onMouseUp = () => {
      isDragging = false;
      element.style.cursor = 'grab';
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';
      const { top, left } = element.getBoundingClientRect();
      localStorage.setItem('googleTranslatePosition', JSON.stringify({ top, left }));
    };

    element.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Cleanup function: runs when the component unmounts
    return () => {
      clearInterval(hideIntervalRef.current); // Stop the hiding interval
      delete window.googleTranslateElementInit; // Clean up global callback
      if (element) { // Ensure element exists before removing listeners
        element.removeEventListener('mousedown', onMouseDown);
      }
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return <div id="google_translate_element" ref={translateElementRef} />;
};

export default GoogleTranslate;
