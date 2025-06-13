# EMS System Architecture

This document provides an overview of the Employee Management System (EMS) architecture.

## System Overview

The EMS is a full-stack web application with:

- **Backend**: Node.js + Express API server
- **Frontend**: React with Vite
- **Database**: PostgreSQL (via Sequelize ORM)
- **Authentication**: JWT-based authentication with SSO options

## Backend Components

### API Server (`backend/index.js`)
- Express server with middleware for JSON parsing, CORS, cookie handling
- Uses passport for authentication
- API routes for user, employee, and OTP management

### Controllers
- **Authentication** (`auth.controller.js`): Handles user signup, login, logout, and current user data
- **SSO Authentication** (`ssoAuth.controller.js`): Handles Google and GitHub OAuth callbacks
- **Password Management** (`password.controller.js`): Handles forgotten password flows and OTP verification
- **Employee Management** (`employee.controller.js`): Handles CRUD operations for employees

### Models
- **User**: User account data including authentication credentials
- **Employee**: Employee information linked to user accounts
- **OTP**: One-time passwords for verification and password reset

### Configuration
- **Database** (`database.js`): Sequelize configuration for database connection
- **Passport** (`passport.js`): Configuration for local, Google, and GitHub authentication strategies

### Helpers and Middleware
- **Token Generation** (`genToken.js`): JWT token creation
- **OTP Service** (`otpService.js`): OTP generation and verification
- **Auth Middleware** (`auth.middleware.js`): Protection for authenticated routes
- **Rate Limiting** (`rateLimiter.middleware.js`): Prevention of brute force attacks

## Frontend Components

### State Management
- **Auth Store** (`authStore.js`): Zustand store for authentication state
- Persists authentication between sessions with localStorage

### API Connection
- **API Client** (`api.js`): Axios-based API client with interceptors for error handling

### Components
- **Authentication**: Login, Signup, Password Reset forms
- **Employee Management**: Forms for creating, editing, viewing employees
- **Profile**: User profile display and management
- **Navigation**: App navigation with protected route handling

### Key Pages
- **Login Page**: Email/password login + SSO options
- **Signup Page**: User registration
- **Profile Page**: User information display
- **HR Admin Page**: Employee management dashboard (admin only)

## Authentication Flow

### Standard Authentication
1. User enters email/password on login form
2. Backend validates credentials and issues JWT
3. JWT is stored in an HTTP-only cookie
4. Frontend stores user information in zustand store

### Google/GitHub SSO
1. User clicks on SSO button (Google/GitHub)
2. User is redirected to OAuth provider
3. After authentication, provider redirects back to backend callback URL
4. Backend creates/updates user and issues JWT
5. User is redirected to frontend with authentication cookie
6. Frontend verifies authentication with backend and loads user data

### Password Reset
1. User requests password reset with email
2. Backend generates OTP and sends email
3. User enters OTP for verification
4. If valid, user can set a new password

## Security Measures

- **JWT**: Short-lived JSON Web Tokens for authentication
- **HTTP-only Cookies**: Prevents client-side access to auth token
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Prevents malformed data and injection attacks

## Deployment Considerations

- Set proper environment variables for database, JWT secret, OAuth credentials
- Use HTTPS in production
- Configure CORS correctly for production domains
- Set appropriate cookie security attributes (secure, sameSite)

## Future Enhancements

- HTTPS implementation
- CSRF protection
- Enhanced user profile management
- Role-based access control refinement
- Improved UI/UX design
- Additional features like time tracking, leave management, etc.
