# ESTRUCTURA 360 - Construction Engineering Platform

## Overview

ESTRUCTURA 360 is a construction technology (Construtech) web application designed to help construction professionals, builders, and families make informed decisions about structural construction projects. The platform provides tools for calculating materials for slabs and walls, project scheduling, budget estimation, construction logbooks with photo/GPS tracking, and comparative analysis dashboards. The application is built as a Spanish-language platform targeting the Latin American construction market.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite with custom development plugins for Replit

The frontend follows a page-based architecture with shared components:
- Pages located in `client/src/pages/`
- Reusable UI components in `client/src/components/ui/` (shadcn/ui)
- Custom hooks in `client/src/hooks/`
- Path aliases configured: `@/` for client source, `@shared/` for shared code

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful API with typed routes defined in `shared/routes.ts`
- **Validation**: Zod schemas shared between frontend and backend

The backend uses a storage abstraction pattern (`IStorage` interface) allowing easy switching between database implementations. Routes are registered in `server/routes.ts` with Zod validation for request/response types.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migrations**: Drizzle Kit (`npm run db:push`)

Database tables:
- `projects` - Client projects with profit margins and labor costs
- `calculations` - Material calculations (slabs/walls) with specs and results stored as JSONB
- `schedule_tasks` - Gantt-style project scheduling with dependencies
- `construction_logs` - Site logs with notes, photos, and GPS coordinates

## Key Features

### Slab Comparator (SlabComparator component)
Compares Traditional Slab (12cm) vs Vigueta y Bovedilla (V&B) system with polystyrene:

**Material Coefficients (f'c 250 with 2% waste):**
- Cement: 8.16 bags (50kg) per m³
- Sand: 0.55 m³ per m³
- Gravel: 0.65 m³ per m³
- Water: 0.24 m³ per m³
- Bucket conversion: 52.63 buckets (19L) per m³

**Bovedilla Specifications:**
- Dimensions: 1.22m × 0.63m × 0.12m
- Axis distance: 70cm between viguetas

**Features:**
- User inputs: material prices, slab dimensions, compression layer thickness
- Outputs: material quantities in m³ and 19L buckets, costs, savings
- SVG floor plan visualization with dark background
- Savings summary panel with percentage and absolute values

### Build System
- **Development**: Vite dev server with HMR, Express backend served alongside
- **Production**: Custom build script (`script/build.ts`) using esbuild for server bundling and Vite for client
- **Output**: `dist/` directory with `index.cjs` (server) and `public/` (client assets)

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database queries
- `connect-pg-simple` for session storage (configured but sessions not fully implemented)

### Third-Party Services
- No external API integrations currently active
- Build script includes allowlist for potential future integrations: Stripe, OpenAI, Google Generative AI, Nodemailer

### Key NPM Packages
- `@tanstack/react-query` - Server state management
- `drizzle-orm` / `drizzle-zod` - Database ORM and schema validation
- `recharts` - Dashboard charts and data visualization
- `date-fns` - Date manipulation for scheduling features
- `jspdf` / `jspdf-autotable` - PDF generation for budgets
- Full shadcn/ui Radix component library for UI primitives