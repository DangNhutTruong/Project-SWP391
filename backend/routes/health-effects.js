const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database config
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
};

// Get smoking effects on body (by body part)
router.get('/smoking/:bodyPart?', async (req, res) => {
  try {
    const { bodyPart } = req.params;
    const effects = getSmokingEffects(bodyPart);
    
    res.json(effects);
  } catch (error) {
    console.error('Error getting smoking effects:', error);
    res.status(500).json({ error: 'Failed to fetch smoking effects' });
  }
});

// Get vaping effects on body
router.get('/vaping/:bodyPart?', async (req, res) => {
  try {
    const { bodyPart } = req.params;
    const effects = getVapingEffects(bodyPart);
    
    res.json(effects);
  } catch (error) {
    console.error('Error getting vaping effects:', error);
    res.status(500).json({ error: 'Failed to fetch vaping effects' });
  }
});

// Get benefits of quitting vaping
router.get('/vaping-benefits/:timeframe?', async (req, res) => {
  try {
    const { timeframe } = req.params;
    const benefits = getVapingBenefits(timeframe);
    
    res.json(benefits);
  } catch (error) {
    console.error('Error getting vaping benefits:', error);
    res.status(500).json({ error: 'Failed to fetch vaping benefits' });
  }
});

// Compare effects (smoking vs vaping)
router.get('/compare/:bodyPart?', async (req, res) => {
  try {
    const { bodyPart } = req.params;
    const smokingEffects = getSmokingEffects(bodyPart);
    const vapingEffects = getVapingEffects(bodyPart);
    
    res.json({
      smoking: smokingEffects,
      vaping: vapingEffects
    });
  } catch (error) {
    console.error('Error comparing effects:', error);
    res.status(500).json({ error: 'Failed to compare effects' });
  }
});

// Dữ liệu tác động của thuốc lá lên từng bộ phận cơ thể
function getSmokingEffects(bodyPart = null) {
  const effects = {
    lungs: {
      name: 'Phổi',
      shortTerm: [
        'Tăng đờm',
        'Khó thở',
        'Tăng nguy cơ nhiễm trùng đường hô hấp',
        'Ho kéo dài'
      ],
      longTerm: [
        'Ung thư phổi',
        'Bệnh phổi tắc nghẽn mạn tính (COPD)',
        'Viêm phế quản mạn tính',
        'Khí phế thũng',
        'Giảm chức năng phổi'
      ],
      image: 'lungs-smoking-effects.jpg',
      recoveryTime: 'Sau 1-9 tháng ngừng hút thuốc, phổi bắt đầu phục hồi. Sau 10-15 năm, nguy cơ ung thư phổi giảm xuống gần bằng người không hút thuốc.'
    },
    heart: {
      name: 'Tim mạch',
      shortTerm: [
        'Tăng nhịp tim',
        'Tăng huyết áp tạm thời',
        'Co thắt mạch máu',
        'Giảm lượng oxy trong máu'
      ],
      longTerm: [
        'Bệnh động mạch vành',
        'Đột quỵ',
        'Nhồi máu cơ tim',
        'Xơ vữa động mạch',
        'Phình động mạch chủ'
      ],
      image: 'heart-smoking-effects.jpg',
      recoveryTime: 'Sau 1 năm ngừng hút thuốc, nguy cơ bệnh tim giảm 50%. Sau 15 năm, nguy cơ tương đương người không hút thuốc.'
    },
    brain: {
      name: 'Não bộ',
      shortTerm: [
        'Kích thích tạm thời',
        'Thay đổi tâm trạng',
        'Tăng căng thẳng',
        'Giảm tập trung'
      ],
      longTerm: [
        'Đột quỵ',
        'Suy giảm nhận thức',
        'Tăng nguy cơ sa sút trí tuệ',
        'Giảm khối lượng chất xám',
        'Nghiện nicotin'
      ],
      image: 'brain-smoking-effects.jpg',
      recoveryTime: 'Sau 5-10 năm ngừng hút thuốc, nguy cơ đột quỵ giảm xuống gần bằng người không hút thuốc.'
    },
    mouth: {
      name: 'Răng miệng',
      shortTerm: [
        'Hơi thở có mùi',
        'Đổi màu răng',
        'Giảm vị giác',
        'Viêm nướu'
      ],
      longTerm: [
        'Ung thư miệng',
        'Ung thư lưỡi',
        'Ung thư môi',
        'Bệnh nha chu',
        'Rụng răng sớm'
      ],
      image: 'mouth-smoking-effects.jpg',
      recoveryTime: 'Vị giác và khứu giác cải thiện sau 48 giờ đến vài ngày. Sức khỏe răng miệng cải thiện đáng kể sau 1-5 năm.'
    },
    skin: {
      name: 'Da',
      shortTerm: [
        'Da khô',
        'Mất độ đàn hồi',
        'Vàng da',
        'Xỉn màu da'
      ],
      longTerm: [
        'Lão hóa sớm',
        'Nếp nhăn nhiều hơn',
        'Rối loạn sắc tố',
        'Chậm lành vết thương',
        'Bệnh vẩy nến'
      ],
      image: 'skin-smoking-effects.jpg',
      recoveryTime: 'Da bắt đầu phục hồi sau vài tuần đến vài tháng. Sau 1 năm, da có thể cải thiện đáng kể về màu sắc và độ đàn hồi.'
    },
    reproductive: {
      name: 'Sinh sản',
      shortTerm: [
        'Giảm lưu lượng máu đến cơ quan sinh dục',
        'Giảm khả năng cương ở nam giới',
        'Rối loạn kinh nguyệt ở nữ giới'
      ],
      longTerm: [
        'Giảm khả năng sinh sản',
        'Tăng nguy cơ vô sinh',
        'Rối loạn cương dương',
        'Mãn kinh sớm ở nữ',
        'Biến chứng thai kỳ (nếu hút thuốc khi mang thai)'
      ],
      image: 'reproductive-smoking-effects.jpg',
      recoveryTime: 'Chức năng sinh sản có thể cải thiện sau 3-12 tháng ngừng hút thuốc.'
    }
  };
  
  if (bodyPart && effects[bodyPart]) {
    return effects[bodyPart];
  }
  
  return effects;
}

