const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateAndCatch } = require('../utils/validateHandler');
const { validateJsonStructure, validateJsonEntries } = require('../validators/jsonValidator');
const authMiddleware = require('../middleware/authMiddleware');
const Account = require('../models/Account');
const { gearSchema } = require('../models/Misc');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

router.post('/updateGearLevel', validateAndCatch([
  ...authMiddleware,
  body("user").notEmpty().trim().escape(),
  body("acToUpdate").notEmpty().trim().escape(),
  body("newGear").notEmpty().isJSON(),
  body("type").notEmpty().isIn(['build', 'research']),
  validateJsonStructure('newGear'),
  validateJsonEntries('newGear', gearSchema)
], async (req, res) => {
  const { user, acToUpdate, type } = req.body;
  const gear = req.body.parsedNewGear;
  const account = await Account.findOne({ user, name: acToUpdate });
  if (!account) return error(res, 'Account not found', 404);
  const gearType = type === 'build' ? 'buildergear' : 'researchgear';
  account.boosts = account.boosts || {};
  account.boosts[gearType] = account.boosts[gearType] || [];
  const index = account.boosts[gearType].findIndex(item => item.name === gear.name);
  if (index !== -1) account.boosts[gearType][index].level = gear.level;
  else account.boosts[gearType].push(gear);
  account.markModified('boosts');
  await account.save();
  log(`Updated ${gear.name} in ${acToUpdate}`);
  return success(res, null, 'Gear updated successfully');
}));

router.post('/deleteGear', validateAndCatch([
  ...authMiddleware,
  body("user").notEmpty().trim().escape(),
  body("acToUpdate").notEmpty().trim().escape(),
  body("newGear").notEmpty().isJSON(),
  body("type").notEmpty().isIn(['build', 'research']),
  validateJsonStructure('newGear'),
  validateJsonEntries('newGear', gearSchema)
], async (req, res) => {
  const { user, acToUpdate, type } = req.body;
  const gear = req.body.parsedNewGear;
  const result = await Account.updateOne(
    { user, name: acToUpdate },
    { $pull: { [`boosts.${type}gear`]: { name: gear.name } } }
  );
  if (result.modifiedCount === 0) return error(res, 'Gear not found or already deleted');
  log(`Deleted ${gear.name} from ${acToUpdate}`);
  return success(res, null, 'Gear deleted successfully');
}));

module.exports = router;