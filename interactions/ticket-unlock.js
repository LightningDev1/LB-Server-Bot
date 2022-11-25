import { MessageEmbed } from "discord.js";
import { ticketDB } from "../models/ticket.js";
import { isUserStaff } from "../utils/staff.js";

async function run(client, interaction) {
  const ticket = await ticketDB
    .findOne({ ChannelID: interaction.channel.id })
    .exec();

  if (!isUserStaff(interaction.member)) {
    return interaction.followUp({
      content: "You must be an administrator to use this option",
      ephemeral: true,
    });
  }

  if (!ticket.Locked) {
    return interaction.followUp({
      content: "This ticket is already unlocked",
      ephemeral: true,
    });
  }

  await ticketDB.updateOne(
    { ChannelID: interaction.channel.id },
    { Locked: false }
  );

  interaction.channel.permissionOverwrites.edit(ticket.MemberID, {
    SEND_MESSAGES: true,
  });

  interaction.channel.send({
    embeds: [
      new MessageEmbed()
        .setTitle("Ticket Unlocked")
        .setDescription("This ticket has been unlocked")
        .setColor("#0099ff"),
    ],
  });
}

export const interaction = {
  customId: "ticket-unlock",
  run: run,
};
