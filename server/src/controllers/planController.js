// Controller cho Plans API
import { pool } from '../middleware/auth.js';

// Lấy tất cả plans
export const getAllPlans = async (req, res) => {
  try {
    const [plans] = await pool.query(`
      SELECT p.*, u.Name as UserName
      FROM QuitSmokingPlan p
      JOIN User u ON p.UserID = u.UserID
      ORDER BY p.CreatedAt DESC
    `);
    
    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách plans:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách plans',
      error: error.message
    });
  }
};

// Lấy plan theo ID (chỉ của user hiện tại)
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.UserID; // Từ middleware auth
    
    const [plans] = await pool.query(`
      SELECT 
        p.*,
        DATEDIFF(p.ExpectedQuitDate, p.StartDate) as TotalDays,
        DATEDIFF(CURDATE(), p.StartDate) as DaysInProgress,
        CASE 
          WHEN CURDATE() >= p.ExpectedQuitDate THEN 100
          ELSE ROUND((DATEDIFF(CURDATE(), p.StartDate) / DATEDIFF(p.ExpectedQuitDate, p.StartDate)) * 100, 2)
        END as ProgressPercentage
      FROM QuitSmokingPlan p
      WHERE p.PlanID = ? AND p.UserID = ?
    `, [id, userID]);
    
    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan không tồn tại hoặc bạn không có quyền truy cập'
      });
    }

    // Lấy các steps của plan (nếu có)
    const [steps] = await pool.query(`
      SELECT * FROM PlanStep 
      WHERE PlanID = ? 
      ORDER BY StepNumber ASC
    `, [id]);

    const planData = {
      ...plans[0],
      steps: steps || []
    };
    
    res.json({
      success: true,
      data: planData
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin plan:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin plan',
      error: error.message
    });
  }
};

// Tạo plan mới
export const createPlan = async (req, res) => {
  try {
    const userID = req.user.UserID; // Từ middleware auth
    const {
      title,
      reason,
      startDate,
      expectedQuitDate,
      description,
      templateId,
      customSteps = []
    } = req.body;

    // Validation
    if (!title || !startDate || !expectedQuitDate) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp title, startDate và expectedQuitDate'
      });
    }

    // Kiểm tra ngày bắt đầu không được trong quá khứ
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Ngày bắt đầu không được trong quá khứ'
      });
    }

    // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
    const expected = new Date(expectedQuitDate);
    if (expected <= start) {
      return res.status(400).json({
        success: false,
        message: 'Ngày dự kiến cai thuốc phải sau ngày bắt đầu'
      });
    }

    // Tạo plan mới
    const [result] = await pool.query(`
      INSERT INTO QuitSmokingPlan 
      (UserID, Title, Reason, StartDate, ExpectedQuitDate, Description, Status, CreatedAt, UpdatedAt)
      VALUES (?, ?, ?, ?, ?, ?, 'In Progress', NOW(), NOW())
    `, [userID, title, reason || '', startDate, expectedQuitDate, description || '']);

    const planId = result.insertId;

    // Nếu có templateId, tạo các bước từ template
    if (templateId) {
      // Lấy template steps (giả lập từ getPlanTemplates)
      const templates = [
        {
          id: 1,
          steps: [
            { day: 1, action: "Quyết định ngày cai thuốc và thông báo với gia đình, bạn bè" },
            { day: 2, action: "Loại bỏ tất cả thuốc lá và dụng cụ hút thuốc" },
            { day: 7, action: "Thay thế thói quen hút thuốc bằng hoạt động khác" },
            { day: 14, action: "Tham gia hoạt động thể thao, vận động" },
            { day: 21, action: "Đánh giá tiến trình và điều chỉnh kế hoạch" },
            { day: 30, action: "Ăn mừng thành công và lập kế hoạch duy trì" }
          ]
        }
        // Thêm các template khác nếu cần
      ];

      const template = templates.find(t => t.id === templateId);
      if (template) {
        for (const step of template.steps) {
          const stepDate = new Date(start);
          stepDate.setDate(stepDate.getDate() + step.day - 1);
          
          await pool.query(`
            INSERT INTO PlanStep (PlanID, StepNumber, Description, TargetDate, Status, CreatedAt)
            VALUES (?, ?, ?, ?, 'pending', NOW())
          `, [planId, step.day, step.action, stepDate.toISOString().split('T')[0]]);
        }
      }
    }

    // Nếu có custom steps
    if (customSteps && customSteps.length > 0) {
      for (let i = 0; i < customSteps.length; i++) {
        const step = customSteps[i];
        await pool.query(`
          INSERT INTO PlanStep (PlanID, StepNumber, Description, TargetDate, Status, CreatedAt)
          VALUES (?, ?, ?, ?, 'pending', NOW())
        `, [planId, i + 1, step.description, step.targetDate]);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Tạo plan thành công',
      data: {
        planId: planId,
        title: title,
        startDate: startDate,
        expectedQuitDate: expectedQuitDate
      }
    });
  } catch (error) {
    console.error('Lỗi khi tạo plan:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo plan',
      error: error.message
    });
  }
};

