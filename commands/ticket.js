import { MessageEmbed, MessageActionRow, MessageSelectMenu } from "discord.js";
import { ticketDB } from "../models/ticket.js";
import { isUserStaff } from "../utils/staff.js";

const subCommands = ["setup", "action"];

async function run(client, interaction) {
  const subCommand = interaction.options.getSubcommand();

  if (!subCommands.includes(subCommand)) {
    return;
  }

  if (!isUserStaff(interaction.member)) {
    return interaction.followUp({
      content: "You must be an administrator to use this command",
    });
  }

  if (subCommand == "setup") {
    const ticketChannel = interaction.options.getChannel("channel");

    const embed = new MessageEmbed()
      .setAuthor({ name: "Support Tickets" })
      .setThumbnail(interaction.guild.iconURL())
      .setColor(`#0x2F3136`)
      .setDescription(
        "If you need any assistance, please use this ticket system to contact the support team."
      );

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("ticket-create")
        .setPlaceholder("Select a category")
        .setMaxValues(1)
        .addOptions([
          {
            label: "Purchase",
            emoji: "🪙",
            value: "purchase",
          },
          {
            label: "Support",
            emoji: "⚙",
            value: "support",
          },
          {
            label: "Report",
            emoji: "💢",
            value: "report",
          },
        ])
    );

    ticketChannel.send({ embeds: [embed], components: [row] });

    return interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Ticket System")
          .setDescription(
            `Ticket system has been successfully enable in <#${ticketChannel.id}>`
          ),
      ],
      ephemeral: true,
    });
  } else if (subCommand == "action") {
    const action = interaction.options.getString("action");
    const user = interaction.options.getUser("user");

    const ticket = ticketDB.findOne({
      GuildID: interaction.guild.id,
      ChannelID: interaction.channel.id,
    });

    if (!ticket) {
      return interaction.reply({
        content: "This channel is not a ticket!",
        ephemeral: true,
      });
    }

    switch (action) {
      case "add":
        if (interaction.user.id == user.id) {
          return interaction.reply({
            content: "You can't add yourself to a ticket",
            ephemeral: true,
          });
        }

        if (ticket.Users.includes(user.id)) {
          return interaction.reply({
            content: "This user is already in this ticket",
            ephemeral: true,
          });
        }

        ticket.Users.push(user.id);

        interaction.channel.permissionOverwrites.edit(user.id, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL: true,
          READ_MESSAGE_HISTORY: true,
        });

        interaction.reply({
          content: `${user.tag} has been added to this ticket`,
          ephemeral: true,
        });
        interaction.channel.send(
          `Hey ${user} you have been added to this ticket`
        );
        ticket.save();
        break;

      case "remove":
        if (interaction.user.id == user.id) {
          return interaction.reply({
            content: "You can't remove yourself from a ticket",
            ephemeral: true,
          });
        }

        if (!ticket.Users.includes(user.id)) {
          return interaction.reply({
            content: "This user is not in this ticket",
            ephemeral: true,
          });
        }

        ticket.Users.remove(user.id);

        interaction.channel.permissionOverwrites.edit(user.id, {
          SEND_MESSAGES: false,
          VIEW_CHANNEL: false,
          READ_MESSAGE_HISTORY: false,
        });

        interaction.reply({
          content: `${user.tag} has been removed from this ticket`,
          ephemeral: true,
        });
        interaction.channel.send(`${user} has been removed from this ticket`);
        ticket.save();
        break;
    }
  }
}

export const command = {
  name: "ticket",
  description: "Ticket System",
  type: "CHAT_INPUT",
  userPermissions: ["ADMINISTRATOR", "MANAGE_CHANNELS"],
  defaultPermission: false,
  options: [
    {
      name: "setup",
      description: "Setup the ticket system",
      type: "SUB_COMMAND",
      options: [
        {
          name: "channel",
          description: "Channel where the ticket system will be created",
          type: "CHANNEL",
          required: true,
          channelTypes: ["GUILD_TEXT"],
        },
      ],
    },
    {
      name: "action",
      description: "Action on a ticket",
      type: "SUB_COMMAND",
      options: [
        {
          name: "action",
          type: "STRING",
          description: "Add or Remove a user from this ticket",
          required: true,
          choices: [
            {
              name: "Add",
              value: "add",
            },
            {
              name: "Remove",
              value: "remove",
            },
          ],
        },
        {
          name: "user",
          type: "USER",
          description: "The user to add or remove",
          required: true,
        },
      ],
    },
  ],
  run: run,
};
