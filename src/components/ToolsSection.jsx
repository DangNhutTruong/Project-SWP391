import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ToolsSection() {
  const [tools, setTools] = useState([]);
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    // Load tools từ API backend
    loadToolsFromAPI();
    loadUserProgress();
  }, []);

  const loadToolsFromAPI = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tools');
      if (response.ok) {
        const toolsData = await response.json();
        setTools(toolsData);
      }
    } catch (error) {
      console.log('API not available, using default tools');
      // Fallback to default tools if API not available
      setTools([
        { id: 1, name: 'Your quit smoking plan', route: '/quit-smoking-plan', icon: 'fas fa-file-alt' },
        { id: 2, name: 'Cost of smoking', route: '/cost-calculator', icon: 'fas fa-calculator' },
        { id: 3, name: 'Effects of smoking on your body', route: '/smoking-effects', icon: 'fas fa-lungs' },
        { id: 4, name: 'Your quit vaping plan', route: '/quit-vaping-plan', icon: 'fas fa-file-alt' },
        { id: 5, name: 'Benefits of quitting vaping', route: '/vaping-benefits', icon: 'fas fa-plus-circle' },
        { id: 6, name: 'Effects of vaping on your body', route: '/vaping-effects', icon: 'fas fa-lungs' }
      ]);
    }
  };

  const loadUserProgress = async () => {
    try {
      const userId = localStorage.getItem('userId') || '1';
      const response = await fetch(`http://localhost:5000/api/progress/${userId}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setUserProgress(stats);
      }
    } catch (error) {
      console.log('Could not load user progress');
    }
  };

  return (
    <section className="tools-section">
      <div className="container">
        <h2>Tools and resources</h2>
        
        {userProgress && (
          <div className="progress-summary">
            <div className="mini-stats">
              {userProgress.max_days_clean > 0 && (
                <span className="mini-stat">
                  🎉 {userProgress.max_days_clean} days clean
                </span>
              )}
              {userProgress.total_money_saved > 0 && (
                <span className="mini-stat">
                  💰 ${userProgress.total_money_saved} saved
                </span>
              )}
            </div>
          </div>
        )}

        <div className="tools-grid">
          <Link to="/quit-smoking-plan" className="tool-card">
            <div className="tool-icon"><i className="fas fa-file-alt"></i></div>
            <p>Your quit smoking plan</p>
            <div className="tool-dot"></div>
          </Link>
          <Link to="/cost-calculator" className="tool-card">
            <div className="tool-icon"><i className="fas fa-calculator"></i></div>
            <p>Cost of smoking</p>
            <div className="tool-dot"></div>
          </Link>
          <Link to="/smoking-effects" className="tool-card">
            <div className="tool-icon"><i className="fas fa-lungs"></i></div>
            <p>Effects of smoking on your body</p>
            <div className="tool-dot"></div>
          </Link>
          <Link to="/quit-vaping-plan" className="tool-card">
            <div className="tool-icon"><i className="fas fa-file-alt"></i></div>
            <p>Your quit vaping plan</p>
            <div className="tool-dot"></div>
          </Link>
          <Link to="/vaping-benefits" className="tool-card">
            <div className="tool-icon"><i className="fas fa-plus-circle"></i></div>
            <p>Benefits of quitting vaping</p>
            <div className="tool-dot"></div>
          </Link>
          <Link to="/vaping-effects" className="tool-card">
            <div className="tool-icon"><i className="fas fa-lungs"></i></div>
            <p>Effects of vaping on your body</p>
            <div className="tool-dot"></div>
          </Link>
        </div>
      </div>
    </section>
  );
}