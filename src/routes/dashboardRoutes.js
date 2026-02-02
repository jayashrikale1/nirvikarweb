const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard Statistics
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProducts:
 *                   type: integer
 *                 totalCategories:
 *                   type: integer
 *                 totalOrders:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.get('/stats', authMiddleware, dashboardController.getDashboardStats);

module.exports = router;
