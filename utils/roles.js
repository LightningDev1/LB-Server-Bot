async function getRole(guild, roleId) {
  const role = guild.roles.cache.get(roleId);

  if (role) {
    return role;
  }

  return await guild.roles.fetch(roleId);
}

export { getRole };
