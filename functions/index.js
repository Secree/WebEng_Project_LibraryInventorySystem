import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './server/src/routes/auth.routes.js';
import userRoutes from './server/src/routes/user.routes.js';
import resourceRoutes from './server/src/routes/resource.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: true,  // Allow all origins in Cloud Functions
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', authRoutes);
app.use('/api/admin', userRoutes);
app.use('/api/resources', resourceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running on Firebase Functions' });
});

// Export the Express app as a Cloud Function
export const api = functions.https.onRequest(app);
