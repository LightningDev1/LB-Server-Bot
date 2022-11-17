import glob from "glob";
import { Client, Collection } from "discord.js";
import { promisify } from "util";
import mongoose from "mongoose";

import config from "./settings/config.js";

const globPromise = promisify(glob);

const client = new Client({ intents: 32767 });

client.commands = new Collection();
client.slashCommands = new Collection();

(async () => {
  // Connect to the MongoDB database
  try {
    mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("\x1b[32m[+] \x1b[0mDatabase Connected");
  } catch (err) {
    console.log("\x1b[31m[-] \x1b[0mDatabase Connection Error: " + err);
  }

  // Import all events and slash commands

  const cwd = process.cwd().replace(/\\/g, "/");

  const eventFiles = await globPromise(`${cwd}/events/*.js`);
  const slashCommandFiles = await globPromise(`${cwd}/commands/*.js`);

  eventFiles.map((filePath) => {
    filePath = filePath.replace(cwd, ".");
    import(filePath);
  });

  // Crate an array of the slash commands
  const arrayOfSlashCommands = [];
  slashCommandFiles.map((filePath) => {
    filePath = filePath.replace(cwd, ".");
    const command = import(filePath);

    if (!command?.name) return;

    client.slashCommands.set(command.name, command);
    arrayOfSlashCommands.push(command);

    if (command.userPermissions) command.defaultPermission = false;
  });

  client.on("ready", async () => {
    // Set the slash commands
    const guild = client.guilds.cache.get(config.GUILD_ID);
    await guild.commands.set(arrayOfSlashCommands);
  });

  await client.login(config.TOKEN);
})();

export default client;
