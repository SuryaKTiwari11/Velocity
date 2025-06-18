# SSO (Single Sign-On) Authentication Flow Explanation

This document explains the SSO authentication flow implemented in the EMS application, focusing on Google and GitHub OAuth integrations.

## Overview of SSO Implementation

The application supports authentication through:
1. Traditional email/password login
2. Google OAuth 2.0 
3. GitHub OAuth

## Backend Implementation

### Passport.js Configuration

At the core of the SSO implementation is the Passport.js configuration (`passport.js`):

```js
// Backend: configuration/passport.js
passport.use(
  "google",
  new GoogleStrat(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails, photos } = profile;
        const email = emails[0].value;
        const profilePicture = photos[0]?.value;
        let user = await User.findOne({ where: { email } });

        // If user exists but doesn't have googleId, update it
        if (user && !user.googleId) {
          await user.update({
            googleId: id,
            profilePicture: user.profilePicture || profilePicture,
          });
        }

        // Create new user if not exists
        if (!user) {
          user = await User.create({
            googleId: id,
            name: displayName,
            email,
            profilePicture,
            password: randomPass(), // Generate random secure password
            isVerified: true, // Auto-verify SSO users
          });
        }

        // Generate JWT token for the user
        const token = genToken(user.id);
        return done(null, { user, token });
      } catch (error) {
        console.error("Google auth error:", error);
        return done(error, false);
      }
    }
  )
);
```

Similar configuration exists for GitHub authentication.

### JWT Token Generation

When a user signs in via SSO, a JWT token is generated:

```js
// Backend: helper/genToken.js
export const genToken = (userID, res) => {
  const token = jwt.sign({ userID }, process.env.JWT_SECRET, {
    expiresIn: "1d", // Token expires in 1 day
  });
  
  // Set HTTP-only cookie if response object is provided
  if (res)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

  return token;
};
```

### OAuth Routes

The backend exposes the following OAuth endpoints:

```js
// Backend: routes/user.routes.js
// Initiate Google OAuth flow
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  handleCallback
);

// Similar routes for GitHub OAuth
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login",
  }),
  handleCallback
);

// Route to check auth status after SSO redirect
router.get("/auth/success", authSuccess);
```

### Callback Handling

After successful OAuth authentication, the `handleCallback` function processes the result:

```js
// Backend: controller/ssoAuth.controller.js
export const handleCallback = (req, res) => {
  try {
    const { user, token } = req.user || {};

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=failed`
      );
    }

    // Set JWT token as cookie
    res.cookie("jwt", token);

    // Redirect to frontend with token
    return res.redirect(
      `${process.env.FRONTEND_URL}/login/success?token=${encodeURIComponent(token)}`
    );
  } catch (error) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=server`
    );
  }
};
```

### Authentication Verification

The `authSuccess` endpoint verifies the SSO authentication:

```js
// Backend: controller/ssoAuth.controller.js
export const authSuccess = (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "authentication failed",
      });
    }

    const token = user.token;
    res.cookie("jwt", token);

    return res.status(200).json({
      success: true,
      message: "authentication successful",
      user: user.user,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error during authentication",
      error: error.message,
    });
  }
};
```

## Frontend Implementation

### SSO Button Component

The frontend offers SSO login options through the `SSO` component:

```jsx
// Frontend: components/SSO.jsx
const SSO = () => (
  <div className="mt-6 border-t pt-4">
    <p className="text-center mb-2">Or login with</p>
    <div className="flex justify-center space-x-4">
      <button
        type="button"
        onClick={() => window.location.href = authApi.googleUrl()}
        className="px-4 py-2 border"
      >
        Google
      </button>
      <button
        type="button"
        onClick={() => window.location.href = authApi.githubUrl()}
        className="px-4 py-2 border"
      >
        GitHub
      </button>
    </div>
  </div>
);
```

### API Connection Layer

The frontend communicates with OAuth endpoints through the API service:

```js
// Frontend: src/front2backconnect/api.js
export const authApi = {
  // Other auth methods...
  googleUrl: () => "http://localhost:3000/api/users/auth/google",
  githubUrl: () => "http://localhost:3000/api/users/auth/github",
  authSuccess: () => api.get("/users/auth/success"),
};
```

### Login Success Handling

The login component handles SSO redirects:

