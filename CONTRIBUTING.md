# Contributing Guidelines

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Create `.env` with MongoDB URI
4. Start dev server: `npm run dev`

## Code Style

- Use TypeScript for new files
- Follow existing naming conventions
- Keep components focused and reusable
- Add meaningful variable names, not single letters

## Making Changes

### Backend (server/)
- Add new routes to `server/routes.ts`
- Update schemas in `shared/schema.ts`
- Implement storage methods in `server/storage.ts`

### Frontend (client/src/)
- Page components go in `pages/`
- Reusable components in `components/`
- Use TanStack Query for data fetching
- Add `data-testid` attributes to interactive elements

### Database
- Update schemas first in `shared/schema.ts`
- MongoDB operations through storage layer
- No raw SQL queries

## Testing Locally

1. Create test vehicles/deliveries
2. Test route optimization
3. Verify real-time WebSocket updates
4. Check analytics filters work
5. Test on mobile if adding driver features

## Commit Messages

- `feat: add vehicle optimization`
- `fix: alerts not dismissing`
- `docs: update README`
- `refactor: simplify route calculation`

## Common Tasks

### Add a new page
1. Create file in `client/src/pages/`
2. Register in `App.tsx` router
3. Add navigation link to sidebar

### Add API endpoint
1. Add route in `server/routes.ts`
2. Add schema in `shared/schema.ts`
3. Test with curl or Postman

### Add database field
1. Update schema in `shared/schema.ts`
2. Add to storage interface
3. MongoDB will auto-create field

## Questions?

Check existing code for patterns. The codebase is straightforward and self-documenting.
