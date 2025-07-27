import { getAllTransactionsController, getTransactionCountController, getTransactionSumController } from "../controllers/transacions.controller";
import { Router } from 'express';

const transactionRouter = Router();

/**
 * @swagger
 * /api/transactions/all:
 *   get:
 *     summary: Get all transactions
 *     description: Retrieve all transactions with environment-aware data source (mock data in development, external API in production)
 *     tags: [Transactions]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           description: Transaction data (mock in dev, external API in prod)
 *                         transactions:
 *                           type: array
 *                           description: Parsed transaction data
 *                         next_cursor:
 *                           type: string
 *                           description: Cursor for next page (production only)
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
transactionRouter.get('/all', getAllTransactionsController);

/**
 * @swagger
 * /api/transactions/count:
 *   get:
 *     summary: Get transaction count
 *     description: Get the count of transactions with pagination metadata (environment-aware data source)
 *     tags: [Transactions]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *     responses:
 *       200:
 *         description: Transaction count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TransactionCountResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
transactionRouter.get('/count', getTransactionCountController);



/**
 * @swagger
 * /api/transactions/sum:
 *   get:
 *     summary: Calculate transaction sum
 *     description: Calculate the total sum of transaction amounts with optional breakdown by type (environment-aware data source)
 *     tags: [Transactions]
 *     parameters:
 *       - $ref: '#/components/parameters/TransactionTypeParam'
 *       - $ref: '#/components/parameters/IncludeBreakdownParam'
 *     responses:
 *       200:
 *         description: Transaction sum calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TransactionSumResponse'
 *             examples:
 *               basic_sum:
 *                 summary: Basic sum calculation
 *                 value:
 *                   success: true
 *                   data:
 *                     totalSum: 1396.50
 *                     currency: "USD"
 *                     transactionCount: 8
 *                   message: "Transaction sum calculated successfully"
 *               sum_with_breakdown:
 *                 summary: Sum with detailed breakdown
 *                 value:
 *                   success: true
 *                   data:
 *                     totalSum: 1396.50
 *                     currency: "USD"
 *                     transactionCount: 8
 *                     breakdown:
 *                       creditSum: 1100.50
 *                       debitSum: 296.00
 *                       netAmount: 804.50
 *                   message: "Transaction sum calculated successfully"
 *               credit_only:
 *                 summary: Credit transactions only
 *                 value:
 *                   success: true
 *                   data:
 *                     totalSum: 1100.50
 *                     currency: "USD"
 *                     transactionCount: 4
 *                   message: "Transaction sum calculated successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
transactionRouter.get('/sum', getTransactionSumController);

export default transactionRouter;