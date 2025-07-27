import axiosClient from "../axios/axios-client";
import {
    Transaction,
    GetTransactionsServiceResponse,
    GetTransactionCountServiceResponse,
    GetTransactionFromMockServiceResponse,
    GetTransactionSumServiceResponse,
    MockTransaction,
    PaginationMetadata
} from "../dto/transaciton.dto";
import { createPaginationMetadata } from "../utils/pagination.utils";

const TRANSACTIONS_URL = 'https://2e36b6c35bd3.ngrok-free.app/transactions';

export const getTransactions = async (): Promise<GetTransactionsServiceResponse> => {
    try {
        const response = await axiosClient.get(TRANSACTIONS_URL);
        const responseData = response.data as any; // Type assertion for flexibility

        return {
            data: responseData,
            transactions: Array.isArray(responseData) ? responseData : responseData?.transactions,
            next_cursor: responseData?.next_cursor
        };
    } catch (error) {
        throw new Error(`Failed to fetch transactions: ${error}`);
    }
}
export const getTransactionCount = async (page: number = 1, pageSize: number = 10): Promise<GetTransactionCountServiceResponse> => {
    try {
        // Build query parameters for pagination
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', pageSize.toString());

        const response = await axiosClient.get(`${TRANSACTIONS_URL}?${params.toString()}`);
        const data = response.data as any; // Flexible typing for API responses

        // Handle both paginated and non-paginated responses
        if (data.transaction_data && Array.isArray(data.transaction_data)) {
            // Paginated response structure
            const total = data.metadata?.total || data.transaction_data.length;
            const pagination = createPaginationMetadata(page, pageSize, total);

            return {
                count: data.transaction_data.length,
                page,
                pageSize,
                total,
                totalPages: pagination.totalPages,
                hasNext: !!data.next_cursor,
                hasPrevious: page > 1
            };
        } else if (Array.isArray(data)) {
            // Non-paginated response structure (array of transactions)
            const pagination = createPaginationMetadata(1, data.length, data.length);

            return {
                count: data.length,
                total: data.length,
                page: 1,
                pageSize: data.length,
                totalPages: pagination.totalPages,
                hasNext: false,
                hasPrevious: false
            };
        }

        // Fallback for empty or invalid responses
        const pagination = createPaginationMetadata(page, pageSize, 0);
        return {
            count: 0,
            total: 0,
            page,
            pageSize,
            totalPages: pagination.totalPages,
            hasNext: false,
            hasPrevious: false
        };
    } catch (error) {
        throw new Error(`Failed to fetch transaction count: ${error}`);
    }
}

export const getTransactionFromMock = async (page: number = 1, pageSize: number = 10): Promise<GetTransactionFromMockServiceResponse> => {
    try {
        const fs = require('fs');
        const path = require('path');

        // Read the mock data from transactions.json
        const filePath = path.join(__dirname, '../data/transactions.json');
        const rawData = fs.readFileSync(filePath, 'utf8');
        const transactions: MockTransaction[] = JSON.parse(rawData);

        // Handle edge cases
        if (page < 1) {
            const pagination = pageSize > 0 ? createPaginationMetadata(page, pageSize, transactions.length) : {
                page,
                pageSize,
                total: transactions.length,
                totalPages: 0,
                hasNext: false,
                hasPrevious: false
            };

            return {
                data: [],
                pagination
            };
        }

        if (pageSize <= 0) {
            return {
                data: [],
                pagination: {
                    page,
                    pageSize,
                    total: transactions.length,
                    totalPages: 0,
                    hasNext: false,
                    hasPrevious: false
                }
            };
        }

        // Calculate pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedTransactions = transactions.slice(startIndex, endIndex);
        const pagination = createPaginationMetadata(page, pageSize, transactions.length);

        // Return paginated response
        return {
            data: paginatedTransactions,
            pagination
        };
    } catch (error) {
        throw new Error(`Failed to fetch mock transactions: ${error}`);
    }
}

export const getTransactionSum = async (
    type: 'credit' | 'debit' | 'all' = 'all',
    includeBreakdown: boolean = false
): Promise<GetTransactionSumServiceResponse> => {
    try {
        const fs = require('fs');
        const path = require('path');

        // Read the mock data from transactions.json
        const filePath = path.join(__dirname, '../data/transactions.json');
        const rawData = fs.readFileSync(filePath, 'utf8');
        const transactions: MockTransaction[] = JSON.parse(rawData);

        // Filter transactions by type if specified
        const filteredTransactions = type === 'all'
            ? transactions
            : transactions.filter(t => t.type === type);

        // Calculate total sum
        const totalSum = filteredTransactions.reduce((sum, transaction) => {
            return sum + transaction.amount;
        }, 0);

        const response: GetTransactionSumServiceResponse = {
            totalSum: Math.round(totalSum * 100) / 100, // Round to 2 decimal places
            currency: 'USD', // Default currency
            transactionCount: filteredTransactions.length
        };

        // Add breakdown if requested
        if (includeBreakdown) {
            const creditTransactions = transactions.filter(t => t.type === 'credit');
            const debitTransactions = transactions.filter(t => t.type === 'debit');

            const creditSum = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
            const debitSum = debitTransactions.reduce((sum, t) => sum + t.amount, 0);

            response.breakdown = {
                creditSum: Math.round(creditSum * 100) / 100,
                debitSum: Math.round(debitSum * 100) / 100,
                netAmount: Math.round((creditSum - debitSum) * 100) / 100
            };
        }

        return response;
    } catch (error) {
        throw new Error(`Failed to calculate transaction sum: ${error}`);
    }
}