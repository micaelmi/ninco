<div align="center">
  <img src="frontend/public/mascot.png" alt="Ninco Mascot" width="180" />
  <h1>Ninco</h1>
  <p><strong>Master your money with ease. Simple, powerful, and built for you.</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Fastify](https://img.shields.io/badge/Fastify-5-black?style=for-the-badge&logo=fastify)](https://fastify.dev/)
  [![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
</div>

---

## 🌟 Overview

**Ninco** is a high-performance, modern financial management application built with a monorepo architecture. Designed for speed and clarity, it provides users with a comprehensive dashboard to track income, expenses, and account balances with precision.

Real-time synchronization, advanced filtering, and a sleek, responsive UI make it the ultimate tool for personal financial oversight.

## 🎨 Design System

We follow a strict design philosophy to ensure consistency and accessibility:
- **Style**: Modern, clean, and accessible (WCAG AA).
- **Tokens**: Custom shadcn/ui tokens defined in the [Design Guide](design-guide.md).
- **Themes**: Native light and dark mode support with curated color palettes.

## 🚀 Key Features

- 📊 **Dynamic Dashboard**: Interactive data visualization using [Recharts](https://recharts.org/), providing clear insights into spending habits and financial health.
- 🤖 **AI Chat Transactions**: Register incomes and expenses through a super fast, simple, and intuitive AI chat interface.
- 💸 **Transaction Management**: 
    - Full CRUD support for transactions.
    - Advanced filtering (by date, type, account, and category).
    - Custom date range selection.
    - **Data Exporting**: Export selected transactions to PDF, CSV, or JSON directly from the datatable UI.
- 🏷️ **Customizable Categories**: Create and personalize categories with unique colors and icons.
- 🏦 **Multi-Account Support**: Manage multiple accounts and view aggregated summaries.
- 🔐 **Secure Authentication**: Integrated with [Clerk](https://clerk.dev/) for robust user identity and session management.
- 🎨 **Premium UI/UX**: 
    - Native **Dark Mode** support using `next-themes`.
    - Responsive mobile-first design with a custom drawer-based header, mobile-adjusted popups, and pagination.
    - Built with **Shadcn UI** and **Tailwind CSS 4**.
- 🔄 **Real-time Sync**: Backend webhooks for seamless data synchronization.
- 🚀 **Automated CI/CD**: Configured GitHub Actions for automated Docker builds, database migrations, and production deployments.

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

### Backend
- **Server**: [Fastify](https://fastify.dev/) (Node.js)
- **ORM**: [Prisma 7](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

### Infrastructure
- **Monorepo**: [pnpm Workspaces](https://pnpm.io/workspaces)
- **Containerization**: [Docker](https://www.docker.com/) & Docker Compose
- **Auth**: [Clerk](https://clerk.com/)
- **CI/CD**: GitHub Actions for automated deployments

## 🏗 Project Structure

```text
├── backend/          # Fastify API, Prisma schema, and business logic
├── frontend/         # Next.js application, UI components, and assets
├── shared/           # Shared TypeScript types and utilities
├── docker-compose.yaml # Database and infrastructure orchestration
└── pnpm-workspace.yaml # Monorepo configuration
```

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v20+ 
- **pnpm**: v9+
- **Docker Desktop**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/ninco.git
   cd ninco
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root and in the `/backend` directory following the provided structure (Refer to Clerk and Prisma documentation for keys).

### Running the Application

1. **Start the Database**:
   ```bash
   pnpm db:up
   ```

2. **Run Development Servers**:
   ```bash
   # Both frontend and backend
   pnpm dev:frontend
   pnpm dev:backend
   ```

## 📦 Available Scripts

| Script | Action |
| :--- | :--- |
| `pnpm dev:frontend` | Launch Next.js dev server (Port 3000) |
| `pnpm dev:backend` | Launch Fastify dev server (Port 3333) |
| `pnpm build` | Build all projects in the monorepo |
| `pnpm db:up` | Spin up PostgreSQL via Docker |
| `pnpm db:down` | Shut down Docker containers |
| `pnpm test` | Run tests across the entire codebase |

---

<div align="center">
  <p>Built with ❤️ for better financial clarity.</p>
</div>
