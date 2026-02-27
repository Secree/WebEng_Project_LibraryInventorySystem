import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './server/src/config/mongodb.js';
import authRoutes from './server/src/routes/auth.routes.js';
import userRoutes from './server/src/routes/user.routes.js';
import resourceRoutes from './server/src/routes/resource.routes.js';

dotenv.config();

// Log environment check
console.log('Environment variables loaded');
console.log('MongoDB URI configured:', !!process.env.MONGODB_URI);
console.log('JWT Secret configured:', !!process.env.JWT_SECRET);

const app = express();

// Connect to MongoDB (non-blocking)
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
});
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true  // Allow credentials (cookies)
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', authRoutes);
app.use('/api/admin', userRoutes);
app.use('/api/resources', resourceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running with MongoDB' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
