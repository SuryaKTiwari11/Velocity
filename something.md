<div align="center">

  # ⚡ VELOCITY — Employee Management System (EMS) SaaS Platform
    <img src="./PREVIEW.jpeg" alt="VELOCITY Preview"  style="border-radius: 16px; box-shadow: 0 4px 24px #0002; margin-bottom: 1rem;" />

  **The most advanced open-source Employee Management System for startups, enterprises, and HR tech builders.**
  
  *Multi-tenant SaaS, real-time collaboration, premium payments, advanced security, and more.*


  <div align="center" color="white" style="margin: 20px 0;">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" width="40" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" width="40" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" alt="Express" width="40" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="40" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" alt="Redis" width="40" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/aws/aws-original.svg" alt="AWS S3" width="40" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" alt="TailwindCSS" width="40" />
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" alt="Docker" width="40" />

  </div>
  
</div>

---

## 🚀 **Why VELOCITY?**

VELOCITY is a **next-generation, open-source Employee Management System** (EMS) built for startups, enterprises, and HR tech builders. It is a true **multi-tenant SaaS platform**, designed to solve every major HR, payroll, and collaboration challenge with modern technology and real-time features.

> **A comprehensive multi-tenant SaaS platform for enterprise HR management, featuring real-time collaboration, payment processing, and advanced security.**

Built with modern technologies to solve complex HR challenges through automation, real-time features, and scalable architecture.

---

## 🎯 **Problem Statement & Solution**

**Challenge**: Traditional HR systems lack real-time collaboration, secure document management, and scalable multi-tenant architecture for growing organizations.

**Solution**: Developed a comprehensive SaaS platform that combines:
- Multi-tenant architecture for enterprise scalability
- Real-time features for instant collaboration
- Secure document management with automated workflows
- Integrated payment processing for premium features
- Location-based employee networking

---

## 🚀 **Key Features & Technical Achievements**

### **🏢 SaaS-Ready Multi-Tenant Architecture**
- **Problem Solved**: Built scalable system supporting multiple companies with isolated data
- **Technical Implementation**: 
  - Company-scoped database queries with tenant isolation
  - Shared infrastructure with per-company data segregation
  - Built-in onboarding flow for new organizations
  - Premium plan upgrades to accommodate more users
- **Impact**: Enables horizontal scaling and reduces infrastructure costs per tenant

### **🛡️ Super Admin Console**
- **Centralized Management**: Platform-wide oversight for all tenants
- **Key Features**:
  - Monitor and onboard new companies
  - Configure global policies and settings
  - View platform-wide analytics and metrics
  - Enforce compliance across all tenants
- **Business Value**: Streamlines SaaS operations and reduces manual management overhead

### **🎓 Modern Onboarding Experience**
- **City Selection**: Location-based setup for regional compliance
- **Training Video Integration**: Interactive onboarding with educational content
- **S3 KYC Upload**: Secure document upload for know-your-customer verification
- **Admin Review Workflow**: Multi-step approval process for new users
- **Technical Stack**: React components + AWS S3 + automated email notifications

### **🔐 Invite-Only Signup System**
- **Enhanced Privacy**: Token-based invitation workflow
- **Security Benefits**: Only authorized users can join companies
- **Technical Implementation**:
  - Secure invitation tokens with expiry
  - Email-based invitation delivery
  - Role-based invitation permissions
- **Impact**: Prevents unauthorized access and maintains data integrity

### **⚡ Real-Time Attendance Tracking**
- **Live Attendance Marking**: WebSocket-based instant status updates
- **Real-Time Dashboard**: Monitor attendance across teams and locations
- **Key Features**:
  - Instant updates for admins and employees
  - Integration with audit logs for compliance
  - Automated notifications for late/missing check-ins
  - Location-based attendance verification
- **Technical Stack**: Socket.IO + Redis for real-time synchronization

### **☁️ S3 Document Management System**
- **Secure File Operations**: Upload, download, admin review, and cleanup
- **LocalStack Compatibility**: Development environment support
- **Advanced Features**:
  - Automated document cleanup jobs
  - Version control and audit trails
  - Admin approval workflow
  - Real-time upload progress tracking
- **Technical Implementation**: AWS S3 SDK + multer + background job processing

### **📊 Admin Dashboard & Analytics**
- **Document Management**: Approve/reject/download documents
- **Real-Time Analytics**: Live metrics and reporting
- **Audit Logs**: Complete action tracking and compliance
- **Key Metrics**:
  - User activity monitoring
  - Document processing statistics
  - Attendance patterns analysis
  - System health monitoring

### **💳 Premium Payment Processing**
- **Razorpay Integration**: UPI-first payment flow (no mock gateway)
- **Premium Logic**: 1-year expiry with automated renewal
- **Security Features**:
  - Payment signature verification
  - Secure backend payment processing
  - Multi-role access control
  - Automated expiry handling
- **Business Model**: Freemium SaaS with premium document features

