# 🚀 Employee Management System (EMS)

![EMS Banner](https://via.placeholder.com/1200x300/4F46E5/FFFFFF?text=Employee+Management+System)

## 📋 Overview

The Employee Management System (EMS) is a full-stack web application built with the PERN stack (PostgreSQL, Express, React, Node.js). It provides a comprehensive solution for managing employee data, user authentication, and HR administration.

## ✨ Features

### 👥 User Management
- 🔐 Secure registration and login system
- 🔑 Multiple authentication methods:
  - 📧 Email/Password authentication
  - 🌐 Single Sign-On (SSO) via Google and GitHub
- 📱 Two-factor authentication with OTP verification
- 🔄 Password reset functionality
- 👤 User profile management

### 👨‍💼 Employee Management
- ➕ Add new employees with detailed information
- 📝 Edit existing employee records
- 🗑️ Delete employee records
- 👀 View comprehensive employee details
- 🔍 Search and filter employee data

### 👩‍💼 Administrative Features
- 👑 Role-based access control (Admin vs Regular users)
- 📊 Admin dashboard for data overview
- 🛠️ Advanced employee management tools

### 🔒 Security Features
- 🛡️ JWT-based authentication
- 🔒 Password hashing with bcrypt
- ⏱️ Rate limiting to prevent brute force attacks
- 📨 Email verification for new accounts
- 🚫 Protection against common security vulnerabilities

## 🛠️ Technologies Used

### 🖥️ Frontend
- ⚛️ React 19.x - Latest React with hooks and functional components
- 🧭 React Router Dom 7.x - For client-side routing
- 🎨 TailwindCSS 4.x - For responsive, utility-first styling
- 📦 Zustand - Lightweight state management
- 🔄 Axios - For API requests
- 🚀 Vite - Fast, modern frontend build tool

### ⚙️ Backend
- 📡 Express.js - Web server framework
- 🗄️ PostgreSQL - Relational database
- 🔄 Sequelize - ORM for database operations
- 🔐 Passport.js - Authentication middleware
- 📧 Nodemailer - For sending emails
- 🔑 JWT - For secure token-based authentication
- 🛡️ bcrypt - For password hashing

## 🏗️ Architecture

The application follows a modern, component-based architecture:

### Backend Structure
```
backend/
  ├── configuration/ - Database and passport setup
  ├── controller/ - Business logic handlers
  ├── helper/ - Utility functions
  ├── middleware/ - Express middleware
  ├── model/ - Database models
  └── routes/ - API endpoints
```

### Frontend Structure
```
frontend/
  ├── components/ - React UI components
  ├── src/
  │   ├── assets/ - Static assets
  │   ├── front2backconnect/ - API service layer
  │   └── store/ - State management
  └── public/ - Static files
```

## 🔍 Key Features Explained

### 🔒 Authentication Flow

The application provides multiple authentication methods:

1. **Traditional Authentication**:
   - Register with email/password
   - Verify email via OTP
   - Login with credentials

2. **SSO Authentication**:
   - One-click authentication with Google or GitHub
   - Automatic user creation on first login

### 📱 OTP Verification

- Email verification via OTP codes
- Password reset security with OTP verification
- Time-limited OTP tokens for security

### 👑 Role-Based Access

- Admin users: Full access to all employee data and management features
- Regular users: Access only to their own profile
- Secured routes with middleware protection

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ems.git
   cd ems
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory with the following variables:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASS=yourpassword
   DB_NAME=ems_db
   JWT_SECRET=your_jwt_secret
   
   # Email configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # OAuth credentials
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/users/auth/google/callback
   
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3000/api/users/auth/github/callback
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm run db:create
   npm run db:sync
   ```

5. **Run the application**
   ```bash
   # From the root directory
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

## 🧪 Testing

Run the API endpoint tests:

```bash
cd frontend
node test-all-endpoints.js
```

Test admin-specific endpoints:

```bash
node admin-endpoints-test.js
```

## 🛣️ API Endpoints

### Employee Endpoints
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Authentication Endpoints
- `POST /api/users/signup` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user
- `GET /api/users/me` - Get current user
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/verify-reset-otp` - Verify reset OTP
- `POST /api/users/reset-password` - Reset password

### OTP Endpoints
- `POST /api/otp/send` - Send OTP
- `POST /api/otp/verify` - Verify OTP

### OAuth Endpoints
- `GET /api/users/auth/google` - Google authentication
- `GET /api/users/auth/github` - GitHub authentication
- `GET /api/users/auth/success` - OAuth success callback

## 📱 Screenshots

### Login Page
![Login Page](https://via.placeholder.com/800x450/4F46E5/FFFFFF?text=Login+Page)

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x450/4F46E5/FFFFFF?text=Admin+Dashboard)

### Employee Management
![Employee Management](https://via.placeholder.com/800x450/4F46E5/FFFFFF?text=Employee+Management)

## 🔄 Future Enhancements

- 📊 Advanced reporting and analytics
- 📅 Employee attendance tracking
- 💸 Payroll management integration
- 📱 Mobile application
- 🌐 Multi-language support
- 🔄 Real-time notifications

## 👥 Contributors

- Your Name - Lead Developer

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

⭐️ **Star this repo if you find it useful!** ⭐️

📧 For any questions or suggestions, please contact: your-email@example.com
