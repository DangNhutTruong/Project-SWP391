import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AutoChatSupport.css';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaAngleDown } from 'react-icons/fa';
const AutoChatSupport = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý ảo của NoSmoke. Tôi có thể giúp gì cho bạn về việc cai thuốc lá?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([
    'Làm thế nào để vượt qua cơn thèm thuốc?',
    'Tôi bị căng thẳng khi cai thuốc',
    'Tôi cần tư vấn về sản phẩm thay thế nicotine',
    'Tôi đã cai thuốc được 3 ngày nhưng rất khó khăn',
    'Làm thế nào để tránh tái nghiện?'
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Các câu hỏi thường gặp và câu trả lời
  const faqResponses = {
    'cơn thèm thuốc': [
      'Để vượt qua cơn thèm thuốc, bạn có thể:',
      '• Uống một ly nước lọc',
      '• Tập thở sâu trong 5 phút',
      '• Gọi điện cho người thân hoặc bạn bè',
      '• Ăn một miếng kẹo cao su không đường',
      '• Đi bộ ngắn hoặc thay đổi môi trường xung quanh'
    ],
    'căng thẳng': [
      'Căng thẳng là phản ứng phổ biến khi cai thuốc. Bạn có thể:',
      '• Thực hành thiền 10 phút mỗi ngày',
      '• Tập thể dục đều đặn',
      '• Giảm caffeine',
      '• Đảm bảo ngủ đủ giấc',
      '• Tham gia các hoạt động thư giãn như yoga'
    ],
    'nicotine': [
      'Một số sản phẩm thay thế nicotine bao gồm:',
      '• Miếng dán nicotine',
      '• Kẹo cao su nicotine',
      '• Ống hít nicotine',
      '• Thuốc viên nicotine',
      'Nên tham khảo ý kiến bác sĩ trước khi sử dụng sản phẩm thay thế nicotine.'
    ],
    'tái nghiện': [
      'Để tránh tái nghiện:',
      '• Xác định và tránh yếu tố kích hoạt',
      '• Tìm hoạt động thay thế khi cảm thấy thèm thuốc',
      '• Luôn nhớ lý do bạn quyết định cai thuốc',
      '• Tham gia nhóm hỗ trợ cai thuốc',
      '• Sử dụng ứng dụng NoSmoke để theo dõi tiến trình'
    ],
    'khó khăn': [
      'Những ngày đầu cai thuốc thường rất khó khăn. Bạn đã làm rất tốt khi vượt qua 3 ngày!',
      '• Hãy tự thưởng cho bản thân với số tiền tiết kiệm được',
      '• Nhớ rằng các triệu chứng cai thuốc sẽ giảm dần sau 1-2 tuần',
      '• Tập trung vào lợi ích sức khỏe bạn đã đạt được',
      '• Hãy chia sẻ thành tựu của bạn với gia đình và bạn bè để nhận thêm động lực'
    ],
    'lợi ích': [
      'Lợi ích khi cai thuốc lá bao gồm:',
      '• Sau 20 phút: Huyết áp và nhịp tim giảm',
      '• Sau 12 giờ: Nồng độ CO trong máu trở lại bình thường',
      '• Sau 2 tuần: Tuần hoàn máu và chức năng phổi cải thiện',
      '• Sau 1 tháng: Chức năng phổi tăng, giảm ho và khó thở',
      '• Sau 1 năm: Nguy cơ bệnh tim giảm 50%',
      '• Sau 10 năm: Nguy cơ ung thư phổi giảm 50%'
    ],
    'hỗ trợ': [
      'NoSmoke cung cấp nhiều hình thức hỗ trợ:',
      '• Tư vấn trực tuyến với chuyên gia (gói Premium và Pro)',
      '• Cộng đồng hỗ trợ cùng mục tiêu cai thuốc',
      '• Công cụ theo dõi tiến trình',
      '• Tài liệu và video hướng dẫn',
      '• Đường dây nóng hỗ trợ: 1800-XXX-XXX'
    ]
  };

  // Phân tích tin nhắn và tạo phản hồi
  const generateResponse = (message) => {
    const lowercaseMessage = message.toLowerCase();
    let response = [];
    
    // Kiểm tra xem tin nhắn có chứa từ khóa nào trong FAQ không
    if (lowercaseMessage.includes('cơn thèm') || lowercaseMessage.includes('thèm thuốc')) {
      response = faqResponses['cơn thèm thuốc'];
    } 
    else if (lowercaseMessage.includes('căng thẳng') || lowercaseMessage.includes('stress')) {
      response = faqResponses['căng thẳng'];
    }
    else if (lowercaseMessage.includes('nicotine') || lowercaseMessage.includes('sản phẩm thay thế')) {
      response = faqResponses['nicotine'];
    }
    else if (lowercaseMessage.includes('tái nghiện') || lowercaseMessage.includes('hút lại')) {
      response = faqResponses['tái nghiện'];
    }
    else if (lowercaseMessage.includes('khó khăn') || lowercaseMessage.includes('khó')) {
      response = faqResponses['khó khăn'];
    }
    else if (lowercaseMessage.includes('lợi ích') || lowercaseMessage.includes('tốt cho sức khỏe')) {
      response = faqResponses['lợi ích'];
    }
    else if (lowercaseMessage.includes('hỗ trợ') || lowercaseMessage.includes('giúp đỡ')) {
      response = faqResponses['hỗ trợ'];
    }
    else if (lowercaseMessage.includes('xin chào') || lowercaseMessage.includes('chào') || lowercaseMessage.includes('hi')) {
      response = ['Xin chào! Tôi là trợ lý ảo của NoSmoke. Tôi có thể giúp gì cho bạn về việc cai thuốc lá?'];
    }
    else if (lowercaseMessage.includes('cảm ơn') || lowercaseMessage.includes('thank')) {
      response = ['Không có gì! Tôi luôn sẵn sàng hỗ trợ bạn trong hành trình cai thuốc lá.', 'Bạn có câu hỏi nào khác không?'];
    }
    else {
      response = [
        'Tôi chưa hiểu rõ câu hỏi của bạn. Dưới đây là một số chủ đề tôi có thể giúp đỡ:',
        '• Các cách vượt qua cơn thèm thuốc',
        '• Quản lý căng thẳng khi cai thuốc',
        '• Sản phẩm thay thế nicotine',
        '• Cách phòng tránh tái nghiện',
        '• Lợi ích sức khỏe khi cai thuốc',
        'Hoặc bạn có thể liên hệ với chuyên gia tư vấn thông qua gói Premium của chúng tôi.'
      ];
    }
    
    return response;
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setIsTyping(true);
    
    // Giả lập thời gian phản hồi
    setTimeout(() => {
      const botResponse = generateResponse(input);
      
      botResponse.forEach((text, index) => {
        setTimeout(() => {
          setMessages(prev => [
            ...prev, 
            {
              id: messages.length + 2 + index,
              text: text,
              sender: 'bot',
              timestamp: new Date()
            }
          ]);
        }, index * 500); // Hiển thị từng dòng phản hồi sau mỗi 500ms
      });
      
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    
    const userMessage = {
      id: messages.length + 1,
      text: suggestion,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Giả lập thời gian phản hồi
    setTimeout(() => {
      const botResponse = generateResponse(suggestion);
      
      botResponse.forEach((text, index) => {
        setTimeout(() => {
          setMessages(prev => [
            ...prev, 
            {
              id: messages.length + 2 + index,
              text: text,
              sender: 'bot',
              timestamp: new Date()
            }
          ]);
        }, index * 500); // Hiển thị từng dòng phản hồi sau mỗi 500ms
      });
      
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Auto-scroll xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="auto-chat-overlay">
      <div className="auto-chat-container">
        <div className="auto-chat-header">
          <div className="auto-chat-title">
            <FaRobot className="auto-chat-icon" />
            <div>
              <h3>Tư vấn hỗ trợ</h3>
              <p>Trợ lý ảo NoSmoke</p>
            </div>
          </div>
          <button className="auto-chat-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="auto-chat-messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
            >
              <div className="message-avatar">
                {message.sender === 'bot' ? <FaRobot /> : <FaUser />}
              </div>
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot-message">
              <div className="message-avatar">
                <FaRobot />
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {showSuggestions && (
          <div className="auto-chat-suggestions">
            <h4>Câu hỏi phổ biến <FaAngleDown /></h4>
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <button 
                  key={index} 
                  className="suggestion-btn"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="auto-chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập câu hỏi của bạn..."
          />
          <button className="send-button" onClick={handleSendMessage}>
            <FaPaperPlane />
          </button>
        </div>
        
        <div className="auto-chat-footer">
          <p>Cần tư vấn chuyên sâu? <Link to="/membership">Nâng cấp lên gói Premium</Link></p>
        </div>
      </div>
    </div>
  );
};

export default AutoChatSupport;
