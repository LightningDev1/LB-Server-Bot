import { config } from "../settings/config.js";

function isUserStaff(user) {
  // Check if the user has administator permissions
  if (user.permissions.has("ADMINISTRATOR")) {
    return true;
  }

  // Check if the user has the staff role
  if (user.roles.cache.get(config.STAFF_ROLE_ID)) {
    return true;
  }

  // Check if the user has the moderator role
  if (user.roles.cache.get(config.MOD_ROLE_ID)) {
    return true;
  }

  return false;
}

export { isUserStaff };