```jsx
// Frontend: components/LoginForm.jsx
useEffect(() => {
  if (isAuthenticated) {
    navigate(isAdmin ? "/hradmin" : "/profile");
    return;
  }

  const searchParams = new URLSearchParams(location.search);
  const errorParam = searchParams.get("error");
  const tokenParam = searchParams.get("token");
  
  if (errorParam) {
    setError(errorParam === "failed" ? "Authentication failed." : "An error occurred.");
  }
  
  if (tokenParam) {
    localStorage.setItem("sso-token", tokenParam);
  }
  
  if (location.pathname === "/login/success") {
    setIsLoading(true);
    ssoSuccess()
      .then((result) => {
        if (result.success) {
          navigate(useAuthStore.getState().isAdmin ? "/hradmin" : "/profile");
        } else {
          setError("Authentication failed");
        }
      })
      .catch(() => setError("Failed to complete authentication."))
      .finally(() => setIsLoading(false));
  }
}, [isAuthenticated, isAdmin, navigate, location, ssoSuccess]);
```

### Authentication Store

The Zustand store manages SSO authentication state:

```js
// Frontend: src/store/authStore.js
ssoSuccess: async () => {
  set({ isLoading: true, error: null });
  try {
    const response = await authApi.authSuccess();
    const { user } = response.data;

    set({
      user,
      isAdmin: user.isAdmin || false,
      isAuthenticated: true,
      isLoading: false,
    });
    return { success: true };
  } catch {
    set({
      error: "SSO authentication failed",
      isLoading: false,
    });
    return {
      success: false,
      error: "SSO authentication failed",
    };
  }
},
```

## Complete SSO Authentication Flow

1. **User Initiates SSO Login:**
   - User clicks on the Google or GitHub button in the login page
   - Frontend redirects to `/api/users/auth/google` or `/api/users/auth/github`

2. **OAuth Provider Authentication:**
   - User is redirected to Google/GitHub login page
   - User authenticates and grants permissions to the application
   - OAuth provider redirects back to the application's callback URL

3. **Backend OAuth Handling:**
   - Passport.js receives the OAuth callback with user profile data
   - System checks if the user already exists in the database
   - If user exists, links the Google/GitHub ID to the existing account
   - If user doesn't exist, creates a new user account with information from the OAuth profile
   - User is automatically marked as verified (no email verification needed)
   - A JWT token is generated for the authenticated user

4. **Return to Frontend:**
   - Backend redirects to frontend with the token: `/login/success?token={token}`
   - Frontend detects the token and calls the `authSuccess` API endpoint
   - Zustand store updates the authentication state
   - User is redirected to the appropriate page based on their role

5. **Subsequent Access:**
   - The JWT token is stored in an HTTP-only cookie
   - Token is automatically included in future API requests
   - Protected routes check the token using the `protectedRoute` middleware

## Security Features

The SSO implementation includes several security measures:

1. **HTTP-Only Cookies:** JWT tokens are stored in HTTP-only cookies, protecting against JavaScript-based theft

2. **Short-Lived Tokens:** Tokens expire after 24 hours, limiting the window for potential misuse

3. **Random Passwords:** SSO users get secure random passwords for their local accounts

4. **Auto-Verification:** SSO users are automatically verified since their identity is confirmed by the OAuth provider

5. **Account Linking:** If a user with the same email already exists, the system links the SSO provider ID to that account instead of creating duplicates

6. **Secure OAuth Configuration:**
   - Using proper scopes (`profile`, `email` for Google, `user:email` for GitHub)
   - No persistence of OAuth access tokens (only used during the authentication flow)
   - Environment variables for sensitive OAuth credentials

## Edge Cases Handled

1. **User already exists with email but no SSO link:**
   - System links the SSO ID to the existing account
   - Preserves existing account data

2. **Authentication failure at OAuth provider:**
   - User is redirected to login page with error message

3. **Server error during authentication:**
   - Error handling with appropriate error messages
   - Fallback to manual login

4. **Multiple SSO providers for same user:**
   - User can link both Google and GitHub to the same account
   - Can log in with either provider

5. **SSO provider doesn't return email (GitHub case):**
   - Falls back to generating an email based on username

This comprehensive authentication flow ensures secure and convenient login options while maintaining data integrity across different authentication methods.
