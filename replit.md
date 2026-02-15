# Auralix - AI Voice Assistant

## Overview

Auralix is an AI voice assistant web application that uses the Vapi AI SDK to enable browser-based voice conversations. Users can start voice calls with an AI assistant, and the app displays real-time audio visualizations showing call state (idle, connecting, listening, speaking). Call events are logged to a PostgreSQL database via a backend API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React + Vite)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router) with a single Home page and a 404 fallback
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack React Query for server state; React useState for local component state
- **Styling**: Tailwind CSS with CSS variables for theming (dark "deep space" theme using Outfit and Space Grotesk fonts)
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`, `@assets/` maps to `attached_assets/`

### Voice AI Integration (Vapi)
- Uses `@vapi-ai/web` SDK to create browser-based voice calls
- Requires two environment variables: `VITE_VAPI_PUBLIC_KEY` and `VITE_VAPI_ASSISTANT_ID`
- The Vapi instance listens for events: `call-start`, `call-end`, `speech-start`, `speech-end`, `volume-level`
- An `AudioVisualizer` component renders animated bars/orb based on call state and volume level

### Backend (Express + Node.js)
- **Runtime**: Node.js with Express, using `tsx` for TypeScript execution in development
- **API Structure**: Single REST endpoint `POST /api/calls` for logging call events
- **Route Definitions**: Shared route definitions in `shared/routes.ts` using Zod for input validation, consumed by both frontend and backend
- **Dev Server**: Vite dev server is integrated as middleware in development; static files served in production from `dist/public`
- **Build**: Custom build script using esbuild for server bundling and Vite for client bundling; output goes to `dist/`

### Database (PostgreSQL + Drizzle ORM)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: `node-postgres` Pool using `DATABASE_URL` environment variable
- **Schema**: Defined in `shared/schema.ts` — single `calls` table with `id` (serial), `status` (text), and `startedAt` (timestamp)
- **Validation**: `drizzle-zod` generates Zod schemas from Drizzle table definitions for type-safe API validation
- **Migrations**: Managed via `drizzle-kit push` command (`db:push` script)

### Storage Pattern
- `IStorage` interface in `server/storage.ts` abstracts data access
- `DatabaseStorage` class implements the interface using Drizzle ORM
- Single exported `storage` instance used by route handlers

### Shared Code (`shared/` directory)
- `schema.ts`: Database schema definitions and Zod validation schemas
- `routes.ts`: API route contracts (paths, methods, input/output types) shared between client and server

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required. Connection string provided via `DATABASE_URL` environment variable
- **Vapi AI**: Voice AI platform. Requires `VITE_VAPI_PUBLIC_KEY` and `VITE_VAPI_ASSISTANT_ID` environment variables (client-side, prefixed with `VITE_`)

### Key NPM Packages
- **@vapi-ai/web**: Browser SDK for Vapi voice AI calls
- **drizzle-orm** + **drizzle-kit**: ORM and migration tooling for PostgreSQL
- **@tanstack/react-query**: Async state management for API calls
- **wouter**: Lightweight React router
- **shadcn/ui** components: Built on Radix UI primitives with Tailwind CSS
- **zod** + **drizzle-zod**: Schema validation shared across client and server
- **express**: HTTP server framework
- **connect-pg-simple**: PostgreSQL session store (available but not currently used in visible routes)