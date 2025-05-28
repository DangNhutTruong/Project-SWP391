import React, { useState } from 'react';
import AutoChatSupport from './AutoChatSupport';
import { FaComments } from 'react-icons/fa';
import '../styles/ChatButton.css';

export default function ChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <button 
        className="chat-btn" 
        onClick={toggleChat}
        aria-label="Mở tư vấn hỗ trợ"
      >
        <FaComments />
      </button>
      
      <AutoChatSupport 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}
