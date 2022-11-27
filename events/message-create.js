import { MessageEmbed } from "discord.js";

import { parseUptimeAlert } from "../utils/uptime-alert.js";
import { config } from "../settings/config.js";
import { client } from "../index.js";

client.on("messageCreate", async (message) => {
  // Uptime alerts

  if (message.channel.id === config.UPTIME_ALERTS.SOURCE_CHANNEL_ID) {
    const uptimeAlert = parseUptimeAlert(message.content);

    const embed = new MessageEmbed()
      .setTitle("Uptime Alert")
      .setDescription("https://lightning-bot.com has changed status")
      .addField("New Status", uptimeAlert.status)
      .setColor("#0099ff");

    if (uptimeAlert.status === "DOWN") {
      embed.addField("Reason", uptimeAlert.reason);
    } else if (uptimeAlert.status === "UP") {
      embed.addField("Down for", uptimeAlert.duration);
    }

    await client.channels.cache
      .get(config.UPTIME_ALERTS.TARGET_CHANNEL_ID)
      .send({ embeds: [embed] });

    await message.delete();
  }
});
