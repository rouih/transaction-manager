# Transaction API - TypeScript Express Project

A comprehensive TypeScript Node.js API for managing transactions with pagination, counting, sum calculations, and environment-aware data sources.

## 🚀 Features

- **Environment-Aware Data Sources**: Automatically switches between mock data (development) and external API (production)
- **Complete CRUD Operations**: Fetch, count, and calculate transaction sums
- **Robust Pagination**: Full pagination support with metadata
- **Type Safety**: Full TypeScript implementation with comprehensive DTOs
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Interactive Documentation**: Swagger UI for API exploration and testing
- **Comprehensive Testing**: 40+ test cases covering all scenarios
- **Input Validation**: Request parameter validation with detailed error messages

## 📋 API Endpoints

### Base URL
```
http://localhost:3000
```

### Core Endpoints

| Method | Endpoint | Description | Environment Aware |
|--------|----------|-------------|-------------------|
| `GET` | `/` | API welcome and information | ❌ |
| `GET` | `/health` | Server health check | ❌ |
| `GET` | `/api-docs` | Interactive Swagger documentation | ❌ |

### Transaction Endpoints

| Method | Endpoint | Description | Environment Aware |
|--------|----------|-------------|-------------------|
| `GET` | `/api/transactions/all` | Get all transactions with pagination | ✅ |
| `GET` | `/api/transactions/count` | Get transaction count with pagination metadata | ✅ |
| `GET` | `/api/transactions/sum` | Calculate transaction sums with optional breakdown | ✅ |
| `GET` | `/api/transactions/available-balance` | Get available balance (placeholder) | ❌ |

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd Receive
npm install
```

2. **Install additional dependencies (if not already installed):**
```bash
npm install swagger-ui-express swagger-jsdoc
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc jest @types/jest ts-jest
```

## 🎮 Usage

### Development Mode (Mock Data)
```bash
npm run dev
```
- Uses local mock data from `src/data/transactions.json`
- No external API calls required
- Consistent, predictable responses
- Perfect for development and testing

### Production Mode (External API)
```bash
npm run build
npm start
```
- Connects to external transaction API
- Real-time data fetching
- Production-ready error handling

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📖 API Documentation

### Interactive Documentation
Visit `http://localhost:3000/api-docs` for interactive Swagger UI documentation where you can:
- Browse all endpoints
- Try out API calls directly
- View request/response schemas
- See example responses

### Swagger JSON
Get the raw OpenAPI specification at `http://localhost:3000/api-docs.json`

## 🔍 Endpoint Details

### 1. Get All Transactions
```http
GET /api/transactions/all?page=1&pageSize=10
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "transactions": [...],
    "next_cursor": "..." // Production only
  },
  "message": "Transactions retrieved successfully"
}
```

### 2. Get Transaction Count
```http
GET /api/transactions/count?page=1&pageSize=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "page": 1,
    "pageSize": 10,
    "total": 8,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "message": "Transaction count retrieved successfully"
}
```

### 3. Calculate Transaction Sum ⭐ **Featured**
```http
GET /api/transactions/sum?type=all&includeBreakdown=true
```

**Query Parameters:**
- `type` (optional): `'credit' | 'debit' | 'all'` (default: 'all')
- `includeBreakdown` (optional): Include detailed breakdown (default: false)

**Response with Breakdown:**
```json
{
  "success": true,
  "data": {
    "totalSum": 1396.50,
    "currency": "USD",
    "transactionCount": 8,
    "breakdown": {
      "creditSum": 1100.50,
      "debitSum": 296.00,
      "netAmount": 804.50
    }
  },
  "message": "Transaction sum calculated successfully"
}
```

**Examples:**
- All transactions: `/api/transactions/sum`
- Credit only: `/api/transactions/sum?type=credit`
- With breakdown: `/api/transactions/sum?includeBreakdown=true`
- Debit only: `/api/transactions/sum?type=debit&includeBreakdown=true`

## 🌍 Environment Configuration

