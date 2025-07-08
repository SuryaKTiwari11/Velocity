# 🚀 Employee Management System (EMS)

![EMS Banner](https://via.placeholder.com/1200x300/4F46E5/FFFFFF?text=Employee+Management+System)

## 📋 Overview

The Employee Management System (EMS) is a **production-ready** full-stack web application built with the PERN stack (PostgreSQL, Express, React, Node.js). It showcases modern development practices including **background job processing**, **real payment integration**, **OAuth authentication**, and **premium subscription management**.

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
- 📄 Upload and manage documents (Premium users only, with real-time progress and auto-refresh)

### 👩‍💼 Administrative Features

- 👑 Role-based access control (Admin vs Regular users)
- 📊 Admin dashboard for data overview
- 🛠️ Advanced employee management tools

### 💸 Premium & Payment Features

- 💳 Razorpay integration for UPI-first premium upgrades (no mock gateway)
- ⏳ Premium status with expiry (1 year, auto-expiry)
- 🔒 Only premium users can upload/manage documents (with real-time upload progress and instant document list refresh)
- 🧾 Payment verification and secure backend logic

### 🎥 Video Calling (Google Meet/Zoom Style)

- Modern video meetings for premium users, powered by [LiveKit](https://livekit.io/)
- Lobby: Create or join meetings with a single click
- Meeting Room: See all participants, mute/unmute, toggle camera, and share screen
- Premium-protected: Only premium users can access video calls
- Clean, student-friendly UI using TailwindCSS
- Secure token generation via backend for LiveKit
- [See full usage & setup guide →](./readme/video_calling_frontend_guide.md)

### 💬 Real-Time Chat & Communication

- Stream Chat Integration: Professional chat experience powered by [Stream Chat](https://getstream.io/chat/)
- Video & Audio Calls: Integrated calling system with invitation cards in chat
- Dark Theme UI: Consistent, modern dark theme across all chat components
- Real-time Messaging: Instant messaging with typing indicators and online status
- File Sharing: Share documents and media files in chat conversations
- Clean Architecture: Modern React components with error boundaries and safety checks

### 🗺️ Location & Mapping Features

- Interactive Maps: Employee location tracking and visualization
- Geolocation Services: Real-time location updates and mapping
- Location Analytics: Dashboard insights for employee locations
- Map Integration: Seamless mapping experience for HR and administrative use

### ⚡ Real-Time Document Uploads & Auto-Refresh

EMS supports real-time document upload progress using **Socket.IO**. After uploading a document, the UI will automatically refresh and show the latest documents as soon as processing is complete. If the socket connection is not active, the app will connect and still refresh the document list after upload.

### ⚡ Background Jobs & Automation

- 📨 Email/OTP queueing with BullMQ and Redis (production-ready job processing)
- 🧹 Automated document cleanup and scheduled maintenance jobs
- 📬 Bulk email notifications for critical actions
- ⏰ Cron-based scheduling for recurring tasks

### 🔒 Security Features

- 🛡️ JWT-based authentication with refresh tokens
- 🔒 Password hashing with bcrypt (industry standard)
- ⏱️ Rate limiting to prevent brute force attacks
- 📨 Email verification for new accounts
- 🚫 CORS protection and security headers
- 🔐 Role-based middleware protection

### 🚀 Modern Development Practices

- 🏗️ Scalable architecture with separation of concerns
- 📊 Error logging and monitoring
- 🔄 API versioning and RESTful design
- 🧪 Environment-based configuration
- 📱 Responsive design with mobile-first approach

---

## 🛠️ Technologies Used

### 🖥️ Frontend (Modern React Ecosystem)

- ⚛️ React 19.x - Latest React with hooks and functional components
- 🧭 React Router Dom 7.x - Client-side routing
- 🎨 TailwindCSS 4.x - Utility-first CSS framework
- 📦 Zustand - Lightweight state management
- 🔄 Axios - Promise-based HTTP client
- 🚀 Vite - Next-generation frontend build tool

### ⚙️ Backend (Production-Ready Stack)

- 📡 Express.js - Fast, unopinionated web framework
- 🗄️ PostgreSQL - Advanced open-source relational database
- 🔄 Sequelize - Promise-based Node.js ORM
- 🔐 Passport.js - Authentication middleware (OAuth support)
- 📧 Nodemailer - Email sending capabilities
- 🔑 JWT - Secure token-based authentication
- 🛡️ bcrypt - Password hashing and security
- 🏗️ BullMQ + Redis - Background job processing and caching
- 💳 Razorpay - Indian payment gateway integration
- ⚡ Express Rate Limit - API protection middleware

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

- [**Advanced Features Roadmap**](./readme/advanced_features_roadmap.md) - Real-time notifications, analytics, AI integration
- [**Payment System Guide**](./readme/money_related_feature.md) - Razorpay implementation details
- [**SaaS Conversion Guide**](./readme/saas.md) - Complete guide to convert EMS into a multi-tenant SaaS platform
- [**Video Calling Guide**](./readme/video_calling_frontend_guide.md) - LiveKit integration and meeting features
- [**Stream Chat Guide**](./STREAM_CHAT_GUIDE.md) - Real-time messaging implementation

---

## 📝 License

MIT License

---

⭐️ **Star this repo if you find it useful!** ⭐️

📧 For any questions or suggestions, please contact: your-email@example.com

---
REMEMBER TO CLEAN  THIS UP 
## 🚀 New & Advanced Features (2025 Update)

The EMS project has been significantly enhanced with the following advanced features and improvements:

- **Modern Onboarding Flow**: New users select their city, watch a training video, upload KYC documents to S3, and await admin review.
- **S3 Document Management**: Upload, download, and admin review of documents using S3 (compatible with LocalStack for local dev/testing).
- **Admin Dashboard**: Secure interface for admins to review, approve/reject, and download user documents.
- **SQL Migrations**: Added onboarding and audit log support for robust data tracking.
- **S3 Bucket Health & Setup Scripts**: Automated scripts to check and initialize S3 buckets.
- **S3Document Cleanup Script**: Node.js script to clean up orphaned S3 keys and maintain storage hygiene.
- **UI/UX Enhancements**:
  - Responsive layout for all devices
  - Modern navbar and footer with theme-matching Lucide icons
  - Footer includes GitHub, LeetCode, and LinkedIn links with icons
- **Toast Notifications**: Instant feedback for all admin actions (approve/reject) and user events.
- **Real-Time Chat & Video Call**: Integrated Stream and LiveKit for chat and video communication between users.
- **Premium Payment Integration**: Razorpay with UPI-first flow for premium upgrades.
- **Multi-Role Support**: Admin, Premium, and Regular user roles with tailored access and features.
- **Audit Log & Login History**: Track all critical actions and user logins for security and compliance.
- **Modular, Production-Ready Codebase**: Clean, scalable, and easy to extend for new features.

---

## 📖 Updated API Endpoints & Learning Guides

- **Onboarding**: `/api/onboarding` (city selection, video, S3 upload)
- **S3 Document**: `/api/s3document` (upload, download, admin review)
- **Admin Review**: `/api/admin/review` (approve/reject docs)
- **Audit Log**: `/api/audit` (view actions, login history)
- **Payment**: `/api/payment` (Razorpay, UPI)
- **Chat/Video**: `/api/chat`, `/api/video` (real-time features)

See `readme/advanced_features_roadmap.md` and `readme/audit/docVerification/` for deep dives and code samples.

---


