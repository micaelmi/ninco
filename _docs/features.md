# Ninco Application Requirements and Features

This document details the functional and non-functional requirements implemented in the Ninco financial management application, structured from a software engineering perspective.

## 1. Functional Requirements

### 1.1 Authentication & User Management
- **Secure Authentication**: Integrated with Clerk for robust identity verification (login, signup, session management).
- **User Portals**: Support for generic account management, including a mobile-responsive UI for account actions (e.g., "Manage account", "Sign out").

### 1.2 Dashboard & Analytics
- **Data Visualization**: Interactive, real-time charts powered by Recharts for clear insights into spending habits and financial health.
- **Aggregated Summaries**: Holistic calculation and display of total income, total expenses, and aggregated account balances.

### 1.3 Transaction Management
- **Full CRUD Operations**: Users can Create, Read, Update, and Delete financial transactions.
- **AI Chat Integration**: Create transactions through an AI Chat interface, providing a super fast and uncomplicated way of registering incomes and expenses.
- **Advanced Filtering Engine**: Transactions can be queried and filtered by custom date ranges, transaction type, specific accounts, and categories.
- **Data Exporting**: Support for exporting selected transaction data into PDF, CSV, or JSON formats directly from the datatable UI.

### 1.4 Category Management
- **Custom Categorization**: Users can define completely personalized transaction categories.
- **Visual Identifiers**: Categories support customization through unique colors and icons for rapid visual identification throughout the app.

### 1.5 Account Management
- **Multi-Account Support**: Ability to track and isolate transactions across multiple financial accounts.
- **Cross-Account Aggregation**: Dashboard and transaction views support combining data across selected multiple accounts.

## 2. Non-Functional Requirements

### 2.1 Architecture & Tech Stack
- **Monorepo Architecture**: Managed via `pnpm` workspaces for clear boundary separation between `frontend`, `backend`, and `shared` type definitions.
- **Frontend Framework**: Built on Next.js 16 (App Router) with React 19.
- **Backend API**: High-performance REST API built using Fastify (Node.js).
- **Data Layer**: Typed database interactions via Prisma 7 ORM connected to a PostgreSQL 16 database.
- **Form Handling & Validation**: React Hook Form combined with Zod for strict client- and server-side validation.

### 2.2 UI/UX Engineering
- **Component System**: Developed with customized Shadcn UI tokens and Tailwind CSS 4.
- **Theming Strategy**: Native dynamic Light and Dark mode variations using `next-themes` with a curated color palette.
- **Responsive Layouts**: Engineered for mobile-first usage, including specialized mobile components (e.g., custom drawer-headers, mobile-adjusted pagination and popups).
- **Accessibility**: Developed following modern accessibility best practices (WCAG AA standard).

### 2.3 Performance & Data Integrity
- **State Management & Caching**: Efficient asynchronous data fetching, caching, and mutation execution utilizing TanStack Query v5.
- **Real-Time Synchronization**: Backend webhooks implemented to ensure data mutations are seamlessly synced across systems.

### 2.4 Infrastructure & Operations (DevOps)
- **Containerization**: Both the Fastify API and the Next.js frontend are containerized utilizing Docker with a cohesive `docker-compose.yaml` for orchestration.
- **Automated Deployments (CI/CD)**: Configured GitHub Actions workflows that automatically build updated Docker containers, execute DB migrations, and seamlessly deploy to the target server upon merges to the main branch.
