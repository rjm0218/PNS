// Centralized API route mapping

const apiRoutes = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register'
  },
  accounts: {
    get: '/accounts/getAccounts',
    add: '/accounts/addAccount',
    remove: '/accounts/removeAccount',
    updateSanctuary: '/accounts/updateSanctuary'
  },
  inventory: {
    get: '/inventory',
    add: '/inventory/addToInventory',
    remove: '/inventory/removeFromInventory',
    update: '/inventory/updateInventory'
  },
  gear: {
    update: '/gear/updateGearLevel',
    delete: '/gear/deleteGear'
  },
  hero: {
    update: '/hero/updateHeroLevel',
    delete: '/hero/deleteHero'
  },
  boost: {
    update: '/boost/updateBoosts'
  },
  utils: {
    feedback: '/utils/feedback',
    buildReqs: '/utils/getBuildRequirements',
    rssReqs: '/utils/getRSSRequirements',
    rssDiscounts: '/utils/getRSSDiscounts'
  },
  planner: {
    costEstimate: '/planner/costEstimate'
  }
};

export default apiRoutes;
