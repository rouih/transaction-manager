import {
    PaginationQueryParams,
    ParsedPaginationParams,
    ValidationError,
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
} from '../dto/transaciton.dto';

/**
 * Parses and validates pagination parameters from request query
 */
export const parsePaginationParams = (query: PaginationQueryParams): ParsedPaginationParams => {
    // Handle both camelCase and snake_case
    const pageParam = query.page || query.page;
    const pageSizeParam = query.pageSize || query.page_size;

    let page = DEFAULT_PAGE;
    let pageSize = DEFAULT_PAGE_SIZE;

    // Parse page parameter
    if (pageParam !== undefined) {
        const parsedPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : pageParam;
        if (!isNaN(parsedPage) && parsedPage > 0) {
            page = parsedPage;
        }
    }

    // Parse pageSize parameter
    if (pageSizeParam !== undefined) {
        const parsedPageSize = typeof pageSizeParam === 'string' ? parseInt(pageSizeParam, 10) : pageSizeParam;
        if (!isNaN(parsedPageSize) && parsedPageSize > 0 && parsedPageSize <= MAX_PAGE_SIZE) {
            pageSize = parsedPageSize;
        }
    }

    return { page, pageSize };
};

/**
 * Validates pagination parameters and returns validation errors if any
 */
export const validatePaginationParams = (query: PaginationQueryParams): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Handle both camelCase and snake_case
    const pageParam = query.page || query.page;
    const pageSizeParam = query.pageSize || query.page_size;

    // Validate page parameter
    if (pageParam !== undefined) {
        const parsedPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : pageParam;
        if (isNaN(parsedPage)) {
            errors.push({
                field: 'page',
                message: 'Page must be a valid number',
                value: pageParam
            });
        } else if (parsedPage < 1) {
            errors.push({
                field: 'page',
                message: 'Page must be greater than 0',
                value: parsedPage
            });
        }
    }

    // Validate pageSize parameter
    if (pageSizeParam !== undefined) {
        const parsedPageSize = typeof pageSizeParam === 'string' ? parseInt(pageSizeParam, 10) : pageSizeParam;
        if (isNaN(parsedPageSize)) {
            errors.push({
                field: 'pageSize',
                message: 'Page size must be a valid number',
                value: pageSizeParam
            });
        } else if (parsedPageSize < 1) {
            errors.push({
                field: 'pageSize',
                message: 'Page size must be greater than 0',
                value: parsedPageSize
            });
        } else if (parsedPageSize > MAX_PAGE_SIZE) {
            errors.push({
                field: 'pageSize',
                message: `Page size must not exceed ${MAX_PAGE_SIZE}`,
                value: parsedPageSize
            });
        }
    }

    return errors;
};

/**
 * Creates pagination metadata object
 */
export const createPaginationMetadata = (
    page: number,
    pageSize: number,
    total: number
) => {
    const totalPages = Math.ceil(total / pageSize);

    return {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
    };
};

/**
 * Calculates offset for database queries or array slicing
 */
export const calculateOffset = (page: number, pageSize: number): number => {
    return (page - 1) * pageSize;
};

/**
 * Validates and sanitizes pagination query parameters
 */
export const sanitizePaginationParams = (query: any): ParsedPaginationParams => {
    const sanitized = {
        page: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE
    };

    // Sanitize page
    if (query.page || query.page) {
        const pageValue = query.page || query.page;
        const parsedPage = parseInt(pageValue, 10);
        if (!isNaN(parsedPage) && parsedPage > 0) {
            sanitized.page = parsedPage;
        }
    }

    // Sanitize pageSize
    if (query.pageSize || query.page_size) {
        const pageSizeValue = query.pageSize || query.page_size;
        const parsedPageSize = parseInt(pageSizeValue, 10);
        if (!isNaN(parsedPageSize) && parsedPageSize > 0 && parsedPageSize <= MAX_PAGE_SIZE) {
            sanitized.pageSize = parsedPageSize;
        }
    }

    return sanitized;
}; 