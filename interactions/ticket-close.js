import { MessageEmbed } from "discord.js";
import { createTranscript } from "discord-html-transcripts";
import { ticketDB } from "../models/ticket.js";
import { config } from "../settings/config.js";

async function run(client, interaction) {
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

  if (ticket.Closed) {
    return await interaction.followUp({
      content: "This ticket is already closed!",
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
          .setDescription("A ticket has been closed.")
          .addField("Ticket User", member.user.tag)
          .addField("Closed By", interaction.user.tag)
          .addField("Ticket ID", ticket.TicketID)
          .setColor("#0099ff"),
      ],
      files: [transcriptAttachment],
    });

  // Send the transcript to the user
  await member
    .send({
      embeds: [
        new MessageEmbed()
          .setTitle("Ticket Closed - Transcript")
          .setDescription("Your ticket has been closed. You can view the transcript by downloading the file.")
          .addField("Ticket Type", ticket.Type)
          .addField("Ticket ID", ticket.TicketID)
          .setColor("#0099ff"),
      ],
      files: [transcriptAttachment],
    })
    // Catch errors if the user has DMs disabled
    .catch(() => {});

  await interaction.followUp({
    embeds: [
      new MessageEmbed()
        .setTitle("Ticket Closed")
        .setDescription(
          `This ticket is being closed, [here is the transcript](${message.url}).`
        )
        .setColor("#0099ff"),
    ],
  });

  // Delete the channel and ticket after 10 seconds
  setTimeout(() => {
    await interaction.channel.delete();
    ticketDB.deleteOne({ ChannelID: interaction.channel.id }, (err) => {
      if (err) throw err;
    });
  }, 10 * 1000);
}

export const interaction = {
  customId: "ticket-close",
  run: run,
};
