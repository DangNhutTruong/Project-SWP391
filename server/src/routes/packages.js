import express from 'express';
import packageController from '../controllers/packageController.js';

const router = express.Router();

/**
 * @route GET /api/packages
 * @desc Lấy tất cả các gói dịch vụ
 * @access Public
 */
router.get('/', packageController.getAllPackages);

/**
 * @route GET /api/packages/:id
 * @desc Lấy chi tiết một gói dịch vụ theo ID
 * @access Public
 */
router.get('/:id', packageController.getPackageById);

export default router;
