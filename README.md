# 🚀 Employee Management System (EMS) — 2025  (Now with SaaS!)

> **Next-Gen HR, Payroll, Collaboration & SaaS Platform**

Welcome to the most advanced open-source Employee Management System! EMS is now a true multi-tenant SaaS platform, ready for startups, enterprises, and HR tech builders.

- **SaaS-Ready:** Multi-company, multi-tenant architecture. Each company has its own users, data, and settings. Built-in onboarding for new orgs.
- **Modern Onboarding:** City selection, training video, S3 KYC upload, admin review
- **S3 Document Management:** Upload, download, admin review, and cleanup (LocalStack compatible)
- **Admin Dashboard:** Approve/reject/download docs, real-time analytics, and audit logs
- **Premium Payments:** Razorpay UPI-first flow, multi-role access, and expiry logic
- **Real-Time Chat & Video:** Stream + LiveKit for chat, video, and file sharing
- **Automated SQL Migrations & S3 Health:** Robust data tracking and S3 setup scripts
- **UI/UX:** Responsive, beautiful, with Lucide icons, dark mode, and instant toast notifications
- **Audit & Security:** Full audit log, login history, JWT, rate limiting, and more
- **Production-Ready:** Modular, scalable, and easy to extend for any org

---

## 🆕 2025 Advanced Features (SaaS Edition)

- **SaaS Multi-Tenancy:** Each company is a tenant. All features (onboarding, docs, chat, payments, analytics) are company-scoped and secure.
- **Company Onboarding:** New companies can sign up, get their own workspace, and onboard users instantly.
- **Onboarding Flow:** City selection, video, S3 KYC upload, admin review
- **S3 Document Management:** Upload/download/review, S3 cleanup script, LocalStack support
- **Admin Dashboard:** Approve/reject/download docs, analytics, audit log
- **SQL Migrations:** Onboarding & audit log support
- **S3 Health & Setup Scripts:** Automated S3 bucket checks
- **UI/UX:** Responsive, Lucide icons, GitHub/LeetCode/LinkedIn footer, toast notifications
- **Real-Time Chat & Video:** Stream + LiveKit integration
- **Premium Payments:** Razorpay UPI-first, expiry, multi-role
- **Audit Log & Login History:** Track all actions and logins
- **Production-Ready:** Clean, modular, scalable codebase

---

## ✨ Features

### 👥 User & Company Management (SaaS)

- 🔐 Secure registration and login system (per company)
- 🏢 Company registration, onboarding, and management
- 🔑 Multiple authentication methods:
  - 📧 Email/Password authentication
  - 🌐 Single Sign-On (SSO) via Google and GitHub
- 📱 Two-factor authentication with OTP verification
- 🔄 Password reset functionality
- 👤 User profile management (company-scoped)

### 👨‍💼 Employee Management (Per Company)

- ➕ Add, edit, delete, and view employee records (per company)
- 🔍 Search and filter employee data
- 📄 Upload and manage documents (Premium users only, with real-time progress and auto-refresh)

### 👩‍💼 Administrative Features (SaaS)

- 👑 Role-based access control (Admin, Premium, Regular users)
- 📊 Admin dashboard for data overview (per company)
- 🛠️ Advanced employee management tools

### 💸 Premium & Payment Features (SaaS)

- 💳 Razorpay integration for UPI-first premium upgrades (no mock gateway)
- ⏳ Premium status with expiry (1 year, auto-expiry)
- 🔒 Only premium users can upload/manage documents (with real-time upload progress and instant document list refresh)
- 🧾 Payment verification and secure backend logic (per company)

### 🎥 Video Calling (SaaS, Google Meet/Zoom Style)

