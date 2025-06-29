// Routes cho Quit Smoking Plan API
import express from 'express';
import {
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getUserPlans,
  getPlanTemplates
} from '../controllers/planController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (cần đăng nhập)
router.post('/', protect, createPlan);                    // POST /api/quit-plans
router.get('/user', protect, getUserPlans);               // GET /api/quit-plans/user
router.get('/templates', getPlanTemplates);               // GET /api/quit-plans/templates
router.get('/:id', protect, getPlanById);                 // GET /api/quit-plans/:id
router.put('/:id', protect, updatePlan);                  // PUT /api/quit-plans/:id
router.delete('/:id', protect, deletePlan);               // DELETE /api/quit-plans/:id

export default router;
