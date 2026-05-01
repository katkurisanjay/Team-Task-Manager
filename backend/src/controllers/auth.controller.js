const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { sendResponse } = require('../utils/response');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');

const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return sendResponse(res, 400, false, null, "Looks like an account with that email already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(validatedData.password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password_hash,
        role: validatedData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true
      }
    });

    const token = generateToken(newUser.id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return sendResponse(res, 201, true, newUser, "Welcome aboard!");
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return sendResponse(res, 401, false, null, "That email/password combo doesn’t look right.");
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.password_hash);
    if (!isMatch) {
      return sendResponse(res, 401, false, null, "That email/password combo doesn’t look right.");
    }

    const token = generateToken(user.id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const { password_hash, ...userWithoutPassword } = user;
    return sendResponse(res, 200, true, userWithoutPassword, "Welcome back!");
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const { password_hash, ...userWithoutPassword } = req.user;
    return sendResponse(res, 200, true, userWithoutPassword, "User fetched successfully");
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    return sendResponse(res, 200, true, null, "Logged out successfully. See you later!");
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, me, logout };
