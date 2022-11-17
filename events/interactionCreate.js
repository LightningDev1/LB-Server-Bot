const client = require("../index");
const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} = require("discord.js");
const ticketDB = require("../models/Ticket");
const { createTranscript } = require("discord-html-transcripts");
const config = require("../settings/config.js");

client.on("interactionCreate", async (interaction) => {
  // Slash Command Handling
  if (interaction.isCommand()) {
    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return interaction.reply({ content: "An error has occurred " });

    const args = [];
    for (let option of interaction.options.data) {
      if (option.type === "SUB_COMMAND") {
        if (option.name) args.push(option.name);
        option.options.forEach((x) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }
    interaction.member = interaction.guild.members.cache.get(
      interaction.user.id
    );
    cmd.run(client, interaction, args);
  }

  // Context Menu Handling
  if (interaction.isContextMenu()) {
    await interaction.deferReply({ ephemeral: true });
    const command = client.slashCommands.get(interaction.commandName);
    if (command) command.run(client, interaction);
  }

  // Button Handling
  if (interaction.isButton()) {
    await interaction.deferUpdate();

    if (["close", "claim"].includes(interaction.customId)) {
      if (!interaction.member.permissions.has("ADMINISTRATOR")) {
        return interaction.followUp({
          content: "You must be an administrator to use this button",
          ephemeral: true,
        });
      }

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

      switch (interaction.customId) {
        case "close":
          if (ticket.Closed) {
            return interaction.followUp({
              content: "This ticket is already closed",
              ephemeral: true,
            });
          }

          const transcriptAttachment = await createTranscript(
            interaction.channel,
            {
              limit: -1,
              returnBuffer: false,
              fileName: `${interaction.channel.name}.html`,
            }
          );

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
          break;

        case "claim":
          if (ticket.Claimed) {
            return interaction.followUp({
              content: "This ticket is already claimed",
              ephemeral: true,
            });
          }

          // Update the database entry
          await ticketDB.updateOne(
            { ChannelID: interaction.channel.id },
            { Claimed: true }
          );

          interaction.channel.send({
            embeds: [
              new MessageEmbed()
                .setDescription(
                  `This ticket has been claimed by ${interaction.user}`
                )
                .setColor("#0099ff"),
            ],
          });
      }
    }
  }

  if (interaction.isSelectMenu()) {
    await interaction.deferUpdate();
    var value = interaction.values[0];

    if (["purchase", "support", "report"].includes(value)) {
      const ticketID = Math.floor(Math.random() * 90000) + 10000;

      // Create the ticket channel
      const ticketChannel = await interaction.guild.channels.create(
        `${value}-${interaction.user.username}-${ticketID}`,
        {
          type: "GUILD_TEXT",
          parent: config.TICKET.CATEGORY_ID,
          permissionOverwrites: [
            // Allow the ticket user to view the channel
            {
              id: interaction.member.id,
              allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
            },
            // Deny everyone else from seeing the channel
            {
              id: interaction.guild.id,
              deny: ["SEND_MESSAGES", "VIEW_CHANNEL"],
            },
          ],
        }
      );

      // Create the database entry
      await ticketDB.create({
        GuildID: interaction.guild.id,
        MemberID: interaction.member.id,
        TicketID: ticketID,
        ChannelID: ticketChannel.id,
        Closed: false,
        Locked: false,
        Type: value,
        Claimed: false,
      });

      const embed = new MessageEmbed()
        .setTitle(`${value[0].toUpperCase()}${value.substring(1)} Ticket`)
        .setDescription(
          "Please describe your problem as detailed as possible. A staff member will be with you shortly."
        )
        .setColor("#0099ff")
        .setFooter({ text: "🚫 Buttons below are staff only 🚫" });

      const actionButtons = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("close")
          .setLabel("Close")
          .setStyle("DANGER"),
        new MessageButton()
          .setCustomId("claim")
          .setLabel("Claim")
          .setStyle("SUCCESS")
      );

      const actionMenu = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("ticket")
          .setPlaceholder("Select a Action")
          .setMaxValues(1)
          .addOptions([
            {
              label: "Lock",
              value: "lock",
            },
            {
              label: "Unlock",
              value: "unlock",
            },
          ])
      );

      ticketChannel.send({
        embeds: [embed],
        components: [actionButtons, actionMenu],
      });

      interaction.followUp({
        content: `Ticket has been successfully created <#${ticketChannel.id}>`,
        ephemeral: true,
      });
    }

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
});
