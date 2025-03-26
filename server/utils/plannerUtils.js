const Building = require('../models/Building');
const Discount = require('../models/Discount');

async function getBuildingData(buildings) {
  let allNames = buildings.map(build => build.name);
  const names = allNames.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
  
  const neededBuildings = [];
  for (const name of names) {
    const building = await Building.findOne({ name });
    if (!building) return error(res, `RSS requirements not found for ${name}`, 404);
      neededBuildings.push({ name, buildLevels: building.buildlevels });
  }

  return neededBuildings;
}

const getNecessaryBuildings = (requirements, buildings, targetBuilding) => {
  let totalBuildings = [];
  let targetreq = requirements.find(req => req.name === targetBuilding.name);
  if (targetreq) {
    let reqlevels = targetreq.levels;
    let reqLevel = reqlevels.find(level => parseInt(level.level) === parseInt(targetBuilding.level));
    if (reqLevel) {
      let buildingsNeeded = reqLevel.requirements;
      for (let j = 0; j < buildingsNeeded.length; j++) {
        let currentBuild = buildings.find(build => build.name === buildingsNeeded[j].name);
        if (currentBuild) {
          if (parseInt(buildingsNeeded[j].level) > parseInt(currentBuild.level)) {
            for (let i = buildingsNeeded[j].level; i > currentBuild.level; i--) {
              let tempBuild = { name: currentBuild.name, level: i };
              let foundBuild = totalBuildings.find(obj => obj.name === tempBuild.name && obj.level === tempBuild.level);
              if (!foundBuild) {
                totalBuildings.push(tempBuild);
                console.log(`Adding ${tempBuild.name} - ${tempBuild.level}`);
                let subReq = getNecessaryBuildings(requirements, buildings, tempBuild);
                for (let k = 0; k < subReq.length; k++) {
                  let foundSubBuild = totalBuildings.find(obj => obj.name === subReq[k].name && obj.level === subReq[k].level);
                  if (!foundSubBuild) totalBuildings.push(subReq[k]);
                }
               }
            }
          }
        }
      }
    }
  }
  return totalBuildings;
};

const getBuildingRssAmounts = (building, rssData) => {
  const rssBuild = rssData.find(b => b.name === building.name);
  const rssLevel = rssBuild.buildLevels.find(level => parseInt(level.level) === parseInt(building.level));
  const data = [...rssLevel.rss, ...rssLevel.special?.reverse() || []];
  return data;
};

const getTotalCost = (requiredBuildings, rssData) => {
  const totalCost = [];
  const rssIndex = ['food','wood','steel','gas','building engin','blueprint','nanotube'];
  rssIndex.forEach((_, i) => totalCost[i] = 0);

  for (let i = 0; i < requiredBuildings.length; i++) {
    const rssAmounts = getBuildingRssAmounts(requiredBuildings[i], rssData);
    for (let j = 0; j < rssAmounts.length; j++) {
      totalCost[j] += parseInt(rssAmounts[j]);
    }
  }
  return totalCost;
};

const getDiscounts = async (currentAccount) => {
    let accHeroes = currentAccount.boosts.heroes;
    let accGear = currentAccount.boosts.buildergear;

    const discountData = await Discount.findOne({});
    if (!discountData) return null;

    let rssHeroDiscounts = Array(10).fill(0);
    for (let heroIdx = 0; heroIdx < accHeroes.length; heroIdx++) {
      let disc = discountData.heroes.find(heroEntry => heroEntry.name === accHeroes[heroIdx].name);
      if (disc && disc.type === "build") {
        for (let i = 0; i < disc.rss.length; i++) {
          let rssIdx = rssIndex.indexOf(disc.rss[i]);
          if (rssIdx !== -1) {
            if (parseInt(accHeroes[heroIdx].level) >= parseInt(disc.level[i])) {
              let discountValues = disc.data[parseInt(accHeroes[heroIdx].plus)];
              if (discountValues) {
                rssHeroDiscounts[rssIdx] += discountValues[i];
              }
            }
          }
        }
      }
    }
    
    let rssBuilderGearDiscounts = Array(10).fill(0);
    for (let gearIdx = 0; gearIdx < accGear.length; gearIdx++) {
      let lev = discountData.buildGear.find(gearEntry => parseInt(gearEntry.level) === parseInt(accGear[gearIdx].level));
      if (lev) {
        let gearPiece = lev.data.find(gearEntry => gearEntry.name === accGear[gearIdx].name);
        if (gearPiece) {
          for (let i = 0; i < gearPiece.discounts.length; i++) {
            if (!isNaN(gearPiece.discounts[i])) {
              rssBuilderGearDiscounts[i] += parseInt(gearPiece.discounts[i]);
            } else if (gearPiece.discounts[i].includes('/')) {
              let dataPieces = gearPiece.discounts[i].split('/');
              rssBuilderGearDiscounts[i] += parseInt(dataPieces[0]);
              rssBuilderGearDiscounts[i+6] += parseInt(dataPieces[1])/100;
            }
          }
        }
      }
    }

    return rssHeroDiscounts.map((val, index) => val + rssBuilderGearDiscounts[index]);
  }

module.exports = {
  getBuildingData,
  getNecessaryBuildings,
  getBuildingRssAmounts,
  getTotalCost,
  getDiscounts
};
