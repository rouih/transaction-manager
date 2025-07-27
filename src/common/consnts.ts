// Error handling constants
export enum ErrorType {
    CAST_ERROR = 'CastError',
    VALIDATION_ERROR = 'ValidationError',
    DUPLICATE_FIELDS = 'DuplicateFields',
    JWT_ERROR = 'JsonWebTokenError',
    JWT_EXPIRED = 'TokenExpiredError',
    AXIOS_ERROR = 'AxiosError',
    GENERIC_ERROR = 'GenericError'
}

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
} as const;

// Environment constants
export const NODE_ENV = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test'
} as const;

// Error messages
export const ERROR_MESSAGES = {
    SOMETHING_WENT_WRONG: 'Something went wrong',
    VALIDATION_FAILED: 'Validation failed',
    UNAUTHORIZED_ACCESS: 'Unauthorized access',
    FORBIDDEN_ACCESS: 'Forbidden access',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    INVALID_TOKEN: 'Invalid token. Please log in again',
    TOKEN_EXPIRED: 'Your token has expired. Please log in again',
    NETWORK_ERROR: 'Network error - no response from external service',
    REQUEST_CONFIG_ERROR: 'Request configuration error'
} as const;
