# Cockatiel Finances

A comprehensive financial management application built as a monorepo.

## 🏗 Structure

The project is organized as a **pnpm monorepo**:

- **`backend`**: Node.js API built with [Fastify](https://fastify.dev/).
    - Uses **Prisma 7** with PostgreSQL driver adapters.
    - Database: PostgreSQL (via Docker).
- **`frontend`**: React application built with [Next.js 16](https://nextjs.org/) (App Router).
    - UI Components: [Shadcn UI](https://ui.shadcn.com/).
    - React 19 & Tailwind CSS 4.
- **`shared`**: Shared code and types (@cockatiel/shared).

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [pnpm](https://pnpm.io/)
- [Docker Desktop](https://www.docker.com/)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd cockatiel-finances
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Environment Setup**:
    - Ensure `.env` exists in the root (created from template if available).
    - Ensure `backend/.env` exists for Prisma configuration.

### 🏃‍♂️ Running the Project

#### 1. Start the Database
Use the root script to start the PostgreSQL container:

```bash
pnpm db:up
```

#### 2. Start Development Servers
You can run both backend and frontend simultaneously (if configured with a tool like Turborepo in the future) or independently:

**Frontend**:
```bash
pnpm dev:frontend
# Runs on http://localhost:3000
```

**Backend**:
```bash
pnpm dev:backend
# Runs on http://localhost:3333 (default Fastify port, check src/server.ts)
```

## 🛠 Database Management (Prisma)

The backend uses Prisma 7.

- **Studio**: `pnpm --filter backend studio`
- **Migrate**: `pnpm --filter backend migrate`
- **Generate Client**: `pnpm --filter backend exec npx prisma generate`

## 📦 Scripts

| Script | Description |
| :--- | :--- |
| `dev:frontend` | Starts Next.js dev server |
| `dev:backend` | Starts Fastify dev server |
| `build` | Builds all packages |
| `test` | Runs tests across all packages |
| `db:up` | Starts Docker database container |
| `db:down` | Stops Docker database container |

## 📝 License

Private repository.
