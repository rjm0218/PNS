const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateAndCatch } = require('../utils/validateHandler');
const { validateJsonStructure, validateJsonEntries } = require('../validators/jsonValidator');
const authMiddleware = require('../middleware/authMiddleware');
const Account = require('../models/Account');
const { boostSchema } = require('../models/Misc');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

router.post('/updateBoosts', validateAndCatch([
  ...authMiddleware,
  body("user").notEmpty().trim().escape(),
  body("acToUpdate").notEmpty().trim().escape(),
  body("newBoost").notEmpty().isJSON(),
  validateJsonStructure('newBoost'),
  validateJsonEntries('newBoost', boostSchema)
], async (req, res) => {
  const { user, acToUpdate } = req.body;
  const boost = req.body.parsedNewBoost;
  const account = await Account.findOne({ user, name: acToUpdate });
  if (!account) return error(res, 'Account not found', 404);
  account.boosts = account.boosts || {};
  account.boosts.speeds = account.boosts.speeds || [];
  const index = account.boosts.speeds.findIndex(item => item.name === boost.name);
  if (index !== -1) account.boosts.speeds[index] = boost;
  else account.boosts.speeds.push(boost);
  account.markModified('boosts');
  await account.save();
  log(`Updated boost ${boost.name} in ${acToUpdate}`);
  return success(res, null, 'Boost updated successfully');
}));

module.exports = router;