// Cập nhật plan
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.UserID; // Từ middleware auth
    const {
      title,
      reason,
      expectedQuitDate,
      description,
      status
    } = req.body;

    // Kiểm tra plan có tồn tại và thuộc về user hiện tại
    const [existingPlans] = await pool.query(
      'SELECT * FROM QuitSmokingPlan WHERE PlanID = ? AND UserID = ?', 
      [id, userID]
    );
    
    if (existingPlans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan không tồn tại hoặc bạn không có quyền chỉnh sửa'
      });
    }

    // Tạo câu query động
    let query = 'UPDATE QuitSmokingPlan SET ';
    const values = [];
    
    if (title) {
      query += 'Title = ?, ';
      values.push(title);
    }
    
    if (reason !== undefined) {
      query += 'Reason = ?, ';
      values.push(reason);
    }
    
    if (expectedQuitDate) {
      // Kiểm tra ngày hợp lệ
      const currentPlan = existingPlans[0];
      const startDate = new Date(currentPlan.StartDate);
      const newQuitDate = new Date(expectedQuitDate);
      
      if (newQuitDate <= startDate) {
        return res.status(400).json({
          success: false,
          message: 'Ngày dự kiến cai thuốc phải sau ngày bắt đầu'
        });
      }
      
      query += 'ExpectedQuitDate = ?, ';
      values.push(expectedQuitDate);
    }
    
    if (description !== undefined) {
      query += 'Description = ?, ';
      values.push(description);
    }
    
    if (status) {
      query += 'Status = ?, ';
      values.push(status);
    }

    // Luôn cập nhật UpdatedAt
    query += 'UpdatedAt = NOW() ';
    
    // Thêm WHERE clause
    query += 'WHERE PlanID = ? AND UserID = ?';
    values.push(id, userID);

    await pool.query(query, values);

    res.json({
      success: true,
      message: 'Cập nhật plan thành công'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật plan:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật plan',
      error: error.message
    });
  }
};

// Xóa plan
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.UserID; // Từ middleware auth

    // Kiểm tra plan có tồn tại và thuộc về user hiện tại
    const [plans] = await pool.query(
      'SELECT * FROM QuitSmokingPlan WHERE PlanID = ? AND UserID = ?', 
      [id, userID]
    );
    
    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan không tồn tại hoặc bạn không có quyền xóa'
      });
    }

    // Xóa các steps liên quan trước (nếu có)
    await pool.query('DELETE FROM PlanStep WHERE PlanID = ?', [id]);
    
    // Xóa plan
    await pool.query('DELETE FROM QuitSmokingPlan WHERE PlanID = ? AND UserID = ?', [id, userID]);

    res.json({
      success: true,
      message: 'Xóa plan thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa plan:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa plan',
      error: error.message
    });
  }
};
        message: 'Plan không tồn tại'
      });
    }

    // Xóa plan
    await pool.query('DELETE FROM QuitSmokingPlan WHERE PlanID = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa plan thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa plan:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa plan',
      error: error.message
    });
  }
};

