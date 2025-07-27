# TypeScript Express Project

A simple TypeScript Node.js project using Express.js.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Or build and run the production version:
```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server with ts-node
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run the built JavaScript
- `npm run watch` - Run with file watching enabled

## Endpoints

- `GET /` - Returns a hello message
- `GET /health` - Returns server health status

The server runs on port 3000 by default, or the port specified in the `PORT` environment variable. 