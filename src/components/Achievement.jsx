import React from "react";
import { FaTrophy } from "react-icons/fa";
import "../styles/Achievement.css";

const Achievement = ({ achievements, title = "Huy hiệu đã đạt", showViewAll = true }) => {  return (    <div className="achievements-section">
      <h1 style={{ color: "#333", fontWeight: "700" }}>{title}</h1>

      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${
              !achievement.date ? "locked" : ""
            }`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <h3>{achievement.name}</h3>
            <p>{achievement.date || "Đạt khi đủ điều kiện"}</p>
          </div>
        ))}
      </div>

      {showViewAll && <h2 style={{ color: '#2570e8' }}>Xem tất cả huy hiệu</h2>}
    </div>
  );
};

export default Achievement;
