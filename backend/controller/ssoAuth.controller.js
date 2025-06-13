/**
 * Controller for SSO (Single Sign-On) authentication methods
 */

// Common function to handle SSO success
export const authSuccess = (req, res) => {
  try {
    // If user is authenticated through SSO, they will have a user object attached
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    // Get token from the user object
    const token = user.token;

    // Set cookie for backup authentication method
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      user: user.user,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error during authentication process",
      error: error.message,
    });
  }
};

// Handle Google OAuth callback
export const googleAuthCallback = (req, res) => {
  try {
    console.log(
      "Google OAuth callback received, req.user:",
      req.user ? "exists" : "missing"
    );

    // Passport will attach the user to req.user
    const { user, token } = req.user || {};
    if (!user) {
      console.log("Google OAuth failed - No user object");
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/login?error=failed`
      );
    }

    console.log(`Google OAuth successful for user: ${user.email}`);

    // Set auth cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed to lax to support cross-site redirects
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Redirect to frontend success page with user info
    // Added token as URL parameter for compatibility with our frontend
    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/login/success?token=${encodeURIComponent(token)}`
    );
  } catch (error) {
    console.error("Google callback error:", error);
    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/login?error=server`
    );
  }
};

// Handle GitHub OAuth callback
export const githubAuthCallback = (req, res) => {
  try {
    // Passport will attach the user to req.user
    const { user, token } = req.user;

    if (!user) {
      console.log("GitHub OAuth failed - No user object");
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/login?error=failed`
      );
    }

    console.log(`GitHub OAuth successful for user: ${user.email}`);

    // Set auth cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed to lax to support cross-site redirects
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Redirect to frontend success page with user info
    // Added token as URL parameter for compatibility with our frontend
    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/login/success?token=${encodeURIComponent(token)}`
    );
  } catch (error) {
    console.error("GitHub callback error:", error);
    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/login?error=server`
    );
  }
};
