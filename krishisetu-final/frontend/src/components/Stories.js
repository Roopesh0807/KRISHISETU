import React, { useState } from "react";
import "./Stories.css"; // Import CSS file
import story1 from "../assets/tomato.jpg";
import story2 from "../assets/chilly.jpg";
import story3 from "../assets/onion.jpg";
import story4 from "../assets/apple.jpg";

const Stories = () => {
  const [activeStory, setActiveStory] = useState(null);

  const stories = [
    { id: 1, name: "Deepika", image: story1 },
    { id: 2, name: "Krishna", image: story2 },
    { id: 3, name: "Ravi", image: story3 },
    { id: 4, name: "Aditi", image: story4 },
  ];

  return (
    <div className="stories-container">
      {stories.map((story) => (
        <div
          key={story.id}
          className={`story-card ${activeStory === story.id ? "active" : ""}`}
          onClick={() => setActiveStory(story.id)}
        >
          <img src={story.image} alt={story.name} className="story-image" />
          <p className="story-name">{story.name}</p>
        </div>
      ))}
    </div>
  );
};

export default Stories;
