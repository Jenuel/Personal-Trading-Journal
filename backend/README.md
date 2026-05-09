# Personal Trading Journal - Backend Documentation

This document provides a comprehensive overview of the backend architecture, technology stack, project structure, and API endpoints for the Personal Trading Journal application.

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Architecture Pattern](#architecture-pattern)
4. [Environment Variables](#environment-variables)
5. [API Endpoints](#api-endpoints)
   - [Portfolios](#portfolios)
   - [Trades](#trades)
6. [Scripts](#scripts)

---

## Technology Stack
- **Runtime Environment:** Node.js
- **Web Framework:** Express.js
- **Database / BaaS:** Supabase (PostgreSQL)
- **Middleware:** `cors` (Cross-Origin Resource Sharing), `express.json` (Body parsing)
- **Configuration:** `dotenv` (Environment variables management)
- **Testing:** Node.js native test runner (`node --test`)

## Project Structure
The backend codebase follows a structured layered architecture to ensure separation of concerns.

```text
backend/
├── src/
│   ├── config/          # Configuration files (Supabase client, Health checks)
│   ├── controllers/     # Request/Response handling logic
│   ├── repositories/    # Data access layer (Supabase interactions)
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic layer
│   └── server.js        # Main entry point of the application
├── .env                 # Environment variables (ignored in Git)
├── package.json         # Project metadata and dependencies
└── package-lock.json    # Dependency tree lockfile
```

## Architecture Pattern
The application uses a **Controller-Service-Repository** pattern:
1. **Routes (`/routes`)**: Define the HTTP methods and endpoints. They map incoming requests to the appropriate controller methods.
2. **Controllers (`/controllers`)**: Extract parameters and body payloads from the `request` object. They handle HTTP responses, status codes, and error reporting, delegating the actual work to the Service layer.
3. **Services (`/services`)**: Contain the core business logic. They orchestrate data between the controllers and repositories.
4. **Repositories (`/repositories`)**: Encapsulate the direct interaction with the Supabase database. This layer is responsible for running queries (`insert`, `select`, `update`, `delete`).

## Environment Variables
Create a `.env` file in the root of the `backend` directory with the following variables:

```env
PORT=3001 # Or any preferred port
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## API Endpoints

All endpoints assume the server is running on `http://localhost:<PORT>`. The Express app natively handles JSON requests and responses.

### Portfolios
Base path: `/port`

| HTTP Method | Endpoint | Description | Request Body / Params |
|-------------|----------|-------------|-----------------------|
| `GET`       | `/port/ports` | Get a list of all portfolios. | None |
| `GET`       | `/port/ports/:id` | Get a specific portfolio by ID. | **Params:** `id` |
| `POST`      | `/port/ports` | Create a new portfolio. | **Body:** `{ portName: string, balance: number }` |
| `PATCH`     | `/port/ports` | Increase the balance of a portfolio. | **Body:** `{ id: string, incrementValue: number }` |
| `PATCH`     | `/port/ports/:id` | Rebate (decrease) the balance of a portfolio. | **Params:** `id`<br>**Body:** `{ decrementValue: number }` |
| `DELETE`    | `/port/ports/:id` | Delete a portfolio by ID. | **Params:** `id` |

### Trades
Base path: `/trade`

| HTTP Method | Endpoint | Description | Request Body / Params |
|-------------|----------|-------------|-----------------------|
| `GET`       | `/trade/trades/port/:id` | Get all trades associated with a specific portfolio. | **Params:** `id` |
| `GET`       | `/trade/trades/:id` | Get a specific trade by its ID. | **Params:** `id` |
| `POST`      | `/trade/trades` | Create a new trade. | **Body:** `{ portId: string, symbol: string, quantity: number, price: number, type: string, date: string }` |
| `PUT`       | `/trade/trades/:id` | Update an existing trade. | **Params:** `id`<br>**Body:** `{ portId, symbol, quantity, price, type, date }` |
| `DELETE`    | `/trade/trades/:id` | Delete a trade by its ID. | **Params:** `id` |

---

## Scripts

You can run the following scripts using `npm run <script_name>`:

- `npm start`: Starts the application using Node.js (`node src/server.js`).
- `npm run dev`: Starts the application in development mode using `nodemon` for hot-reloading (`nodemon src/server.js`).