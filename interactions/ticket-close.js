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

  // Update the database entry
  await ticketDB.updateOne(
    { ChannelID: interaction.channel.id },
    { Closed: true }
  );

  const transcriptString = await createTranscript(interaction.channel, {
    returnType: "string",
    minify: true,
  });

  const result = await client.apiWrapper.CreateTranscript(transcriptString);

  let transcriptUrl = "**An error occurred while uploading the transcript**";
  if (result.success) {
    transcriptUrl =
      "https://transcripts.lightning-bot.com/t/" + result.json.code;
  }

  // Get the user who opened the ticket
  const member = interaction.guild.members.cache.get(ticket.MemberID);

  // Send the transcript to the log channel
  await interaction.guild.channels.cache
    .get(config.TICKET.TRANSCRIPT_CHANNEL_ID)
    .send({
      embeds: [
        new MessageEmbed()
          .setTitle("Ticket Closed")
          .setDescription("A ticket has been closed.")
          .addField("Ticket User", member.user.tag)
          .addField("Closed By", interaction.user.tag)
          .addField("Ticket ID", ticket.TicketID)
          .addField("Transcript", transcriptUrl)
          .setColor("#0099ff"),
      ],
    });

  // Send the transcript to the user
  await member
    .send({
      embeds: [
        new MessageEmbed()
          .setTitle("Ticket Closed")
          .setDescription(
            "Your ticket has been closed. You can view the transcript by opening the below URL."
          )
          .addField("Ticket Type", ticket.Type)
          .addField("Ticket ID", ticket.TicketID)
          .addField("Transcript", transcriptUrl)
          .setColor("#0099ff"),
      ],
    })
    // Catch errors if the user has DMs disabled
    .catch(() => {});

  await interaction.followUp({
    embeds: [
      new MessageEmbed()
        .setTitle("Ticket Closed")
        .setDescription(
          `This ticket is being closed, [here is the transcript](${transcriptUrl}).`
        )
        .setColor("#0099ff"),
    ],
  });

  // Delete the channel and ticket after 10 seconds
  setTimeout(async () => {
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
