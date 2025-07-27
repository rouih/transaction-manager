import express from 'express';
import swaggerUi from 'swagger-ui-express';
import router from './api/routes/router.index';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import swaggerSpec from './config/swagger.config';
import { Logger } from './utils/logger.utils';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Global error handling for JSON parsing
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Invalid JSON in request body',
            statusCode: 400
        });
    }
    next(err);
});

// Routes
/**
 * @swagger
 * /:
 *   get:
 *     summary: API Welcome
 *     description: Welcome endpoint providing basic API information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Welcome message with API information
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
 *                         version:
 *                           type: string
 *                           example: "1.0.0"
 *                         endpoints:
 *                           type: object
 *                           properties:
 *                             health:
 *                               type: string
 *                               example: "/health"
 *                             api:
 *                               type: string
 *                               example: "/api"
 *                             docs:
 *                               type: string
 *                               example: "/api-docs"
 */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the Transaction API',
        data: {
            version: '1.0.0',
            endpoints: {
                health: '/health',
                api: '/api',
                docs: '/api-docs'
            }
        }
    });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Check the health status of the API server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API server is healthy
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
 *                         status:
 *                           type: string
 *                           example: "OK"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-27T12:00:00.000Z"
 *                         uptime:
 *                           type: number
 *                           description: "Server uptime in seconds"
 *                           example: 3600.123
 *                         memory:
 *                           type: object
 *                           description: "Memory usage statistics"
 *                           properties:
 *                             rss:
 *                               type: number
 *                               description: "Resident Set Size"
 *                             heapTotal:
 *                               type: number
 *                               description: "Total heap size"
 *                             heapUsed:
 *                               type: number
 *                               description: "Used heap size"
 *                             external:
 *                               type: number
 *                               description: "External memory usage"
 */
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Transaction API Documentation'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// API Routes
app.use('/api', router);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
    Logger.debug(`Server is running on http://localhost:${port}`, 'Server');
    Logger.debug(`Environment: ${process.env.NODE_ENV || 'development'}`, 'Server');
}); 