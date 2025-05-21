import React, { useState } from 'react';
import { FaCalculator, FaChartLine, FaCalendarAlt, FaHeartbeat, FaRegLightbulb, FaBrain, FaUsers, FaCheckCircle } from 'react-icons/fa';
import '../style.css';

export default function Tools() {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="tools-container">
      <div className="tools-wrapper">
        {/* Header */}
        <div className="tools-header">
          <h1>Công cụ hỗ trợ cai thuốc lá</h1>
          <p>
            Các công cụ tương tác giúp bạn lên kế hoạch, theo dõi và thành công trên hành trình trở thành người không hút thuốc.
          </p>
        </div>

        {/* Tools Navigation */}
        <div className="tools-nav">
          <div className="tools-tabs">
            <ToolTab 
              id="calculator"
              icon={<FaCalculator />}
              title="Máy tính tiết kiệm"
              active={activeTab === 'calculator'}
              onClick={() => setActiveTab('calculator')}
            />
            <ToolTab 
              id="tracker"
              icon={<FaChartLine />}
              title="Theo dõi tiến trình"
              active={activeTab === 'tracker'}
              onClick={() => setActiveTab('tracker')}
            />
            <ToolTab 
              id="planner"
              icon={<FaCalendarAlt />}
              title="Kế hoạch cai thuốc"
              active={activeTab === 'planner'}
              onClick={() => setActiveTab('planner')}
            />
            <ToolTab 
              id="healthBenefits"
              icon={<FaHeartbeat />}
              title="Lợi ích sức khỏe"
              active={activeTab === 'healthBenefits'}
              onClick={() => setActiveTab('healthBenefits')}
            />          </div>
        </div>

        {/* Active Tool Content */}
        <div className="tool-content">
          {activeTab === 'calculator' && <SavingsCalculator />}
          {activeTab === 'tracker' && <ProgressTracker />}
          {activeTab === 'planner' && <QuitPlanner />}
          {activeTab === 'healthBenefits' && <HealthBenefits />}
        </div>

        {/* Additional Resources */}
        <div className="resources-section">
          <h2>Tài nguyên bổ sung</h2>
          <div className="resources-grid">
            <ResourceCard
              icon={<FaRegLightbulb className="text-yellow-500" />}
              title="Thư viện mẹo cai thuốc"
              description="Bộ sưu tập các mẹo và chiến lược cai thuốc dựa trên bằng chứng."
              link="#"
            />
            <ResourceCard
              icon={<FaUsers className="text-blue-500" />}
              title="Nhóm hỗ trợ địa phương"
              description="Tìm các nhóm hỗ trợ trực tiếp trong khu vực của bạn."
              link="#"
            />
            <ResourceCard
              icon={<FaBrain className="text-purple-500" />}
              title="Hỗ trợ cơn thèm khẩn cấp"
              description="Các chiến lược và bài tập tức thì khi cơn thèm thuốc đến mạnh mẽ."
              link="#"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Tool Tab Component
function ToolTab({ id, icon, title, active, onClick }) {
  return (
    <button
      className={`flex items-center px-5 py-3 rounded-full whitespace-nowrap transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      <span className="font-medium">{title}</span>
    </button>
  );
}

// Resource Card Component
function ResourceCard({ icon, title, description, link }) {
  return (
    <a 
      href={link}
      className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
      <div className="mt-4 text-blue-600 font-medium">Tìm hiểu thêm →</div>
    </a>
  );
}

// Savings Calculator Tool
function SavingsCalculator() {
  const [cigarettesPerDay, setCigarettesPerDay] = useState(10);
  const [pricePerPack, setPricePerPack] = useState(30000);
  const [cigarettesPerPack, setCigarettesPerPack] = useState(20);
  
  // Calculate daily, weekly, monthly, yearly savings
  const dailyCost = (cigarettesPerDay / cigarettesPerPack) * pricePerPack;
  const weeklyCost = dailyCost * 7;
  const monthlyCost = dailyCost * 30;
  const yearlyCost = dailyCost * 365;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tính tiền tiết kiệm được</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Số điếu thuốc mỗi ngày</label>
            <input 
              type="range" 
              min="1" 
              max="40" 
              value={cigarettesPerDay} 
              onChange={(e) => setCigarettesPerDay(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>1</span>
              <span>{cigarettesPerDay} điếu</span>
              <span>40</span>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Giá mỗi bao thuốc (VNĐ)</label>
            <input 
              type="number" 
              value={pricePerPack} 
              onChange={(e) => setPricePerPack(parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Số điếu thuốc trong một bao</label>
            <select 
              value={cigarettesPerPack} 
              onChange={(e) => setCigarettesPerPack(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            >
              <option value="10">10 điếu</option>
              <option value="20">20 điếu</option>
              <option value="25">25 điếu</option>
            </select>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Số tiền bạn sẽ tiết kiệm</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span>Mỗi ngày:</span>
              <span className="font-semibold">{dailyCost.toLocaleString()} VNĐ</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Mỗi tuần:</span>
              <span className="font-semibold">{weeklyCost.toLocaleString()} VNĐ</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Mỗi tháng:</span>
              <span className="font-semibold">{monthlyCost.toLocaleString()} VNĐ</span>
            </div>
            <div className="flex justify-between pt-2">
              <span>Mỗi năm:</span>
              <span className="font-bold text-xl text-green-600">{yearlyCost.toLocaleString()} VNĐ</span>
            </div>
          </div>
          
          <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-2">Bạn có thể dùng số tiền này để:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Đi du lịch nghỉ dưỡng</li>
              <li>Mua sắm đồ điện tử mới</li>
              <li>Tiết kiệm cho tương lai</li>
              <li>Đầu tư vào sức khỏe của bạn</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress Tracker Tool
function ProgressTracker() {
  // Just a placeholder UI for now
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Theo dõi tiến trình cai thuốc</h2>
      
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600 mb-4">
          Để sử dụng công cụ này, vui lòng đăng nhập hoặc tạo tài khoản để lưu tiến trình của bạn.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full">
          Đăng nhập / Đăng ký
        </button>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Tính năng theo dõi tiến trình</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2" />
              <span>Theo dõi số ngày không hút thuốc</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2" />
              <span>Ghi lại các triệu chứng cai thuốc</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2" />
              <span>Xem tiến trình sức khỏe phục hồi</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2" />
              <span>Đặt và theo dõi các mục tiêu cá nhân</span>
            </li>
          </ul>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Lợi ích của việc theo dõi</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2" />
              <span>Tăng động lực khi thấy tiến bộ</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2" />
              <span>Nhận thông báo khích lệ</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2" />
              <span>Hiểu rõ hơn về quá trình cai thuốc</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2" />
              <span>Xác định các yếu tố kích hoạt và tránh tái nghiện</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Quit Planner Tool
function QuitPlanner() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lập kế hoạch cai thuốc</h2>
      
      <div className="mb-8">
        <p className="text-gray-600">
          Kế hoạch cai thuốc cá nhân sẽ giúp bạn chuẩn bị tâm lý và thể chất để tăng khả năng thành công. Hãy trả lời các câu hỏi dưới đây để tạo kế hoạch phù hợp với bạn.
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="border-b p-4">
          <h3 className="text-lg font-medium">1. Chọn ngày cai thuốc</h3>
        </div>
        
        <div className="p-6">
          <label className="block text-gray-700 mb-2">Ngày cai thuốc của bạn</label>
          <input 
            type="date" 
            className="w-full md:w-64 p-3 border border-gray-300 rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-2">
            Chọn ngày trong vòng 2 tuần tới. Tránh các sự kiện có thể gây căng thẳng.
          </p>
        </div>
        
        <div className="border-t border-b p-4">
          <h3 className="text-lg font-medium">2. Xác định lý do cai thuốc</h3>
        </div>
        
        <div className="p-6">
          <label className="block text-gray-700 mb-2">Những lý do quan trọng nhất của bạn</label>
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            rows="3"
            placeholder="Ví dụ: Tôi muốn cải thiện sức khỏe, tiết kiệm tiền, là tấm gương tốt cho con cái..."
          />
        </div>
        
        <div className="border-t border-b p-4">
          <h3 className="text-lg font-medium">3. Xác định kích hoạt thèm thuốc</h3>
        </div>
        
        <div className="p-6">
          <p className="mb-4">Chọn những tình huống thường khiến bạn muốn hút thuốc:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Sau bữa ăn</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Khi uống cà phê</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Khi uống rượu bia</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Khi cảm thấy căng thẳng</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Khi nghỉ giải lao</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Khi lái xe</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Khi giao tiếp xã hội</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Khi buồn chán</span>
            </label>
          </div>
        </div>
        
        <div className="border-t p-4">
          <h3 className="text-lg font-medium">4. Chọn phương pháp cai thuốc</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="radio" name="method" className="mr-2" />
              <span>Cai thuốc đột ngột (ngừng hoàn toàn vào ngày đã chọn)</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="method" className="mr-2" />
              <span>Giảm dần (giảm số lượng thuốc hút mỗi ngày)</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="method" className="mr-2" />
              <span>Sử dụng liệu pháp thay thế nicotine (NRT)</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="method" className="mr-2" />
              <span>Sử dụng thuốc kê đơn</span>
            </label>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full">
            Tạo kế hoạch của tôi
          </button>
        </div>
      </div>
    </div>
  );
}

// Health Benefits Tool
function HealthBenefits() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lợi ích sức khỏe khi cai thuốc lá</h2>
      
      <div className="mb-8">
        <p className="text-gray-600">
          Cơ thể bạn bắt đầu hồi phục ngay từ khi bạn hút điếu thuốc cuối cùng. Khám phá những lợi ích sức khỏe theo thời gian dưới đây.
        </p>
      </div>
      
      <div className="space-y-6">
        <TimelineItem
          time="20 phút"
          title="Huyết áp và nhịp tim giảm"
          description="Huyết áp và nhịp tim của bạn bắt đầu trở về mức bình thường chỉ sau 20 phút khi hút điếu thuốc cuối cùng."
          icon={<FaHeartbeat className="text-red-500" />}
        />
        
        <TimelineItem
          time="12 giờ"
          title="Mức CO trong máu giảm"
          description="Nồng độ carbon monoxide trong máu giảm xuống mức bình thường, tăng lượng oxy cho các cơ quan trong cơ thể."
          icon={<FaLungs className="text-blue-500" />}
        />
        
        <TimelineItem
          time="2-3 ngày"
          title="Vị giác và khứu giác cải thiện"
          description="Các dây thần kinh chịu trách nhiệm cho vị giác và khứu giác bắt đầu hồi phục, giúp bạn thưởng thức thức ăn tốt hơn."
          icon={<FaRegLightbulb className="text-yellow-500" />}
        />
        
        <TimelineItem
          time="1-3 tháng"
          title="Tuần hoàn và chức năng phổi cải thiện"
          description="Lưu thông máu được cải thiện, giúp bạn dễ dàng vận động và tập thể dục. Chức năng phổi có thể tăng lên đến 30%."
          icon={<FaHeartbeat className="text-red-500" />}
        />
        
        <TimelineItem
          time="1 năm"
          title="Giảm nguy cơ bệnh tim"
          description="Nguy cơ mắc bệnh tim mạch vành giảm một nửa so với người hút thuốc."
          icon={<FaHeartbeat className="text-red-500" />}
        />
        
        <TimelineItem
          time="5-15 năm"
          title="Giảm nguy cơ đột quỵ"
          description="Sau 5-15 năm, nguy cơ đột quỵ giảm xuống tương đương với người không hút thuốc."
          icon={<FaBrain className="text-purple-500" />}
        />
        
        <TimelineItem
          time="10 năm"
          title="Giảm nguy cơ ung thư phổi"
          description="Nguy cơ ung thư phổi giảm xuống còn khoảng một nửa so với người hút thuốc."
          icon={<FaLungs className="text-blue-500" />}
        />
        
        <TimelineItem
          time="15 năm"
          title="Nguy cơ tương đương người không hút thuốc"
          description="Nguy cơ mắc bệnh tim mạch vành gần như bằng với người chưa từng hút thuốc."
          icon={<FaHeartbeat className="text-red-500" />}
        />
      </div>
    </div>
  );
}

// Timeline Item Component for Health Benefits
function TimelineItem({ time, title, description, icon }) {
  return (
    <div className="flex">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
        {icon}
      </div>
      <div className="flex-grow pb-6 border-l-2 border-blue-200 pl-6 relative">
        <div className="absolute w-3 h-3 bg-blue-500 rounded-full left-[-8px] top-2"></div>
        <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-2">
          {time}
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

// For lungs icon in the HealthBenefits component
function FaLungs({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 640 512"
      className={className}
      fill="currentColor"
      width="1em"
      height="1em"
    >
      <path d="M320 64c-8.8 0-16 7.2-16 16v163.4c0 35.2-28.8 64-64 64c-14.3 0-27.9-4.8-39-13.6L96.4 200.5C96.1 200.3 95.9 200 95.6 199.8c-5.6-4.4-13.8-3.4-18.2 2.2s-3.4 13.8 2.2 18.2c.3 .3 .7 .5 1 .8L166.4 307.2C186 324 211.4 336 240 336c61.9 0 112-50.1 112-112V80c0-8.8-7.2-16-16-16H320zM636.5 110c-3.3-8.1-12.6-12-20.8-8.7l-1.9 .8c-8.9 3.7-15.9 10.7-19.6 19.6l-11.6 28c-7.5 18-14.3 34.5-30.9 44.9c-10.6 6.6-23.5 10.7-40.4 10.7h-0c-32.9-.2-53-15.5-64.4-40.4c-.8-1.7-1.5-3.4-2.2-5.1L429.2 128H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H272c-8.8 0-16 7.2-16 16s7.2 16 16 16h2.8L260.3 159.9c-.7 1.7-1.4 3.4-2.2 5.1c-11.5 24.9-31.5 40.2-64.4 40.4h-0c-16.9 0-29.8-4.1-40.4-10.7c-16.6-10.4-23.4-26.9-30.9-44.9l-11.6-28c-3.7-8.9-10.7-15.9-19.6-19.6l-1.9-.8c-8.1-3.3-17.5 .5-20.8 8.7s.5 17.5 8.7 20.8l1.9 .8c1.8 .7 3.2 2.2 3.9 3.9L86 168c6.5 15.6 13.1 31.9 28.8 41.8c16.3 10.2 36.1 15.9 60.6 15.9h0c41.6-.2 70.9-20.8 87.2-55.6c1-2.2 1.9-4.3 2.7-6.4L288 128h64l22.7 36.7c.9 2.1 1.8 4.2 2.7 6.4c16.3 34.8 45.6 55.4 87.2 55.6h0c24.5 0 44.3-5.8 60.6-15.9c15.7-9.9 22.2-26.2 28.8-41.8l4-9.6c.7-1.8 2.2-3.2 3.9-3.9l1.9-.8c8.1-3.3 12-12.7 8.7-20.8z"/>
    </svg>
  );
}