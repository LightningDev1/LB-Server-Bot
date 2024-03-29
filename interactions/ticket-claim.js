import { MessageEmbed } from "discord.js";
import { ticketDB } from "../models/ticket.js";
import { isUserStaff } from "../utils/staff.js";

async function run(client, interaction) {
  if (!isUserStaff(interaction.member)) {
    return await interaction.followUp({
      content: "You must be an administrator to use this button",
      ephemeral: true,
    });
  }

  const ticket = await ticketDB
    .findOne({ ChannelID: interaction.channel.id })
    .exec();

  if (!ticket) {
    return await interaction.followUp({
      content:
        "No data was found related to this ticket, please remove it manually",
      ephemeral: true,
    });
  }

  if (ticket.Claimed) {
    return await interaction.followUp({
      content: "This ticket is already claimed",
      ephemeral: true,
    });
  }

  // Update the database entry
  await ticketDB.updateOne(
    { ChannelID: interaction.channel.id },
    { Claimed: true }
  );

  const embed = new MessageEmbed()
    .setDescription(`This ticket has been claimed by ${interaction.user}`)
    .setColor("#0099ff");

  interaction.channel.send({ embeds: [embed] });
}

export const interaction = {
  customId: "ticket-claim",
  run: run,
};
