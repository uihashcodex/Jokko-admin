import { hasAccess } from "./permissionCheck";

// key → module mapping
const MODULE_MAP = {
    "/dashboard": "Dashboard",
    "/assets": "Assets",
    // "/buy-sell-fiat-asset": "Assets",
    "/network": "Network",
    "/viewdetails": "User Details",
    "/wallet": "Wallet",
    "/transaction": "Transaction",
    "webhook": "Webhook",
    "/trendingcurrency": "Trending Currency",
    "/defaultcurrency": "Default Currency",
    "/pushnotification": "Push Notification",
    "/emailtemplate": "Email Template",
    "/emailtemplatemanagementnew": "Email Management",
    "/support": "Support",
    "/rolemanagement":"Role Management",
    "/profile": "Profile"
};

export const filterSidebar = (menuItems, userPermissions) => {
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
