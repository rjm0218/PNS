
* **Building Planning:** Users select a target building and level to view required resources.
* **Resource Cost Estimation:** Calculates total resource costs, considering existing buildings and account boosts (heroes, builder gear).
* **Account Management:** Users select their account for personalized calculations.
* **Sanctuary Overview:**  Displays a comprehensive overview of the user's sanctuary, allowing for easy tracking of building levels and upgrades.  Allows users to update building levels.
* **Responsive Design:** Adapts to different screen sizes.

**Technology Stack:**

* **Frontend:** React, React Bootstrap, Axios
* **Backend:** Node.js, Express.js, Mongoose (MongoDB)
* **Database:** MongoDB

**Architecture:**

Client-server architecture. The frontend handles user interaction and display; the backend handles data fetching, calculations, and database interactions.

```
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
