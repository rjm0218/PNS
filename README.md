# PNS
PNS Companion 

Project Name: PNS Companion App
This project provides a web application for planning and managing building upgrades in a sanctuary-style game (or similar). It allows users to plan upgrades, estimate resource costs, and track progress.

Features:

Building Planning: Users can select a target building and level to view the required resources for the upgrade.
Resource Cost Estimation: The application calculates the total resource costs, considering existing buildings and account-specific boosts (heroes, builder gear).
Account Management: Users can select their account to personalize resource calculations.
Sanctuary Overview: A comprehensive overview of the user's sanctuary, allowing for easy tracking of building levels and upgrades.
Responsive Design: The application adapts to different screen sizes for optimal usability.
Technology Stack:

Frontend: React, React Bootstrap, Axios
Backend: Node.js, Express.js, Mongoose (MongoDB), Express Validator, JWT (JSON Web Tokens)
Database: MongoDB
Architecture:

The application follows a client-server architecture. The frontend (React) handles user interaction and displays data. The backend (Node.js/Express.js) handles data fetching, calculations, and database interactions. JWTs are used for authentication and authorization.

project-root/
│
├── index.js                  # Main Express app entry point
├── package.json
├── README.md
│
├── routes/                  # Route files grouped by domain
│   ├── authRoutes.js
│   ├── accountRoutes.js
│   ├── inventoryRoutes.js
│   ├── gearRoutes.js
│   ├── heroRoutes.js
│   ├── boostRoutes.js
│   └── utilityRoutes.js
│
├── models/                 # Mongoose schemas
│
├── middleware/             # Middleware (auth checks, JWT verification)
│
├── utils/                  # Logger and response helpers
│
├── validators/             # Custom validation utilities
│
├── config/                 # App config (DB, CORS)
│
└── tests/                  # Route-level test files (Jest/Mocha)
```

## ✅ Features
- Clean modular structure
- Centralized error/success response helpers
- `validateAndCatch()` wrapper for all routes
- Express Validator for request validation
- JWT-based authentication
- MongoDB via Mongoose
- Ready for CI/CD & unit testing

## 🛠 How to Run

1. Clone the repo
2. `npm install`
3. Create `.env` with:
   ```
   MONGODB_URI=your_db_connection
   JWT_SECRET=your_secret
   NODE_ENV=development
   ```
4. `npm run dev` or `node index.js`
