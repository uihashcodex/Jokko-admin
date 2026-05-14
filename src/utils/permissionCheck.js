export const PERMISSION_ROUTE_MAP = {
  Dashboard: "/dashboard",
  Assets: "/assets",
  Network: "/network",
  "User Details": "/viewdetails",
  Wallet: "/wallet",
  Transaction: "/transaction",
  "Trending Currency": "/trendingcurrency",
  "Push Notification": "/pushnotification",
  "Email Template": "/emailtemplate",
  "Email Management": "/emailcontent",
  "Email Campaign": "/emailcampaign",
  Support: "/support",
  "Support Categories" : "/support-categories",
  Profile: "/profile",
  "Role Management": "/rolemanagement",
  "Staff Management": "/staffmanagement",
  Env: "/env",
  Broadcast: "/broadcast",
  "Onramper Orders": "/onramper-history",
  "Oframper Orders": "/oframper-history",
  "CoinRabbit History": "/coin-rabbbit-history",


  "Fiat Assets": "/buy-sell-fiat-asset",
  "Buy/Sell Crypto": "/buy-sell-crypto",
  "Buy/Sell Network": "/buy-sell-networks",
  "Buy/Sell CoinRabbit": "/coinrabbit-crypto"
};

export const hasAccess = (userPermissions = [], module) => {
  if (userPermissions?.includes("ALL")) return true;
  return userPermissions?.includes(module);
};

export const getFirstAllowedRoute = (userPermissions = []) => {
  if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
    return null;
  }

  if (userPermissions.includes("ALL")) {
    return "/dashboard";
  }

  for (const permission of userPermissions) {
    if (PERMISSION_ROUTE_MAP[permission]) {
      return PERMISSION_ROUTE_MAP[permission];
    }
  }

  return null;
};