### **🎥 Video Calling System**
- **LiveKit Integration**: Modern video meetings for premium users
- **Features**:
  - **Lobby System**: Create or join meetings with single click
  - **Meeting Room**: See all participants, mute/unmute, camera toggle
  - **Screen Sharing**: Professional presentation capabilities
  - **Premium Protection**: Access control for paying users
- **UI/UX**: Clean, responsive design with TailwindCSS
- **Security**: Secure token generation via backend

### **💬 Real-Time Chat & Communication**
- **Stream Chat Integration**: Professional chat experience
- **Advanced Features**:
  - Video & audio calls with invitation cards
  - Dark theme UI consistency
  - Real-time messaging with typing indicators
  - Online status tracking
  - File sharing in conversations
  - Modern React components with error boundaries

### **🗺️ Location & Mapping Features**
- **Connect with Nearby Colleagues**: Redis GEO-based proximity search
- **How it Works**:
  - Browser geolocation API integration
  - Redis GEO commands for efficient location queries
  - Company-scoped colleague discovery
  - Real-time location updates
- **Privacy & Security**: Validated locations with company-scoped search
- **Use Cases**: Networking, collaboration, office space optimization

### **⚡ Real-Time Document Uploads & Auto-Refresh**
- **Socket.IO Integration**: Real-time upload progress tracking
- **Auto-Refresh**: UI updates document list after processing
- **User Experience**: 
  - Progress indicators during upload
  - Instant feedback on completion
  - Error handling with retry mechanisms
- **Technical Implementation**: WebSocket events + React state management

### **🤖 Background Jobs & Automation**
- **BullMQ + Redis**: Robust job queue system
- **Automated Tasks**:
  - Email/OTP queuing and delivery
  - Document cleanup and maintenance
  - Bulk email notifications
  - Cron-based recurring tasks
- **Reliability**: Job retries, failure handling, and monitoring

### **🔒 Advanced Security Features**
- **Multi-Layer Security**:
  - JWT-based authentication with refresh tokens
  - Password hashing with bcrypt
  - Rate limiting for brute force protection
  - Email verification for new accounts
  - CORS protection and security headers
- **Role-Based Access**: Company/tenant scoped permissions
- **Compliance**: Audit logs and session management

### **🚀 Modern Development Practices**
- **Scalable Architecture**: Multi-tenant with separation of concerns
- **Code Quality**:
  - Modular, maintainable codebase
  - Error logging and monitoring
  - API versioning and RESTful design
  - Environment-based configuration
- **Responsive Design**: Mobile-first approach with modern UI/UX

---

## 🛠️ **Tech Stack**

<table>
<tr>
<td valign="top" width="50%">

### **Frontend**
- **React 19.x** - Component-based UI architecture
- **TailwindCSS 4.x** - Utility-first styling framework
- **Zustand** - Lightweight state management
- **React Router Dom 7.x** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Vite** - Fast build tool and dev server
- **Lucide Icons** - Modern icon library
- **Socket.IO Client** - Real-time communication

</td>
<td valign="top" width="50%">

### **Backend**
- **Node.js + Express.js** - RESTful API server
- **PostgreSQL** - Relational database
- **Sequelize ORM** - Database modeling and migrations
- **Redis** - Caching, sessions, and job queues
- **Socket.IO** - Real-time WebSocket communication
- **BullMQ** - Background job processing
- **Nodemailer** - Email service integration

</td>
</tr>
<tr>
<td valign="top" width="50%">

### **Authentication & Security**
- **Passport.js** - Authentication strategies
- **JWT** - Stateless token authentication
- **bcrypt** - Password hashing
- **Express Rate Limit** - API throttling
- **CORS** - Cross-origin security
- **Helmet** - Security headers

</td>
<td valign="top" width="50%">

### **Third-Party Integrations**
- **Razorpay** - Payment processing (UPI-first)
- **Stream Chat** - Real-time messaging platform
- **LiveKit** - Video conferencing solution
- **AWS S3** - Document storage and management
- **Google OAuth** - Social authentication
- **GitHub OAuth** - Developer authentication

</td>
</tr>
<tr>
<td valign="top" width="50%">

### **DevOps & Tools**
- **Docker** - Containerization
- **LocalStack** - AWS service mocking
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **PM2** - Process management
- **Winston** - Logging framework

</td>
<td valign="top" width="50%">

### **Database & Caching**
- **PostgreSQL 14+** - Primary database
- **Redis 6+** - Caching and real-time features
- **Sequelize Migrations** - Database versioning
- **Connection Pooling** - Performance optimization
- **Database Indexing** - Query optimization

</td>
</tr>
</table>

---

