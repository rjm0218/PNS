// routes/accountRoutes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateAndCatch } = require('../utils/validateHandler');
const authMiddleware = require('../middleware/authMiddleware');
const Account = require('../models/Account');
const Building = require('../models/Building');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

// Add Account
router.post('/addAccount', validateAndCatch([
  ...authMiddleware,
  body('user').notEmpty().trim().escape(),
  body('accName').notEmpty().trim().escape()
], async (req, res) => {
  const { user, accName } = req.body;
  const buildings = (await Building.find().select('name')).map(b => ({ name: b.name, level: 0 }));
  const account = new Account({ user, name: accName, buildings });
  await account.save();
  return success(res, { account }, 'Account added successfully');
}));

// Remove Account
router.post('/removeAccount', validateAndCatch([
  ...authMiddleware,
  body('user').notEmpty().trim().escape(),
  body('accName').notEmpty().trim().escape()
], async (req, res) => {
  const { user, accName } = req.body;
  const deleted = await Account.findOneAndDelete({ user, name: accName });
  if (!deleted) return error(res, 'Account not found', 404);
  return success(res, null, `Successfully deleted: ${accName}`);
}));

// Get Accounts
router.post('/getAccounts', validateAndCatch([
  ...authMiddleware,
  body('user').notEmpty().trim().escape()
], async (req, res) => {
  const { user } = req.body;
  const accs = await Account.find({ user });
  if (!accs || accs.length === 0) return error(res, 'No accounts found for user', 404);
  return success(res, { accs });
}));

// Update Sanctuary
router.post('/updateSanctuary', validateAndCatch([
  ...authMiddleware,
  body("user").trim().notEmpty().escape(),
  body("accName").trim().notEmpty().escape(),
  body("building").notEmpty().isObject()
], async (req, res) => {
  const { user, accName, building } = req.body;
  if (!building || !building.name || !building.level) {
    return error(res, 'Invalid building data: name and level are required.', 400);
  }

  const result = await Account.updateOne(
    { user, name: accName, 'buildings.name': building.name },
    { $set: { 'buildings.$.level': building.level } }
  );

  if (result.modifiedCount === 0) {
    log(`No update required for ${building.name} in ${user}'s account ${accName}`);
    return success(res, null, 'No changes were made');
  }

  log(`Updated ${building.name} in ${user}'s account ${accName} to level ${building.level}`);
  return success(res, null, 'Building updated successfully');
}));

// Get Sanctuary (building list for account)
router.post('/sanctuary', validateAndCatch([
  ...authMiddleware,
  body("user").trim().notEmpty().escape(),
  body("accName").trim().notEmpty().escape()
], async (req, res) => {
  const { user, accName } = req.body;
  const account = await Account.findOne({ user, name: accName }, 'buildings');
  if (!account) return error(res, 'Account not found', 404);
  return success(res, { buildings: account.buildings });
}));

module.exports = router;
