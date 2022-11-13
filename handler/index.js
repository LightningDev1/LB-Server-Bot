const { glob } = require("glob");
const { promisify } = require("util");
const globPromise = promisify(glob);

module.exports = async (client) => {
  const eventFiles = await globPromise(`${process.cwd()}/events/*.js`);
  eventFiles.map((value) => require(value));

  const slashCommands = await globPromise(`${process.cwd()}/commands/*.js`);
  const arrayOfSlashCommands = [];
  slashCommands.map((value) => {
    const file = require(value);
    if (!file?.name) return;
    client.slashCommands.set(file.name, file);
    if(file.userPermissions) file.defaultPermission = false;
    arrayOfSlashCommands.push(file);
  });

  client.on('ready', async () => {
    const guild = client.guilds.cache.get(client.config.GUILD_ID);
    await guild.commands.set(arrayOfSlashCommands)
  })
};
