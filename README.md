# 🚀 Employee Management System (EMS) — 2025 (Now with SaaS!)

> **Next-Gen HR, Payroll, Collaboration & SaaS Platform**

Welcome to the most advanced open-source Employee Management System! EMS is now a true multi-tenant SaaS platform, designed for startups, enterprises, and HR tech builders.

- **SaaS-Ready:** Multi-company, multi-tenant architecture. Each company has its own users, data, and settings. Built-in onboarding for new organizations. can be upgraded to account more people via premium plans.
- **Super Admin Console:** Centralized management for all tenants, with the ability to monitor, onboard, and configure companies, enforce global policies, and view platform-wide analytics.
- **Modern Onboarding:** City selection, training video, S3 KYC upload, admin review.
- **Invite-Only Signup:** Enhanced privacy and security with invitation-based user registration, ensuring only authorized users can join a company.
- **Real-Time Attendance Tracking:** Live attendance marking and monitoring, with instant updates for admins and employees, and integration with audit logs.
- **S3 Document Management:** Upload, download, admin review, and cleanup (LocalStack compatible).
- **Admin Dashboard:** Approve/reject/download docs, real-time analytics, and audit logs.
- **Premium Payments:** Razorpay UPI-first flow, multi-role access, and expiry logic.
- **Real-Time Chat & Video:** Stream + LiveKit for chat, video, and file sharing.
- **Automated SQL Migrations & S3 Health:** Robust data tracking and S3 setup scripts.
- **UI/UX:** Responsive, beautiful, with Lucide icons, dark mode, and instant toast notifications.
- **Audit & Security:** Full audit log, login history, JWT, rate limiting, and more.
- **Production-Ready:** Modular, scalable, and easy to extend for any organization.

---

## ✨ Features

### 🤝 Connect with Colleagues Nearby

- **Meet Nearby Colleagues:** Instantly find and connect with coworkers close to you for collaboration or networking.
- **How it Works:** Uses browser geolocation and Redis GEO to show nearby employees from your company only.
- **Using Redis GEO:** Efficiently stores and queries user locations for real-time updates.
- **Privacy & Security:** Company-scoped search, validated location, and secure real-time updates.

### 👥 User & Company Management

- Secure registration and login system (per company)
- Company registration, onboarding, and management
- Invite-only signup for improved privacy and access control
- Multiple authentication methods: Email/Password, Google, GitHub SSO
- Two-factor authentication with OTP verification
- Password reset functionality
- User profile management (company-scoped)

### 👨‍💼 Employee Management

- Add, edit, delete, and view employee records (per company)
- Search and filter employee data
- Upload and manage documents (Premium users only, with real-time progress and auto-refresh)

### 🕒 Real-Time Attendance Tracking

- Live attendance marking with instant status updates
- Real-time dashboard for admins to monitor attendance across teams and locations
- Integration with audit logs for compliance and reporting
- Automated notifications for late or missing check-ins

### 👩‍💼 Administrative Features

- Role-based access control (Admin, Premium, Regular users)
- Super Admin role for platform-wide management and oversight
- Admin dashboard for data overview (per company)
- Advanced employee management tools

### 💸 Premium & Payment Features

- Razorpay integration for UPI-first premium upgrades (no mock gateway)
- Premium status with 1-year expiry (auto-expiry)
- Only premium users can upload/manage documents (with real-time upload progress and instant document list refresh)
- Payment verification and secure backend logic (per company)

### 🎥 Video Calling

- Modern video meetings for premium users, powered by [LiveKit](https://livekit.io/)
- Lobby: Create or join meetings with a single click
- Meeting Room: See all participants, mute/unmute, toggle camera, and share screen
- Premium-protected: Only premium users can access video calls
- Clean, student-friendly UI using TailwindCSS
- Secure token generation via backend for LiveKit

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

- Real-time document upload progress using **Socket.IO**
- UI auto-refreshes document list after upload and processing

### ⚡ Background Jobs & Automation

- Email/OTP queueing with BullMQ and Redis
- Automated document cleanup and scheduled maintenance jobs
- Bulk email notifications for critical actions
- Cron-based scheduling for recurring tasks

### 🔒 Security Features

- Invite-only signup for enhanced privacy and access control
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting to prevent brute force attacks
- Email verification for new accounts
- CORS protection and security headers
- Role-based middleware protection (company/tenant scoped)

### 🚀 Modern Development Practices

- Scalable, multi-tenant architecture with separation of concerns
- Super Admin layer for SaaS management
- Error logging and monitoring
- API versioning and RESTful design
- Environment-based configuration
- Responsive design with mobile-first approach

---

## 🛠️ Technologies Used

### 🖥️ Frontend

- React 19.x
- React Router Dom 7.x
- TailwindCSS 4.x
- Zustand
- Axios
- Vite

### ⚙️ Backend

- Express.js
- PostgreSQL
- Sequelize
- Passport.js
- Nodemailer
- JWT
- bcrypt
- BullMQ + Redis
- Razorpay
- Express Rate Limit

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

- `POST /api/users/invite` - Generate and send invitation for user signup (admin/super admin only)
- `POST /api/users/signup` - Register new user via invitation (company scoped)
- `POST /api/users/login` - User authentication (company scoped)
- `GET /api/users/me` - Get current user profile (company scoped)
- `POST /api/users/logout` - Secure logout

### Attendance Management

- `POST /api/attendance/mark` - Mark attendance (real-time, company scoped)
- `GET /api/attendance/today` - Get today's attendance status (company scoped)
- `GET /api/attendance/summary` - Attendance summary and analytics (admin/company scoped)

### Payment & Premium Features

- `POST /api/payment/create-order` - Create Razorpay payment order (company scoped)
- `POST /api/payment/verify-payment` - Verify payment signature (company scoped)
- `GET /api/payment/premium-status` - Check user premium status (company scoped)

### Employee & Document Management

- `GET /api/employees` - List all employees (admin only, company scoped)
- `POST /api/employees` - Create new employee record (company scoped)
- `GET /api/documents` - List user documents (premium only, company scoped)
- `POST /api/documents/upload` - Upload document (premium only, company scoped)

### OAuth & Social Login

- `GET /api/users/auth/google` - Google OAuth login
- `GET /api/users/auth/github` - GitHub OAuth login

### Super Admin & SaaS Management

- `GET /api/superadmin/tenants` - List all companies/tenants
- `POST /api/superadmin/onboard` - Onboard new company/tenant
- `GET /api/superadmin/analytics` - Platform-wide analytics and monitoring

### Other Key Endpoints

- **Company:** `/api/company` — company registration, onboarding, settings
- **Onboarding:** `/api/onboarding` — city selection, video, S3 upload (company scoped)
- **S3 Document:** `/api/s3document` — upload, download, admin review (company scoped)
- **Admin Review:** `/api/admin/review` — approve/reject docs (company scoped)
- **Audit Log:** `/api/audit` — view actions, login history (company scoped)
- **Payment:** `/api/payment` — Razorpay, UPI (company scoped)
- **Chat/Video:** `/api/chat`, `/api/video` — real-time features (company scoped)
- **Attendance:** `/api/attendance` — real-time attendance management (company scoped)
- **All endpoints are company/tenant scoped for SaaS!**

---

## 📝 License

MIT License

---

⭐️ **Star this repo if you find it useful!** ⭐️

📧 For any questions or suggestions, please contact: stiwari2_be23@thapar.edu

---