// Lấy tất cả plans của user hiện tại
export const getUserPlans = async (req, res) => {
  try {
    const userID = req.user.UserID; // Từ middleware auth

    const [plans] = await pool.query(`
      SELECT 
        p.*,
        DATEDIFF(p.ExpectedQuitDate, p.StartDate) as TotalDays,
        DATEDIFF(CURDATE(), p.StartDate) as DaysInProgress,
        CASE 
          WHEN CURDATE() >= p.ExpectedQuitDate THEN 100
          ELSE ROUND((DATEDIFF(CURDATE(), p.StartDate) / DATEDIFF(p.ExpectedQuitDate, p.StartDate)) * 100, 2)
        END as ProgressPercentage
      FROM QuitSmokingPlan p
      WHERE p.UserID = ?
      ORDER BY p.CreatedAt DESC
    `, [userID]);
    
    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Lỗi khi lấy plans của user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy plans của user',
      error: error.message
    });
  }
};

// Lấy templates có sẵn cho quit smoking plans
export const getPlanTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 1,
        title: "Kế hoạch cai thuốc lá 30 ngày",
        description: "Kế hoạch cai thuốc lá trong 30 ngày với các bước dần dần",
        duration: 30,
        steps: [
          { day: 1, action: "Quyết định ngày cai thuốc và thông báo với gia đình, bạn bè" },
          { day: 2, action: "Loại bỏ tất cả thuốc lá và dụng cụ hút thuốc" },
          { day: 7, action: "Thay thế thói quen hút thuốc bằng hoạt động khác" },
          { day: 14, action: "Tham gia hoạt động thể thao, vận động" },
          { day: 21, action: "Đánh giá tiến trình và điều chỉnh kế hoạch" },
          { day: 30, action: "Ăn mừng thành công và lập kế hoạch duy trì" }
        ],
        difficulty: "medium",
        successRate: 65
      },
      {
        id: 2,
        title: "Kế hoạch cai thuốc lá 60 ngày",
        description: "Kế hoạch cai thuốc lá từ từ trong 60 ngày",
        duration: 60,
        steps: [
          { day: 1, action: "Ghi chép thói quen hút thuốc hiện tại" },
          { day: 7, action: "Giảm 25% lượng thuốc lá hàng ngày" },
          { day: 14, action: "Giảm 50% lượng thuốc lá hàng ngày" },
          { day: 21, action: "Giảm 75% lượng thuốc lá hàng ngày" },
          { day: 30, action: "Ngừng hoàn toàn việc hút thuốc" },
          { day: 45, action: "Tập trung vào duy trì không hút thuốc" },
          { day: 60, action: "Đánh giá và lập kế hoạch dài hạn" }
        ],
        difficulty: "easy",
        successRate: 78
      },
      {
        id: 3,
        title: "Kế hoạch cai thuốc lá 14 ngày nhanh",
        description: "Kế hoạch cai thuốc lá nhanh trong 14 ngày",
        duration: 14,
        steps: [
          { day: 1, action: "Ngừng hút thuốc ngay lập tức" },
          { day: 2, action: "Quản lý các triệu chứng cai thuốc" },
          { day: 3, action: "Tìm kiếm hỗ trợ từ gia đình và bạn bè" },
          { day: 7, action: "Đánh giá tiến trình và động lực" },
          { day: 10, action: "Thay đổi môi trường và thói quen" },
          { day: 14, action: "Ăn mừng thành công giai đoạn đầu" }
        ],
        difficulty: "hard",
        successRate: 45
      },
      {
        id: 4,
        title: "Kế hoạch cai thuốc lá với hỗ trợ y tế",
        description: "Kế hoạch cai thuốc lá kết hợp với hỗ trợ y tế",
        duration: 90,
        steps: [
          { day: 1, action: "Tham vấn bác sĩ về kế hoạch cai thuốc" },
          { day: 3, action: "Sử dụng patch nicotine hoặc kẹo cao su" },
          { day: 7, action: "Theo dõi các triệu chứng và tác dụng phụ" },
          { day: 14, action: "Điều chỉnh liều lượng hỗ trợ y tế" },
          { day: 30, action: "Đánh giá tiến trình với bác sĩ" },
          { day: 60, action: "Giảm dần hỗ trợ y tế" },
          { day: 90, action: "Hoàn thành kế hoạch và theo dõi dài hạn" }
        ],
        difficulty: "medium",
        successRate: 85
      }
    ];

    res.json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    console.error('Lỗi khi lấy plan templates:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy plan templates',
      error: error.message
    });
  }
};
