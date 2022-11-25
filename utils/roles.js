async function getRole(guild, roleId) {
  let role = guild.roles.cache.get(roleId);
  if (!role) {
    role = await guild.roles.fetch(roleId);
  }
  return role;
}

export { getRole };
