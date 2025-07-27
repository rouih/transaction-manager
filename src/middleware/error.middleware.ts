import { Request, Response, NextFunction } from 'express';
import { ApiError, ValidationError } from '../dto/transaciton.dto';
import { ErrorType, ERROR_MESSAGES, NODE_ENV } from '../common/consnts';
import { Logger } from '../utils/logger.utils';

// Custom error class for application-specific errors
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
    public validationErrors?: ValidationError[];

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        validationErrors?: ValidationError[]
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.validationErrors = validationErrors;

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

// Validation error class
export class ValidationAppError extends AppError {
    constructor(message: string, validationErrors: ValidationError[]) {
        super(message, 400, true, validationErrors);
    }
}

// Not found error class
export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404);
    }
}

// Unauthorized error class
export class UnauthorizedError extends AppError {
    constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED_ACCESS) {
        super(message, 401);
    }
}

// Forbidden error class
export class ForbiddenError extends AppError {
    constructor(message: string = ERROR_MESSAGES.FORBIDDEN_ACCESS) {
        super(message, 403);
    }
}

// Bad request error class
export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

// Internal server error class
export class InternalServerError extends AppError {
    constructor(message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR) {
        super(message, 500);
    }
}

// Error response formatter
const formatErrorResponse = (error: AppError, req: Request): ApiError => {
    return {
        success: false,
        error: error.constructor.name || 'Error',
        message: error.message,
        statusCode: error.statusCode,
        ...(error.validationErrors && { validationErrors: error.validationErrors })
    };
};

// Development error response (includes stack trace)
const sendErrorDev = (error: AppError, req: Request, res: Response): void => {
    const errorResponse = {
        ...formatErrorResponse(error, req),
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: req.originalUrl,
        method: req.method
    };

    Logger.error(`${req.method} ${req.originalUrl} - ${error.message}`, error, 'ErrorMiddleware');
    res.status(error.statusCode).json(errorResponse);
};

const sendErrorProd = (error: AppError, req: Request, res: Response): void => {
    if (error.isOperational) {
        const errorResponse = formatErrorResponse(error, req);
        res.status(error.statusCode).json(errorResponse);
    } else {
        Logger.error(`Non-operational error on ${req.method} ${req.originalUrl}`, error, 'ErrorMiddleware');
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Something went wrong',
            statusCode: 500
        });
    }
};

const handleCastError = (error: any): AppError => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new BadRequestError(message);
};

const handleDuplicateFieldsError = (error: any): AppError => {
    const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value`;
    return new BadRequestError(message);
};

const handleValidationError = (error: any): AppError => {
    const errors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
        value: err.value
    }));

    return new ValidationAppError('Invalid input data', errors);
};

// Handle JWT errors
const handleJWTError = (): AppError => {
    return new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
};

// Handle JWT expired error
const handleJWTExpiredError = (): AppError => {
    return new UnauthorizedError(ERROR_MESSAGES.TOKEN_EXPIRED);
};

// Handle Axios errors
const handleAxiosError = (error: any): AppError => {
    if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 'External API error';
        return new AppError(message, error.response.status);
    } else if (error.request) {
        // Request was made but no response received
        return new InternalServerError(ERROR_MESSAGES.NETWORK_ERROR);
    } else {
        // Something else happened
        return new InternalServerError(ERROR_MESSAGES.REQUEST_CONFIG_ERROR);
    }
};



// Determine error type for switch case handling
const determineErrorType = (error: Error): ErrorType => {
    if (error.name === 'CastError') {
        return ErrorType.CAST_ERROR;
    }

    if (error.name === 'ValidationError') {
        return ErrorType.VALIDATION_ERROR;
    }

    if ((error as any).code === 11000) {
        return ErrorType.DUPLICATE_FIELDS;
    }

    if (error.name === 'JsonWebTokenError') {
        return ErrorType.JWT_ERROR;
    }

    if (error.name === 'TokenExpiredError') {
        return ErrorType.JWT_EXPIRED;
    }

    if ((error as any).isAxiosError) {
        return ErrorType.AXIOS_ERROR;
    }

    return ErrorType.GENERIC_ERROR;
};

// Convert specific error types to AppError using switch case
const convertToAppError = (error: Error): AppError => {
    const errorType = determineErrorType(error);

    switch (errorType) {
        case ErrorType.CAST_ERROR:
            return handleCastError(error);

        case ErrorType.VALIDATION_ERROR:
            return handleValidationError(error);

        case ErrorType.DUPLICATE_FIELDS:
            return handleDuplicateFieldsError(error);

        case ErrorType.JWT_ERROR:
            return handleJWTError();

        case ErrorType.JWT_EXPIRED:
            return handleJWTExpiredError();

        case ErrorType.AXIOS_ERROR:
            return handleAxiosError(error);

        case ErrorType.GENERIC_ERROR:
        default:
            return new AppError(
                error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG,
                500,
                false // Mark as non-operational since we don't know what it is
            );
    }
};

// Main error handling middleware
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Convert to AppError if it's not already one
    const appError = error instanceof AppError
        ? error
        : convertToAppError(error);

    // Send error response based on environment
    if (process.env.NODE_ENV === NODE_ENV.DEVELOPMENT) {
        sendErrorDev(appError, req, res);
    } else {
        sendErrorProd(appError, req, res);
    }
};

// Async error wrapper to catch async errors
export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

// 404 handler middleware (should be placed after all routes)
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    const error = new NotFoundError(`Route ${req.originalUrl}`);
    next(error);
};

// Validation middleware helper
export const validateRequest = (validationErrors: ValidationError[]) => {
    if (validationErrors.length > 0) {
        throw new ValidationAppError(ERROR_MESSAGES.VALIDATION_FAILED, validationErrors);
    }
}; 