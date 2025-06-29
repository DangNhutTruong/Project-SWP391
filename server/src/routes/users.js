import express from 'express';
import {
  getUserDashboard,
  updateUserProfile,
  updateQuitPlan,
  getProgressDashboard,
  getUserAchievements
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// User routes
router.get('/dashboard', getUserDashboard);
router.get('/progress', getProgressDashboard);  // Available function
router.get('/achievements', getUserAchievements);  // Available function
router.put('/profile', updateUserProfile);
router.put('/quit-plan', updateQuitPlan);
// router.post('/quit-plan/milestone/:milestoneIndex/complete', completeMilestone);  // TODO: Implement
// router.put('/settings', updateSettings);  // TODO: Implement

export default router;
