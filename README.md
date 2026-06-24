# DecideSecure - Secure Online Voting System (MERN Stack)

DecideSecure is a complete, production-style, role-based Online Voting System built using the MERN stack (MongoDB, Express, React, Node.js) and secured with JSON Web Tokens (JWT), bcrypt hashing, and database-level unique voting constraints.

---

## 🚀 Key Features

* **Role-Based Access Control**:
  * **Voter (User)**: Casts exactly one vote per election, views active & upcoming ballots, updates profiles, and monitors real-time/ended election statistics.
  * **Administrator**: Full lifecycle management of elections (Create, Update, Delete) and candidates. Directory of registered voters with block/unblock actions and secure audit logs.
* **Double-Voting Prevention**: Protected at both the application level and database level using a compound unique index constraint on `{ userId, electionId }`.
* **Harmonious Dark Theme**: Built with customizable CSS variables, Outfit typography, glassmorphism panel styles, and smooth hover micro-animations.
* **Data Visualizations**: Responsive bar charts built using `recharts` for analyzing vote distributions.

---

## 📂 Folder Structure

```
online voting system/
├── backend/                  # Node.js + Express API server
│   ├── config/               # Database connection scripts
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # JWT and Admin authorization gates
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # API route maps
│   ├── test_db_constraints.js# Constraint validation test suite
│   ├── .env                  # Backend environment secrets
│   └── server.js             # API entry point
└── frontend/                 # Vite + React SPA client
    ├── src/
    │   ├── components/       # Navbars, Route guards, Cards, Charts, Buttons
    │   ├── context/          # Authentication state providers
    │   ├── pages/            # Login, dashboards, management panels
    │   ├── services/         # Native API fetch wrappers
    │   ├── App.jsx           # Client router
    │   └── index.css         # Styling system & dark theme variables
    └── package.json
```

---

## 🛠️ Setup & Running Instructions

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended, tested on v24.13.0)
* [MongoDB](https://www.mongodb.com/) (Local server or Atlas cloud connection)

---

### Step 1: Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies (Express, Mongoose, JWT, bcryptjs, CORS):
   ```bash
   npm install
   ```
3. Configure the environment variables in `backend/.env` (a template is provided by default):
   * `PORT`: Port server runs on (default: `5000`)
   * `MONGODB_URI`: Mongoose connection string (default: `mongodb://localhost:27017/online_voting`)
   * `JWT_SECRET`: Hashing secret for authentication tokens

4. Start the backend server:
   * **Development Mode (with live reload)**:
     ```bash
     npm run dev
     ```
   * **Production Mode**:
     ```bash
     npm start
     ```

---

### Step 2: Frontend Setup
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies (Recharts, Lucide Icons, React Router):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web client in your browser at:
   `http://localhost:5173`

---

## 🧪 Database Constraints Test
To verify the database-level security and ensure voters cannot bypass constraints to double-vote, run the automated test suite:
1. Ensure your MongoDB database server is running.
2. In the `backend` terminal, execute:
   ```bash
   node test_db_constraints.js
   ```
3. The test suite will construct a temporary sandboxed voter, ballot, and candidate, cast a vote, attempt to cast a duplicate vote, confirm that MongoDB blocks it with a `11000` duplicate key violation, and clean up.

---

## 👤 Admin Setup Details
By default, the **first registered user** on the platform is automatically designated as the **Administrator**.
1. Go to the Registration Page on the client.
2. Register the first account. This account will automatically grant you `admin` role and redirect you to the Admin Panel.
3. Subsequent accounts will be registered as normal `voters` (users).
