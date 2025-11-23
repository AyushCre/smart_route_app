# Smart Delivery System - Route Optimization & Tracking

## Overview

This is an enterprise logistics dashboard for smart route optimization, real-time vehicle tracking, and delivery management with IoT integration. The system provides fleet managers and dispatchers with comprehensive tools to monitor vehicles, optimize delivery routes, track packages, analyze performance metrics, and receive real-time alerts about fleet operations.

The application enables:
- Real-time vehicle tracking with GPS coordinates
- Smart route optimization using pathfinding algorithms (Dijkstra, A*)
- Delivery scheduling and status management
- IoT sensor monitoring (fuel levels, temperature, engine status)
- Alert system for critical events
- Analytics dashboard with delivery trends and cost analysis
- Interactive map visualization with Leaflet

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. The design follows Material Design principles with Linear-inspired clean typography, using Inter for UI elements and JetBrains Mono for technical data (GPS coordinates, timestamps).

**State Management**: 
- TanStack Query (React Query) for server state management with automatic caching and real-time updates
- WebSocket integration for live vehicle position updates and sensor data streaming
- Client-side routing via Wouter (lightweight alternative to React Router)

**Design System**:
- Consistent spacing using Tailwind's scale (p-4, gap-6, m-8)
- 12-column grid layout with fixed sidebar navigation
- Theme support (light/dark mode) via CSS variables
- Responsive breakpoints for mobile, tablet, and desktop

**Key Pages**:
- Dashboard: Overview metrics and recent activity
- Live Map: Real-time vehicle tracking with Leaflet maps
- Vehicles: Fleet management and status monitoring
- Deliveries: Package tracking and scheduling
- Routes: Route optimization and algorithm selection
- Analytics: Charts showing delivery trends and cost analysis
- Alerts: Critical notifications and warnings
- IoT Sensors: Real-time sensor data from vehicle telemetry

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful API with WebSocket support for real-time updates
- `/api/metrics` - Dashboard statistics
- `/api/vehicles` - Vehicle CRUD operations
- `/api/deliveries` - Delivery management
- `/api/routes` - Route optimization
- `/api/alerts` - Alert system
- `/api/iot/sensors` - IoT sensor data
- `/ws` - WebSocket endpoint for live updates

**Data Layer**: 
- In-memory storage implementation (`MemStorage`) for development/testing
- Drizzle ORM configured for PostgreSQL production use
- Schema-first approach with Zod validation via `drizzle-zod`

**Real-time Communication**:
- WebSocket server for pushing vehicle position updates, sensor readings, and alerts to connected clients
- Automatic query invalidation on the client when server pushes updates

**Development vs Production**:
- Development: Vite dev server with HMR middleware integrated into Express
- Production: Static file serving of pre-built client bundle

### Data Storage

**ORM**: Drizzle ORM with PostgreSQL dialect

**Database Schema** (defined in `shared/schema.ts`):

1. **Users Table**: Authentication and role-based access (driver, dispatcher, admin)
2. **Vehicles Table**: Fleet information with real-time GPS coordinates, speed, fuel level, temperature, status (idle, in-transit, maintenance), and current route assignment
3. **Deliveries Table**: Package tracking with pickup/delivery locations, customer details, assigned vehicle/route, scheduling information, priority levels, and status tracking
4. **Routes Table**: Optimized paths with algorithm selection (Dijkstra, A*), waypoints as JSON arrays, distance/duration estimates, fuel cost calculations, and completion status
5. **Alerts Table**: Notification system with severity levels (info, warning, critical), alert types (delivery delay, fuel low, maintenance required), and read/unread status
6. **IoT Sensor Data Table**: Telemetry from vehicle devices including GPS coordinates, fuel percentage, engine temperature, battery voltage, speed, engine status, and connection health

**Schema Features**:
- UUID primary keys with auto-generation via PostgreSQL's `gen_random_uuid()`
- Timestamp tracking with `defaultNow()`
- Real numbers for precise GPS coordinates and measurements
- JSON fields for flexible data storage (route waypoints, sensor metadata)
- Foreign key relationships between vehicles, deliveries, and routes

### External Dependencies

**Third-party Services & APIs**:
- **Neon Database** (`@neondatabase/serverless`): Serverless PostgreSQL database hosting
- **Leaflet**: Interactive mapping library for vehicle tracking visualization
- **Recharts**: Charting library for analytics dashboards
- **WebSocket Protocol**: For real-time bidirectional communication

**Key Libraries**:
- **shadcn/ui + Radix UI**: Complete component library for forms, dialogs, dropdowns, etc.
- **TanStack Query**: Server state management with caching
- **React Hook Form + Zod**: Form validation and management
- **date-fns**: Date/time formatting and manipulation
- **Wouter**: Lightweight client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety across full stack

**Development Tools**:
- **Vite**: Fast development server and build tool
- **Drizzle Kit**: Database migration management
- **ESBuild**: Production server bundling
- **TSX**: TypeScript execution for development server

**Session Management**:
- `connect-pg-simple`: PostgreSQL-backed session store for Express
- Session data persisted in database for scalability

**Route Optimization Algorithms** (referenced in design):
- Dijkstra's algorithm for shortest path calculation
- A* algorithm for heuristic-based pathfinding
- Real-time route updates based on traffic and conditions
- Machine learning integration for demand prediction and cost estimation (planned)