const { Client, Collection } = require("discord.js");
const mongoose = require("mongoose");

require("dotenv").config();

const client = new Client({
  intents: 32767,
});
module.exports = client;

client.commands = new Collection();
client.slashCommands = new Collection();
client.config = require("./settings/config.js");

mongoose
  .connect(client.config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("\x1b[32m[+] \x1b[0mDatabase Connected"))
  .catch((err) =>
    console.log("\x1b[31m[-] \x1b[0mDatabase Connection Error: " + err)
  );

require("./handler")(client);
client.login(client.config.TOKEN);
