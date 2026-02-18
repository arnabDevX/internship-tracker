const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");

const protect = async (req, res, next) => {
  try {
    let token;

    // Header format: Bearer TOKEN
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach to request
    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = protect;