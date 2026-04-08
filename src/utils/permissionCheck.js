// utils/permissionCheck.js

export const hasAccess = (userPermissions, module) => {
    if (userPermissions?.includes("ALL")) return true;

    return userPermissions?.includes(module);
};