import { MockTransaction } from "../dto/transaciton.dto";

/**
 * Utility class for transaction calculations
 */
export class TransactionCalculationUtils {
    /**
     * Filters transactions by type
     */
    static filterTransactionsByType(
        transactions: MockTransaction[],
        type: 'credit' | 'debit' | 'all'
    ): MockTransaction[] {
        return type === 'all' ? transactions : transactions.filter(t => t.type === type);
    }

    /**
     * Calculates sum of transactions with proper rounding
     */
    static calculateTransactionSum(transactions: MockTransaction[]): number {
        const sum = transactions.reduce((total, transaction) => total + transaction.amount, 0);
        return Math.round(sum * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Calculates breakdown of credit/debit transactions
     */
    static calculateBreakdown(transactions: MockTransaction[]) {
        const creditTransactions = transactions.filter(t => t.type === 'credit');
        const debitTransactions = transactions.filter(t => t.type === 'debit');

        const creditSum = this.calculateTransactionSum(creditTransactions);
        const debitSum = this.calculateTransactionSum(debitTransactions);

        return {
            creditSum,
            debitSum,
            netAmount: Math.round((creditSum - debitSum) * 100) / 100
        };
    }

    /**
     * Calculates transaction statistics
     */
    static calculateTransactionStats(transactions: MockTransaction[]) {
        const breakdown = this.calculateBreakdown(transactions);
        const totalSum = this.calculateTransactionSum(transactions);

        return {
            total: totalSum,
            count: transactions.length,
            creditCount: transactions.filter(t => t.type === 'credit').length,
            debitCount: transactions.filter(t => t.type === 'debit').length,
            average: transactions.length > 0 ? Math.round((totalSum / transactions.length) * 100) / 100 : 0,
            ...breakdown
        };
    }

    /**
     * Finds transactions within amount range
     */
    static filterByAmountRange(
        transactions: MockTransaction[],
        minAmount?: number,
        maxAmount?: number
    ): MockTransaction[] {
        return transactions.filter(t => {
            if (minAmount !== undefined && t.amount < minAmount) return false;
            if (maxAmount !== undefined && t.amount > maxAmount) return false;
            return true;
        });
    }

    /**
     * Finds transactions by date range
     */
    static filterByDateRange(
        transactions: MockTransaction[],
        startDate?: string,
        endDate?: string
    ): MockTransaction[] {
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            if (startDate && transactionDate < new Date(startDate)) return false;
            if (endDate && transactionDate > new Date(endDate)) return false;
            return true;
        });
    }

    /**
     * Groups transactions by type and calculates sums
     */
    static groupByTypeWithSums(transactions: MockTransaction[]) {
        const grouped = transactions.reduce((acc, transaction) => {
            if (!acc[transaction.type]) {
                acc[transaction.type] = {
                    transactions: [],
                    sum: 0,
                    count: 0
                };
            }
            acc[transaction.type].transactions.push(transaction);
            acc[transaction.type].sum += transaction.amount;
            acc[transaction.type].count += 1;
            acc[transaction.type].sum = Math.round(acc[transaction.type].sum * 100) / 100;
            return acc;
        }, {} as Record<string, { transactions: MockTransaction[], sum: number, count: number }>);

        return grouped;
    }
}

// Export individual functions for backward compatibility
export const filterTransactionsByType = TransactionCalculationUtils.filterTransactionsByType;
export const calculateTransactionSum = TransactionCalculationUtils.calculateTransactionSum;
export const calculateBreakdown = TransactionCalculationUtils.calculateBreakdown; 