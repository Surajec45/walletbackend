const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
/**
 * @swagger
 * /api/admin/flagged-transactions:
 *   get:
 *     summary: Get all flagged transactions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of flagged transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   transactionId:
 *                     type: object
 *                     description: Populated transaction details
 */

router.get('/flagged-transactions', adminController.getFlaggedTransactions);
/**
 * @swagger
 * /api/admin/total-balances:
 *   get:
 *     summary: Get total balances per currency across all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total balances per currency
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: number
 *                 example: 12000.50
 */

router.get('/total-balances', adminController.getTotalBalances);
/**
 * @swagger
 * /api/admin/top-users/balance:
 *   get:
 *     summary: Get top 10 users by total balance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users sorted by total balance
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   totalBalance:
 *                     type: number
 */

router.get('/top-users/balance', adminController.getTopUsersByBalance);
/**
 * @swagger
 * /api/admin/top-users/transactions:
 *   get:
 *     summary: Get top 10 users by number of transactions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with most transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   transactionCount:
 *                     type: integer
 */

router.get('/top-users/transactions', adminController.getTopUsersByTransactionVolume);

module.exports = router;