// Dữ liệu tác động của vaping lên từng bộ phận cơ thể
function getVapingEffects(bodyPart = null) {
  const effects = {
    lungs: {
      name: 'Phổi',
      shortTerm: [
        'Ho',
        'Khô họng',
        'Kích ứng đường hô hấp',
        'Khó thở nhẹ'
      ],
      longTerm: [
        'Tổn thương phổi do hóa chất (EVALI)',
        'Viêm đường hô hấp mạn tính',
        'Giảm chức năng phổi',
        'Tăng nguy cơ nhiễm trùng phổi'
      ],
      image: 'lungs-vaping-effects.jpg',
      note: 'Nghiên cứu dài hạn vẫn đang tiếp tục, nhưng các dấu hiệu cho thấy vaping có thể gây tổn thương phổi nghiêm trọng.'
    },
    heart: {
      name: 'Tim mạch',
      shortTerm: [
        'Tăng huyết áp tạm thời',
        'Tăng nhịp tim',
        'Căng thẳng oxy hóa trên mạch máu'
      ],
      longTerm: [
        'Tăng nguy cơ bệnh tim mạch',
        'Tăng huyết áp mạn tính',
        'Tổn thương nội mạc mạch máu'
      ],
      image: 'heart-vaping-effects.jpg',
      note: 'Nicotine trong vaping vẫn gây ra những tác động tiêu cực tương tự lên tim mạch như thuốc lá truyền thống.'
    },
    brain: {
      name: 'Não bộ',
      shortTerm: [
        'Kích thích tạm thời',
        'Tăng tỉnh táo',
        'Thay đổi tâm trạng',
        'Căng thẳng'
      ],
      longTerm: [
        'Phát triển nghiện nicotin',
        'Thay đổi não bộ ở thanh thiếu niên',
        'Ảnh hưởng đến phát triển nhận thức'
      ],
      image: 'brain-vaping-effects.jpg',
      note: 'Đặc biệt nguy hiểm cho não bộ đang phát triển ở người dưới 25 tuổi.'
    },
    mouth: {
      name: 'Răng miệng',
      shortTerm: [
        'Khô miệng',
        'Kích ứng miệng và họng',
        'Thay đổi vị giác tạm thời'
      ],
      longTerm: [
        'Viêm nướu',
        'Bệnh nha chu',
        'Tổn thương men răng',
        'Tăng nguy cơ sâu răng'
      ],
      image: 'mouth-vaping-effects.jpg'
    }
  };
  
  if (bodyPart && effects[bodyPart]) {
    return effects[bodyPart];
  }
  
  return effects;
}

// Dữ liệu lợi ích khi ngừng vaping
function getVapingBenefits(timeframe = null) {
  const benefits = {
    immediate: {
      time: 'Ngay lập tức',
      benefits: [
        'Huyết áp và nhịp tim bắt đầu ổn định',
        'Mức oxy trong máu bắt đầu trở lại bình thường',
        'Giảm căng thẳng từ chu kỳ cai nghiện'
      ]
    },
    hours: {
      time: 'Sau vài giờ',
      benefits: [
        'Nồng độ nicotine trong máu giảm đáng kể',
        'Cảm giác thèm nicotine bắt đầu xuất hiện',
        'Cơ thể bắt đầu quá trình detox'
      ]
    },
    days: {
      time: 'Sau vài ngày',
      benefits: [
        'Khứu giác và vị giác cải thiện',
        'Chức năng phổi bắt đầu phục hồi',
        'Giảm ho và khó thở',
        'Mức năng lượng tăng lên'
      ]
    },
    weeks: {
      time: 'Sau vài tuần',
      benefits: [
        'Tuần hoàn máu cải thiện đáng kể',
        'Chức năng phổi tiếp tục cải thiện',
        'Giảm các triệu chứng lo âu và trầm cảm',
        'Hệ thống miễn dịch bắt đầu mạnh lên'
      ]
    },
    months: {
      time: 'Sau vài tháng',
      benefits: [
        'Giảm đáng kể các vấn đề hô hấp',
        'Tăng sức chịu đựng thể chất',
        'Cải thiện sức khỏe răng miệng',
        'Tiết kiệm tiền bạc đáng kể'
      ]
    },
    years: {
      time: 'Sau một năm trở lên',
      benefits: [
        'Giảm nguy cơ các bệnh tim mạch',
        'Cải thiện sức khỏe phổi dài hạn',
        'Giảm nguy cơ các bệnh liên quan đến hô hấp',
        'Chất lượng cuộc sống tổng thể tốt hơn'
      ]
    }
  };
  
  if (timeframe && benefits[timeframe]) {
    return benefits[timeframe];
  }
  
  return benefits;
}

module.exports = router;
