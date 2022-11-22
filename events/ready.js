import { ensureTimeout } from "../utils/giveaway.js";
import { giveawayDB } from "../models/giveaway.js";
import { config } from "../settings/config.js";
import { client } from "../index.js";

client.on("ready", async () => {
  console.log(`\x1b[32m[+] \x1b[0mLightningBot is online`);

  client.user.setActivity({
    type: config.STATUS.TYPE,
    name: config.STATUS.TEXT,
  });

  const giveaways = await giveawayDB.find({});

  for (const giveaway of giveaways) {
    giveaway.EndTimeout = ensureTimeout(client, giveaway);

    await giveaway.save();
  }
});
