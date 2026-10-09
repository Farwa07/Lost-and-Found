const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Verifies the token and loads the user fresh from the database, so blocking,
// deleting or changing the role of a user takes effect immediately instead of
// waiting for the JWT to expire.
const resolveUser = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: { status: 401, message: "No token provided" } };
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return { error: { status: 401, message: "Invalid or expired token" } };
  }

  const user = await User.findById(decoded.id).select("role status");

  if (!user) {
    return { error: { status: 401, message: "Account no longer exists. Please login again." } };
  }

  if (user.status === "blocked") {
    return { error: { status: 403, message: "Your account has been blocked by admin" } };
  }

  return {
    user: {
      id: String(user._id),
      role: user.role,
    },
  };
};

const authMiddleware = async (req, res, next) => {
  try {
    const { user, error } = await resolveUser(req);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// For public routes that show extra data to the owner or an admin.
// Never rejects the request; req.user is only set for a valid, active user.
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const { user } = await resolveUser(req);
      if (user) req.user = user;
    }
  } catch (error) {
    // Ignore: treat as anonymous.
  }

  next();
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;
