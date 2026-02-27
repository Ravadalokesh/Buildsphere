const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function authorize(...allowedRoles) {
  return function checkRole(req, res, next) {
    const role = req.user?.role;
    if (!role) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role permission" });
    }
    return next();
  };
}

module.exports = { protect, authorize };
