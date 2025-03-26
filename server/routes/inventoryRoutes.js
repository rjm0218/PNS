const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateAndCatch } = require('../utils/validateHandler');
const { validateJsonStructure, validateJsonEntries } = require('../validators/jsonValidator');
const { success, error } = require('../utils/response');
const Account = require('../models/Account');
const itemSchema = require('../models/InventoryItem').itemSchema;
const authMiddleware = require('../middleware/authMiddleware');
const log = require('../utils/logger');

router.post('/inventory', validateAndCatch([
  ...authMiddleware,
  body('user').notEmpty().trim().escape(),
  body('accName').notEmpty().trim().escape()
], async (req, res) => {
  const { user, accName } = req.body;
  const account = await Account.findOne({ user, name: accName }, 'inventory');
  if (!account) return error(res, 'Account not found', 404);
  return success(res, { inventory: account.inventory });
}));

router.post('/addToInventory', validateAndCatch([
  ...authMiddleware,
  body('user').notEmpty().trim().escape(),
  body('accName').notEmpty().trim().escape(),
  body('newItem').notEmpty().isJSON(),
  validateJsonStructure('newItem'),
  validateJsonEntries('newItem', itemSchema)
], async (req, res) => {
  const { user, accName } = req.body;
  const newItem = req.body.parsedNewItem;
  const result = await Account.updateOne({ user, name: accName }, { $push: { inventory: newItem } });
  if (result.modifiedCount === 0) return error(res, 'Nothing was modified', 400);
  log(`Added item ${newItem.name} to ${accName}`);
  return success(res, null, 'Item added successfully');
}));

router.post('/removeFromInventory', validateAndCatch([
  ...authMiddleware,
  body('user').notEmpty().trim().escape(),
  body('accName').notEmpty().trim().escape(),
  body('itrm').notEmpty().isJSON(),
  validateJsonStructure('itrm'),
  validateJsonEntries('itrm', itemSchema)
], async (req, res) => {
  const { user, accName } = req.body;
  const itemToRemove = req.body.parsedItrm;
  const result = await Account.updateOne({ user, name: accName }, { $pull: { inventory: itemToRemove } });
  if (result.modifiedCount === 0) return error(res, 'Nothing was modified', 400);
  log(`Removed item ${itemToRemove.name} from ${accName}`);
  return success(res, null, 'Item removed successfully');
}));

router.post('/updateInventory', validateAndCatch([
  ...authMiddleware,
  body('user').notEmpty().trim().escape(),
  body('accName').notEmpty().trim().escape(),
  body('item').notEmpty().isJSON(),
  body('name').trim().notEmpty().escape(),
  validateJsonStructure('item')
], async (req, res) => {
  const { user, accName, name } = req.body;
  const item = req.body.parsedItem;
  const result = await Account.updateOne(
    { user, name: accName, 'inventory.name': name },
    { $set: { 'inventory.$.name': item.name, 'inventory.$.quantity': item.quantity } }
  );
  if (result.modifiedCount === 0) return error(res, 'Nothing was modified', 400);
  log(`Updated inventory item ${name} in ${accName}`);
  return success(res, null, 'Inventory item updated successfully');
}));

module.exports = router;