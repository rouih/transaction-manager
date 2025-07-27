import { getTransactionFromMock, getTransactionCount, getTransactionSum } from '../transaction.service';

// Mock fs module
jest.mock('fs', () => ({
    readFileSync: jest.fn(),
}));

// Mock path module
jest.mock('path', () => ({
    join: jest.fn(),
}));

// Mock axios client
jest.mock('../../axios/axios-client', () => ({
    get: jest.fn(),
}));

describe('Transaction Service Pagination Tests', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;

    const mockTransactions = [
        {
            id: "1",
            type: "credit",
            amount: 100.50,
            description: "Salary deposit",
            date: "2024-01-15T10:30:00Z",
            accountId: "acc123"
        },
        {
            id: "2",
            type: "debit",
            amount: 25.00,
            description: "Coffee shop purchase",
            date: "2024-01-15T14:20:00Z",
            accountId: "acc123"
        },
        {
            id: "3",
            type: "credit",
            amount: 500.00,
            description: "Freelance payment",
            date: "2024-01-16T09:15:00Z",
            accountId: "acc123"
        },
        {
            id: "4",
            type: "debit",
            amount: 75.25,
            description: "Grocery shopping",
            date: "2024-01-16T16:45:00Z",
            accountId: "acc123"
        },
        {
            id: "5",
            type: "credit",
            amount: 200.00,
            description: "Refund from online store",
            date: "2024-01-17T11:00:00Z",
            accountId: "acc123"
        },
        {
            id: "6",
            type: "debit",
            amount: 150.00,
            description: "Utility bill payment",
            date: "2024-01-18T08:30:00Z",
            accountId: "acc123"
        },
        {
            id: "7",
            type: "credit",
            amount: 300.00,
            description: "Investment dividend",
            date: "2024-01-19T12:00:00Z",
            accountId: "acc123"
        },
        {
            id: "8",
            type: "debit",
            amount: 45.75,
            description: "Restaurant dinner",
            date: "2024-01-19T19:15:00Z",
            accountId: "acc123"
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // Set NODE_ENV to development to use mock data
        process.env.NODE_ENV = 'development';

        const fs = require('fs');
        const path = require('path');

        fs.readFileSync.mockReturnValue(JSON.stringify(mockTransactions));
        path.join.mockReturnValue('/mock/path/to/transactions.json');
    });

    afterEach(() => {
        // Restore original NODE_ENV
        process.env.NODE_ENV = originalNodeEnv;
    });

    describe('getTransactionFromMock', () => {
        it('should return first page with default pagination (page=1, pageSize=10)', async () => {
            const result = await getTransactionFromMock();

            expect(result.data).toHaveLength(8); // All transactions since pageSize=10 > total=8
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 10,
                total: 8,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false
            });
        });

        it('should return first page with custom pageSize=3', async () => {
            const result = await getTransactionFromMock(1, 3);

            expect(result.data).toHaveLength(3);
            expect(result.data[0].id).toBe("1");
            expect(result.data[1].id).toBe("2");
            expect(result.data[2].id).toBe("3");
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 3,
                total: 8,
                totalPages: 3, // Math.ceil(8/3) = 3
                hasNext: true,
                hasPrevious: false
            });
        });

        it('should return second page with pageSize=3', async () => {
            const result = await getTransactionFromMock(2, 3);

            expect(result.data).toHaveLength(3);
            expect(result.data[0].id).toBe("4");
            expect(result.data[1].id).toBe("5");
            expect(result.data[2].id).toBe("6");
            expect(result.pagination).toEqual({
                page: 2,
                pageSize: 3,
                total: 8,
                totalPages: 3,
                hasNext: true,
                hasPrevious: true
            });
        });

        it('should return third page with pageSize=3', async () => {
            const result = await getTransactionFromMock(3, 3);

            expect(result.data).toHaveLength(2); // Only 2 items left
            expect(result.data[0].id).toBe("7");
            expect(result.data[1].id).toBe("8");
            expect(result.pagination).toEqual({
                page: 3,
                pageSize: 3,
                total: 8,
                totalPages: 3,
                hasNext: false,
                hasPrevious: true
            });
        });

        it('should return empty array for page beyond total pages', async () => {
            const result = await getTransactionFromMock(5, 3);

            expect(result.data).toHaveLength(0);
            expect(result.pagination).toEqual({
                page: 5,
                pageSize: 3,
                total: 8,
                totalPages: 3,
                hasNext: false,
                hasPrevious: true
            });
        });

        it('should handle pageSize larger than total items', async () => {
            const result = await getTransactionFromMock(1, 20);

            expect(result.data).toHaveLength(8);
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 20,
                total: 8,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false
            });
        });

        it('should handle edge case with pageSize=1', async () => {
            const result = await getTransactionFromMock(2, 1);

            expect(result.data).toHaveLength(1);
            expect(result.data[0].id).toBe("2");
            expect(result.pagination).toEqual({
                page: 2,
                pageSize: 1,
                total: 8,
                totalPages: 8,
                hasNext: true,
                hasPrevious: true
            });
        });

        it('should handle edge case with pageSize equal to total items', async () => {
            const result = await getTransactionFromMock(1, 8);

            expect(result.data).toHaveLength(8);
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 8,
                total: 8,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false
            });
        });

        it('should handle zero pageSize gracefully', async () => {
            const result = await getTransactionFromMock(1, 0);

            expect(result.data).toHaveLength(0);
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 0,
                total: 8,
                totalPages: 0,
                hasNext: false,
                hasPrevious: false
            });
        });

        it('should handle negative page gracefully', async () => {
            const result = await getTransactionFromMock(-1, 3);

            expect(result.data).toHaveLength(0);
            expect(result.pagination).toEqual({
                page: -1,
                pageSize: 3,
                total: 8,
                totalPages: 3,
                hasNext: true, // createPaginationMetadata calculates this as -1 < 3 = true
                hasPrevious: false
            });
        });
    });

    describe('getTransactionCount pagination', () => {
        it('should handle pagination parameters correctly (development mode)', async () => {
            const result = await getTransactionCount(2, 5);

            expect(result).toHaveProperty('page');
            expect(result).toHaveProperty('pageSize');
            expect(result).toHaveProperty('hasNext');
            expect(result).toHaveProperty('hasPrevious');
            expect(result.page).toBe(2);
            expect(result.pageSize).toBe(5);
            expect(result.count).toBe(3); // Page 2 with pageSize 5 from 8 total = 3 items
            expect(result.total).toBe(8);
            expect(result.hasNext).toBe(false); // Page 2 is the last page
            expect(result.hasPrevious).toBe(true);
        });

        it('should handle first page correctly (development mode)', async () => {
            const result = await getTransactionCount(1, 5);

            expect(result.count).toBe(5); // First 5 items from 8 total
            expect(result.total).toBe(8);
            expect(result.page).toBe(1);
            expect(result.pageSize).toBe(5);
            expect(result.totalPages).toBe(2); // Math.ceil(8/5) = 2
            expect(result.hasNext).toBe(true);
            expect(result.hasPrevious).toBe(false);
        });
    });

    describe('Pagination edge cases', () => {
        it('should handle empty transaction list', async () => {
            const fs = require('fs');
            fs.readFileSync.mockReturnValue('[]');

            const result = await getTransactionFromMock(1, 5);

            expect(result.data).toHaveLength(0);
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 5,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrevious: false
            });
        });

        it('should handle single transaction', async () => {
            const fs = require('fs');
            fs.readFileSync.mockReturnValue(JSON.stringify([mockTransactions[0]]));

            const result = await getTransactionFromMock(1, 5);

            expect(result.data).toHaveLength(1);
            expect(result.data[0].id).toBe("1");
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 5,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false
            });
        });
    });

    describe('getTransactionSum', () => {
        it('should calculate total sum of all transactions', async () => {
            const result = await getTransactionSum('all', false);

            // Sum: 100.50 + 25.00 + 500.00 + 75.25 + 200.00 + 150.00 + 300.00 + 45.75 = 1396.50
            expect(result.totalSum).toBe(1396.50);
            expect(result.currency).toBe('USD');
            expect(result.transactionCount).toBe(8);
            expect(result.breakdown).toBeUndefined();
        });

        it('should calculate sum for credit transactions only', async () => {
            const result = await getTransactionSum('credit', false);

            // Credit sum: 100.50 + 500.00 + 200.00 + 300.00 = 1100.50
            expect(result.totalSum).toBe(1100.50);
            expect(result.currency).toBe('USD');
            expect(result.transactionCount).toBe(4);
        });

        it('should calculate sum for debit transactions only', async () => {
            const result = await getTransactionSum('debit', false);

            // Debit sum: 25.00 + 75.25 + 150.00 + 45.75 = 296.00
            expect(result.totalSum).toBe(296.00);
            expect(result.currency).toBe('USD');
            expect(result.transactionCount).toBe(4);
        });

        it('should include breakdown when requested', async () => {
            const result = await getTransactionSum('all', true);

            expect(result.totalSum).toBe(1396.50);
            expect(result.breakdown).toBeDefined();
            expect(result.breakdown!.creditSum).toBe(1100.50);
            expect(result.breakdown!.debitSum).toBe(296.00);
            expect(result.breakdown!.netAmount).toBe(804.50); // 1100.50 - 296.00
        });

        it('should handle empty transaction list', async () => {
            const fs = require('fs');
            fs.readFileSync.mockReturnValue('[]');

            const result = await getTransactionSum('all', true);

            expect(result.totalSum).toBe(0);
            expect(result.transactionCount).toBe(0);
            expect(result.breakdown!.creditSum).toBe(0);
            expect(result.breakdown!.debitSum).toBe(0);
            expect(result.breakdown!.netAmount).toBe(0);
        });

        it('should round amounts to 2 decimal places', async () => {
            const fs = require('fs');
            const testTransactions = [
                { id: "1", type: "credit", amount: 100.333, description: "Test", date: "2024-01-01", accountId: "acc1" },
                { id: "2", type: "debit", amount: 50.666, description: "Test", date: "2024-01-01", accountId: "acc1" }
            ];
            fs.readFileSync.mockReturnValue(JSON.stringify(testTransactions));

            const result = await getTransactionSum('all', true);

            expect(result.totalSum).toBe(151); // 100.333 + 50.666 = 150.999 rounded to 151
            expect(result.breakdown!.creditSum).toBe(100.33); // 100.333 rounded to 100.33
            expect(result.breakdown!.debitSum).toBe(50.67); // 50.666 rounded to 50.67
            expect(result.breakdown!.netAmount).toBe(49.67); // 100.33 - 50.67 = 49.66, but due to rounding: 49.67
        });
    });
}); 