# Invoice Management Dashboard

A full-stack invoice management application built as part of the Powerplay Full-Stack Internship Assignment.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Charts | Recharts |

---

## Project Structure

```
invoice_app/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, environment
│   │   ├── controllers/     # Request/response handling
│   │   ├── middleware/       # Error handling, validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   └── services/        # Business logic, aggregations
│   ├── scripts/
│   │   └── seed.js          # Data ingestion script
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios/fetch wrappers
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page-level components
│   │   └── utils/           # Helpers, formatters
│   └── package.json
└── .gitignore
```

---

## Prerequisites

- Node.js **v18 or v20 LTS**
- A **MongoDB Atlas** account with a valid connection URI

---

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

Create a `.env` file inside `backend/`:

```env
PORT=4000
MONGODB_URI=your_mongodb_atlas_connection_string
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

---

## Running the App

Open two terminals simultaneously.

**Terminal 1 — Backend**

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:4000`

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Seed Script

Loads 2,000 invoices and 61 customers into MongoDB Atlas.

```bash
cd backend
npm run seed
```

> The seed script is **idempotent** — running it multiple times will not create duplicates. It upserts customers by `name` and invoices by `invoiceId`. On completion, it prints the count of seeded documents.

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/invoices` | List invoices (paginated, filtered, sorted) |
| `POST` | `/api/invoices` | Create a new invoice |
| `GET` | `/api/invoices/:invoiceId` | Get a single invoice |
| `PUT` | `/api/invoices/:invoiceId` | Update an invoice |
| `GET` | `/api/customers` | List all customers |
| `GET` | `/api/customers/:slug` | Customer profile + metrics + invoice history |
| `GET` | `/api/summary/top-customers` | Top 5 customers by revenue |
| `GET` | `/health` | Health check |

### Invoice List — Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Results per page (max: `100`) |
| `status` | string | — | Comma-separated statuses e.g. `Paid,Sent` |
| `customerId` | string | — | Filter by customer ObjectId |
| `issueDateFrom` | date | — | Issue date range start (`YYYY-MM-DD`) |
| `issueDateTo` | date | — | Issue date range end (`YYYY-MM-DD`) |
| `dueDateFrom` | date | — | Due date range start (`YYYY-MM-DD`) |
| `dueDateTo` | date | — | Due date range end (`YYYY-MM-DD`) |
| `sortBy` | string | — | `amount`, `issueDate`, or `dueDate` |
| `order` | string | — | `asc` or `desc` |

### Response Format

**Success (list)**
```json
{
  "success": true,
  "data": [],
  "meta": { "total": 2000, "page": 1, "limit": 20, "totalPages": 100 }
}
```

**Success (single)**
```json
{
  "success": true,
  "data": {}
}
```

**Error**
```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "dueDate must be >= issueDate" }
}
```

---

## Data Modeling Rationale

### Two collections: `customers` and `invoices`

The dataset contains 61 unique customers, each associated with exactly one company (1:1 relationship). Despite this, customers and invoices are modeled as **separate collections** for the following reasons:

- **Customers are a first-class entity.** The assignment requires a dedicated customer profile page with aggregated metrics. A proper reference with indexes makes these queries efficient.
- **Avoids data duplication.** Embedding customer name and company in every invoice would mean 2,000 redundant copies. A `customerId` reference keeps the schema normalized.
- **Efficient aggregations.** The customer profile and summary endpoints use MongoDB aggregation pipelines (`$match`, `$group`, `$sum`). Separate collections with compound indexes make these pipelines performant.

### Indexes

| Index | Type | Reason |
|-------|------|--------|
| `invoiceId` | Unique | External identifier used in all API routes |
| `customerId` | Single | Customer filtering and profile queries |
| `issueDate` | Single | Date range filtering |
| `dueDate` | Single | Date range filtering and sorting |
| `(customerId, issueDate)` | Compound | Customer invoice history — latest first |
| `(status, dueDate)` | Compound | Filtered invoice list sorted by due date |

### Dates stored as MongoDB `Date` type

The seed data provides dates as ISO strings (`YYYY-MM-DD`). The seed script converts these to native MongoDB `Date` objects so date range queries work correctly with index support.

### `tax` and `total` stored in the database

Both are derived values (`tax = amount × taxRate / 100`, `total = amount + tax`). They are stored explicitly and **recalculated server-side on every create and update** operation. This avoids runtime computation inside aggregation pipelines and allows direct use of `$sum: "$total"` in summary queries.

---

## Assumptions

| # | Assumption |
|---|-----------|
| 1 | **Status transitions** — Any status can transition to any other valid status. No workflow rules are enforced (e.g. `Draft → Paid` is allowed). |
| 2 | **Revenue calculations** — `Void` and `Draft` invoices are excluded from all revenue calculations. `Paid` invoices contribute to paid revenue. `Sent`, `Unpaid`, and `Overdue` invoices contribute to pending revenue. |
| 3 | **Invoice ID generation** — Invoice IDs are auto-generated by the backend in the format `INV-XXXXXXX`. Users do not set invoice IDs manually via the form. |
| 4 | **Customer uniqueness** — Enforced by the `name` field with a unique index. This assumes the dataset contains no duplicate customer names and that the 61 customers in the seed data are the fixed customer base. |
| 5 | **Customer URLs** — Customer profile pages use name-based slugs (e.g. `Aarav Sharma` → `/customers/aarav-sharma`) instead of MongoDB ObjectIds to keep URLs human-readable. |
| 6 | **No delete operations** — Invoice and customer deletion were not implemented as they were not part of the assignment requirements. |
| 7 | **Git history** — The repository was restructured from separate frontend and backend repos into a monorepo during development. Earlier commit history was lost in this process. |

---

## Dashboard Features

- **Invoice list** — paginated (20 per page), sortable by amount / issue date / due date, filterable by status, customer, issue date range, and due date range
- **Summary view** — top 5 customers by revenue with bar chart, global stats (total billed, tax, invoices, customers)
- **Customer profile** — company info, metric cards, status mix donut chart, revenue breakdown, full paginated invoice history
- **Create invoice** — form with auto-generated invoice ID, customer dropdown with company auto-fill, computed tax and total preview
- **Edit invoice** — pre-filled form, read-only invoice ID