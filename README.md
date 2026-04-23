# Lost & Found Item Management System
## MERN Stack - Campus Lost & Found Portal

---

## 📁 Project Structure

```
lost-found-app/
├── backend/
│   ├── models/
│   │   ├── User.js         ← MongoDB User Schema
│   │   └── Item.js         ← MongoDB Item Schema
│   ├── routes/
│   │   ├── auth.js         ← Register / Login / Dashboard APIs
│   │   └── items.js        ← CRUD Item APIs + Search
│   ├── middleware/
│   │   └── auth.js         ← JWT Protection Middleware
│   ├── .env                ← Environment Variables
│   ├── server.js           ← Express Server Entry
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/
    │   │   ├── Register.js  ← Registration Page
    │   │   ├── Login.js     ← Login Page
    │   │   └── Dashboard.js ← Main Dashboard
    │   ├── utils/
    │   │   └── api.js       ← Axios API Calls
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

---

## ⚙️ Setup & Run Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally on port 27017)
- npm

---

### Step 1: Start MongoDB
```bash
# On Windows (if MongoDB is installed as a service):
net start MongoDB

# On Mac/Linux:
mongod
# or
brew services start mongodb-community
```

---

### Step 2: Setup Backend
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start backend server (development with auto-reload)
npm run dev

# OR start normally
npm start
```
Backend will run on: http://localhost:5000

---

### Step 3: Setup Frontend (in a new terminal)
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```
Frontend will open at: http://localhost:3000

---

## 🔑 Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/lost_found_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

---

## 📡 API Endpoints

| Method | Route | Auth Required | Description |
|--------|-------|:---:|-------------|
| POST | /api/register | ❌ | Register new user |
| POST | /api/login | ❌ | Login user |
| GET | /api/dashboard | ✅ | Protected dashboard info |
| POST | /api/items | ✅ | Report new item |
| GET | /api/items | ❌ | View all items |
| GET | /api/items/:id | ❌ | View item by ID |
| PUT | /api/items/:id | ✅ | Update item (owner only) |
| DELETE | /api/items/:id | ✅ | Delete item (owner only) |
| GET | /api/items/search?name=xyz | ❌ | Search items |

---

## 🛠️ Tech Stack
- **MongoDB** - Database
- **Express.js** - Backend Framework
- **React.js** - Frontend
- **Node.js** - Runtime
- **bcryptjs** - Password Hashing
- **jsonwebtoken** - JWT Authentication
- **Axios** - HTTP Client
- **Bootstrap 5** - UI Styling
