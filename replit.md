# Internal Development Notes

Quick reference for the team working on this project.

## Current State
- Vehicle movement system: Working (5 vehicles in-transit every 3s)
- Analytics filters: Working (24h, 7d, 30d, 90d data generation)
- Alerts dismiss: Fixed (MongoDB ._id references)
- WebSocket: Active and broadcasting position updates

## Tech Stack
- React + TypeScript (frontend)
- Express + Node (backend)
- MongoDB + Mongoose (persistence)
- WebSocket (real-time updates)
- Vite (build tool)

## Development URLs
- Local: http://localhost:5001
- Backend API: http://localhost:5001/api/*
- WebSocket: ws://localhost:5001/ws

## Environment Setup
See .env.template for required variables:
- MONGODB_URI: MongoDB connection string
- NODE_ENV: development or production

## File Locations
- Frontend routes: client/src/pages/
- Backend API: server/routes.ts
- Data models: shared/schema.ts
- Database layer: server/storage.ts
