# Driver View GPS Setup Guide

## Overview
The Smart Delivery System includes a **Driver View** page that captures real GPS coordinates from drivers' phones and displays them live on the dashboard map.

## How It Works

1. **Driver View Page** (`/driver` route)
   - Mobile-friendly interface designed for phones
   - Uses the phone's built-in GPS sensor
   - Displays real coordinates in degrees (latitude, longitude)
   - Shows accuracy levels and connection status

2. **Real-time Location Updates**
   - When you click "Start Driving", GPS tracking begins
   - Your location is sent to the dashboard every few seconds
   - The dashboard map updates with your real position in real-time
   - Dispatchers see all driver locations simultaneously

3. **Data Flow**
   ```
   Phone GPS → Browser GeolocationAPI → Driver View Page → Vehicle Location Update → Dashboard Map
   ```

## Step-by-Step Setup

### On Mobile Device (Driver)

1. **Open Driver View Page**
   - On your phone, go to: `https://your-app-url/driver`
   - You'll see the Driver View with your assigned vehicle info

2. **Enable Location Permission**
   - When prompted, allow the app to access your location
   - For best accuracy, choose "Allow while using the app"
   - This uses your phone's GPS sensor (not cell towers)

3. **Start Driving**
   - Click the **"Start Driving"** button
   - You'll see:
     - Green checkmark: "GPS Connected"
     - Real latitude/longitude coordinates
     - Accuracy ±X meters
     - Last update timestamp

4. **Monitor During Delivery**
   - Your position updates automatically every 3-5 seconds
   - Watch the route completion percentage
   - Keep the page open during deliveries

5. **Stop Tracking**
   - Click **"Stop Tracking"** when done
   - This pauses GPS updates (useful to save battery)

### On Dashboard (Dispatcher)

1. **View Live Map** (Go to `/map`)
   - See all driver locations as blue truck icons
   - Drivers appear as they move in real-time
   - Click on any vehicle to see:
     - Driver name
     - Current speed
     - Fuel level
     - Exact GPS coordinates
     - Status (in-transit/idle)

2. **Track Driver Progress**
   - Click "Optimize Routes" to assign deliveries to drivers
   - Routes appear as blue lines on the map
   - Watch drivers move along their assigned routes
   - See route completion percentage

3. **Receive Real-time Updates**
   - Dashboard updates every 3 seconds as drivers move
   - No manual refresh needed
   - Automatic scroll/zoom to fit all drivers

## Technical Details

### GPS Accuracy
- **Desktop/Simulator**: May use IP-based location (less accurate)
- **Real Phone with GPS**:
  - Accuracy: ±5-10 meters typical
  - Requires clear sky view for best results
  - Uses multiple satellite signals

### Device Requirements
- **iOS**: Safari browser with iOS 13+ 
- **Android**: Chrome browser with Android 5+
- **Requirements**:
  - Location permission enabled
  - HTTPS connection (not HTTP)
  - Active internet connection
  - GPS sensor enabled on phone

### Data Privacy
- Location data is only sent while the driver has the page open
- Data updates every 3-5 seconds (configurable)
- No continuous background tracking
- Driver can pause anytime with "Stop Tracking"

## Real Phone Testing on Replit

Since Replit preview URLs work on any phone:

1. **Get Your App URL**
   - Look at the browser address bar in Replit
   - It looks like: `https://bdce0dae-1574-xxxx.spock.replit.dev`

2. **On Your Phone**
   - Open Chrome/Safari
   - Paste the URL in address bar
   - Add `/driver` at the end
   - Full URL: `https://bdce0dae-1574-xxxx.spock.replit.dev/driver`

3. **Grant Permissions**
   - Browser asks for location permission
   - Tap "Allow"
   - Choose "Allow while using the app"

4. **Start Driving**
   - Click "Start Driving" button
   - Your phone's real GPS coordinates will appear
   - Check the dashboard on desktop to see live updates

5. **Back on Desktop Dashboard**
   - Go to `/map`
   - See your phone's GPS location as blue truck marker
   - It updates every 3 seconds as you move
   - Try moving around and watch the marker follow

## Troubleshooting

### "GPS Not Starting"
- **Issue**: Permission denied
- **Solution**: Allow location permission in browser settings
- **iOS**: Settings → Websites → Location
- **Android**: Tap lock icon in address bar → Location → Allow

### "Coordinates Not Updating"
- **Issue**: No internet connection
- **Solution**: Ensure strong WiFi or mobile data
- **Check**: Look at "Last updated" timestamp

### "Accuracy Says 'Unknown'"
- **Issue**: GPS signal weak (indoors)
- **Solution**: Go outside, wait 30 seconds for satellite lock
- **Typical**: Takes 10-30 seconds to acquire lock

### "Phone Coordinates Don't Match Map"
- **Issue**: GPS still acquiring signal
- **Solution**: Wait 1-2 minutes for better accuracy
- **Normal**: First reading may be 100+ meters off

## API Endpoints Used

The Driver View uses these endpoints:

```javascript
// Get vehicle data (reads first vehicle in system)
GET /api/vehicles

// Update vehicle location from GPS
PATCH /api/vehicles/{vehicleId}
  {
    "latitude": 22.1234,
    "longitude": 84.5678
  }
```

## Example Workflow

1. **Dispatcher**:
   - Opens Dashboard at `/map`
   - Clicks "Optimize Routes"
   - Sees blue route lines drawn on map
   - Waits for drivers to connect

2. **Driver 1**:
   - Opens Driver View at `/driver`
   - Clicks "Start Driving"
   - GPS location appears on dispatcher's map
   - Dispatcher can see real-time movement

3. **Driver 2**:
   - Joins the same way
   - Both drivers visible on map simultaneously
   - Dispatcher tracks both in real-time
   - Routes show completion percentage

4. **Real-time Monitoring**:
   - As drivers move, map updates every 3 seconds
   - Dispatcher sees current location, speed, fuel level
   - Alerts fire if something goes wrong
   - Can track multiple drivers at once

## Multiple Driver Setup

For testing with multiple drivers:

1. **Open 2+ Browser Tabs/Phones**
   - Tab 1: `/driver` for Driver 1
   - Tab 2: `/driver` for Driver 2
   - Desktop: `/map` for Dashboard

2. **Each Tab Gets Same First Vehicle**
   - Both send GPS to same vehicle initially
   - In production, each driver would have unique ID
   - Currently uses first vehicle in database

3. **See Real-time Sync**
   - Start driving on Tab 1
   - Watch Dashboard update
   - Start on Tab 2
   - See both locations update simultaneously

## Production Deployment

When deploying to production:

1. **Use HTTPS only** (required for GPS)
2. **Assign unique vehicles** to each driver (currently prototype uses first vehicle)
3. **Enable background location** if continuous tracking needed
4. **Set up alerts** for delivery delays/issues
5. **Configure battery optimization** for long routes

## Questions?

Refer to:
- **Map not showing all markers?** Click "Fit All" button
- **Routes not optimizing?** Check that vehicles exist and deliveries are "pending"
- **GPS not working?** Verify location permission and internet connection
- **Want more accuracy?** Use real phone GPS (not simulator)
