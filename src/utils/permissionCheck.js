// utils/permissionCheck.js

// export const hasAccess = (userPermissions, module) => {
//     if (userPermissions?.includes("ALL")) return true;

//     return userPermissions?.includes(module);
// };


// utils/permissionCheck.js

export const PERMISSION_ROUTE_MAP = {
  Dashboard: "/dashboard",
  Assets: "/assets",
  Network: "/network",
  "User Details": "/viewdetails",
  Wallet: "/wallet",
  Transaction: "/transaction",
  Webhook: "/webhook",
  "Trending Currency": "/trendingcurrency",
  "Default Currency": "/defaultcurrency",
  "Push Notification": "/pushnotification",
  "Email Template": "/emailtemplate",
  "Email Management": "/emailcontent",
  Support: "/support",
  Profile: "/profile",
};

export const hasAccess = (userPermissions = [], module) => {
  if (userPermissions?.includes("ALL")) return true;
  return userPermissions?.includes(module);
};

export const getFirstAllowedRoute = (userPermissions = []) => {
  if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
    return null;
  }

  console.log("DSFSD", userPermissions)

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