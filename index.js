import { Client, Collection } from "discord.js";
import mongoose from "mongoose";
import config from "./settings/config.js";
import handler from "./handler/index.js";

const client = new Client({ intents: 32767 });

client.commands = new Collection();
client.slashCommands = new Collection();

mongoose
  .connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("\x1b[32m[+] \x1b[0mDatabase Connected"))
  .catch((err) =>
    console.log("\x1b[31m[-] \x1b[0mDatabase Connection Error: " + err)
  );

handler(client);

client.login(config.TOKEN);

export default client;
