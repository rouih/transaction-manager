
export interface TransactionMetadata {
    failure_reason: string | null;
    gross_amount: string;
    payment_date: string;
    payment_type: string;
    payment_status: string;
    customer_credit_amount: string;
    exchange_rate: number | null;
    parent_transaction_id: string | null;
    gross_amount_currency_id: string;
    customer_credit_amount_currency_id: string;
    platform_account_id: string;
}

export interface TransactionData {
    transaction_id: string;
    payment_method_type: 'wire' | 'cash' | 'cheque' | 'ach';
    type: 'sale' | 'refund' | 'credit_repayment';
    amount: number;
    status: 'success' | 'failed' | 'pending';
    statement_id?: string;
    metadata: TransactionMetadata;
}

export interface Transaction {
    id: string;
    customer_id: string;
    type: 'receivable' | 'repayment';
    created_at: string;
    updated_at: string;
    amount: number;
    currency_code: string;
    status: 'completed' | 'processing';
    transaction_data: TransactionData;
    next_cursor?: string;
}

export interface TransactionResponseMetadata {
    request_id: string;
    page_size: number;
}

export interface TransactionResponse {
    transactions: Transaction[];
    metadata: TransactionResponseMetadata;
    next_cursor?: string;
}

// Additional utility types for specific use cases
export type TransactionType = Transaction['type'];
export type TransactionStatus = Transaction['status'];
export type PaymentMethodType = TransactionData['payment_method_type'];
export type TransactionDataType = TransactionData['type'];
export type TransactionDataStatus = TransactionData['status'];

// Enums for better type safety
export enum TransactionTypeEnum {
    RECEIVABLE = 'receivable',
    REPAYMENT = 'repayment'
}

export enum TransactionStatusEnum {
    COMPLETED = 'completed',
    PROCESSING = 'processing'
}

export enum PaymentMethodTypeEnum {
    WIRE = 'wire',
    CASH = 'cash',
    CHEQUE = 'cheque',
    ACH = 'ach'
}

export enum TransactionDataTypeEnum {
    SALE = 'sale',
    REFUND = 'refund',
    CREDIT_REPAYMENT = 'credit_repayment'
}

export enum TransactionDataStatusEnum {
    SUCCESS = 'success',
    FAILED = 'failed',
    PENDING = 'pending'
}

// ================================
// REQUEST DTOs (Controller Input)
// ================================

export interface PaginationQueryParams {
    page?: string | number;
    pageSize?: string | number;
    page_size?: string | number;
}

export interface GetTransactionsRequest extends PaginationQueryParams {
    // Additional query parameters can be added here
    status?: TransactionStatus;
    type?: TransactionType;
    fromDate?: string;
    toDate?: string;
}

export interface GetTransactionCountRequest extends PaginationQueryParams {
    // Same as GetTransactionsRequest but specific for count endpoint
}

export interface GetTransactionSumRequest {
    type?: 'credit' | 'debit' | 'all';
    fromDate?: string;
    toDate?: string;
    includeBreakdown?: string | boolean;
}

// ================================
// RESPONSE DTOs (Controller Output)
// ================================

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginationMetadata {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface PaginatedResponse<T = any> {
    data: T[];
    pagination: PaginationMetadata;
}

export interface TransactionCountResponse {
    count: number;
    page: number;
    pageSize: number;
    total?: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface TransactionSumResponse {
    totalSum: number;
    currency: string;
    transactionCount: number;
    breakdown?: {
        creditSum: number;
        debitSum: number;
        netAmount: number;
    };
}

// ================================
// SERVICE RETURN TYPES
// ================================

export interface GetTransactionsServiceResponse {
    transactions?: Transaction[];
    data?: any; // For flexible API response handling
    pagination?: PaginationMetadata;
    next_cursor?: string;
}

export interface GetTransactionCountServiceResponse extends TransactionCountResponse {
    // Extends the response with any additional fields from service
}

export interface GetTransactionFromMockServiceResponse extends PaginatedResponse<MockTransaction> {
    // Specific type for mock data response
}

export interface GetTransactionSumServiceResponse extends TransactionSumResponse {
    // Service response for transaction sum calculation
}

// ================================
// MOCK DATA TYPES
// ================================

export interface MockTransaction {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
    accountId: string;
}

export enum MockTransactionTypeEnum {
    CREDIT = 'credit',
    DEBIT = 'debit'
}

// ================================
// ERROR TYPES
// ================================

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

export interface ApiError {
    success: false;
    error: string;
    message: string;
    statusCode: number;
    validationErrors?: ValidationError[];
}

// ================================
// UTILITY TYPES
// ================================

export interface ParsedPaginationParams {
    page: number;
    pageSize: number;
}

// Type guards for runtime type checking
export const isValidTransactionType = (type: any): type is TransactionType => {
    return Object.values(TransactionTypeEnum).includes(type);
};

export const isValidTransactionStatus = (status: any): status is TransactionStatus => {
    return Object.values(TransactionStatusEnum).includes(status);
};

export const isValidMockTransactionType = (type: any): type is MockTransaction['type'] => {
    return Object.values(MockTransactionTypeEnum).includes(type);
};

// Pagination utility types
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export interface PaginationConfig {
    defaultPage: number;
    defaultPageSize: number;
    maxPageSize: number;
}
