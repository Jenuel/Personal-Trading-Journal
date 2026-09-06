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
│   ├── mappers/         # camelCase API objects <-> snake_case database rows
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
5. **Mappers (`/mappers`)**: Translate between the camelCase objects the API speaks and the snake_case rows the database stores. `toRow` deliberately omits any key the caller did not supply, so a partial update never overwrites a column it was not asked to touch.

## Environment Variables
Create a `.env` file in the root of the `backend` directory with the following variables:

```env
PORT=5000 # Defaults to 5000, which is what the frontend expects
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
CORS_ORIGIN=http://localhost:3000 # Optional; defaults to the Next.js dev server
```

---

## API Endpoints

All endpoints assume the server is running on `http://localhost:<PORT>` (5000 by default). The Express app
natively handles JSON requests and responses, and every response — successes, errors and deletes alike —
carries a JSON body.

Requests and responses use camelCase throughout; the snake_case column names are an implementation detail
of the database and never cross the API boundary.

### Portfolios

| HTTP Method | Endpoint | Description | Request Body / Params |
|-------------|----------|-------------|-----------------------|
| `GET`       | `/portfolios` | List all accounts, each with its `trades` and `cashTransactions` embedded. | None |
| `GET`       | `/portfolios/:id` | Get one account, with the same embedded collections. | **Params:** `id` |
| `POST`      | `/portfolios` | Create an account. | **Body:** `{ name: string, initialBalance: number, currency?: string, broker?: string, accountType?: 'LIVE' \| 'DEMO' \| 'PROP', description?: string }` |
| `PUT`       | `/portfolios/:id` | Update account metadata. `initialBalance` is ignored — the funded amount is fixed once the account exists. | **Params:** `id`<br>**Body:** any subset of the create fields |
| `DELETE`    | `/portfolios/:id` | Delete an account. Its trades and cash transactions cascade. | **Params:** `id` |

`currentBalance` is derived, never written by a client: it is recalculated as
`initialBalance + Σ trade.result + Σ deposits − Σ withdrawals` after every write that can move it.

### Trades

| HTTP Method | Endpoint | Description | Request Body / Params |
|-------------|----------|-------------|-----------------------|
| `GET`       | `/trades` | List trades, optionally filtered. | **Query:** `portfolioId` (optional) |
| `GET`       | `/trades/port/:id` | List the trades for one account. Returns `200 []` when there are none. | **Params:** `id` |
| `GET`       | `/trades/:id` | Get one trade. | **Params:** `id` |
| `POST`      | `/trades` | Log a trade. | **Body:** `{ portfolioId, pair, direction: 'LONG' \| 'SHORT', lots, entryPrice, date }` plus optional `exitPrice`, `stopLoss`, `takeProfit`, `pips`, `result`, `rr`, `outcome`, `session`, `setup`, `notes` |
| `PUT`       | `/trades/:id` | Update a trade. Only the fields present in the body are written. | **Params:** `id`<br>**Body:** any subset of the create fields |
| `DELETE`    | `/trades/:id` | Delete a trade. | **Params:** `id` |

---

## Scripts

You can run the following scripts using `npm run <script_name>`:

- `npm start`: Starts the application using Node.js (`node src/server.js`).
- `npm run dev`: Starts the application with auto-reload (requires `nodemon`, which is not currently installed).
- `npm test`: Runs the unit tests with the Node.js test runner.

## Docker Setup

The backend can be containerized and run using Docker. A `Dockerfile` is included in the project for this purpose.

### Build the Docker Image
Navigate to the `backend` directory and run:

```bash
docker build -t trading-journal-backend .
```

### Run the Docker Container
Once the image is built, you can run it. Make sure to provide your environment variables, typically via the `.env` file.

```bash
docker run -p 5000:5000 --env-file .env trading-journal-backend
```

This maps port 5000 inside the container to port 5000 on your local machine.