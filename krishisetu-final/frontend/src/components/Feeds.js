import React, { useState } from "react";
import "./Feeds.css"; // Import CSS file
import { Heart, MessageCircle, Share2 } from "lucide-react"; // Icons from lucide-react

// Import assets
import story1 from "../assets/tomato.jpg";
import story2 from "../assets/chilly.jpg";
import story3 from "../assets/onion.jpg";
import story4 from "../assets/apple.jpg";
import logo from "../assets/logo.jpg";
import onion from "../assets/onion.jpg";

const Feed = () => {
  const [activeStory, setActiveStory] = useState(null);
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Deepika",
      title: "Fresh Organic Tomatoes",
      image: logo,
      description: "Grown with care, no chemicals used. Available now!",
      likes: 12,
      comments: 4,
      shares: 2,
    },
    {
      id: 2,
      author: "Krishna",
      title: "Organic Mangoes",
      image: onion,
      description: "Sweet and juicy organic mangoes for sale!",
      likes: 25,
      comments: 8,
      shares: 5,
    },
  ]);

  const stories = [
    { id: 1, name: "Deepika", image: story1 },
    { id: 2, name: "Krishna", image: story2 },
    { id: 3, name: "Ravi", image: story3 },
    { id: 4, name: "Aditi", image: story4 },
  ];

  // Function to handle Like button
  const handleLike = (id) => {
    setPosts(
      posts.map((post) =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  // Function to handle Share button
  const handleShare = (id) => {
    setPosts(
      posts.map((post) =>
        post.id === id ? { ...post, shares: post.shares + 1 } : post
      )
    );
    alert("Post shared successfully!");
  };

  return (
    <div className="feed-container">
      {/* Stories Section */}
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

      {/* Posts Section */}
      <div className="posts-container">
        <h2>🌿 Latest Posts</h2>
        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <img src={post.image} alt={post.title} className="post-image" />
            <div className="post-content">
              <h3>{post.title}</h3>
              <p className="post-author">By {post.author}</p>
              <p>{post.description}</p>
              <div className="post-actions">
                <button className="like-btn" onClick={() => handleLike(post.id)}>
                  <Heart size={18} /> {post.likes}
                </button>
                <button className="comment-btn">
                  <MessageCircle size={18} /> {post.comments}
                </button>
                <button className="share-btn" onClick={() => handleShare(post.id)}>
                  <Share2 size={18} /> {post.shares}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
