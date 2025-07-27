import { Request, Response } from "express";
import { getTransactionCount, getTransactions, getTransactionSum } from "../../services/transaction.service";
import {
    GetTransactionsRequest,
    GetTransactionCountRequest,
    GetTransactionSumRequest,
    ApiResponse,
    GetTransactionsServiceResponse,
    GetTransactionCountServiceResponse,
    GetTransactionSumServiceResponse,
    ApiError,
    ValidationError
} from "../../dto/transaciton.dto";
import { parsePaginationParams, validatePaginationParams } from "../../utils/pagination.utils";
import { catchAsync, validateRequest } from "../../middleware/error.middleware";

export const getAllTransactionsController = catchAsync(async (req: Request<{}, ApiResponse<GetTransactionsServiceResponse>, {}, GetTransactionsRequest>, res: Response<ApiResponse<GetTransactionsServiceResponse> | ApiError>) => {
    // Validate pagination parameters
    const validationErrors = validatePaginationParams(req.query);
    validateRequest(validationErrors);

    // Parse pagination parameters
    const { page, pageSize } = parsePaginationParams(req.query);

    // Get transactions from service
    const transactions = await getTransactions();

    res.json({
        success: true,
        data: transactions,
        message: "Transactions retrieved successfully"
    });
});

export const getTransactionCountController = catchAsync(async (req: Request<{}, ApiResponse<GetTransactionCountServiceResponse>, {}, GetTransactionCountRequest>, res: Response<ApiResponse<GetTransactionCountServiceResponse> | ApiError>) => {
    // Validate pagination parameters
    const validationErrors = validatePaginationParams(req.query);
    validateRequest(validationErrors);

    // Parse pagination parameters
    const { page, pageSize } = parsePaginationParams(req.query);

    // Get transaction count from service
    const transactionCount = await getTransactionCount(page, pageSize);

    res.json({
        success: true,
        data: transactionCount,
        message: "Transaction count retrieved successfully"
    });
});



export const getTransactionSumController = catchAsync(async (req: Request<{}, ApiResponse<GetTransactionSumServiceResponse>, {}, GetTransactionSumRequest>, res: Response<ApiResponse<GetTransactionSumServiceResponse> | ApiError>) => {
    // Parse query parameters
    const type = req.query.type || 'all';
    const includeBreakdown = req.query.includeBreakdown === true || req.query.includeBreakdown === 'true';

    // Validate type parameter
    if (type && !['credit', 'debit', 'all'].includes(type)) {
        validateRequest([{
            field: 'type',
            message: 'Type must be one of: credit, debit, all',
            value: type
        }]);
    }

    // Get transaction sum from service
    const transactionSum = await getTransactionSum(type as 'credit' | 'debit' | 'all', includeBreakdown);

    res.json({
        success: true,
        data: transactionSum,
        message: "Transaction sum calculated successfully"
    });
});