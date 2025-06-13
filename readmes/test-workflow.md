# EMS Testing Workflow Guide

This guide will help you test all the features of your Employee Management System.

## Prerequisites

1. Make sure both your backend and frontend are running:
   ```
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. Ensure your `.env` file in the backend directory has all required values:
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GITHUB_CALLBACK_URL`
   - `EMAIL_HOST` (for Ethereal Email)
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `FRONTEND_URL` (should be http://localhost:5173)

## Testing Workflow

### 1. Regular Registration and Login

1. **User Registration**
   - Navigate to http://localhost:5173/signup
   - Fill in the registration form with:
     - Name: `Test User`
     - Email: `test@example.com`
     - Password: `password123`
     - Confirm Password: `password123`
   - Click "Sign Up"
   - You should be redirected to the login page

2. **User Login**
   - Navigate to http://localhost:5173/login
   - Login with:
     - Email: `test@example.com`
     - Password: `password123`
   - You should be redirected to the profile page

### 2. Google SSO

1. **Google Sign In**
   - Navigate to http://localhost:5173/login
   - Click on "Sign in with Google"
   - Complete the Google authentication flow
   - You should be redirected back to your app and logged in

2. **Google SSO Troubleshooting**
   - Check browser console for any errors
   - Check backend terminal for errors
   - Verify your Google OAuth credentials are correct
   - Make sure redirect URI matches exactly what's registered in Google Developer Console

### 3. GitHub SSO

1. **GitHub Sign In**
   - Navigate to http://localhost:5173/login
   - Click on "Sign in with GitHub"
   - Complete the GitHub authentication flow
   - You should be redirected back to your app and logged in

2. **GitHub SSO Troubleshooting**
   - Check browser console for any errors
   - Check backend terminal for errors
   - Verify your GitHub OAuth application settings
   - Make sure callback URL matches exactly what's registered in GitHub

### 4. Email OTP Verification

1. **Password Reset Flow**
   - Navigate to http://localhost:5173/login
   - Click "Forgot Password"
   - Enter your email address and submit
   - Check the backend console for the Ethereal Email preview URL
   - Open the URL to view the email and get the OTP
   - Enter the OTP in the verification form
   - Create a new password
   - Try logging in with the new password

### 5. Admin Functions

1. **Admin Login**
   - Navigate to http://localhost:5173/login
   - Login with:
     - Email: `admin@example.com`
     - Password: `admin123`
   - You should be redirected to the HR admin page

2. **Employee Management**
   - Create a new employee
   - View employee list
   - Edit an employee's details
   - Delete an employee

### 6. User Profile Management

1. **View Profile**
   - Login with your test user
   - Navigate to the profile page
   - Verify that your user information is displayed correctly

2. **Update Profile**
   - Try updating your profile information
   - Verify that changes are saved correctly

## Common Issues and Solutions

### SSO Issues:
- Mismatched redirect URLs: Make sure your callback URLs in the OAuth provider settings match exactly what's in your backend
- Missing scopes: Ensure you've requested the correct scopes (email, profile, etc.)
- CORS issues: Check that your backend allows requests from your frontend domain

### OTP Issues:
- Email not sending: Check your Ethereal Email credentials
- OTP not validating: Make sure the OTP isn't expired and is being correctly stored in the database

### Authentication Issues:
- Cookie issues: Check that cookies are being set with the correct attributes (httpOnly, sameSite)
- JWT issues: Verify your JWT secret is consistent and secure

## Next Steps After Testing

Once you've verified that all features are working correctly, consider:

1. Enhancing security with HTTPS
2. Adding CSRF protection
3. Implementing more comprehensive user profile management
4. Adding more employee management features like time tracking or leave management
