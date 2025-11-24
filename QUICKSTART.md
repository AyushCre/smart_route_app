# Quick Start Guide

Get up and running in 5 minutes.

## 1. Clone & Install

```bash
git clone https://github.com/yourusername/smart-delivery-system.git
cd smart-delivery-system
npm install
```

## 2. Add MongoDB URI

Create `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartdelivery
NODE_ENV=development
```

Get MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available).

## 3. Start Development Server

```bash
npm run dev
```

App will be at: **http://localhost:5001**

## 4. Test It Out

1. Click **Vehicles** → Add 2-3 vehicles
2. Click **Deliveries** → Add some deliveries
3. Go to **Live Map** → Click "Optimize Routes"
4. Watch vehicles move in real-time! 🚗
5. Check **Analytics** → Try different time ranges

## 5. Deploy (Optional)

### To Replit:
1. Connect GitHub repo to Replit
2. Set environment variables in Replit
3. Deploy with one click

### To Heroku:
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your_uri
git push heroku main
```

## Common Tasks

### Add a new API endpoint
Edit `server/routes.ts`:
```typescript
app.post("/api/custom", async (req, res) => {
  // your code
});
```

### Add a new page
1. Create `client/src/pages/MyPage.tsx`
2. Add route in `App.tsx`
3. Add navigation link in sidebar

### Debug vehicle movement
1. Open browser console
2. Check WebSocket connection to `/ws`
3. Verify vehicle has `status: "in-transit"`

## Troubleshooting

**MongoDB connection fails?**
- Check MongoDB URI in `.env`
- Verify IP whitelist in MongoDB Atlas dashboard

**Port 5001 already in use?**
```bash
lsof -ti:5001 | xargs kill -9
```

**WebSocket not connecting?**
- Clear browser cache
- Check browser console for errors
- Ensure WebSocket endpoint: `ws://localhost:5001/ws`

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- See [DEVELOPMENT.md](./DEVELOPMENT.md) for architecture details

---

**Questions?** Check existing code or open an issue on GitHub.
