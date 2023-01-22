import { ensureTimeout } from "../utils/giveaway.js";
import { giveawayDB } from "../models/giveaway.js";
import { config } from "../settings/config.js";
import { client } from "../index.js";

client.on("ready", async () => {
  console.log(`\x1b[32m[+] \x1b[0mLightningBot is online`);

  let currentActivity = 0;

  setInterval(() => {
    client.user.setActivity(config.ACTIVITIES[currentActivity]);

    currentActivity = (currentActivity + 1) % config.ACTIVITIES.length;
  }, 15000);

  const giveaways = await giveawayDB.find({});

  for (const giveaway of giveaways) {
    await ensureTimeout(client, giveaway);
  }
});
