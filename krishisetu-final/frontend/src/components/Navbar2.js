import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSeedling, FaPlus, FaBell, FaUser, FaSignOutAlt, FaMicrophone } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg';
import './Navbar2.css';

const Navbar2 = () => {
  const navigate = useNavigate();
  const { farmer, logout } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const recognitionRef = useRef(null);

  // Command mappings with multiple variations
  const commandMap = {
    'home': '/farmer-dashboard',
    'dashboard': '/farmer-dashboard',
    'main page': '/farmer-dashboard',
    'add produce': '/add-produce',
    'add product': '/add-produce',
    'new produce': '/add-produce',
    'produce': '/add-produce',
    'notifications': '/notifications',
    'alerts': '/notifications',
    'profile': `/farmer/${farmer?.farmer_id}/profile`,
    'my profile': `/farmer/${farmer?.farmer_id}/profile`,
    'account': `/farmer/${farmer?.farmer_id}/profile`,
    'logout': 'logout',
    'sign out': 'logout',
    'log out': 'logout',
    'go back': 'back',
    'back': 'back',
    'previous': 'back'
  };

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-IN'; // Indian English

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      setVoiceFeedback(`You said: "${transcript}"`);
      processVoiceCommand(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setVoiceFeedback(`Error: ${event.error}. Try again.`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        recognitionRef.current.start();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const toggleVoiceCommand = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceFeedback('');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setVoiceFeedback('Listening... Speak now');
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setVoiceFeedback('Failed to start voice recognition. Please refresh and try again.');
      }
    }
  };

  const processVoiceCommand = (command) => {
    // Remove common filler words and punctuation
    const cleanCommand = command
      .replace(/\b(please|kindly|can you|i want to|go to|navigate to|open)\b/gi, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .trim();

    // Find the best matching command
    let bestMatch = '';
    let bestScore = 0;

    Object.keys(commandMap).forEach((cmd) => {
      const score = calculateMatchScore(cleanCommand, cmd);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = cmd;
      }
    });

    // Threshold for considering it a match
    if (bestScore >= 0.6) {
      setVoiceFeedback(prev => `${prev}\nAction: Going to ${bestMatch}`);
      
      setTimeout(() => {
        const destination = commandMap[bestMatch];
        if (destination === 'logout') {
          logout();
          navigate('/login');
        } else if (destination === 'back') {
          navigate(-1);
        } else {
          navigate(destination);
        }
      }, 1500);
    } else {
      setVoiceFeedback(prev => `${prev}\nSorry, I didn't understand. Try saying:\n- "Add produce"\n- "Notifications"\n- "Profile"\n- "Logout"`);
    }
  };

  // Improved matching algorithm
  const calculateMatchScore = (input, command) => {
    // Exact match
    if (input === command) return 1.0;
    
    // Contains the full command
    if (input.includes(command)) return 0.9;
    
    // Split into words and compare
    const inputWords = input.split(' ');
    const commandWords = command.split(' ');
    
    // Count matching words (order doesn't matter)
    const matchingWords = commandWords.filter(word => 
      inputWords.some(inputWord => 
        inputWord.includes(word) || word.includes(inputWord)
    ));
    
    return matchingWords.length / commandWords.length;
  };

  return (
    <nav className="navbar2">
      {/* Left Aligned: Logo and Name */}
      <div className="logo" onClick={() => navigate('/farmer-dashboard')}>
        <img src={logo} alt="KrishiSetu Logo" />
        <span className="navbar-name">KRISHISETU</span>
      </div>

      {/* Right Aligned: Icons */}
      <ul className="navbar-icons">
        {/* Voice Command */}
        <li>
        
          <button 
            onClick={toggleVoiceCommand} 
            className={`icon ${isListening ? 'voice-active' : ''}`}
            title={isListening ? 'Stop Voice Command' : 'Start Voice Command'}
          >
            <div className="icon-container">
            <FaMicrophone className="icon" />
            <span className="icon-text">Voice</span>
            </div>
          </button>
          
        </li>

        {/* Add Produce */}
        <li>
          <Link to="/add-produce" className="icon-link" title="Add Produce">
            <div className="icon-container">
              <FaSeedling className="icon" aria-label="Add Produce" />
              <FaPlus className="plus-icon" aria-label="Add" />
            </div>
            <span className="icon-text">Add Produce</span>
          </Link>
        </li>

        {/* Notifications */}
        <li>
          <Link to="/notifications" className="icon-link" title="Notifications">
            <FaBell className="icon" aria-label="Notifications" />
            <span className="icon-text">Notifications</span>
          </Link>
        </li>

        {/* Profile */}
        <li>
          <Link 
            to={`/farmer/${farmer?.farmer_id}/profile`} 
            className="icon-link" 
            title="Profile"
          >
            <FaUser className="icon" aria-label="Profile" />
            <span className="icon-text">Profile</span>
          </Link>
        </li>

        {/* Logout */}
        <li>
          <button className="icon-link logout" title="Logout" onClick={() => {
            logout();
            navigate('/LoginPage');
          }}>
            <FaSignOutAlt className="icon" aria-label="Logout" />
            <span className="icon-text">Logout</span>
          </button>
        </li>
      </ul>

      {/* Voice Feedback Overlay */}
      {isListening && (
        <div className="voice-feedback-overlay">
          <div className="voice-feedback-box">
            <div className="feedback-content">
              {voiceFeedback.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <button 
              onClick={toggleVoiceCommand} 
              className="stop-button"
            >
              Stop Listening
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar2;