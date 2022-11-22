import { MessageEmbed } from "discord.js";
import { ticketDB } from "../models/ticket.js";

async function run(client, interaction) {
  const value = interaction.values[0];

  const ticket = await ticketDB
    .findOne({ ChannelID: interaction.channel.id })
    .exec();

  if (value === "lock") {
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
  } else if (value === "unlock") {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.followUp({
        content: "You must be an administrator to use this option",
        ephemeral: true,
      });
    }

    if (ticket.Locked == false) {
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
}

export const interaction = {
  customId: "ticket-action",
  run: run,
};