- Modern video meetings for premium users, powered by [LiveKit](https://livekit.io/)
- Lobby: Create or join meetings with a single click
- Meeting Room: See all participants, mute/unmute, toggle camera, and share screen
- Premium-protected: Only premium users can access video calls
- Clean, student-friendly UI using TailwindCSS
- Secure token generation via backend for LiveKit

### 💬 Real-Time Chat & Communication (SaaS)

- Stream Chat Integration: Professional chat experience powered by [Stream Chat](https://getstream.io/chat/)
- Video & Audio Calls: Integrated calling system with invitation cards in chat
- Dark Theme UI: Consistent, modern dark theme across all chat components
- Real-time Messaging: Instant messaging with typing indicators and online status
- File Sharing: Share documents and media files in chat conversations
- Clean Architecture: Modern React components with error boundaries and safety checks

### 🗺️ Location & Mapping Features (SaaS)

- Interactive Maps: Employee location tracking and visualization
- Geolocation Services: Real-time location updates and mapping
- Location Analytics: Dashboard insights for employee locations
- Map Integration: Seamless mapping experience for HR and administrative use

### ⚡ Real-Time Document Uploads & Auto-Refresh (SaaS)

EMS supports real-time document upload progress using **Socket.IO**. After uploading a document, the UI will automatically refresh and show the latest documents as soon as processing is complete. If the socket connection is not active, the app will connect and still refresh the document list after upload.

### ⚡ Background Jobs & Automation (SaaS)

- 📨 Email/OTP queueing with BullMQ and Redis (production-ready job processing)
- 🧹 Automated document cleanup and scheduled maintenance jobs
- 📬 Bulk email notifications for critical actions
- ⏰ Cron-based scheduling for recurring tasks

### 🔒 Security Features (SaaS)

- 🛡️ JWT-based authentication with refresh tokens
- 🔒 Password hashing with bcrypt (industry standard)
- ⏱️ Rate limiting to prevent brute force attacks
- 📨 Email verification for new accounts
- 🚫 CORS protection and security headers
- 🔐 Role-based middleware protection (company/tenant scoped)

### 🚀 Modern Development Practices (SaaS)

- 🏗️ Scalable, multi-tenant architecture with separation of concerns
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

### 🔒 Authentication Flow (SaaS)

- Register/login with email/password or SSO (Google/GitHub) per company
- Email verification and OTP for extra security
- JWT-based session management (company scoped)

### 👑 Role-Based Access (SaaS)

- Admin: Full access to all features (per company)
- Regular: Limited to own profile and premium features
- Middleware-protected routes (company/tenant scoped)

### 💸 Premium Document Management (SaaS)

- Only premium users (with valid payment) can upload/manage documents (per company)
- Premium status is tracked and expires after 1 year
- Razorpay UPI-first payment flow (no mock gateway)
- Secure backend verification and expiry logic (company scoped)

### ⚡ Background Jobs (SaaS)

- Email/OTP sending via BullMQ queues
- Scheduled document cleanup
- Scalable, production-ready job processing (multi-tenant)

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

## 🛣️ API Endpoints (Sample, SaaS-Ready)

### Authentication & User Management

- `POST /api/users/signup` - Register new user (company scoped)
- `POST /api/users/login` - User authentication (company scoped)
- `GET /api/users/me` - Get current user profile (company scoped)
- `POST /api/users/logout` - Secure logout

### Payment & Premium Features

- `POST /api/payment/create-order` - Create Razorpay payment order (company scoped)
- `POST /api/payment/verify-payment` - Verify payment signature (company scoped)
- `GET /api/payment/premium-status` - Check user premium status (company scoped)

### Employee & Document Management (SaaS)

- `GET /api/employees` - List all employees (admin only, company scoped)
- `POST /api/employees` - Create new employee record (company scoped)
- `GET /api/documents` - List user documents (premium only, company scoped)
- `POST /api/documents/upload` - Upload document (premium only, company scoped)

### OAuth & Social Login

- `GET /api/users/auth/google` - Google OAuth login
- `GET /api/users/auth/github` - GitHub OAuth login

---

## 📖 Key API Endpoints (2025, SaaS Edition)

- **Company:** `/api/company` — company registration, onboarding, settings
- **Onboarding:** `/api/onboarding` — city selection, video, S3 upload (company scoped)
- **S3 Document:** `/api/s3document` — upload, download, admin review (company scoped)
- **Admin Review:** `/api/admin/review` — approve/reject docs (company scoped)
- **Audit Log:** `/api/audit` — view actions, login history (company scoped)
- **Payment:** `/api/payment` — Razorpay, UPI (company scoped)
- **Chat/Video:** `/api/chat`, `/api/video` — real-time features (company scoped)
- **All endpoints are company/tenant scoped for SaaS!**

---

## 📝 License

MIT License

---

⭐️ **Star this repo if you find it useful!** ⭐️

📧 For any questions or suggestions, please contact: your-email@example.com

---

