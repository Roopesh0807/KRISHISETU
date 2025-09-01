import React, { useState, useEffect, useContext } from 'react';
import Joyride from 'react-joyride';
import { FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './OnboardingTour.css';

const FarmerOnboardingTour = () => {
    const [runTour, setRunTour] = useState(false);
    const [showRestartButton, setShowRestartButton] = useState(false);
    const navigate = useNavigate();
    const { farmer } = useContext(AuthContext); // Access the farmer object from context

    const FinalStepContent = () => (
        <div className="final-step-content">
            <p className="final-step-text">
                That's it! You're all set to start your journey with Krishisetu. We’re excited to help you grow your profits. Happy farming!
                <br /><br />
                Now, please fill out your profile first. It’s a crucial step to get your farm up and running.
            </p>
            <div className="final-step-buttons">
                <button 
                    onClick={() => {
                        handleTourEnd({ action: 'custom', status: 'finished' });
                        // Use the dynamic farmer ID for correct navigation
                        if (farmer?.farmer_id) {
                            navigate(`/farmer/${farmer.farmer_id}/profile`);
                        }
                    }}
                    className="go-to-profile-btn"
                >
                    Go to Profile
                </button>
                <button 
                    onClick={() => handleTourEnd({ action: 'custom', status: 'finished' })}
                    className="fill-later-btn"
                >
                    Fill Later
                </button>
            </div>
        </div>
    );

    const tourSteps = [
        // Step 1: Dashboard (in Sidebar) - The starting point
        {
            target: '#dashboard-tour-target',
            content: "Hey there! Welcome to your home base. From here, you can see all your farm's activity at a glance. Let's get you set up!",
            placement: 'right',
            title: 'Welcome to your Dashboard!',
            disableBeacon: true, 
        },
        // Step 2: Profile (in Navbar) - First and most important action
        {
            target: 'li a[title="Profile"]',
            content: "First things first, let's complete your profile. It's important to add your personal and farm details so you can receive payments and build trust with buyers. Just click here!",
            placement: 'bottom',
            title: 'Complete Your Profile',
        },
        // Step 3: Add Produce (in Navbar) - The core function
        {
            target: 'li a[title="Add Produce"]',
            content: "Ready to sell? This is where the magic happens! Click 'Add Produce' to list your harvest on the marketplace and start connecting with consumers.",
            placement: 'bottom',
            title: 'Add Your Produce',
        },
        // Step 4: Bargain (in Sidebar) - A unique feature
        {
            target: '.fa-handshake',
            content: "You're in control! Head over to the 'Bargain' section to directly negotiate prices with buyers. You can accept their offer, reject it, or make a counter-offer.",
            placement: 'right',
            title: 'Bargain Directly',
        },
        // Step 5: Plant Health (in Sidebar) - A loss-prevention tool
        {
            target: '.fa-leaf',
            content: "Don't let disease ruin your harvest. Use our 'Plant Health' tool to upload a photo of your crop, get a diagnosis, and find the right solution to save your plants.",
            placement: 'right',
            title: 'Check Your Plant Health',
        },
        // Step 6: Farmer Community (in Sidebar) - Fostering community
        {
            target: '.fa-users',
            content: "Connect with fellow farmers! Join the 'Community' to share knowledge, ask questions, and support each other. You're not alone in this.",
            placement: 'right',
            title: "Join the Farmer's Community",
        },
        // Step 7: My Reviews (in Sidebar) - Building reputation
        {
            target: '.fa-star',
            content: "Keep track of your success here. Check out the reviews from your customers to see what they love and build a strong reputation.",
            placement: 'right',
            title: 'See Your Reviews',
        },
        // Step 8: Notifications (in Navbar) - Staying informed
        {
            target: 'li a[title="Notifications"]',
            content: "Always stay in the loop! This is your notification center where you'll get updates on new orders, messages, and other important alerts.",
            placement: 'bottom',
            title: 'Stay Notified',
        },
        // Step 9: Voice Controls (in Navbar) - A final tip for convenience
        {
            target: 'li button[title^="Start Voice"]',
            content: "One last thing! For a super-easy experience, use your voice to navigate the site. Just click the mic icon and speak a command. Give it a try!",
            placement: 'bottom',
            title: 'Quick Navigation with Voice',
        },
        // Step 10: Final Custom Step
        {
            target: 'body',
            content: <FinalStepContent />,
            placement: 'center',
            title: "You're Ready to Go!",
            disableClose: true, 
            showProgress: false, 
            showButtons: false, 
        }
    ];

    useEffect(() => {
        const hasCompletedTour = localStorage.getItem('krishisetu_farmer_tour_completed');
        
        if (!hasCompletedTour) {
            const timer = setTimeout(() => {
                setRunTour(true);
            }, 500); 
            return () => clearTimeout(timer); 
        } else {
            setShowRestartButton(true);
        }
    }, []);

    const handleTourEnd = (data) => {
        const { action, status } = data;
        
        if (action === 'close' || status === 'finished' || status === 'skipped' || status === 'custom') {
            localStorage.setItem('krishisetu_farmer_tour_completed', 'true');
            setRunTour(false);
            setShowRestartButton(true);
        }
    };

    const restartTour = () => {
        localStorage.removeItem('krishisetu_farmer_tour_completed');
        setShowRestartButton(false);
        setRunTour(true);
    };
    
    return (
        <>
            <Joyride
                steps={tourSteps}
                run={runTour}
                continuous={true}
                showProgress={true}
                showSkipButton={true}
                callback={handleTourEnd}
                styles={{
                    options: { zIndex: 10000, primaryColor: '#2b9047' },
                    tooltip: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                    button: { borderRadius: '4px' },
                }}
            />
            {showRestartButton && (
                <button className="tour-restart-btn" onClick={restartTour}>
                    <FaInfoCircle />
                </button>
            )}
        </>
    );
};

export default FarmerOnboardingTour;