## 📊 **System Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │   Database      │
│   (React SPA)   │◄──►│   (Express.js)   │◄──►│  (PostgreSQL)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────▼────┐  ┌──────▼─────┐  ┌────▼─────┐
        │   Redis    │  │   S3       │  │  Queue   │
        │ (Cache+GEO)│  │ (Storage)  │  │ (BullMQ) │
        └────────────┘  └────────────┘  └──────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
            ┌───────▼──┐  ┌────▼────┐  ┌──▼──────┐
            │ Socket.IO│  │LiveKit  │  │ Stream  │
            │(Real-time)│  │(Video)  │  │ (Chat)  │
            └──────────┘  └─────────┘  └─────────┘
```

---

## ⚡ **Quick Start**

### **Prerequisites**
```bash
Node.js 18+ | PostgreSQL 14+ | Redis 6+ | AWS Account (Optional)
```

### **Installation**
```bash
# Clone repository
git clone https://github.com/SuryaKTiwari11/velocity-ems.git
cd velocity-ems

# Install dependencies for all packages
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Database setup and migrations
cd backend
npm run db:create
npm run db:sync
npm run db:seed  # Optional: Add sample data

# Start development servers (from root directory)
npm run dev
```

### **Environment Configuration**
```env
# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/velocity_ems
DB_HOST=localhost
DB_PORT=5432
DB_NAME=velocity_ems
DB_USER=your_db_user
DB_PASS=your_db_password

# Authentication & Security
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
BCRYPT_ROUNDS=12

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-secret

# Payment Processing
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_SECRET=your-razorpay-secret

# Cloud Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=velocity-ems-documents

# Real-Time Services
REDIS_URL=redis://localhost:6379
SOCKET_IO_PORT=3001

# Third-Party Integrations
STREAM_API_KEY=your-stream-chat-api-key
STREAM_API_SECRET=your-stream-chat-secret
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_SECRET=your-livekit-secret
LIVEKIT_URL=wss://your-livekit-server.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Settings
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```


### **Docker Deployment**
```dockerfile
# Multi-stage build for optimized images
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```
## 📄 **API Documentation**

### **Authentication Endpoints**
```
POST /api/users/signup          # User registration via invitation
POST /api/users/login           # User authentication
POST /api/users/logout          # Secure logout
GET  /api/users/me             # Get current user profile
POST /api/users/forgot-password # Password reset request
POST /api/users/reset-password  # Password reset confirmation
```

### **Company Management**
```
POST /api/company/register      # Company registration
GET  /api/company/profile      # Company profile
PUT  /api/company/settings     # Update company settings
POST /api/company/invite       # Send user invitation
```

### **Employee Operations**
```
GET    /api/employees          # List company employees
POST   /api/employees          # Create employee record
GET    /api/employees/:id      # Get employee details
PUT    /api/employees/:id      # Update employee
DELETE /api/employees/:id      # Remove employee
GET    /api/employees/nearby   # Find nearby colleagues
```

### **Attendance Management**
```
POST /api/attendance/mark      # Mark attendance
GET  /api/attendance/today     # Today's attendance status
GET  /api/attendance/summary   # Attendance analytics
GET  /api/attendance/history   # Attendance history
```

### **Document Management**
```
GET    /api/documents          # List user documents
POST   /api/documents/upload   # Upload document
GET    /api/documents/:id      # Download document
DELETE /api/documents/:id      # Delete document
POST   /api/documents/review   # Admin review action
```

### **Payment & Premium**
```
POST /api/payment/create-order # Create payment order
POST /api/payment/verify       # Verify payment
GET  /api/payment/status       # Check premium status
GET  /api/payment/history      # Payment history
```

### **Real-Time Features**
```
WebSocket Events:
- attendance-updated           # Live attendance changes
- upload-progress             # Document upload progress
- document-approved           # Admin document actions
- chat-message                # Real-time messaging
- user-online                 # User presence updates
```

### **Super Admin Operations**
```
GET  /api/superadmin/tenants   # List all companies
POST /api/superadmin/onboard   # Onboard new company
GET  /api/superadmin/analytics # Platform analytics
PUT  /api/superadmin/settings  # Global settings
```

Complete interactive API documentation is available at `/api/docs` when running the development server.

---

## 📊 **Project Statistics**

<div align="center">

| Metric | Value |
|--------|--------|
| **Lines of Code** | 15,000+ |
| **API Endpoints** | 40+ |
| **Database Tables** | 12 |
| **Real-Time Features** | 8 |
| **Third-Party Integrations** | 6 |
| **Authentication Methods** | 3 |
| **Payment Gateways** | 1 |
| **File Upload Types** | Multiple |
| **Supported Languages** | English (Extensible) |
| **Browser Support** | Modern browsers |

</div>

---

## 📞 **Contact & Support**

<div align="center">

**Developer**: Surya Kant Tiwari  
**Email**: [stiwari2_be23@thapar.edu](mailto:stiwari2_be23@thapar.edu)  
**LinkedIn**: [Connect with me](https://linkedin.com/in/yourprofile)  
**Portfolio**: [View my work](https://yourportfolio.com)  
**GitHub**: [Follow for updates](https://github.com/Sur)



## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.
