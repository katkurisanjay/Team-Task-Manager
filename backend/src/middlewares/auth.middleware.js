const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');
const { sendResponse } = require('../utils/response');

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return sendResponse(res, 401, false, null, "You need to log in to access this.");
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return sendResponse(res, 401, false, null, "User not found. Please log in again.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAuth };
