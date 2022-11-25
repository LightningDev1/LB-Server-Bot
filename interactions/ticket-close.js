import { MessageEmbed } from "discord.js";
import { createTranscript } from "discord-html-transcripts";
import { ticketDB } from "../models/ticket.js";
import { config } from "../settings/config.js";

async function run(client, interaction) {
  const ticket = await ticketDB
    .findOne({ ChannelID: interaction.channel.id })
    .exec();

  if (!ticket) {
    return interaction.followUp({
      content:
        "No data was found related to this ticket, please remove it manually",
      ephemeral: true,
    });
  }

  if (ticket.Closed) {
    return interaction.followUp({
      content: "This ticket is already closed",
      ephemeral: true,
    });
  }

  const transcriptAttachment = await createTranscript(interaction.channel, {
    returnType: "attachment",
    fileName: `${interaction.channel.name}.html`,
    minify: true,
  });

  // Update the database entry
  await ticketDB.updateOne(
    { ChannelID: interaction.channel.id },
    { Closed: true }
  );

  // Get the user who opened the ticket
  const member = interaction.guild.members.cache.get(ticket.MemberID);

  // Send the transcript to the log channel
  const message = await interaction.guild.channels.cache
    .get(config.TICKET.TRANSCRIPT_CHANNEL_ID)
    .send({
      embeds: [
        new MessageEmbed()
          .setTitle("Ticket Closed - Transcript")
          .setDescription(
            `${interaction.user.tag} has closed a ticket\nTicket User: ${member.user.tag}\nTicket Type: ${ticket.Type}\nTicketID: ${ticket.TicketID}`
          )
          .setColor("#0099ff"),
      ],
      files: [transcriptAttachment],
    });

  // Send the transcript to the user
  member
    .send({
      embeds: [
        new MessageEmbed()
          .setTitle("Ticket Closed - Transcript")
          .setDescription(
            `Your ticket has been closed\n\nTicket Type: ${ticket.Type}\nTicket ticketID: ${ticket.TicketID}`
          )
          .setColor("#0099ff"),
      ],
      files: [transcriptAttachment],
    })
    // Catch errors if the user has DMs disabled
    .catch(() => {});

  interaction.followUp({
    embeds: [
      new MessageEmbed()
        .setTitle("Ticket Closed")
        .setDescription(
          `This ticket is being closed, [here is the transcript](${message.url})`
        )
        .setColor("#0099ff"),
    ],
  });

  // Delete the channel and ticket after 10 seconds
  setTimeout(() => {
    interaction.channel.delete();
    ticketDB.deleteOne({ ChannelID: interaction.channel.id }, (err) => {
      if (err) throw err;
    });
  }, 10 * 1000);
}

export const interaction = {
  customId: "ticket-close",
  run: run,
};
