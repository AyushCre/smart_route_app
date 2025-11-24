# Development Notes

Internal development documentation and architecture decisions.

## Project Setup

- Vite-based fullstack with React frontend and Express backend
- MongoDB for persistence
- WebSocket for real-time vehicle tracking updates
- Runs on port 5001 locally

## Key Architectural Decisions

### Data Layer
- Mongoose schemas in MongoDB (not Drizzle - decided on NoSQL for flexibility)
- In-memory vehicle progress tracking during route execution
- WebSocket broadcasts updates to all connected clients

### Vehicle Movement
- Updates every 3 seconds via WebSocket
- Linear interpolation along route pathCoordinates
- Progress stored in memory, persisted to DB on update
- Routes auto-complete when progress reaches 100%

### Analytics
- Time-range based data generation (24h, 7d, 30d, 90d)
- Data functions regenerate on time range selection
- Charts update instantly without API calls

### Cache Strategy
- TanStack Query with 3-5 second refetch intervals
- Cache invalidation on mutations for instant UI updates
- Refetch strategy for critical real-time data

## Common Issues & Solutions

1. **Vehicle not moving on map**
   - Check vehicle.status = "in-transit"
   - Verify currentRouteId is set
   - Check pathCoordinates is valid JSON array

2. **Analytics charts not changing**
   - Time range functions are static - update if needed
   - Check if timeRange state is updating in React DevTools

3. **MongoDB connection fails**
   - Verify MONGODB_URI in .env
   - Check IP whitelist if using Atlas
   - Ensure network connectivity

## Testing Checklist

- [ ] Add vehicle with route
- [ ] Create delivery and assign to vehicle
- [ ] Run route optimization
- [ ] Verify vehicle moves on map
- [ ] Check alerts dismiss
- [ ] Test analytics filters
- [ ] Verify WebSocket connection
- [ ] Test driver view on mobile

## Performance Metrics

- Vehicle update latency: ~100-500ms
- Chart render: <1s
- Map render: <2s
- API response time: <100ms

## Dependencies

Key packages:
- express@4.x - Backend framework
- mongoose - MongoDB ODM
- react@18 - UI framework
- recharts - Charts library
- leaflet - Maps library
- tailwindcss - Styling

All managed via npm. See package.json for full list.
