const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateAndCatch } = require('../utils/validateHandler');
const authMiddleware = require('../middleware/authMiddleware');
const Account = require('../models/Account');
const BuildReq = require('../models/BuildReq');
const { success, error } = require('../utils/response');
const { getBuildingData, getNecessaryBuildings, getDiscounts, getBuildingRssAmounts } = require('../utils/plannerUtils');
const log = require('../utils/logger');

const rssIndex = ['food','wood','steel','gas','building engin','blueprint','nanotube'];

router.post('/costEstimate', validateAndCatch([
  ...authMiddleware,
  body('curAcc').notEmpty().isObject(),
  body('targetBuilding').notEmpty().isObject()
], async (req, res) => {
  const { curAcc, targetBuilding } = req.body;
  let accName = curAcc.name;
  let user = curAcc.user;

  const account = await Account.findOne({ user, name: accName });
  if (!account) return error(res, 'Account not found', 404);

  const buildReqs = await BuildReq.findOne({});
  if (!buildReqs) return error(res, 'Build requirements not found', 404);
  let requirements = buildReqs.requirements;
  
  let requiredBuildings = getNecessaryBuildings(requirements, account.buildings, targetBuilding);
  requiredBuildings.push(targetBuilding);
  
  let rssData = await getBuildingData(requiredBuildings);
  if (!rssData) return error(res, 'RSS requirements not found', 404);

  let discountData = await getDiscounts(curAcc);
  if (!discountData) return error(res, 'RSS discounts not found', 404);

	const buildingCosts = {}
	for (const building of requiredBuildings) {
      log(building.name + " - " + building.level);
        buildingCosts[building.name] = {};
        const cost = getBuildingRssAmounts(building, rssData);
        const discountedCost = cost.map((val, i) => Math.max(0, val - (discountData[i] || 0))); // Handle missing discounts
        discountedCost.forEach((val, index) => discountedCost[index] = Math.ceil(val));
        rssIndex.forEach((resource, i) => {
            buildingCosts[building.name][resource] = discountedCost[i];
        });
    }
    // Prepare data for the table
    const tableData = [];
    const totals = {}; // Use an object to store totals

    // Add building rows
    Object.keys(buildingCosts).forEach(buildingName => {
        const building = requiredBuildings.find(b => b.name === buildingName);
        const buildingRow = { Building: `${building.name} - ${building.level}` };
        rssIndex.forEach(resource => {
            buildingRow[resource] = buildingCosts[buildingName][resource].toLocaleString();
            totals[resource] = (totals[resource] || 0) + buildingCosts[buildingName][resource]; // Accumulate totals
        });
        tableData.push(buildingRow);
    });

    // Add totals row at the beginning
    const totalsRow = { Building: 'Total' };
    rssIndex.forEach(resource => {
        totalsRow[resource] = totals[resource].toLocaleString();
    });
    tableData.unshift(totalsRow); // Use unshift to add to the beginning

    return success(res, { tableData }, 'Cost estimate retrieved successfully');
}));

module.exports = router;
