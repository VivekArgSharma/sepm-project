const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const dataStore = require('../config/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_jwt_secret_dev_key_min32chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const register = async ({ name, email, password, role = 'STUDENT', bio = '' }) => {
  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  const validRoles = ['STUDENT', 'INSTRUCTOR'];
  const assignedRole = validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'STUDENT';

  const users = dataStore.getTable('users');
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  // Instructors can be set to ACTIVE or PENDING for admin approval as per PRD
  // For smooth demonstration, instructors start ACTIVE with a note
  const status = 'ACTIVE';

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = dataStore.insert('users', {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password_hash: passwordHash,
    role: assignedRole,
    status,
    bio: bio || '',
  });

  const token = generateToken(newUser);

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      bio: newUser.bio,
    },
    token,
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const users = dataStore.getTable('users');
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    throw new AppError('Invalid email or password credentials', 401);
  }

  if (user.status === 'DEACTIVATED') {
    throw new AppError('Your account has been deactivated. Please contact an administrator.', 403);
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Invalid email or password credentials', 401);
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      bio: user.bio,
    },
    token,
  };
};

const getCurrentUser = async (userId) => {
  const users = dataStore.getTable('users');
  const user = users.find((u) => Number(u.id) === Number(userId));
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    bio: user.bio,
  };
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
