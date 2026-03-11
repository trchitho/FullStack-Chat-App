# Deployment Guide

## Deploy to Vercel

### Prerequisites
1. GitHub account with your repository
2. Vercel account (sign up at vercel.com)
3. MongoDB Atlas account for production database

### Step 1: Setup MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel

### Step 2: Deploy Backend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NODE_ENV=production
   ```
5. Deploy

### Step 3: Deploy Frontend Separately (Recommended)
1. Create a new Vercel project for frontend
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```

### Step 4: Update CORS
Update the CORS origin in `backend/src/index.js` with your frontend URL:
```javascript
origin: ["https://your-frontend-url.vercel.app"]
```

### Alternative: Single Deployment
The current setup supports deploying both frontend and backend together using the `vercel.json` configuration.

## Environment Variables Needed

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=production
```

## Troubleshooting
1. **CORS Issues**: Make sure frontend URL is added to CORS origins
2. **Database Connection**: Ensure MongoDB Atlas allows connections from all IPs
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **Build Errors**: Check build logs in Vercel dashboard