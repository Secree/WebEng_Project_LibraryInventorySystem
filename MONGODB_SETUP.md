# MongoDB Atlas Setup Guide (FREE)

Your app now uses MongoDB instead of Firebase! Here's how to get a free cloud database.

## 🚀 Quick Setup (5 minutes)

### Step 1: Sign Up for MongoDB Atlas (FREE)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email or Google account
3. **No credit card required!** ✅

### Step 2: Create a Free Cluster

1. Choose **"Create a deployment"**
2. Select **M0 (Free Forever)**
   - 512 MB storage
   - Shared RAM
   - Perfect for development and small apps
3. Choose a cloud provider & region (any is fine, closest to you is best)
4. Cluster Name: `library-inventory` (or any name)
5. Click **"Create Deployment"**

### Step 3: Create Database User

1. **Security Quickstart** will appear
2. Choose **"Username and Password"**
3. Create a username: `admin` (or your choice)
4. Create a strong password (save it!)
5. Click **"Create Database User"**

### Step 4: Add Your IP Address

1. In the same Security Quickstart:
2. Choose **"My Local Environment"**
3. Click **"Add My Current IP Address"**
4. For deployment (Render), also add: `0.0.0.0/0` (allows all IPs)
   - This is safe because you still need username/password
5. Click **"Finish and Close"**

### Step 5: Get Your Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** and latest version
4. Copy the connection string:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace `<password>` with your actual password!**
6. **Add database name**: Change `mongodb.net/` to `mongodb.net/library_inventory`

Final format:
```
mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/library_inventory?retryWrites=true&w=majority
```

## 💻 Local Development

### Option 1: Use MongoDB Atlas (Recommended)

Update your `.env`:
```
MONGODB_URI=mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/library_inventory?retryWrites=true&w=majority
```

### Option 2: Install MongoDB Locally

1. Download MongoDB Community from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Use local connection in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/library_inventory
   ```

## 🌐 Production Deployment (Render)

### Update Render Environment Variables:

1. Go to your Render dashboard
2. Select your service
3. Go to **"Environment"** tab
4. **Remove these old Firebase variables:**
   - `FIREBASE_SERVICE_ACCOUNT`
   - `FIREBASE_DATABASE_URL`

5. **Add new MongoDB variable:**
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/library_inventory?retryWrites=true&w=majority`

6. Click **"Save Changes"** (Render will auto-redeploy)

## 🔐 Security Best Practices

### For MongoDB Atlas:

1. **Never commit your connection string to Git!**
   - It's in `.env` which is in `.gitignore` ✅

2. **Use Network Access whitelist:**
   - For local dev: Add your IP
   - For Render: Add `0.0.0.0/0` (still secure with password)

3. **Use strong passwords:**
   - Mix of letters, numbers, special characters
   - At least 12 characters

4. **Enable M001: MongoDB Basics (free course):**
   - Learn MongoDB security best practices
   - https://university.mongodb.com/

## 📊 Viewing Your Data

### MongoDB Atlas UI:

1. Go to your cluster dashboard
2. Click **"Browse Collections"**
3. You'll see your databases and collections:
   - `users` - All registered users
   - `resources` - Library resources
   - `reservations` - Resource reservations

### Using MongoDB Compass (GUI):

1. Download free: https://www.mongodb.com/products/compass
2. Connect using your connection string
3. Visual interface to browse/edit data

## 🧪 Test Your Setup

### Test locally:

```bash
cd Library_Inventory_Backend
npm start
```

You should see:
```
MongoDB connected successfully
Mongoose connected to MongoDB
Server is running on http://localhost:3000
```

### Test the API:

Visit: http://localhost:3000/api/health

Should return:
```json
{"status":"ok","message":"Server is running with MongoDB"}
```

## 🆘 Troubleshooting

### "MongooseError: The `uri` parameter to `openUri()` must be a string"

- **Fix**: Make sure `MONGODB_URI` is set in your `.env` file

### "MongoNetworkError: failed to connect to server"

- **Fix**: Check your connection string
- Ensure IP address is whitelisted in MongoDB Atlas
- Verify password doesn't contain special characters that need URL encoding

### "Authentication failed"

- **Fix**: Double-check username and password
- Password in connection string must be URL-encoded
- Special characters: `@` → `%40`, `:` → `%3A`, etc.

### "Cannot find module"

- **Fix**: Run `npm install` to install mongoose

## 💰 MongoDB Atlas Free Tier Limits

- **Storage**: 512 MB (plenty for small-medium apps)
- **RAM**: Shared
- **Connections**: 500 concurrent
- **Backups**: Not included (upgrade for $9/month)
- **No credit card required**
- **Never expires**

## 🔄 Migrating Data from Firebase (Optional)

If you had data in Firebase Firestore and want to migrate:

1. Export data from Firebase Console
2. Convert JSON to MongoDB format
3. Use `mongoimport` or MongoDB Compass to import
4. Or use the bulk create endpoints in your API

## 📚 Learn More

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Mongoose Docs**: https://mongoosejs.com/docs/
- **MongoDB University**: https://university.mongodb.com/ (Free courses!)

## ✅ Next Steps

1. ✅ Sign up for MongoDB Atlas
2. ✅ Create free cluster  
3. ✅ Get connection string
4. ✅ Update `.env` file locally
5. ✅ Test locally (`npm start`)
6. ✅ Update Render environment variables
7. ✅ Push changes to GitHub
8. ✅ Render auto-deploys with MongoDB!

Your app is now running on MongoDB - a scalable, flexible NoSQL database! 🎉
