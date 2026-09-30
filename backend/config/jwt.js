const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nepaladvocate_super_secret_jwt_key_2026';

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };

