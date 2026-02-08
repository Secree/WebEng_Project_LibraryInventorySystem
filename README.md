# Library Inventory System

A web-based library inventory management system with role-based access control (Admin and User).

## Features

- **User Authentication**: Login and registration system
- **Role-Based Access**: 
  - **Admin**: Can view all users, delete users, and manage the system
  - **User**: Access to personal dashboard and library features
- **Firebase Integration**: Data stored in Firebase Firestore
- **React + TypeScript Frontend**: Modern UI with React and TypeScript
- **Express Backend**: RESTful API with Node.js and Express

## Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- React Router (for navigation)

**Backend:**
- Node.js
- Express
- Firebase Admin SDK
- CORS

## Project Structure

```
├── Library_Inventory/          # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── UserDashboard.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── Library_Inventory_Backend/  # Backend (Node.js + Express)
    ├── server.js
    ├── .env                    # Your Firebase credentials (not tracked)
    ├── .env.example           # Template for environment variables
    └── package.json
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### 1. Clone the Repository

```bash
git clone https://github.com/Secree/WebEng_Project_LibraryInventorySystem.git
cd WebEng_Project_LibraryInventorySystem
```

### 2. Firebase Setup

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Firestore Database in your project

2. **Get Firebase Credentials:**
   - In Firebase Console, go to **Project Settings** (gear icon)
   - Navigate to the **Service accounts** tab
   - Click **Generate new private key**
   - Download the JSON file (keep it secure!)

3. **Set up Environment Variables:**
   - Navigate to `Library_Inventory_Backend` folder
   - Copy `.env.example` to `.env`:
     ```bash
     cd Library_Inventory_Backend
     cp .env.example .env
     ```
   - Open `.env` and update with your Firebase credentials:
     ```env
     PORT=3000
     FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
     FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...paste entire JSON here...}
     ```
   - Replace `your-project-id` with your actual Firebase project ID
   - Paste the entire downloaded JSON content as one line for `FIREBASE_SERVICE_ACCOUNT`

### 3. Install Dependencies

**Backend:**
```bash
cd Library_Inventory_Backend
npm install
```

**Frontend:**
```bash
cd ../Library_Inventory
npm install
```

### 4. Run the Application

**Start Backend Server:**
```bash
cd Library_Inventory_Backend
npm start
```
Backend will run on: `http://localhost:3000`

**Start Frontend Development Server (in a new terminal):**
```bash
cd Library_Inventory
npm run dev
```
Frontend will run on: `http://localhost:5173`

### 5. Access the Application

Open your browser and navigate to: `http://localhost:5173`

## Usage

### Registration
1. Click on "Register" on the login page
2. Fill in your name, email, password
3. Select role: **User** or **Admin**
4. Submit the form

### Login
1. Enter your registered email and password
2. Click "Login"
3. You'll be redirected to the appropriate dashboard based on your role

### Admin Features
- View all registered users
- Delete users from the system
- Full system access

### User Features
- Personal dashboard
- Access to library features

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login with credentials

### Admin Only
- `POST /api/admin/users` - Get all users (requires admin role)
- `POST /api/admin/delete-user` - Delete a user (requires admin role)

### Health Check
- `GET /api/health` - Server health check

## Security Notes

- Never commit `.env` file to version control
- The `.env` file is already in `.gitignore`
- Only share Firebase credentials securely
- In production, use proper password hashing (bcrypt)
- Implement token-based authentication (JWT) for production

## Development

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

**Backend:**
```bash
npm start        # Start server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request


```
