# Connecting Frontend and Backend Features

This document outlines the steps to connect your frontend and backend for each feature in your Employee Management System.

## 1. Google SSO Integration

### Setup Steps:
1. Create Google OAuth credentials as outlined in `GOOGLE_SSO_SETUP_GUIDE.md`
2. Update your `.env` file with the credentials
3. Verify the implementation in `backend/configuration/passport.js`
4. Test the flow:
   - Click "Sign in with Google" on the frontend login page
   - Complete the Google authentication flow
   - Verify successful redirect and authentication in your app

### Troubleshooting:
- Check browser console for frontend errors
- Check backend terminal for server errors
- Verify CORS settings in the backend
- Ensure cookies are being properly set with `httpOnly` and `sameSite` attributes

## 2. GitHub SSO Integration

### Setup Steps:
1. Create GitHub OAuth application as outlined in `GITHUB_SSO_SETUP_GUIDE.md`
2. Update your `.env` file with the credentials
3. Verify the implementation in `backend/configuration/passport.js`
4. Test the flow:
   - Click "Sign in with GitHub" on the frontend login page
   - Complete the GitHub authentication flow
   - Verify successful redirect and authentication in your app

### Troubleshooting:
- Same as Google SSO troubleshooting
- If email is private on GitHub, ensure the fallback email generation works correctly

## 3. Email OTP Verification

### Setup Steps:
1. Configure Ethereal Email credentials in your `.env` file
2. Update `backend/services.js/email.js` to use environment variables instead of hardcoded values
3. Test the OTP generation and sending:
   - Register a new account or use the "Forgot Password" flow
   - Check the Ethereal Email preview URL returned in the response
   - Verify that the email template looks correct and the OTP is included

### Troubleshooting:
- Check that OTP is being correctly stored in the database with proper expiration
- Verify that the OTP verification endpoint is working correctly
- Test rate limiting to ensure it prevents abuse but doesn't block legitimate requests

## 4. User Profile Management

### Setup Steps:
1. Connect the user profile page in the frontend to the backend API
2. Implement the profile update endpoints if not already done
3. Add form validation on both frontend and backend
4. Test updating user information and verify changes are saved

### Testing:
- Update profile information and refresh to verify persistence
- Test validation errors for invalid inputs
- Verify that sensitive operations require password verification

## 5. Next Steps

After connecting these core features, consider implementing:

1. **Employee Management**:
   - CRUD operations for employees
   - Role-based access control 
   - Department and position management

2. **Enhanced Security**:
   - Implement HTTPS
   - Add CSRF protection
   - Improve password policies

3. **UI/UX Improvements**:
   - Responsive design enhancements
   - Accessibility improvements
   - Loading states and error handling

4. **Additional Features**:
   - Time tracking
   - Leave management
   - Performance reviews
   - Team management
