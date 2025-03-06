// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Sidebar.css'; // Styling for the sidebar

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const [isOpen, setIsOpen] = useState(false); // Sidebar closed by default

//   // Toggle Sidebar
//   const toggleSidebar = () => {
//     setIsOpen(!isOpen);
//   };

//   // Handle right-click to close sidebar
//   const handleRightClick = (e) => {
//     e.preventDefault(); // Prevent default right-click context menu
//     setIsOpen(false); // Close sidebar
//   };

//   return (
//     <>
//       {/* Left Vertical Bar (Open on Left Click) */}
//       <div
//         className="vertical-bar left-bar"
//         onClick={toggleSidebar} // Open on left click
//         title="Click to open sidebar" // Tooltip for left bar
//       ></div>

//       {/* Sidebar */}
//       <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
//         {/* Sidebar Content */}
//         <div className="sidebar-content">
//           {/* Sidebar Header with Toggle Button */}
//           <div className="sidebar-header">
//             <h2>{isOpen ? 'Farmer Dashboard' : '☰'}</h2>
//             {isOpen && (''
//               // <button className="toggle-btn" onClick={toggleSidebar}>
              
//               // </button>
//             )}
//           </div>

//           {/* Sidebar Buttons */}
//           <button onClick={() => navigate('/farmer-dashboard')} title="Dashboard">
//             {isOpen ? 'Dashboard' : '🏠'}
//           </button>
//           <button onClick={() => navigate('/view-profile')} title="View Profile">
//             {isOpen ? 'View Profile' : '👤'}
//           </button>
//           <button onClick={() => navigate('/order-review')} title="Order Review">
//             {isOpen ? 'Order Review' : '📝'}
//           </button>
//           <button onClick={() => navigate('/bargain_farmer')} title="Bargain">
//             {isOpen ? 'Bargain' : '💬'}
//           </button>
//           <button onClick={() => navigate('/community')} title="Community">
//             {isOpen ? 'Community' : '👥'}
//           </button>
//           <button onClick={() => navigate('/help')} title="Help and Support">
//             {isOpen ? 'Help and Support' : '❓'}
//           </button>
//         </div>
//       </div>

//       {/* Right Vertical Bar (Close on Right Click) */}
//       <div
//         className="vertical-bar right-bar"
//         onContextMenu={handleRightClick} // Close on right click
//         title="Right-click to close sidebar" // Tooltip for right bar
//       ></div>
//     </>
//   );
// };

// export default Sidebar;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css'; // Styling for the sidebar

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Sidebar closed by default
  const [showCommunity, setShowCommunity] = useState(false);

  // Function to navigate to Bargain Chat
  // const handleBargainClick = () => {
  //   const farmerId = 1; // Replace with actual logged-in farmer ID
  //   navigate(`/chat/${farmerId}`);
  // };

  // Function to open Plant Disease Detection in a new tab
  const handlePlantDiseaseClick = () => {
    window.open(
      'https://plant-disease-detection-system-for-sustainable-agriculture-yg2.streamlit.app/',
      '_blank'
    );
  };

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Handle right-click to close sidebar
  const handleRightClick = (e) => {
    e.preventDefault(); // Prevent default right-click context menu
    setIsOpen(false); // Close sidebar
  };

  return (
    <>
      {/* Left Vertical Bar (Open on Left Click) */}
      <div
        className="vertical-bar left-bar"
        onClick={toggleSidebar} // Open on left click
        title="Click to open sidebar" // Tooltip for left bar
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Sidebar Content */}
        <div className="sidebar-content">
          {/* Sidebar Header with Toggle Button */}
          <div className="sidebar-header">
            <h2>{isOpen ? 'Farmer Dashboard' : '☰'}</h2>
          </div>

          {/* Sidebar Buttons */}
          <button onClick={() => navigate('/farmer-dashboard')} title="Dashboard">
            {isOpen ? 'Dashboard' : '🏠'}
          </button>
          <button onClick={() => navigate('/view-profile')} title="View Profile">
            {isOpen ? 'View Profile' : '👤'}
          </button>
          <button onClick={() => navigate('/order-review')} title="Order Review">
            {isOpen ? 'Order Review' : '📝'}
          </button>
          <button onClick={() => navigate('/bargain_farmer')} title="Bargain">
            {isOpen ? 'Bargain' : '💬'}
          </button>
          

          {/* Plant Disease Detection Button */}
          <button onClick={handlePlantDiseaseClick} title="Plant Disease Detection">
            {isOpen ? 'Plant Disease Detection' : '🌱'}
          </button>

          {/* Farmer's Community Button */}
{/* Farmer's Community Button */}
<button onClick={() => setShowCommunity(!showCommunity)} title="Farmer's Community">
  {isOpen ? "Farmer's Community" : '👥'}
</button>

{/* Farmer's Community Overlay */}
{showCommunity && (
  <div className="community-overlay active">
    <button className="close-btn" onClick={() => setShowCommunity(false)}>Close</button>
    <iframe
      src="https://farmer-s-community.onrender.com"
      className="community-iframe"
      title="Farmer's Community"
    ></iframe>


  </div>
)}

<button onClick={() => navigate('/help')} title="Help and Support">
            {isOpen ? 'Help and Support' : '❓'}
          </button>

        </div>
      </div>

     
      {/* Right Vertical Bar (Close on Right Click) */}
      <div
        className="vertical-bar right-bar"
        onContextMenu={handleRightClick} // Close on right click
        title="Right-click to close sidebar" // Tooltip for right bar
      ></div>
    </>
  );
};

export default Sidebar;
