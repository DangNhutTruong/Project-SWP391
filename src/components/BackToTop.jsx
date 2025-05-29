import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(true); // Mặc định hiển thị

  // Xử lý sự kiện cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Chỉ ẩn nút khi ở đầu trang
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY === 0) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    // Gọi ngay để đặt trạng thái ban đầu
    toggleVisibility();

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Luôn render nút, chỉ ẩn bằng CSS khi không isVisible
  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all z-50 flex items-center justify-center ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        display: 'flex',
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <FaArrowUp size={24} />
    </button>
  );
}
