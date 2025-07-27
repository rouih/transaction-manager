import { MockTransaction } from "../dto/transaciton.dto";

/**
 * Utility class for transaction data transformations
 */
export class TransactionTransformUtils {
    /**
     * Converts API response to MockTransaction format
     */
    static convertApiToMockTransactions(responseData: any): MockTransaction[] {
        if (Array.isArray(responseData)) {
            return responseData.map((t: any) => this.mapSingleTransaction(t));
        } else if (responseData?.transactions) {
            return responseData.transactions.map((t: any) => this.mapSingleTransaction(t));
        }
        return [];
    }

    /**
     * Maps a single API transaction to MockTransaction format
     */
    private static mapSingleTransaction(apiTransaction: any): MockTransaction {
        return {
            id: apiTransaction.id || apiTransaction.transaction_id,
            type: apiTransaction.type === 'receivable' ? 'credit' : 'debit', // Map API types to mock types
            amount: apiTransaction.amount,
            description: apiTransaction.description || `${apiTransaction.type} transaction`,
            date: apiTransaction.created_at || apiTransaction.date,
            accountId: apiTransaction.customer_id || apiTransaction.accountId
        };
    }

    /**
     * Converts MockTransaction to API format (for potential future use)
     */
    static convertMockToApiFormat(mockTransaction: MockTransaction): any {
        return {
            transaction_id: mockTransaction.id,
            type: mockTransaction.type === 'credit' ? 'receivable' : 'payable',
            amount: mockTransaction.amount,
            description: mockTransaction.description,
            created_at: mockTransaction.date,
            customer_id: mockTransaction.accountId
        };
    }

    /**
     * Normalizes transaction data ensuring consistent format
     */
    static normalizeTransactionData(transactions: any[]): MockTransaction[] {
        return transactions.map(t => {
            if (this.isAlreadyMockFormat(t)) {
                return t as MockTransaction;
            }
            return this.mapSingleTransaction(t);
        });
    }

    /**
     * Checks if transaction is already in MockTransaction format
     */
    private static isAlreadyMockFormat(transaction: any): boolean {
        return transaction.hasOwnProperty('id') &&
            transaction.hasOwnProperty('type') &&
            transaction.hasOwnProperty('amount') &&
            transaction.hasOwnProperty('accountId');
    }
}

// Export individual functions for backward compatibility
export const convertApiToMockTransactions = TransactionTransformUtils.convertApiToMockTransactions; 