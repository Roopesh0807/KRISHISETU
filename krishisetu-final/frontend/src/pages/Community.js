import React, { useState, useEffect, useRef } from "react";
import "./../styles/Community.css";

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [farmerCount, setFarmerCount] = useState(1);
  const chatEndRef = useRef(null); // Ref for auto-scroll

  // Farmer avatars (unique for each message)
  const farmerAvatars = [
    "https://i.pravatar.cc/40?img=10",
    "https://i.pravatar.cc/40?img=20",
    "https://i.pravatar.cc/40?img=30",
    "https://i.pravatar.cc/40?img=40",
    "https://i.pravatar.cc/40?img=50",
    "https://i.pravatar.cc/40?img=60",
    "https://i.pravatar.cc/40?img=70",
    "https://i.pravatar.cc/40?img=80",
  ];

  const handlePost = () => {
    if (postText.trim()) {
      const avatar = farmerAvatars[farmerCount % farmerAvatars.length]; // Assign an avatar
      setPosts((prevPosts) => [
        ...prevPosts,
        {
          text: postText,
          author: `Farmer ${farmerCount}`,
          avatar: avatar,
          isLeft: farmerCount % 2 !== 0, // Alternates left & right
        },
      ]);

      setPostText("");
      setFarmerCount(farmerCount + 1);
    }
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  return (
    <div className="community">
      <h2>Community Chat</h2>
      <div className="post-container">
        {posts.map((post, index) => (
          <div key={index} className={`post ${post.isLeft ? "left" : "right"}`}>
            <img src={post.avatar} alt="Profile" className="profile-pic" />
            <div className="post-content">
              <strong>{post.author}</strong>: {post.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} /> {/* Auto-scroll reference */}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
        />
        <button onClick={handlePost}>Send</button>
      </div>
    </div>
  );
};

export default Community;
