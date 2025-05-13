// components/VoiceCommand.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const VoiceCommand = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [action, setAction] = useState('');
  const navigate = useNavigate();

  // Command mappings
  const commandMap = {
    'home': '/farmer-dashboard',
    'dashboard': '/farmer-dashboard',
    'Riviews':'/farmers/my-reviews',
    'Riview':'/farmers/my-reviews',
    'add produce': '/add-produce',
    'add product': '/add-produce',
    'produce': '/add-produce',
    'notification': '/notifications',
    'notifications': '/notifications',
    'profile': '/profile',
    'my profile': '/profile',
    'logout': '/login',
    'log out': '/login',
    'go back': -1,
    'back': -1
  };

  useEffect(() => {
    let recognition;
    if (isListening && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // For Indian English, can be changed to local language codes

      recognition.onstart = () => {
        setTranscript('Listening...');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        setTranscript(`You said: "${transcript}"`);
        
        // Find the best matching command
        let bestMatch = '';
        let bestScore = 0;
        
        Object.keys(commandMap).forEach((command) => {
          // Simple similarity check
          const score = calculateSimilarity(transcript, command);
          if (score > bestScore && score > 0.6) { // Threshold for matching
            bestScore = score;
            bestMatch = command;
          }
        });
        
        if (bestMatch) {
          setAction(`Action: Navigating to "${bestMatch}"`);
          setTimeout(() => {
            const destination = commandMap[bestMatch];
            if (typeof destination === 'number') {
              navigate(destination); // For go back
            } else if (destination === '/login') {
              // Handle logout
              localStorage.removeItem('farmer');
              navigate(destination);
            } else {
              navigate(destination);
            }
          }, 1500);
        } else {
          setAction('Action: Command not recognized. Please try again.');
        }
      };

      recognition.onerror = (event) => {
        setTranscript(`Error occurred: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) {
          // Restart listening if still active
          recognition.start();
        }
      };

      recognition.start();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening]);

  const calculateSimilarity = (str1, str2) => {
    // Simple similarity calculation
    const set1 = new Set(str1.split(' '));
    const set2 = new Set(str2.split(' '));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    return intersection.size / Math.max(set1.size, set2.size);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTranscript('');
      setAction('');
    }
  };

  return (
    <div className="voice-command-container">
      <button 
        onClick={toggleListening} 
        className={`voice-command-btn ${isListening ? 'active' : ''}`}
        title={isListening ? 'Stop Voice Command' : 'Start Voice Command'}
      >
        {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
        <span className="icon-text">Voice</span>
      </button>
      
      {isListening && (
        <div className="voice-feedback">
          <p>{transcript}</p>
          <p>{action}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceCommand;