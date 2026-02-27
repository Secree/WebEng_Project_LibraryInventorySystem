# Deploy Backend to Render (FREE - No Payment Required!)

## What is Render?
Render offers **free hosting** for web services with:
- ✅ No credit card required
- ✅ Automatic deployments from GitHub
- ✅ Free SSL certificates
- ✅ 750 hours/month free (enough for 24/7 uptime)
- ⚠️ Free tier sleeps after 15 minutes of inactivity (cold start ~30 seconds)

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

Make sure your latest code is pushed:
```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

### 2. Sign Up for Render

1. Go to [https://render.com/](https://render.com/)
2. Click "Get Started for Free"
3. Sign up with your GitHub account (recommended) or email
4. **No credit card required!**

### 3. Create New Web Service

1. Click "New +" button in the dashboard
2. Select "Web Service"
3. Connect your GitHub repository:
   - Click "Connect GitHub" or "Configure GitHub"
   - Select your repository: `Secree/WebEng_Project_LibraryInventorySystem`
4. Configure the service:
   - **Name**: `library-inventory-backend`
   - **Region**: Oregon (US West) - default
   - **Branch**: `main`
   - **Root Directory**: `Library_Inventory_Backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### 4. Add Environment Variables

Click "Advanced" and add these environment variables:

```
FRONTEND_URL=https://libraryinventory-f6b9d.web.app
PORT=3000
NODE_ENV=production
```

**Important**: Add your Firebase credentials:
- `FIREBASE_SERVICE_ACCOUNT` - Your Firebase service account JSON (as a string)
- `FIREBASE_DATABASE_URL` - Your Firebase database URL
- `JWT_SECRET` - Your JWT secret key

To add Firebase Service Account as environment variable:
1. Copy the entire content of your service account JSON file
2. Paste it as a single line (or Render will format it correctly)

### 5. Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your server
3. Wait 2-5 minutes for deployment
4. You'll get a URL like: `https://library-inventory-backend.onrender.com`

### 6. Update Frontend API URL

Once deployed, update your frontend to use the Render backend URL.

**Option A: Rebuild and Redeploy Frontend**

1. Update `Library_Inventory/.env` or create it:
   ```
   VITE_API_URL=https://library-inventory-backend.onrender.com/api
   ```

2. Rebuild and redeploy:
   ```bash
   cd Library_Inventory
   npm run build
   cd ..
   firebase deploy --only hosting
   ```

**Option B: Update API URL in Code (if no .env)**

Edit `Library_Inventory/src/services/api.ts` and change the API URL to your Render backend URL.

### 7. Test Your Deployment

1. Visit your frontend: https://libraryinventory-f6b9d.web.app
2. Try logging in or accessing the inventory
3. Check Render logs if there are issues: Dashboard → Your Service → Logs

## Automatic Deployments

Render automatically redeploys when you push to GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Render will detect the push and redeploy automatically!

## Monitoring & Logs

- **View Logs**: Go to your service dashboard → "Logs" tab
- **Restart Service**: Click "Manual Deploy" → "Deploy latest commit"
- **Environment Variables**: Update in "Environment" tab

## Important Notes

### Free Tier Limitations
- ⏸️ **Sleeps after 15 min inactivity** - First request after sleep takes ~30 seconds
- 🕐 **750 hours/month** - Enough for continuous uptime
- 💾 **512 MB RAM** - Should be sufficient for this app
- 🌐 **Shared IP** - Multiple services share the same infrastructure

### Keeping Service Awake (Optional)
To prevent cold starts, you can:
1. Use a free service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 5 minutes
2. Or upgrade to a paid plan ($7/month) for always-on service

### CORS Configuration
Your backend already has CORS configured to accept requests from your frontend. If you change the frontend URL, update the `FRONTEND_URL` environment variable in Render.

## Troubleshooting

### Issue: "Application failed to respond"
- Check logs in Render dashboard
- Ensure all environment variables are set correctly
- Verify PORT is set to 3000 or use `process.env.PORT` in server.js

### Issue: "Cannot connect to database"
- Verify `FIREBASE_SERVICE_ACCOUNT` is properly formatted
- Check `FIREBASE_DATABASE_URL` is correct
- View logs for specific Firebase errors

### Issue: Frontend can't reach backend
- Check CORS settings in backend
- Verify frontend API URL is correct
- Check if backend is sleeping (wait 30 seconds for cold start)

### Issue: Environment variables not working
- Render automatically restarts when you update environment variables
- Wait for deployment to complete before testing

## Alternative Free Hosting Options

If Render doesn't work for you, try these:

### 1. Railway (500 hours/month free)
- Similar to Render
- https://railway.app/

### 2. Cyclic (Free tier)
- Good for Node.js apps
- https://www.cyclic.sh/

### 3. Fly.io (Free tier)
- More technical setup
- https://fly.io/

### 4. Vercel (Serverless functions)
- Requires code restructuring
- https://vercel.com/

## Cost Comparison

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| Render | 750 hours/month, sleeps | $7/month - always on |
| Railway | 500 hours/month | $5/month |
| Firebase Functions | 2M calls/month | Pay per use |
| Heroku | ⚠️ No longer free | $5/month minimum |

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Update frontend API URL
3. ✅ Redeploy frontend to Firebase
4. ✅ Test the complete application
5. ✅ (Optional) Set up UptimeRobot to keep backend awake

Your complete stack:
- **Frontend**: Firebase Hosting (FREE)
- **Backend**: Render (FREE)
- **Database**: Firebase Firestore (FREE tier)
- **Authentication**: Firebase Auth (FREE tier)

Total cost: **$0/month** 🎉
