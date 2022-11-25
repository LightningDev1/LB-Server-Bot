import { MessageEmbed } from "discord.js";
import { ticketDB } from "../models/ticket.js";

async function run(client, interaction) {
  const value = interaction.values[0];

  const ticket = await ticketDB
    .findOne({ ChannelID: interaction.channel.id })
    .exec();

  if (!interaction.member.permissions.has("ADMINISTRATOR")) {
    return interaction.followUp({
      content: "You must be an administrator to use this option",
      ephemeral: true,
    });
  }

  if (ticket.Locked) {
    return interaction.followUp({
      content: "This ticket is already locked",
      ephemeral: true,
    });
  }

  await ticketDB.updateOne(
    { ChannelID: interaction.channel.id },
    { Locked: true }
  );

  interaction.channel.permissionOverwrites.edit(ticket.MemberID, {
    SEND_MESSAGES: false,
  });

  interaction.channel.send({
    embeds: [
      new MessageEmbed()
        .setTitle("Ticket Locked")
        .setDescription("This ticket has been locked")
        .setColor("#0099ff"),
    ],
  });
}

export const interaction = {
  customId: "ticket-lock",
  run: run,
};