### Development Environment
```bash
NODE_ENV=development npm run dev
```
- **Data Source**: `src/data/transactions.json`
- **Benefits**: Offline development, consistent data, fast responses
- **Perfect for**: Development, testing, demos

### Production Environment
```bash
NODE_ENV=production npm start
```
- **Data Source**: External API (`https://2e36b6c35bd3.ngrok-free.app/transactions`)
- **Benefits**: Real-time data, production-ready
- **Perfect for**: Live deployments, real data processing

## 🧪 Testing

### Test Coverage
- **40 test cases** covering all functionality
- **Pagination scenarios**: Edge cases, boundary conditions
- **Error handling**: Validation, network errors, malformed data
- **Environment awareness**: Development and production modes
- **Mock data testing**: Comprehensive transaction sum calculations

### Run Tests
```bash
# All tests
npm test

# Specific test file
npm test transaction.service.test.ts

# With coverage report
npm run test:coverage
```

## 📁 Project Structure

```
src/
├── api/
│   ├── controllers/     # Request handlers
│   └── routes/          # Route definitions
├── common/
│   └── consnts.ts      # Application constants
├── config/
│   └── swagger.config.ts # Swagger/OpenAPI configuration
├── data/
│   └── transactions.json # Mock transaction data
├── dto/
│   └── transaciton.dto.ts # Data Transfer Objects
├── middleware/
│   └── error.middleware.ts # Error handling
├── services/
│   └── transaction.service.ts # Business logic
├── types/
│   └── index.ts        # Type exports
├── utils/
│   └── pagination.utils.ts # Pagination utilities
└── index.ts            # Application entry point
```

## 🔧 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start with hot reload (ts-node) |
| Build | `npm run build` | Compile TypeScript to JavaScript |
| Start | `npm start` | Run production build |
| Watch | `npm run watch` | File watching mode |
| Test | `npm test` | Run all tests |
| Test Watch | `npm run test:watch` | Run tests in watch mode |
| Test Coverage | `npm run test:coverage` | Run tests with coverage report |

## 🛡 Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: Detailed field-level validation with specific error messages
- **Network Errors**: Graceful handling of external API failures
- **Environment Errors**: Automatic fallback and error reporting
- **HTTP Status Codes**: Proper status codes (400, 401, 403, 404, 500)
- **Development vs Production**: Different error detail levels based on environment

**Example Error Response:**
```json
{
  "success": false,
  "error": "ValidationAppError",
  "message": "Validation failed",
  "statusCode": 400,
  "validationErrors": [
    {
      "field": "type",
      "message": "Type must be one of: credit, debit, all",
      "value": "invalid_type"
    }
  ]
}
```

## 🔗 Integration Examples

### Frontend Integration
```javascript
// Fetch all transactions
const response = await fetch('http://localhost:3000/api/transactions/all?page=1&pageSize=10');
const data = await response.json();

// Calculate transaction sum with breakdown
const sumResponse = await fetch('http://localhost:3000/api/transactions/sum?includeBreakdown=true');
const sumData = await sumResponse.json();
console.log(`Total: $${sumData.data.totalSum}`);
console.log(`Net Amount: $${sumData.data.breakdown.netAmount}`);
```

### cURL Examples
```bash
# Get all transactions
curl "http://localhost:3000/api/transactions/all?page=1&pageSize=5"

# Get transaction count
curl "http://localhost:3000/api/transactions/count"

# Calculate sum with breakdown
curl "http://localhost:3000/api/transactions/sum?type=all&includeBreakdown=true"

# Get credit transactions sum only
curl "http://localhost:3000/api/transactions/sum?type=credit"
```

## 🚀 Deployment

### Environment Variables
```bash
NODE_ENV=production  # Switches to external API
PORT=3000           # Server port (default: 3000)
```

### Production Deployment
1. Build the application: `npm run build`
2. Set environment variables
3. Start the server: `npm start`
4. Access API documentation: `http://your-domain.com/api-docs`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm test`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎯 Quick Start**: Run `npm run dev` and visit `http://localhost:3000/api-docs` to explore the API! 