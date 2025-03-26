import apiRoutes from '../../utils/apiRoutes';
import {api} from '../../axios_config.js';
const rssIndex = ['food','wood','steel','gas','blueprint','nanotube', 'building engin'];

function getNecessaryBuildings(requirements, buildings, targetBuilding) {
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
							let tempBuild = {'name': currentBuild.name, 'level': i};
							let foundBuild = totalBuildings.find(obj => obj.name === tempBuild.name && obj.level === tempBuild.level);
							if (!foundBuild) {
								totalBuildings.push(tempBuild);
								let subReq = getNecessaryBuildings(requirements, buildings, tempBuild);
								for (let k = 0; k < subReq.length; k++) {
									let foundBuild = totalBuildings.find(obj => obj.name === subReq[k].name && obj.level === subReq[k].level);
									if (!foundBuild) {
										totalBuildings.push(subReq[k]);
									}
								}
							}
							
						}
					}				
				}
			}
		}
	}
	return totalBuildings;
}

function getBuildingRssAmounts(building, rssData) {
	
	let rssBuild = rssData.find(build => build.name === building.name);
	let rssLevel = rssBuild.buildLevels.find(level => parseInt(level.level) === parseInt(building.level));
	let rssSpecial = rssLevel.special;
	let data = rssLevel.rss.concat(rssSpecial.reverse());
	console.log("Need the following rss for " + building.name + '-' + building.level + ":" + data);
	return data;
}

async function getBuildingData(buildings) {
	let allNames = buildings.map(build => build.name);
	const names = allNames.filter((value, index, self) => {
		return self.indexOf(value) === index;
	});
	

	try {
		const response = await api.post(apiRoutes.utils.rssReqs, { names});
		if (response !== null) {
			let data = response.data;
			if (data !== null) {
				let buildingData = data.neededBuildings;
				localStorage.setItem('rssData',JSON.stringify(buildingData));
				return buildingData;
			}
		}
	} catch (error) {
		console.error('Login failed:', error.response ? error.response.data : 'No response');
	}

}

async function getDiscounts(heroes, gear) {
	
	async function getDiscountData() {
	
		let discounts = localStorage.getItem('discounts');
		if (!discounts) {
			try {
				const response = await api.post(apiRoutes.utils.rssDiscounts);
				if (response !== null) {
					let data = response.data;
					if (data !== null) {
						discounts = data.discounts;
						localStorage.setItem('discounts',JSON.stringify(discounts));
						return discounts;
					}
				}
			} catch (error) {
				console.error('Login failed:', error.response ? error.response.data : 'No response');
			}

		} else {
			return JSON.parse(discounts);
		}
	};
	
	let discountData = await getDiscountData();
	let rssHeroDiscounts = Array(10).fill(0);
	for (let heroIdx = 0; heroIdx < heroes.length; heroIdx++) {
		let disc = discountData.heroes.find(heroEntry => heroEntry.name === heroes[heroIdx].name);
		if (disc && disc.type === "build") {
			for (let i = 0; i < disc.rss.length; i++) {
				let rssIdx = rssIndex.indexOf(disc.rss[i]);
				if (rssIdx !== -1) {
					if (parseInt(heroes[heroIdx].level) >= parseInt(disc.level[i])) {
						let discountValues = disc.data[parseInt(heroes[heroIdx].plus)];
						if (discountValues) {
							rssHeroDiscounts[rssIdx] += discountValues[i];
						}
					}
				}
			}
		}
	}
	
	let rssBuilderGearDiscounts = Array(10).fill(0);
	for (let gearIdx = 0; gearIdx < gear.length; gearIdx++) {
		let lev = discountData.buildGear.find(gearEntry => parseInt(gearEntry.level) === parseInt(gear[gearIdx].level));
		if (lev) {
			let gearPiece = lev.data.find(gearEntry => gearEntry.name === gear[gearIdx].name);
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
	
};


export async function getTotalCost(requirements, buildings, targetBuilding, currentAccount) {
	
	let currentBuild = buildings.find(build => build.name === targetBuilding.name);
	
	if (parseInt(currentBuild.level) >= parseInt(targetBuilding.level)) {
		return null;
	}
	let totalBuildings = getNecessaryBuildings(requirements, buildings, targetBuilding);
	totalBuildings.push(targetBuilding);
	let rssData = await getBuildingData(totalBuildings);
	if (!rssData) return null;

	let heroes = currentAccount.boosts.heroes;
	let gear = currentAccount.boosts.buildergear;
	let discounts = await getDiscounts(heroes, gear);
	const buildingCosts = {}
	for (const building of totalBuildings) {
        buildingCosts[building.name] = {};
        const cost = getBuildingRssAmounts(building, rssData);
        const discountedCost = cost.map((val, i) => Math.max(0, val - (discounts[i] || 0))); // Handle missing discounts
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
        const building = totalBuildings.find(b => b.name === buildingName);
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

	return { buildings: totalBuildings, totals, tableData };
}
