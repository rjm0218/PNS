const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateAndCatch } = require('../utils/validateHandler');
const { validateJsonStructure, validateJsonEntries } = require('../validators/jsonValidator');
const authMiddleware = require('../middleware/authMiddleware');
const Account = require('../models/Account');
const { heroSchema } = require('../models/Misc');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

router.post('/updateHeroLevel', validateAndCatch([
  ...authMiddleware,
  body("user").notEmpty().trim().escape(),
  body("acToUpdate").notEmpty().trim().escape(),
  body("newHero").notEmpty().isJSON(),
  validateJsonStructure('newHero'),
  validateJsonEntries('newHero', heroSchema)
], async (req, res) => {
  const { user, acToUpdate } = req.body;
  const hero = req.body.parsedNewHero;
  const account = await Account.findOne({ user, name: acToUpdate });
  if (!account) return error(res, 'Account not found', 404);
  account.boosts = account.boosts || {};
  account.boosts.heroes = account.boosts.heroes || [];
  const index = account.boosts.heroes.findIndex(item => item.name === hero.name);
  if (index !== -1) account.boosts.heroes[index] = hero;
  else account.boosts.heroes.push(hero);
  account.markModified('boosts');
  await account.save();
  log(`Updated hero ${hero.name} in ${acToUpdate}`);
  return success(res, null, 'Hero updated successfully');
}));

router.post('/deleteHero', validateAndCatch([
  ...authMiddleware,
  body("user").notEmpty().trim().escape(),
  body("acToUpdate").notEmpty().trim().escape(),
  body("hero").notEmpty().trim().escape()
], async (req, res) => {
  const { user, acToUpdate, hero } = req.body;
  const result = await Account.updateOne(
    { user, name: acToUpdate },
    { $pull: { 'boosts.heroes': { name: hero } } }
  );
  if (result.modifiedCount === 0) return error(res, 'Hero not found or already deleted');
  log(`Deleted hero ${hero} from ${acToUpdate}`);
  return success(res, null, 'Hero deleted successfully');
}));

module.exports = router;