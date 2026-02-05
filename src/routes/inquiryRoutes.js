const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const protect = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Inquiry:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the inquiry
 *         name:
 *           type: string
 *           description: Name of the person inquiring
 *         email:
 *           type: string
 *           description: Email of the person
 *         phone:
 *           type: string
 *           description: Phone number
 *         address:
 *           type: string
 *           description: Address of the person
 *         message:
 *           type: string
 *           description: Inquiry message
 *         product_id:
 *           type: integer
 *           description: ID of the product being inquired about
 *         status:
 *           type: string
 *           enum: [new, read, contacted, resolved]
 *           default: new
 */

/**
 * @swagger
 * /api/inquiries:
 *   post:
 *     summary: Create a new inquiry (Public)
 *     tags: [Inquiries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inquiry'
 *     responses:
 *       201:
 *         description: The inquiry was successfully created
 *       500:
 *         description: Server error
 */
router.post('/', inquiryController.createInquiry);

/**
 * @swagger
 * /api/inquiries:
 *   get:
 *     summary: Get all inquiries (Admin only)
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of inquiries
 *       500:
 *         description: Server error
 */
router.get('/', protect, inquiryController.getAllInquiries);

/**
 * @swagger
 * /api/inquiries/{id}:
 *   get:
 *     summary: Get inquiry by ID (Admin only)
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inquiry details
 *       404:
 *         description: Inquiry not found
 */
router.get('/:id', protect, inquiryController.getInquiryById);

/**
 * @swagger
 * /api/inquiries/{id}/status:
 *   put:
 *     summary: Update inquiry status (Admin only)
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, read, contacted, resolved]
 *     responses:
 *       200:
 *         description: Updated inquiry
 *       404:
 *         description: Inquiry not found
 */
router.put('/:id/status', protect, inquiryController.updateInquiryStatus);

/**
 * @swagger
 * /api/inquiries/{id}:
 *   delete:
 *     summary: Delete inquiry (Admin only)
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inquiry deleted
 *       404:
 *         description: Inquiry not found
 */
router.delete('/:id', protect, inquiryController.deleteInquiry);

module.exports = router;
