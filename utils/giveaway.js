import { MessageEmbed } from "discord.js";
import { giveawayDB } from "../models/giveaway.js";

function generateDescription(
  endEpoch,
  hostID,
  entries,
  winners,
  ended = false
) {
  return (
    `End${ended ? "ed" : "s"}: <t:${endEpoch}:R> (<t:${endEpoch}>)` +
    `\nHosted by: <@${hostID}>` +
    `\nEntries: **${entries}**` +
    `\nWinners: **${winners}**`
  );
}

function mentionWinners(winners) {
  return winners.map((winner) => `<@${winner}>`).join(", ");
}

async function ensureTimeout(client, giveaway) {
  const currentEpoch = Math.floor(Date.now() / 1000);

  if (giveaway.EndEpoch < currentEpoch) {
    return;
  }

  const timeout = setTimeout(async () => {
    // Reload the giveaway from the database to ensure it hasn't changed
    giveaway = await giveawayDB.findOne({
      MessageID: giveaway.MessageID,
    });

    const channel = client.channels.cache.get(giveaway.ChannelID);
    const message = await channel.messages.fetch(giveaway.MessageID);

    const winners = [];

    while (winners.length < giveaway.WinnerAmount) {
      const winner =
        giveaway.Entries[Math.floor(Math.random() * giveaway.Entries.length)];

      if (!winners.includes(winner)) {
        winners.push(winner);
      }

      if (winners.length === giveaway.Entries.length) {
        break;
      }
    }

    giveaway.Winners = winners;

    const embed = new MessageEmbed()
      .setTitle(`**${giveaway.Prize}**`)
      .setDescription(
        generateDescription(
          giveaway.EndEpoch,
          giveaway.HostID,
          giveaway.Entries.length,
          giveaway.Winners.join(", "),
          true
        )
      )
      .setTimestamp(giveaway.EndEpoch * 1000)
      .setColor("#378cbc");

    await message.edit({ embeds: [embed], components: [] });

    await message.reply({
      content:
        `Congratulations ${mentionWinners(giveaway.Winners)}!` +
        ` You won the **${giveaway.Prize}**!`,
    });

    await giveaway.save();
  }, (giveaway.EndEpoch - currentEpoch) * 1000);

  clearTimeout(giveaway.EndTimeout);

  giveaway.EndTimeout = timeout;

  await giveaway.save();

  return timeout;
}

export { generateDescription, ensureTimeout };
