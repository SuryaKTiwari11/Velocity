export const authSuccess = (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
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
export const handleCallback = (req, res) => {
  try {
    const { user, token } = req.user || {};

    if (!user) {
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/login?error=failed`
      );
    }

    res.cookie("jwt", token);

    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/login/success?token=${encodeURIComponent(token)}`
    );
  } catch (error) {
    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/login?error=server`
    );
  }
};



