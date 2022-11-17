import glob from "glob";
import { promisify } from "util";
import config from "../settings/config.js";

const globPromise = promisify(glob);

export default async (client) => {
  const cwd = process.cwd().replace(/\\/g, "/");
  const eventFiles = await globPromise(`${cwd}/events/*.js`);
  eventFiles.map((value) => import(value.replace(cwd, "../")));

  const slashCommands = await globPromise(`${cwd}/commands/*.js`);
  const arrayOfSlashCommands = [];
  slashCommands.map((value) => {
    const file = import(value.replace(cwd, "../"));
    if (!file?.name) return;
    client.slashCommands.set(file.name, file);
    if (file.userPermissions) file.defaultPermission = false;
    arrayOfSlashCommands.push(file);
  });

  client.on("ready", async () => {
    const guild = client.guilds.cache.get(config.GUILD_ID);
    await guild.commands.set(arrayOfSlashCommands);
  });
};
