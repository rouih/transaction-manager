import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

// Swagger definition
const swaggerDefinition: SwaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Transaction API',
        version: '1.0.0',
        description: 'A comprehensive API for managing transactions with pagination, counting, and sum calculations',
        contact: {
            name: 'API Support',
            email: 'support@transactionapi.com'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server'
        },
        {
            url: 'https://api.transactionapp.com',
            description: 'Production server'
        }
    ],
    components: {
        schemas: {
            // Basic transaction schema
            MockTransaction: {
                type: 'object',
                required: ['id', 'type', 'amount', 'description', 'date', 'accountId'],
                properties: {
                    id: {
                        type: 'string',
                        description: 'Unique transaction identifier',
                        example: '1'
                    },
                    type: {
                        type: 'string',
                        enum: ['credit', 'debit'],
                        description: 'Transaction type',
                        example: 'credit'
                    },
                    amount: {
                        type: 'number',
                        format: 'float',
                        minimum: 0,
                        description: 'Transaction amount',
                        example: 100.50
                    },
                    description: {
                        type: 'string',
                        description: 'Transaction description',
                        example: 'Salary deposit'
                    },
                    date: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Transaction date',
                        example: '2024-01-15T10:30:00Z'
                    },
                    accountId: {
                        type: 'string',
                        description: 'Associated account ID',
                        example: 'acc123'
                    }
                }
            },

            // Pagination metadata
            PaginationMetadata: {
                type: 'object',
                properties: {
                    page: {
                        type: 'integer',
                        minimum: 1,
                        description: 'Current page number',
                        example: 1
                    },
                    pageSize: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        description: 'Number of items per page',
                        example: 10
                    },
                    total: {
                        type: 'integer',
                        minimum: 0,
                        description: 'Total number of items',
                        example: 8
                    },
                    totalPages: {
                        type: 'integer',
                        minimum: 0,
                        description: 'Total number of pages',
                        example: 1
                    },
                    hasNext: {
                        type: 'boolean',
                        description: 'Whether there is a next page',
                        example: false
                    },
                    hasPrevious: {
                        type: 'boolean',
                        description: 'Whether there is a previous page',
                        example: false
                    }
                }
            },

            // Transaction count response
            TransactionCountResponse: {
                type: 'object',
                properties: {
                    count: {
                        type: 'integer',
                        minimum: 0,
                        description: 'Number of transactions',
                        example: 5
                    },
                    page: {
                        type: 'integer',
                        minimum: 1,
                        example: 1
                    },
                    pageSize: {
                        type: 'integer',
                        minimum: 1,
                        example: 10
                    },
                    total: {
                        type: 'integer',
                        minimum: 0,
                        example: 5
                    },
                    totalPages: {
                        type: 'integer',
                        minimum: 0,
                        example: 1
                    },
                    hasNext: {
                        type: 'boolean',
                        example: false
                    },
                    hasPrevious: {
                        type: 'boolean',
                        example: false
                    }
                }
            },

            // Transaction sum response
            TransactionSumResponse: {
                type: 'object',
                required: ['totalSum', 'currency', 'transactionCount'],
                properties: {
                    totalSum: {
                        type: 'number',
                        format: 'float',
                        description: 'Total sum of all transaction amounts (rounded to 2 decimal places)',
                        example: 1396.50
                    },
                    currency: {
                        type: 'string',
                        description: 'Currency code',
                        example: 'USD'
                    },
                    transactionCount: {
                        type: 'integer',
                        minimum: 0,
                        description: 'Number of transactions included in the sum',
                        example: 8
                    },
                    breakdown: {
                        type: 'object',
                        description: 'Optional detailed breakdown of the sum',
                        properties: {
                            creditSum: {
                                type: 'number',
                                format: 'float',
                                description: 'Total sum of credit transactions',
                                example: 1100.50
                            },
                            debitSum: {
                                type: 'number',
                                format: 'float',
                                description: 'Total sum of debit transactions',
                                example: 296.00
                            },
                            netAmount: {
                                type: 'number',
                                format: 'float',
                                description: 'Net amount (creditSum - debitSum)',
                                example: 804.50
                            }
                        }
                    }
                }
            },

            // Generic API response wrapper
            ApiResponse: {
                type: 'object',
                required: ['success', 'data'],
                properties: {
                    success: {
                        type: 'boolean',
                        description: 'Indicates if the request was successful',
                        example: true
                    },
                    data: {
                        description: 'Response data (type varies by endpoint)'
                    },
                    message: {
                        type: 'string',
                        description: 'Success message',
                        example: 'Data retrieved successfully'
                    }
                }
            },

            // Error response
            ApiError: {
                type: 'object',
                required: ['success', 'error', 'message', 'statusCode'],
                properties: {
                    success: {
                        type: 'boolean',
                        description: 'Always false for errors',
                        example: false
                    },
                    error: {
                        type: 'string',
                        description: 'Error type',
                        example: 'ValidationAppError'
                    },
                    message: {
                        type: 'string',
                        description: 'Error message',
                        example: 'Validation failed'
                    },
                    statusCode: {
                        type: 'integer',
                        description: 'HTTP status code',
                        example: 400
                    },
                    validationErrors: {
                        type: 'array',
                        description: 'Array of validation errors (if applicable)',
                        items: {
                            type: 'object',
                            properties: {
                                field: {
                                    type: 'string',
                                    description: 'Field that failed validation',
                                    example: 'type'
                                },
                                message: {
                                    type: 'string',
                                    description: 'Validation error message',
                                    example: 'Type must be one of: credit, debit, all'
                                },
                                value: {
                                    description: 'Invalid value that was provided',
                                    example: 'invalid_type'
                                }
                            }
                        }
                    }
                }
            }
        },

        // Reusable parameters
        parameters: {
            PageParam: {
                name: 'page',
                in: 'query',
                description: 'Page number for pagination',
                required: false,
                schema: {
                    type: 'integer',
                    minimum: 1,
                    default: 1
                },
                example: 1
            },
            PageSizeParam: {
                name: 'pageSize',
                in: 'query',
                description: 'Number of items per page',
                required: false,
                schema: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 100,
                    default: 10
                },
                example: 10
            },
            TransactionTypeParam: {
                name: 'type',
                in: 'query',
                description: 'Filter transactions by type',
                required: false,
                schema: {
                    type: 'string',
                    enum: ['credit', 'debit', 'all'],
                    default: 'all'
                },
                example: 'all'
            },
            IncludeBreakdownParam: {
                name: 'includeBreakdown',
                in: 'query',
                description: 'Include detailed breakdown in sum calculation',
                required: false,
                schema: {
                    type: 'boolean',
                    default: false
                },
                example: false
            }
        },

        // Common responses
        responses: {
            ValidationError: {
                description: 'Validation error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ApiError'
                        }
                    }
                }
            },
            NotFound: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ApiError'
                        },
                        example: {
                            success: false,
                            error: 'NotFoundError',
                            message: 'Route /api/nonexistent not found',
                            statusCode: 404
                        }
                    }
                }
            },
            InternalServerError: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ApiError'
                        },
                        example: {
                            success: false,
                            error: 'InternalServerError',
                            message: 'Something went wrong',
                            statusCode: 500
                        }
                    }
                }
            }
        }
    },
    tags: [
        {
            name: 'Transactions',
            description: 'Transaction management operations'
        },
        {
            name: 'Health',
            description: 'API health check endpoints'
        }
    ]
};

// Options for the swagger docs
const options = {
    definition: swaggerDefinition,
    // Path to the API docs
    apis: [
        './src/api/routes/*.ts',
        './src/api/controllers/*.ts',
        './src/index.ts'
    ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec; 