import { hasAccess } from "./permissionCheck";

const MODULE_MAP = {
  "/dashboard": "Dashboard",
  "/assets": "Assets",
  "/network": "Network",
  "/viewdetails": "User Details",
  "/wallet": "Wallet",
  "/transaction": "Transaction",
  "/trendingcurrency": "Trending Currency",
  "/defaultcurrency": "Default Currency",
  "/pushnotification": "Push Notification",
  "/emailtemplate": "Email Template",
  "/emailcontent": "Email Management",
  "/emailcampaign": "Email Campaign",
  "/support": "Support",

  "/support-categories": "Support Categories",
  "/profile": "Profile",
  "/rolemanagement": "Role Management",
  "/staffmanagement": "Staff Management",
  "/env": "Env",
  "/broadcast": "Broadcast",
  "/onramper-history": "Onramper Orders",
  "/oframper-history": "Oframper Orders",
  "/coin-rabbbit-history": "CoinRabbit History",
  "/buy-sell-fiat-asset": "Fiat Assets",
  "/buy-sell-crypto": "Buy/Sell Crypto",
  "/buy-sell-networks": "Buy/Sell Network",
  "/coinrabbit-crypto": "Buy/Sell CoinRabbit"
};

export const filterSidebar = (menuItems = [], userPermissions = []) => {
  return menuItems
    ?.map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) =>
          hasAccess(userPermissions, MODULE_MAP[child.key])
        );

        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }

        return null;
      }

      if (hasAccess(userPermissions, MODULE_MAP[item.key])) {
        return item;
      }

      return null;
    })
    .filter(Boolean);
};
