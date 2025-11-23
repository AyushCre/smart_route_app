# Design Guidelines: Smart Route Optimization & Delivery Scheduling System

## Design Approach
**Selected Approach:** Design System (Material Design + Linear-inspired)  
**Justification:** Enterprise logistics dashboard requiring data density, real-time updates, and operational efficiency. Drawing from Material Design's structured components and Linear's clean typography for optimal usability.

---

## Typography

**Font Families:**
- Primary: Inter (headings, UI elements, data labels)
- Monospace: JetBrains Mono (GPS coordinates, sensor readings, timestamps)

**Hierarchy:**
- Dashboard Title: text-2xl font-semibold
- Section Headers: text-lg font-medium
- Card Titles: text-base font-medium
- Body/Data: text-sm font-normal
- Metrics/Stats: text-3xl font-bold (large numbers)
- Labels: text-xs font-medium uppercase tracking-wide
- Timestamps: text-xs font-normal (monospace)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8 (p-4, gap-6, m-8)

**Grid Structure:**
- Dashboard: 12-column grid with sidebar (col-span-2) + main content (col-span-10)
- Cards: Grid of 3-4 columns on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
- Map View: 70% map + 30% sidebar panel
- Analytics: 2-column layout for charts (grid-cols-1 lg:grid-cols-2)

**Container Widths:**
- Full viewport with no max-width constraints (dashboard spans entire screen)
- Card padding: p-6
- Section spacing: space-y-6

---

## Component Library

### Navigation & Layout
**Sidebar Navigation:**
- Fixed left sidebar (w-64)
- Logo/brand at top (h-16)
- Navigation items with icons (h-12, px-4)
- Active state: border-l-4 indicator
- User profile at bottom with role badge

**Top Bar:**
- Fixed header (h-16) with breadcrumbs, search, notifications, user menu
- Real-time status indicators (Active Deliveries count, Alerts badge)
- Quick actions dropdown

### Core Dashboard Components

**Map Container:**
- Full-height interactive map using Leaflet
- Floating controls panel (top-right): zoom, layers toggle, fullscreen
- Route overlay with polylines showing optimized paths
- Vehicle markers with real-time positions (pulsing animation)
- Delivery waypoint markers with status icons
- Info cards appear on marker click (w-80, absolute positioning)

**Metrics Cards:**
- Grid of stat cards (4 across on xl screens)
- Large number (text-3xl) with trend indicator (up/down arrow + percentage)
- Label below (text-xs uppercase)
- Icon in top-right corner
- Border with subtle shadow

**Vehicle Tracking Panel:**
- Scrollable list (max-h-screen overflow-y-auto)
- Each vehicle card shows: ID, driver name, status badge, current location, ETA
- Mini progress bar for route completion
- Live GPS coordinates in monospace
- Speed/fuel indicators with icon + value

**Route Optimization Interface:**
- Split view: algorithm visualization (left 60%) + parameters (right 40%)
- Graph visualization canvas showing nodes/edges
- Highlighted path in active state
- Control panel with algorithm selector (Dijkstra/A* tabs)
- Distance matrix table below
- "Optimize Route" primary action button

**Analytics Dashboard:**
- Chart grid (2 columns, 3 rows)
- Line charts for delivery trends over time
- Bar charts for cost analysis by route/vehicle
- Donut chart for delivery status distribution
- Table for top routes/drivers
- Date range picker in top-right

**Alerts & Notifications Panel:**
- Chronological list with severity indicators
- Each alert: icon, timestamp, message, action button
- Filter chips at top (All, Critical, Warnings, Info)
- "Mark all as read" action
- Auto-scroll to new alerts

**IoT Sensor Data Display:**
- Table layout with real-time updates (WebSocket indicator)
- Columns: Device ID, GPS, Speed, Fuel Level, Temperature, Last Update
- Status badges for connection state
- Expandable rows for detailed telemetry
- Export to CSV button

### Forms & Inputs
**Delivery Creation Form:**
- Multi-step wizard (3 steps: Details, Route, Confirmation)
- Step indicator at top
- Form fields with floating labels
- Autocomplete for addresses
- Date/time pickers for scheduling
- Vehicle/driver assignment dropdown
- "Calculate Route" button triggers optimization preview

**Search & Filters:**
- Global search bar (w-96) with icon prefix
- Advanced filters dropdown panel
- Date range, status checkboxes, vehicle multi-select
- Apply/Reset button group

### Data Tables
- Sticky header row
- Sortable columns (click header, show arrow indicator)
- Row hover state
- Action menu (3-dot) in last column
- Pagination controls at bottom
- Rows per page selector

### Modals & Overlays
**Route Details Modal:**
- Large modal (max-w-4xl)
- Map on left, details list on right
- Waypoint timeline with completion status
- Driver assignment section
- "Edit Route" / "Cancel Delivery" actions

**Confirmation Dialogs:**
- Centered modal (max-w-md)
- Icon + heading + description
- Two-button layout (Cancel secondary, Confirm primary)

---

## Responsive Behavior

**Desktop (1440px+):** Full multi-column layouts, sidebar always visible  
**Tablet (768-1440px):** Collapsible sidebar (hamburger menu), 2-column grids  
**Mobile (< 768px):** Stack all columns, bottom navigation bar for key actions

---

## Real-Time Features

**Live Update Indicators:**
- Pulsing dot next to "Live" label in top bar
- Animated transitions for data changes (fade in new values)
- Toast notifications slide in from top-right for new alerts
- Vehicle markers smoothly animate to new positions

**WebSocket Connection Status:**
- Small indicator in footer: Connected (green dot) / Reconnecting (yellow pulse) / Disconnected (red)

---

## Role-Based Views

**Admin:** Full access, analytics, user management section  
**Manager:** Delivery overview, route optimization, vehicle tracking  
**Driver:** Simplified view with assigned deliveries, navigation, checklist

---

## Images

No hero images required. This is a functional dashboard.

**Icons:** Use Heroicons (solid variant) via CDN for all interface icons - consistent 20x20 or 24x24 sizes throughout.