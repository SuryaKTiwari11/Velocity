// Middleware to block userId and companyId in req.body for all routes
export function blockUserCompanyIdInBody(req, res, next) {
  if (req.body && ("userId" in req.body || "companyId" in req.body)) {
    return res.status(400).json({
      error:
        "You cannot set userId or companyId via request body. These are set by authentication context.",
    });
  }
  next();
}
