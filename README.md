# Smart Delivery System - Route Optimization & Tracking

A production-ready logistics dashboard for real-time vehicle tracking, smart route optimization, and delivery management. Built with React, Express, and MongoDB.

## Features

- **Live Vehicle Tracking** - Real-time GPS tracking with WebSocket updates
- **Smart Route Optimization** - Dijkstra and A* pathfinding algorithms
- **Delivery Management** - Full CRUD operations for deliveries and scheduling
- **IoT Integration** - Monitor vehicle sensors (fuel, temperature, speed, etc.)
- **Analytics Dashboard** - Time-range filtered charts for performance metrics
- **Mobile Driver View** - Mobile-friendly GPS tracking for drivers
- **Alert System** - Real-time notifications for critical events
- **Interactive Maps** - Leaflet-based visualization with multi-point routing

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui components
- Recharts for analytics
- Leaflet for mapping
- TanStack Query for state management
- Wouter for routing

**Backend:**
- Express.js + TypeScript
- MongoDB with Mongoose
- WebSocket for real-time updates
- Node.js runtime

**Infrastructure:**
- Vite for development and builds
- ESBuild for production bundling

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- MongoDB Atlas account (or local MongoDB instance)
- Git installed

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/smart-delivery-system.git
cd smart-delivery-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
# MongoDB connection string (required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartdelivery

# Node environment
NODE_ENV=development
```

**Getting MongoDB URI:**
- **MongoDB Atlas (Cloud)**: Create cluster at https://www.mongodb.com/cloud/atlas and copy connection string
- **Local MongoDB**: Use `mongodb://localhost:27017/smartdelivery`

### 4. Start the development server

```bash
npm run dev
```

The app will be available at: **http://localhost:5001**

## Project Structure

```
smart-delivery-system/
├── client/                  # React frontend
│   └── src/
│       ├── pages/          # Main app pages
│       ├── components/     # Reusable components
│       ├── lib/            # Utilities and query client
│       └── App.tsx         # Main app entry
├── server/                 # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # MongoDB data layer
│   └── index-dev.ts       # Dev server entry
├── shared/                # Shared types and schemas
│   └── schema.ts          # Data models and validation
└── .env                   # Environment configuration
```

## Usage

### Dashboard
- View real-time metrics and vehicle status
- Monitor recent alerts and deliveries

### Live Map
- See all vehicles on interactive map
- Watch vehicles move in real-time
- Click "Optimize Routes" to assign deliveries to vehicles

### Vehicles
- Add/edit/delete vehicles
- Monitor real-time status and metrics
- Track fuel levels and location

### Deliveries
- Create new deliveries with pickup/dropoff locations
- Assign to vehicles and routes
- Track delivery status

### Routes
- View optimized routes
- See route completion progress
- Analyze route efficiency

### Analytics
- Filter data by time range (24h, 7d, 30d, 90d)
- View delivery trends and status distribution
- Analyze costs by route

### Driver View
- Mobile-optimized page at `/driver`
- Enable real phone GPS tracking
- Live location updates to dashboard

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics` | Dashboard metrics |
| GET | `/api/vehicles` | List all vehicles |
| POST | `/api/vehicles` | Create vehicle |
| GET | `/api/deliveries` | List deliveries |
| POST | `/api/deliveries` | Create delivery |
| GET | `/api/routes` | List routes |
| POST | `/api/routes/optimize-all` | Optimize all routes |
| GET | `/api/alerts` | List alerts |
| DELETE | `/api/alerts/:id` | Dismiss alert |
| GET | `/api/iot/sensors` | Get sensor data |
| WS | `/ws` | WebSocket for real-time updates |

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Format code
npm run format
```

### Key Files to Modify

- **Backend routes**: `server/routes.ts`
- **Data models**: `shared/schema.ts`
- **Frontend pages**: `client/src/pages/`
- **API queries**: `client/src/lib/queryClient.ts`

## WebSocket Events

The app uses WebSocket for real-time updates:

```js
// Vehicle position updates (sent every 3 seconds)
{
  type: 'vehicle_update',
  data: { vehicleId, latitude, longitude, speed, ... }
}

// Alert notifications
{
  type: 'alert',
  data: { alertId, type, message, severity, ... }
}
```

## Testing Locally

1. **Add vehicles**: Create 2-3 vehicles from Vehicles page
2. **Add deliveries**: Create deliveries with different locations
3. **Optimize routes**: Click "Optimize Routes" to assign deliveries
4. **Watch movement**: Go to Live Map and see vehicles move in real-time
5. **Check analytics**: Filter by time range to see updated charts
6. **Test driver view**: Open `/driver` on phone (grant GPS permission)

## Production Deployment

To deploy this app:

1. Update MongoDB URI to production instance
2. Set `NODE_ENV=production`
3. Run `npm run build` to build frontend
4. Deploy to your hosting (Replit, Heroku, DigitalOcean, etc.)

Example for Replit:
```bash
npm run build
npm start
```

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

**MongoDB connection error:**
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network is accessible

**WebSocket not connecting:**
- Check browser console for errors
- Verify WebSocket endpoint: `ws://localhost:5001/ws`
- Clear browser cache and refresh

**Charts not updating:**
- Try selecting different time range in Analytics
- Clear browser local storage if needed

## Performance Notes

- Vehicle updates: 3-second intervals via WebSocket
- Chart data: Generated dynamically based on selected time range
- Real-time map: Uses Leaflet's efficient marker clustering
- Database queries: Indexed for fast retrieval

## Future Enhancements

- Machine learning for demand prediction
- Real-time traffic integration
- Multi-warehouse support
- Customer mobile app
- Payment integration
- Automated billing

## License

MIT

## Support

For issues or questions, open an issue on GitHub or contact the development team.

---

**Last Updated:** November 2025
