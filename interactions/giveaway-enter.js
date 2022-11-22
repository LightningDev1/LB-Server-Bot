import { MessageEmbed } from "discord.js";
import { generateDescription } from "../utils/giveaway.js";
import { giveawayDB } from "../models/giveaway.js";

async function run(client, interaction) {
  const giveaway = await giveawayDB.findOne({
    MessageID: interaction.message.id,
  });

  if (!giveaway) {
    return interaction.followUp({
      content: "This giveaway has already ended!",
      ephemeral: true,
    });
  }
  
  const currentEpoch = Math.floor(Date.now() / 1000);

  if (giveaway.EndEpoch < currentEpoch) {
    return interaction.followUp({
      content: "This giveaway has already ended!",
      ephemeral: true,
    });
  }

  if (giveaway.Entries.includes(interaction.user.id)) {
    return interaction.followUp({
      content: "You have already entered this giveaway!",
      ephemeral: true,
    });
  }

  giveaway.Entries.push(interaction.user.id);

  await giveaway.save();

  interaction.followUp({
    content: `You have entered the giveaway for **${giveaway.Prize}**!`,
    ephemeral: true,
  });

  const message = await client.channels.cache
    .get(giveaway.ChannelID)
    .messages.fetch(giveaway.MessageID);

  const embed = new MessageEmbed()
    .setTitle(`**${giveaway.Prize}**`)
    .setDescription(
      generateDescription(
        giveaway.EndEpoch,
        giveaway.HostID,
        giveaway.Entries.length,
        giveaway.WinnerAmount
      )
    )
    .setTimestamp(giveaway.EndEpoch * 1000)
    .setColor("#378cbc");

  await message.edit({ embeds: [embed], components: message.components });
}

export const interaction = {
  customId: "giveaway-enter",
  run: run,
};
