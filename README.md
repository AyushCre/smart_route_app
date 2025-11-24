# 🚚 Smart Delivery System

**A real-time logistics platform for fleet tracking and route optimization.**
*Built with Type-Safe Architecture (TypeScript).*

![Status](https://img.shields.io/badge/Status-Development-green)

## 🚀 Key Features
* **📍 Live Tracking:** Real-time vehicle updates (<3s latency).
* **🛣️ Smart Routing:** AI-powered path optimization.
* **🔧 IoT Simulation:** Monitors fuel, engine health & temperature.
* **📊 Analytics:** Dashboard for fleet performance metrics.
* **📱 Driver App:** Mobile-friendly interface for drivers.

## 🛠️ Tech Stack
* **TypeScript** (Backend & Frontend)
* **React.js / Tailwind CSS**
* **Node.js / Express.js**
* **Socket.io** (Real-time communication)

---

## ⚡ How to Run

### 1. Install Dependencies
Open the project folder in your terminal and run:

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
npm run dev. //with this command the server will start running on the browser only the thing you have to do is to copy the url (http://localhost:5001) and the result will be displayed.
To make run this app in your local system first create the .env file and then paste
this lines.

NODE_ENV=development //simply copy this for instant test and run.

For accessing the real time use your own mongodb string and paste here below.
MONGO_URI=your_mongodb_url
MAP_API_KEY=your_map_key
JWT_SECRET=your_secret