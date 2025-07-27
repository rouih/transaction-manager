import { Request, Response, NextFunction } from 'express';
import {
    errorHandler,
    notFoundHandler,
    catchAsync,
    validateRequest,
    AppError,
    ValidationAppError,
    NotFoundError,
    UnauthorizedError,
    BadRequestError,
    InternalServerError
} from '../error.middleware';
import { ValidationError } from '../../dto/transaciton.dto';
import { ERROR_MESSAGES, NODE_ENV } from '../../common/consnts';

// Mock Express objects
const mockRequest = (overrides = {}) => ({
    originalUrl: '/test',
    method: 'GET',
    ...overrides
}) as Request;

const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

const mockNext = jest.fn() as NextFunction;

describe('Error Middleware Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Set development environment for consistent testing
        process.env.NODE_ENV = NODE_ENV.DEVELOPMENT;
        // Mock console.error to avoid noise in test output
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        // Restore console.error
        jest.restoreAllMocks();
    });

    describe('AppError Classes', () => {
        it('should create AppError with correct properties', () => {
            const error = new AppError('Test error', 400, true);

            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.isOperational).toBe(true);
            expect(error instanceof Error).toBe(true);
        });

        it('should create ValidationAppError with validation errors', () => {
            const validationErrors: ValidationError[] = [
                { field: 'page', message: 'Page must be a number', value: 'invalid' }
            ];
            const error = new ValidationAppError('Validation failed', validationErrors);

            expect(error.message).toBe('Validation failed');
            expect(error.statusCode).toBe(400);
            expect(error.validationErrors).toEqual(validationErrors);
        });

        it('should create NotFoundError with correct status', () => {
            const error = new NotFoundError('User');

            expect(error.message).toBe('User not found');
            expect(error.statusCode).toBe(404);
        });

        it('should create UnauthorizedError with correct status', () => {
            const error = new UnauthorizedError();

            expect(error.message).toBe(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
            expect(error.statusCode).toBe(401);
        });

        it('should create BadRequestError with correct status', () => {
            const error = new BadRequestError('Invalid input');

            expect(error.message).toBe('Invalid input');
            expect(error.statusCode).toBe(400);
        });

        it('should create InternalServerError with correct status', () => {
            const error = new InternalServerError();

            expect(error.message).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
            expect(error.statusCode).toBe(500);
        });
    });

    describe('errorHandler middleware', () => {
        it('should handle AppError in development mode', () => {
            const req = mockRequest();
            const res = mockResponse();
            const error = new AppError('Test error', 400);

            errorHandler(error, req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'AppError',
                    message: 'Test error',
                    statusCode: 400,
                    stack: expect.any(String),
                    timestamp: expect.any(String),
                    url: '/test',
                    method: 'GET'
                })
            );
        });

        it('should handle AppError in production mode', () => {
            process.env.NODE_ENV = NODE_ENV.PRODUCTION;
            const req = mockRequest();
            const res = mockResponse();
            const error = new AppError('Test error', 400);

            errorHandler(error, req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'AppError',
                message: 'Test error',
                statusCode: 400
            });
        });

        it('should handle non-operational errors in production', () => {
            process.env.NODE_ENV = NODE_ENV.PRODUCTION;
            const req = mockRequest();
            const res = mockResponse();
            const error = new AppError('Internal error', 500, false); // non-operational

            errorHandler(error, req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Internal Server Error',
                message: 'Something went wrong',
                statusCode: 500
            });
        });

        it('should handle ValidationAppError with validation errors', () => {
            const req = mockRequest();
            const res = mockResponse();
            const validationErrors: ValidationError[] = [
                { field: 'page', message: 'Invalid page', value: 'abc' }
            ];
            const error = new ValidationAppError('Validation failed', validationErrors);

            errorHandler(error, req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'Validation failed',
                    statusCode: 400,
                    validationErrors
                })
            );
        });

        it('should convert generic Error to AppError', () => {
            const req = mockRequest();
            const res = mockResponse();
            const error = new Error('Generic error');

            errorHandler(error, req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'Generic error',
                    statusCode: 500
                })
            );
        });

        it('should handle Axios errors', () => {
            const req = mockRequest();
            const res = mockResponse();
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 404,
                    data: { message: 'External API not found' }
                }
            };

            errorHandler(axiosError as any, req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'External API not found',
                    statusCode: 404
                })
            );
        });

        it('should handle Axios network errors', () => {
            const req = mockRequest();
            const res = mockResponse();
            const axiosError = {
                isAxiosError: true,
                request: {},
                response: undefined
            };

            errorHandler(axiosError as any, req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ERROR_MESSAGES.NETWORK_ERROR,
                    statusCode: 500
                })
            );
        });

        it('should handle JWT errors', () => {
            const req = mockRequest();
            const res = mockResponse();
            const jwtError = new Error('Invalid token');
            jwtError.name = 'JsonWebTokenError';

            errorHandler(jwtError, req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ERROR_MESSAGES.INVALID_TOKEN,
                    statusCode: 401
                })
            );
        });

        it('should handle JWT expired errors', () => {
            const req = mockRequest();
            const res = mockResponse();
            const jwtError = new Error('Token expired');
            jwtError.name = 'TokenExpiredError';

            errorHandler(jwtError, req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ERROR_MESSAGES.TOKEN_EXPIRED,
                    statusCode: 401
                })
            );
        });
    });

    describe('notFoundHandler middleware', () => {
        it('should create NotFoundError and call next', () => {
            const req = mockRequest({ originalUrl: '/api/nonexistent' });
            const res = mockResponse();

            notFoundHandler(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Route /api/nonexistent not found',
                    statusCode: 404
                })
            );
        });
    });

    describe('catchAsync wrapper', () => {
        it('should catch and forward async errors', async () => {
            const asyncFunction = async () => {
                throw new Error('Async error');
            };
            const wrappedFunction = catchAsync(asyncFunction);
            const req = mockRequest();
            const res = mockResponse();

            await wrappedFunction(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Async error'
                })
            );
        });

        it('should not call next for successful async functions', async () => {
            const asyncFunction = async (req: Request, res: Response) => {
                res.json({ success: true });
            };
            const wrappedFunction = catchAsync(asyncFunction);
            const req = mockRequest();
            const res = mockResponse();

            await wrappedFunction(req, res, mockNext);

            expect(mockNext).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });
    });

    describe('validateRequest helper', () => {
        it('should not throw for empty validation errors', () => {
            expect(() => validateRequest([])).not.toThrow();
        });

        it('should throw ValidationAppError for validation errors', () => {
            const validationErrors: ValidationError[] = [
                { field: 'page', message: 'Invalid page', value: 'abc' }
            ];

            expect(() => validateRequest(validationErrors)).toThrow(ValidationAppError);
            expect(() => validateRequest(validationErrors)).toThrow(ERROR_MESSAGES.VALIDATION_FAILED);
        });
    });
}); 