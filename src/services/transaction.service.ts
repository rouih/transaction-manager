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
import {
    createPaginationMetadata,
    TransactionDataUtils,
    TransactionCalculationUtils,
    TransactionTransformUtils
} from "../utils";

export const getTransactions = async (): Promise<GetTransactionsServiceResponse> => {
    try {
        if (TransactionDataUtils.shouldUseMockData()) {
            // Development: Use mock data
            const transactions = TransactionDataUtils.readMockData();
            return {
                data: transactions,
                transactions: transactions as any // Type assertion for mock data compatibility
            };
        } else {
            // Production: Use external API
            const responseData = await TransactionDataUtils.fetchRawApiResponse();

            return {
                data: responseData,
                transactions: Array.isArray(responseData) ? responseData : responseData?.transactions,
                next_cursor: responseData?.next_cursor
            };
        }
    } catch (error) {
        throw new Error(`Failed to fetch transactions: ${error}`);
    }
}

export const getTransactionCount = async (page: number = 1, pageSize: number = 10): Promise<GetTransactionCountServiceResponse> => {
    try {
        if (TransactionDataUtils.shouldUseMockData()) {
            // Development: Use mock data with pagination
            const transactions = TransactionDataUtils.readMockData();
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedTransactions = transactions.slice(startIndex, endIndex);
            const pagination = createPaginationMetadata(page, pageSize, transactions.length);

            return {
                count: paginatedTransactions.length,
                page,
                pageSize,
                total: transactions.length,
                totalPages: pagination.totalPages,
                hasNext: pagination.hasNext,
                hasPrevious: pagination.hasPrevious
            };
        } else {
            // Production: Use external API
            const data = await TransactionDataUtils.fetchTransactionsWithPagination(page, pageSize);

            // Handle both paginated and non-paginated responses
            if (data.transaction_data && Array.isArray(data.transaction_data)) {
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
        }
    } catch (error) {
        throw new Error(`Failed to fetch transaction count: ${error}`);
    }
}

export const getTransactionSum = async (
    type: 'credit' | 'debit' | 'all' = 'all',
    includeBreakdown: boolean = false
): Promise<GetTransactionSumServiceResponse> => {
    try {
        // Fetch transactions from appropriate source
        const transactions = await TransactionDataUtils.fetchTransactions();

        // Filter transactions by type if specified
        const filteredTransactions = TransactionCalculationUtils.filterTransactionsByType(transactions, type);

        // Calculate total sum
        const totalSum = TransactionCalculationUtils.calculateTransactionSum(filteredTransactions);

        // Build base response
        const response: GetTransactionSumServiceResponse = {
            totalSum,
            currency: 'USD', // Default currency
            transactionCount: filteredTransactions.length
        };

        // Add breakdown if requested
        if (includeBreakdown) {
            response.breakdown = TransactionCalculationUtils.calculateBreakdown(transactions);
        }

        return response;
    } catch (error) {
        throw new Error(`Failed to calculate transaction sum: ${error}`);
    }
};

// Keep the specific mock function for testing purposes
export const getTransactionFromMock = async (page: number = 1, pageSize: number = 10): Promise<GetTransactionFromMockServiceResponse> => {
    try {
        const transactions: MockTransaction[] = TransactionDataUtils.readMockData();

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