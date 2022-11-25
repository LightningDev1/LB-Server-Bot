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

async function endGiveaway(client, messageId) {
  const giveaway = await giveawayDB.findOne({
    MessageID: messageId,
  });

  if (!giveaway) return;

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
        mentionWinners(winners),
        true
      )
    )
    .setTimestamp(giveaway.EndEpoch * 1000)
    .setColor("#378cbc");

  await message.edit({ embeds: [embed] });

  await message.reply({
    content:
      `Congratulations ${mentionWinners(giveaway.Winners)}!` +
      ` You won the **${giveaway.Prize}**!`,
  });

  await giveaway.save();
}

async function ensureTimeout(client, giveaway) {
  const currentEpoch = Math.floor(Date.now() / 1000);

  if (giveaway.EndEpoch < currentEpoch) {
    return;
  }

  const timeout = setTimeout(async () => {
    await endGiveaway(client, giveaway.MessageID);
  }, (giveaway.EndEpoch - currentEpoch) * 1000);

  clearTimeout(giveaway.EndTimeout);

  giveaway.EndTimeout = timeout;

  await giveaway.save();

  return timeout;
}

async function rerollGiveaway(client, interaction, messageId) {
  const giveaway = await giveawayDB.findOne({
    MessageID: messageId,
  });

  if (!giveaway) {
    return await interaction.reply({
      content: "That giveaway does not exist.",
      ephemeral: true,
    });
  }

  if (giveaway.Winners.length === 0) {
    return await interaction.reply({
      content: "That giveaway has not ended yet.",
      ephemeral: true,
    });
  }

  const winners = [];

  // Max 1 winner for reroll
  while (winners.length < 1) {
    const winner =
      giveaway.Entries[Math.floor(Math.random() * giveaway.Entries.length)];

    if (!winners.includes(winner)) {
      winners.push(winner);
    }

    if (winners.length === 1) {
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
        mentionWinners(winners),
        true
      )
    )
    .setTimestamp(giveaway.EndEpoch * 1000)
    .setColor("#378cbc");

  const channel = client.channels.cache.get(giveaway.ChannelID);
  const message = await channel.messages.fetch(giveaway.MessageID);
  
  await message.edit({ embeds: [embed] });

  await message.reply({
    content:
      `Congratulations ${mentionWinners(giveaway.Winners)}!` +
      ` You are the new winner of **${giveaway.Prize}**!`,
  });

  await giveaway.save();
}

export { generateDescription, mentionWinners, endGiveaway, rerollGiveaway, ensureTimeout };
