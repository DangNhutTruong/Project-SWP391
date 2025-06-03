import React from 'react';
import { FaComments, FaLock } from 'react-icons/fa';
import RequireMembership from './RequireMembership';

/**
 * ChatWithCoachButton component 
 * Shows either a functional chat button or a membership-restricted button based on user's membership
 */
const ChatWithCoachButton = ({ 
  appointment, 
  userMembership, 
  hasUnread, 
  onChatOpen 
}) => {
  // Check if user has required membership
  const hasMembership = ['premium', 'pro'].includes(userMembership);

  if (hasMembership) {
    // User has required membership - show functional button
    return (
      <button 
        className="chat-button"
        onClick={onChatOpen}
      >
        <FaComments className="chat-button-icon" /> 
        Chat với Coach
        {hasUnread && <span className="chat-notification">!</span>}
      </button>
    );
  } else {
    // User doesn't have required membership - show button wrapped in RequireMembership
    return (
      <RequireMembership allowedMemberships={['premium', 'pro']} showModal={true}>
        <button className="chat-button">
          <FaComments className="chat-button-icon" /> 
          Chat với Coach
          <FaLock className="membership-lock" />
        </button>
      </RequireMembership>
    );
  }
};

export default ChatWithCoachButton;
