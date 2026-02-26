# Firebase Deployment Guide

## Prerequisites

1. **Firebase CLI**: Install globally
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com/)

3. **Firebase Configuration**: Make sure you have your Firebase service account credentials

## Deployment Steps

### 1. Login to Firebase

```bash
firebase login
```

### 2. Initialize Firebase Project

```bash
firebase init
```

Select:
- ✅ Functions
- ✅ Hosting

Follow the prompts and:
- Choose your existing Firebase project
- For functions, select JavaScript/ES Modules
- For hosting, set public directory to `Library_Inventory/dist`
- Configure as single-page app: Yes
- Set up automatic builds with GitHub: Optional

### 3. Update Firebase Project ID

Edit `.firebaserc` and replace `your-firebase-project-id` with your actual Firebase project ID.

### 4. Set Environment Variables for Functions

Set your environment variables in Firebase Functions:

```bash
# Set Firebase service account (as a JSON string)
firebase functions:config:set firebase.service_account="$(cat path/to/serviceAccountKey.json)"

# Set database URL
firebase functions:config:set firebase.database_url="YOUR_DATABASE_URL"

# Set JWT secret
firebase functions:config:set jwt.secret="YOUR_JWT_SECRET"

# Set frontend URL
firebase functions:config:set frontend.url="https://your-project-id.web.app"
```

Alternative: Use .env file for local testing and Firebase environment config for production.

### 5. Update Frontend API URL

Update the API URL in your frontend to use relative paths (already configured for `/api/`).

Check `Library_Inventory/src/services/api.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

### 6. Build Frontend

```bash
cd Library_Inventory
npm run build
cd ..
```

### 7. Install Functions Dependencies

```bash
cd functions
npm install
cd ..
```

### 8. Deploy to Firebase

Deploy everything:
```bash
firebase deploy
```

Or deploy separately:
```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

### 9. Access Your App

After deployment, your app will be available at:
- **Hosting URL**: `https://your-project-id.web.app`
- **Functions URL**: `https://us-central1-your-project-id.cloudfunctions.net/api`

## Environment Configuration

### For Cloud Functions

Firebase Functions can access environment variables through:

1. **Firebase Config** (recommended for production):
   ```bash
   firebase functions:config:set key.name="value"
   ```

2. **Environment Variables in Code**:
   Update `functions/server/src/config/firebase.js` to use Firebase Functions config:
   ```javascript
   const serviceAccount = functions.config().firebase?.service_account || 
                         JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
   ```

### For Local Development

Keep using your current setup with `.env` file in `Library_Inventory_Backend/`.

## Continuous Deployment (Optional)

### GitHub Actions

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Dependencies
        run: |
          cd Library_Inventory
          npm install
          cd ../functions
          npm install
      
      - name: Build Frontend
        run: |
          cd Library_Inventory
          npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, make sure the backend `cors` configuration allows your hosting URL.

### Function Cold Starts
First request after idle period may be slow. Consider:
- Using Firebase Functions min instances (paid)
- Implementing warming requests

### Environment Variables
If functions can't read environment variables:
```bash
# View current config
firebase functions:config:get

# Deploy after setting config
firebase deploy --only functions
```

### Build Errors
Clear caches and rebuild:
```bash
cd Library_Inventory
rm -rf node_modules dist
npm install
npm run build
```

## Monitoring

View logs:
```bash
# Real-time logs
firebase functions:log --follow

# Specific function logs
firebase functions:log --only api
```

## Costs

Firebase offers generous free tier:
- **Hosting**: 10 GB storage, 10 GB/month transfer
- **Functions**: 2M invocations/month, 400K GB-seconds compute

Monitor usage in Firebase Console > Usage and billing.

## Security

1. **Firestore Rules**: Set appropriate security rules in Firebase Console
2. **API Keys**: Never commit service account keys to Git
3. **Environment Variables**: Use Firebase Functions config for secrets
4. **CORS**: Restrict to your domain in production

## Useful Commands

```bash
# Test locally
firebase serve

# View current project
firebase projects:list

# Switch projects
firebase use <project-id>

# Delete functions
firebase functions:delete <function-name>
```
