# Invoice Management Dashboard

A full-stack invoice management application built as part of the Powerplay Full-Stack Internship Assignment.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas + Mongoose

## Project Structure
invoice_app/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   ├── scripts/
│   │   └── seed.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── utils/
│   └── package.json
└── .gitignore
## Prerequisites

- Node.js v18 or v20 LTS
- MongoDB Atlas account and connection URI

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/SambhavSharma7781/invoice_management_dashboard
cd invoice_management_dashboard
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

PORT=4000
MONGODB_URI=your_mongodb_atlas_connection_string
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` directory:

VITE_API_BASE_URL=http://localhost:4000

## Running the App

Open two terminals.

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:4000`

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`

## Seed Script

Loads 2,000 invoices and 61 customers into MongoDB Atlas.

```bash
cd backend
npm run seed
```

The seed script is idempotent — running it multiple times will not create duplicates. It upserts customers by `name` and invoices by `invoiceId`.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices (paginated, filtered, sorted) |
| POST | `/api/invoices` | Create a new invoice |
| GET | `/api/invoices/:invoiceId` | Get a single invoice |
| PUT | `/api/invoices/:invoiceId` | Update an invoice |
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:slug` | Customer profile, metrics, invoice history |
| GET | `/api/summary/top-customers` | Top 5 customers by revenue |
| GET | `/health` | Health check |

### Invoice List Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 100) |
| `status` | string | Filter by status (comma-separated, e.g. `Paid,Sent`) |
| `customerId` | string | Filter by customer ID |
| `issueDateFrom` | date | Issue date range start (YYYY-MM-DD) |
| `issueDateTo` | date | Issue date range end (YYYY-MM-DD) |
| `dueDateFrom` | date | Due date range start (YYYY-MM-DD) |
| `dueDateTo` | date | Due date range end (YYYY-MM-DD) |
| `sortBy` | string | Sort field: `amount`, `issueDate`, `dueDate` |
| `order` | string | Sort order: `asc`, `desc` |

## Data Modeling Rationale

### Two collections: `customers` and `invoices`

The dataset contains 61 unique customers, each associated with exactly one company (1:1). Despite this, customers and invoices are modeled as separate collections for the following reasons:

- **Customers are a first-class entity.** The assignment requires a dedicated customer profile page with aggregated metrics. Treating customers as a reference rather than embedded data makes these queries efficient and clean.
- **Avoids data duplication.** Embedding customer name and company in every invoice would mean 2,000 copies of the same data. A `customerId` reference keeps the schema normalized.
- **Efficient aggregations.** The customer profile and summary endpoints use MongoDB aggregation pipelines (`$match`, `$group`, `$sum`). A proper reference with indexes makes these pipelines performant.

### Indexes

| Index | Type | Reason |
|-------|------|--------|
| `invoiceId` | Unique | External identifier used in URLs and API routes |
| `customerId` | Single | Customer filter and profile queries |
| `issueDate` | Single | Date range filtering |
| `dueDate` | Single | Date range filtering and sorting |
| `(customerId, issueDate)` | Compound | Customer invoice history sorted by latest first |
| `(status, dueDate)` | Compound | Filtered invoice list sorted by due date |

### Dates stored as MongoDB `Date` type

The seed data provides dates as strings (`YYYY-MM-DD`). The seed script converts these to native MongoDB `Date` objects so that date range queries work correctly with index support.

### `tax` and `total` stored in database

Both fields are derived values. They are stored explicitly and recalculated server-side on every create and update operation. This avoids runtime computation inside aggregation pipelines and allows direct use of `$sum: "$total"` in summary queries.

## Assumptions

- **Status transitions:** Any status can transition to any other valid status. No workflow rules are enforced.
- **Revenue calculations:** `Void` and `Draft` invoices are excluded from all revenue calculations. `Paid` invoices contribute to paid revenue. `Sent`, `Unpaid`, and `Overdue` invoices contribute to pending revenue.
- **Invoice ID generation:** Invoice IDs are auto-generated by the backend in the format `INV-XXXXXXX`. Users do not set invoice IDs manually.
- **Customer URLs:** Customer profile pages use name-based slugs (e.g., `Aarav Sharma` → `/customers/aarav-sharma`) instead of MongoDB ObjectIds to keep URLs human-readable and debuggable.
- **Customer uniqueness:** Enforced by the `name` field, based on the assumption that the seed data contains no duplicate customer names.
- **No delete operations:** Invoice and customer deletion were not implemented as they were not part of the assignment requirements.
- **Git history:** The repository was restructured from separate frontend and backend repos into a monorepo during development. Earlier commit history was lost in this process.