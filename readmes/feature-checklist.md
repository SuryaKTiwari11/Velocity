# EMS Feature Checklist

Use this checklist to track testing of all EMS features.

## Authentication Features

- [ ] User Registration
  - [ ] Create new user with name, email, password
  - [ ] Validate input fields (email format, password requirements)
  - [ ] Check for duplicate emails
  - [ ] Redirect to login page after successful registration

- [ ] User Login
  - [ ] Login with email and password
  - [ ] Show appropriate error messages for invalid credentials
  - [ ] Redirect to profile page after successful login
  - [ ] Admin login redirects to HR admin page

- [ ] Google SSO
  - [ ] Navigate to Google auth page when clicking "Sign in with Google"
  - [ ] Successfully authenticate with Google
  - [ ] Redirect back to the application with proper user data
  - [ ] Create new user account if first-time login
  - [ ] Link Google account to existing user with matching email

- [ ] GitHub SSO
  - [ ] Navigate to GitHub auth page when clicking "Sign in with GitHub"
  - [ ] Successfully authenticate with GitHub
  - [ ] Redirect back to the application with proper user data
  - [ ] Create new user account if first-time login
  - [ ] Link GitHub account to existing user with matching email

- [ ] Password Management
  - [ ] Request password reset with email
  - [ ] Receive OTP email
  - [ ] Verify OTP
  - [ ] Set new password
  - [ ] Login with new password

- [ ] Logout
  - [ ] Clear authentication token/cookie
  - [ ] Redirect to login page

## User Profile Management

- [ ] View Profile
  - [ ] Display user information (name, email, etc.)
  - [ ] Show employee data if available

- [ ] Update Profile
  - [ ] Change user information
  - [ ] Update password
  - [ ] Upload profile picture (if implemented)

## Employee Management (Admin)

- [ ] View Employees
  - [ ] List all employees
  - [ ] Search/filter employees (if implemented)

- [ ] Create Employees
  - [ ] Add new employee with all required fields
  - [ ] Validate input data

- [ ] Update Employees
  - [ ] Edit employee information
  - [ ] Save changes

- [ ] Delete Employees
  - [ ] Remove employee from system
  - [ ] Confirm deletion

## UI Elements

- [ ] Navigation
  - [ ] Proper routes working
  - [ ] Protected routes redirect unauthenticated users
  - [ ] Admin-only routes restricted

- [ ] Form Validation
  - [ ] Show error messages for invalid inputs
  - [ ] Prevent submission of invalid forms

- [ ] Responsive Design
  - [ ] UI works on desktop
  - [ ] UI works on mobile devices (if implemented)

- [ ] Error Handling
  - [ ] Show appropriate error messages
  - [ ] Recover gracefully from API errors

## Backend API

- [ ] Authentication Endpoints
  - [ ] POST /api/users/signup
  - [ ] POST /api/users/login
  - [ ] POST /api/users/logout
  - [ ] GET /api/users/me
  - [ ] GET /api/users/auth/google
  - [ ] GET /api/users/auth/github
  - [ ] GET /api/users/auth/success

- [ ] Password Management Endpoints
  - [ ] POST /api/users/forgot-password
  - [ ] POST /api/users/verify-reset-otp
  - [ ] POST /api/users/reset-password

- [ ] Employee Endpoints
  - [ ] GET /api/employees
  - [ ] GET /api/employees/:id
  - [ ] POST /api/employees
  - [ ] PUT /api/employees/:id
  - [ ] DELETE /api/employees/:id

## Notes

Use this section to document any issues, bugs, or enhancements discovered during testing:

1. 
2. 
3. 
