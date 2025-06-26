# 🚀 Employee Management System (EMS)

![EMS Banner](https://via.placeholder.com/1200x300/4F46E5/FFFFFF?text=Employee+Management+System)

## 📋 Overview

The Employee Management System (EMS) is a **production-ready** full-stack web application built with the PERN stack (PostgreSQL, Express, React, Node.js). It showcases modern development practices including **background job processing**, **real payment integration**, **OAuth authentication**, and **premium subscription management** - perfect for demonstrating advanced skills to potential employers.

**🎯 Built for 3rd Year Students**: This project goes beyond basic CRUD operations to showcase job-ready technologies like queue systems, payment gateways, real-time features, and scalable architecture.

---

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

- ➕ Add, edit, delete, and view employee records
- 🔍 Search and filter employee data
- 📄 Upload and manage documents (Premium users only)

### 👩‍💼 Administrative Features

- 👑 Role-based access control (Admin vs Regular users)
- 📊 Admin dashboard for data overview
- 🛠️ Advanced employee management tools

### 💸 Premium & Payment Features

- 💳 Razorpay integration for UPI-first premium upgrades (no mock gateway)
- ⏳ Premium status with expiry (1 year, auto-expiry)
- 🔒 Only premium users can upload/manage documents
- 🧾 Payment verification and secure backend logic

### ⚡ Background Jobs & Automation

- 📨 **Email/OTP queueing** with BullMQ and Redis (production-ready job processing)
- 🧹 **Automated document cleanup** and scheduled maintenance jobs
- 📬 **Bulk email notifications** for critical actions
- ⏰ **Cron-based scheduling** for recurring tasks

### 🔒 Security Features

- 🛡️ **JWT-based authentication** with refresh tokens
- 🔒 **Password hashing** with bcrypt (industry standard)
- ⏱️ **Rate limiting** to prevent brute force attacks
- 📨 **Email verification** for new accounts
- 🚫 **CORS protection** and security headers
- 🔐 **Role-based middleware** protection

### 🚀 Modern Development Practices

- 🏗️ **Scalable architecture** with separation of concerns
- 📊 **Error logging** and monitoring
- 🔄 **API versioning** and RESTful design
- 🧪 **Environment-based configuration**
- 📱 **Responsive design** with mobile-first approach

---

## 🛠️ Technologies Used

### 🖥️ Frontend (Modern React Ecosystem)

- ⚛️ **React 19.x** - Latest React with hooks and functional components
- 🧭 **React Router Dom 7.x** - Client-side routing
- 🎨 **TailwindCSS 4.x** - Utility-first CSS framework
- 📦 **Zustand** - Lightweight state management (modern alternative to Redux)
- 🔄 **Axios** - Promise-based HTTP client
- 🚀 **Vite** - Next-generation frontend build tool

### ⚙️ Backend (Production-Ready Stack)

- 📡 **Express.js** - Fast, unopinionated web framework
- 🗄️ **PostgreSQL** - Advanced open-source relational database
- 🔄 **Sequelize** - Promise-based Node.js ORM
- 🔐 **Passport.js** - Authentication middleware (OAuth support)
- 📧 **Nodemailer** - Email sending capabilities
- 🔑 **JWT** - Secure token-based authentication
- 🛡️ **bcrypt** - Password hashing and security
- 🏗️ **BullMQ + Redis** - Background job processing and caching
- 💳 **Razorpay** - Indian payment gateway integration
- ⚡ **Express Rate Limit** - API protection middleware

---

## 🏗️ Architecture

### Backend Structure

```
backend/
  ├── configuration/   # DB and passport setup
  ├── controller/      # Business logic
  ├── helper/          # Utility functions
  ├── middleware/      # Express middleware
  ├── model/           # Sequelize models
  ├── queues/          # BullMQ job queues
  ├── workers/         # Background job workers
  └── routes/          # API endpoints
```

### Frontend Structure

```
frontend/
  ├── components/      # React UI components
  ├── src/
  │   ├── assets/      # Static assets
  │   ├── front2backconnect/ # API service layer
  │   └── store/       # Zustand state
  └── public/          # Static files
```

---

## 🔍 Key Features Explained

### 🔒 Authentication Flow

- Register/login with email/password or SSO (Google/GitHub)
- Email verification and OTP for extra security
- JWT-based session management

### 👑 Role-Based Access

- Admin: Full access to all features
- Regular: Limited to own profile and premium features
- Middleware-protected routes

### 💸 Premium Document Management

- Only premium users (with valid payment) can upload/manage documents
- Premium status is tracked and expires after 1 year
- Razorpay UPI-first payment flow (no mock gateway)
- Secure backend verification and expiry logic

### ⚡ Background Jobs

- Email/OTP sending via BullMQ queues
- Scheduled document cleanup
- Scalable, production-ready job processing

---

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
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Configure environment variables**
   - See `.env.example` in backend and frontend for required variables (DB, JWT, email, OAuth, Razorpay keys)
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

---

## 🛣️ API Endpoints (Sample)

### Authentication & User Management

- `POST /api/users/signup` - Register new user
- `POST /api/users/login` - User authentication
- `GET /api/users/me` - Get current user profile
- `POST /api/users/logout` - Secure logout

### Payment & Premium Features

- `POST /api/payment/create-order` - Create Razorpay payment order
- `POST /api/payment/verify-payment` - Verify payment signature
- `GET /api/payment/premium-status` - Check user premium status

### Employee & Document Management

- `GET /api/employees` - List all employees (admin only)
- `POST /api/employees` - Create new employee record
- `GET /api/documents` - List user documents (premium only)
- `POST /api/documents/upload` - Upload document (premium only)

### OAuth & Social Login

- `GET /api/users/auth/google` - Google OAuth login
- `GET /api/users/auth/github` - GitHub OAuth login

---

## 📚 Advanced Features & Learning Guides

### 🚀 For Students & Job Seekers

- [**Advanced Features Roadmap**](./readme/advanced_features_roadmap.md) - Real-time notifications, analytics, AI integration
- [**Payment System Guide**](./readme/payment_system_guide.md) - Razorpay implementation details

### 🎯 Skills Demonstrated

This project showcases **production-ready skills** that impress recruiters:

- **Scalable Architecture**: Queue systems, background jobs, caching
- **Security Best Practices**: Authentication, authorization, data protection
- **Modern Frontend**: Latest React, state management, responsive design
- **Payment Integration**: Real payment gateway (no mock), secure verification
- **DevOps Awareness**: Environment configuration, database management

---

## 💼 Resume-Worthy Project Summary

_"Developed a comprehensive Employee Management System featuring real-time payment processing, background job queues, OAuth authentication, and premium subscription management. Implemented Razorpay integration with secure payment verification, BullMQ for scalable job processing, and role-based access control. Built with Node.js, React, PostgreSQL, and Redis demonstrating production-ready full-stack development skills."_

---

## 📝 License

MIT License

---

⭐️ **Star this repo if you find it useful!** ⭐️

📧 For any questions or suggestions, please contact: your-email@example.com
