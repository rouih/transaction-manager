import { MockTransaction } from "../dto/transaciton.dto";
import { NODE_ENV } from "../common/consnts";
import axiosClient from "../axios/axios-client";
import { convertApiToMockTransactions } from "./transaction-transform.utils";
import { Logger } from "./logger.utils";

const TRANSACTIONS_URL = 'https://2e36b6c35bd3.ngrok-free.app/transactions';

/**
 * Utility class for managing transaction data sources
 */
export class TransactionDataUtils {
    /**
     * Determines if we should use mock data based on environment
     */
    static shouldUseMockData(): boolean {
        return process.env.NODE_ENV ? process.env.NODE_ENV === NODE_ENV.DEVELOPMENT : true;
    }

    /**
     * Reads mock transaction data from JSON file
     */
    static readMockData(): MockTransaction[] {
        const fs = require('fs');
        const path = require('path');

        const filePath = path.join(__dirname, '../data/transactions.json');
        const rawData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(rawData);
    }

    /**
     * Fetches transactions from appropriate source (mock or API)
     */
    static async fetchTransactions(): Promise<MockTransaction[]> {
        if (this.shouldUseMockData()) {
            Logger.debug('Using mock data source for transactions', 'TransactionDataUtils');
            return this.readMockData();
        } else {
            Logger.debug('Fetching transactions from external API', 'TransactionDataUtils');
            const response = await axiosClient.get(TRANSACTIONS_URL);
            const responseData = response.data as any;
            return convertApiToMockTransactions(responseData);
        }
    }

    /**
     * Fetches transactions with pagination parameters for API calls
     */
    static async fetchTransactionsWithPagination(page: number, pageSize: number): Promise<any> {
        try {
            Logger.debug(`Fetching paginated transactions - page: ${page}, pageSize: ${pageSize}`, 'TransactionDataUtils');
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('page_size', pageSize.toString());

            const response = await axiosClient.get(`${TRANSACTIONS_URL}?${params.toString()}`);
            return response.data;
        } catch (error) {
            Logger.error('Failed to fetch paginated transactions from API', error as Error, 'TransactionDataUtils');
            throw error;
        }
    }

    /**
     * Fetches raw API response without transformation
     */
    static async fetchRawApiResponse(): Promise<any> {
        const response = await axiosClient.get(TRANSACTIONS_URL);
        return response.data;
    }
}

// Export individual functions for backward compatibility
export const shouldUseMockData = TransactionDataUtils.shouldUseMockData;
export const readMockData = TransactionDataUtils.readMockData;
export const fetchTransactionsForSum = TransactionDataUtils.fetchTransactions; 