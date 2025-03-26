const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateAndCatch } = require('../utils/validateHandler');
const { success, error } = require('../utils/response');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');
const log = require('../utils/logger');

router.post('/register', validateAndCatch([
  body('username').trim().notEmpty().escape(),
  body('email').trim().isEmail().normalizeEmail().escape(),
  body('password').trim().notEmpty().escape()
], async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) return error(res, 'User already exists');
  const user = new User({ username, email, password });
  await user.save();
  return success(res, null, 'Registered successfully');
}));

router.post('/login', validateAndCatch([
  body('username').trim().notEmpty().escape(),
  body('password').trim().notEmpty().escape()
], async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return error(res, 'Invalid username');
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return error(res, 'Invalid password');
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.cookie('token', token, { httpOnly: true, sameSite: 'None', secure: true });
  return success(res, { name: user.username }, 'Login successful');
}));

router.post('/logout', validateAndCatch([
  require('../middleware/authMiddleware'),
  body('user').notEmpty().trim().escape()
], async (req, res) => {
  const { user } = req.body;
  const token = req.cookies.token;
  const revoked = new RevokedToken({ token });
  await revoked.save();
  log(`${user} successfully logged out`);
  return success(res, null, 'Logout successful');
}));

module.exports = router;