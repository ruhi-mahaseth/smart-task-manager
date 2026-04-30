# Team Task Manager

A full-stack Team Task Manager web application where users can create projects, assign tasks, and track progress with role-based access control (Admin/Member).

## 🚀 Live URL
*(Replace this with your Railway Frontend URL once deployed)*

## 📦 Features
- **Authentication**: Secure Login/Signup using JWT and bcrypt.
- **Role-Based Access**: 
  - **Admins**: Can create new projects and tasks.
  - **Members**: Can view assigned tasks and update status.
- **Dashboard**: Real-time progress tracking with dynamic completion rates.
- **Premium UI**: Modern dark mode with glassmorphism aesthetics.

## 🛠️ Technology Stack
- **Frontend**: React.js (Vite), React Router, Axios, Vanilla CSS.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite (Local) / PostgreSQL (Production), Prisma ORM.

## ⚙️ Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/team-task-manager.git
   cd team-task-manager
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npx prisma db push
   node server.js
   ```
   *(The backend runs on http://localhost:5000)*

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *(The frontend runs on http://localhost:5173)*

## 🧪 Testing Credentials
To test the Admin features, you can create a user and update their role in the database, or create an initial user via Postman with `"role": "ADMIN"`.
