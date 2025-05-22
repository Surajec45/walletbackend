const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  deposit,
  withdraw,
  transfer,
  getTransactionHistory
} = require('../controllers/walletController');

router.use(authMiddleware);
/**
 * @swagger
 * /api/wallet/deposit:
 *   post:
 *     summary: Deposit funds into the user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100
 *               currency:
 *                 type: string
 *                 example: USD
 *     responses:
 *       200:
 *         description: Updated balances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balances:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *       400:
 *         description: Invalid deposit amount
 *       500:
 *         description: Server error
 */

router.post('/deposit', deposit);
/**
 * @swagger
 * /api/wallet/withdraw:
 *   post:
 *     summary: Withdraw funds from the user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50
 *               currency:
 *                 type: string
 *                 example: USD
 *     responses:
 *       200:
 *         description: Updated balances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balances:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *       400:
 *         description: Invalid withdrawal or insufficient balance
 *       500:
 *         description: Server error
 */

router.post('/withdraw',  withdraw);
/**
 * @swagger
 * /api/wallet/transfer:
 *   post:
 *     summary: Transfer funds to another user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *               - toEmail
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 25
 *               currency:
 *                 type: string
 *                 example: USD
 *               toEmail:
 *                 type: string
 *                 example: recipient@example.com
 *     responses:
 *       200:
 *         description: Transfer successful, returns updated sender balances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balances:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *       400:
 *         description: Validation error (e.g. insufficient balance, self-transfer)
 *       500:
 *         description: Server error
 */

router.post('/transfer', transfer);
/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get user's transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's transactions (deposit, withdraw, transfer)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                   to:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [deposit, withdraw, transfer]
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */

router.get('/transactions', getTransactionHistory);

module.exports = router;