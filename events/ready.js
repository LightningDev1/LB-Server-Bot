import client from "../index.js";
import config from "../settings/config.js";

client.on("ready", () => {
  console.log(`\x1b[32m[+] \x1b[0mLightningBot is online`);
  client.user.setActivity({
    type: config.STATUS.TYPE,
    name: config.STATUS.TEXT,
  });
});
