# Smart Delivery System

Production-ready logistics platform for real-time vehicle tracking, route optimization, and delivery management.

## What This App Does

### 🗺️ Live Vehicle Tracking
- Real-time GPS tracking of all delivery vehicles
- Live position updates every 3 seconds
- Interactive map view with vehicle status
- Vehicle metrics: speed, fuel level, temperature

### 🛣️ Smart Route Optimization
- Automatic route generation using Dijkstra and A* algorithms
- Assign multiple deliveries to single vehicle
- Calculate optimal delivery sequence
- View detailed route paths on map

### 📦 Delivery Management
- Create and track deliveries
- Set pickup and delivery locations
- Assign deliveries to vehicles
- Monitor delivery status (pending, in-transit, delivered)

### 📊 Analytics Dashboard
- Delivery trends and statistics
- Filter data by time period (24h, 7d, 30d, 90d)
- Cost analysis by route
- Delivery status distribution (pie chart)
- Performance metrics

### 🚨 Alerts & Notifications
- Real-time alerts for critical events
- Dismiss notifications as needed
- Alert history and severity levels
- Connected to vehicle and delivery events

### 🔧 IoT Sensor Monitoring
- Monitor vehicle sensor data
- Track fuel consumption
- Engine status and temperature
- Real-time sensor dashboard

### 📱 Mobile Driver View
- Mobile-friendly driver interface
- Real-time GPS location sharing
- Current delivery information
- Can enable actual phone GPS tracking

### 🎯 Additional Features
- User dashboard with key metrics
- Route completion tracking
- Comprehensive vehicle management
- Multi-vehicle simultaneous tracking

---

## Installation & Setup

### Prerequisites
- **Node.js** 18 or higher
- **npm** or yarn
- **MongoDB** (free account at https://www.mongodb.com/cloud/atlas)
- **Git**

### Step 1: Clone & Install
```bash
git clone https://github.com/yourusername/smart-delivery-system.git
cd smart-delivery-system
npm install
```

### Step 2: Get MongoDB Connection String
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Copy your connection string
4. Replace `username`, `password`, and `cluster` with your values

### Step 3: Create .env File
Create a `.env` file in the project root with:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartdelivery
NODE_ENV=development
```

### Step 4: Start the App
```bash
npm run dev
```

The app will be available at: **http://localhost:5001**

---

## Using the App

### First Time Setup
1. **Add Vehicles** - Go to Vehicles page, click "Add Vehicle"
2. **Add Deliveries** - Create deliveries with pickup/delivery locations
3. **Optimize Routes** - Go to Live Map, click "Optimize Routes" button
4. **Watch Movement** - View vehicles moving on map in real-time

### Key Pages
| Page | What It Does |
|------|--------------|
| Dashboard | Quick overview of metrics and alerts |
| Live Map | View all vehicles and routes on interactive map |
| Vehicles | Manage vehicles, track status and metrics |
| Deliveries | Create and manage deliveries |
| Routes | View optimized routes and completion status |
| Analytics | Charts and performance data (filter by time) |
| Alerts | All system notifications |
| IoT Sensors | Vehicle sensor data monitoring |
| Driver View | Mobile interface for drivers |

---

## Troubleshooting

**MongoDB connection error?**
- Check MongoDB URI in `.env` is correct
- Verify IP is whitelisted in MongoDB Atlas

**Port 5001 already in use?**
```bash
lsof -ti:5001 | xargs kill -9
```

**WebSocket not connecting?**
- Check browser console for errors
- Try clearing cache and refreshing
- Verify vehicle has `status: "in-transit"`

**Charts not changing?**
- Try selecting different time range in Analytics dropdown
- Refresh the page

---

## Tech Stack

**Frontend:** React 18, TypeScript, Tailwind CSS, Recharts, Leaflet  
**Backend:** Express.js, Node.js, WebSocket  
**Database:** MongoDB with Mongoose  
**Build:** Vite, ESBuild  

---

## Project Structure

```
smart-delivery-system/
├── client/src/          # React frontend
│   ├── pages/          # Dashboard, Map, Vehicles, etc.
│   ├── components/     # UI components
│   └── lib/            # Utilities
├── server/             # Express backend
│   ├── routes.ts       # API endpoints
│   └── storage.ts      # Database operations
├── shared/
│   └── schema.ts       # Data types and validation
└── .env                # Configuration
```

---

## Next Steps

- Read **QUICKSTART.md** for faster setup
- Check **DEVELOPMENT.md** for architecture details
- See **CONTRIBUTING.md** for contributing guidelines

---

**Ready to deploy?** Host on Replit, Heroku, or any Node.js hosting platform.
