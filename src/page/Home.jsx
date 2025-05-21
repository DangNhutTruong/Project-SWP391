import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import ScrollDown from '../components/ScrollDown.jsx';
import CallSection from '../components/CallSection.jsx';
import FocusSection from '../components/FocusSection.jsx';
import ToolsSection from '../components/ToolsSection.jsx';
import StartSection from '../components/StartSection.jsx';
import ExploreSection from '../components/ExploreSection.jsx';
import BackToTop from '../components/BackToTop.jsx';

/**
 * Home - Trang chủ của ứng dụng
 * 
 * Trang này hiển thị tất cả các thành phần chính của trang landing page
 * và chứa các liên kết đến các trang khác trong ứng dụng.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <ScrollDown />
      <CallSection />
      <FocusSection />
      <ToolsSection />
      <StartSection />
      <ExploreSection />
      <BackToTop />
    </>
  );
}