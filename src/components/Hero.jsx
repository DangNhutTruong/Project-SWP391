import { useState } from 'react';

const journeys = [
  "I'm thinking about quitting",
  "I'm ready to work out how to quit",
  "I need help to stay on track",
  "I'm smoking or vaping again",
  "I'm helping someone I know quit"
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(2);

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>Wherever you are on your<br />quitting journey,</h1>
          <h2>Quit is here to help.</h2>
          <div className="button-list">
            {journeys.map((text, idx) => (
              <button
                key={idx}
                className={`journey-btn ${activeIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveIndex(idx)}
              >
                <span className="arrow">›</span> {text}
              </button>
            ))}
          </div>
        </div>
        <div className="hero-image">
          <img src="image/hero/quit-smoking-2.png" alt="Student with backpack" />
        </div>
      </div>
    </section>
  );
}
