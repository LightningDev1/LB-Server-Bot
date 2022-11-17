import { MessageEmbed, MessageActionRow, MessageSelectMenu } from "discord.js";
import ticketDB from "../models/ticket.js";

export const name = "ticket";
export const description = "Ticket";
export const type = "CHAT_INPUT";
export const userPermissions = ["ADMINISTRATOR"];
export const defaultPermission = false;
export const options = [
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
        name: "type",
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
];

export async function run(client, interaction, args) {
  await interaction.deferReply({ ephemeral: true });

  const [SubCommand] = args;

  if (!interaction.member.permissions.has("ADMINISTRATOR"))
    return interaction.followUp({
      content: "You must be an administrator to use this command",
    });

  if (SubCommand == "setup") {
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
        .setCustomId("ticket")
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
  } else if (SubCommand == "action") {
    const action = interaction.options.getString("action");
    const user = interaction.options.getUser("user");

    switch (action) {
      case "add":
        ticketDB.findOne(
          { GuildID: interaction.guild.id, ChannelID: interaction.channel.id },
          async (err, docs) => {
            if (err) throw err;
            if (!docs)
              return interaction.reply({
                content: "This channel is not a ticket",
                ephemeral: true,
              });
            if (interaction.user.id == user.id)
              return interaction.reply({
                content: "You can't add yourself to a ticket",
                ephemeral: true,
              });
            if (docs.Users.includes(user.id))
              return interaction.reply({
                content: "This user is already in this ticket",
                ephemeral: true,
              });
            docs.Users.push(user.id);

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
            docs.save();
          }
        );
        break;
      case "remove":
        findOne(
          { GuildID: interaction.guild.id, ChannelID: interaction.channel.id },
          async (err, docs) => {
            if (err) throw err;
            if (!docs)
              return interaction.reply({
                content: "This channel is not a ticket",
                ephemeral: true,
              });
            if (interaction.user.id == user.id)
              return interaction.reply({
                content: "You can't remove yourself from a ticket",
                ephemeral: true,
              });
            if (!docs.Users.includes(user.id))
              return interaction.reply({
                content: "This user is not in this ticket",
                ephemeral: true,
              });
            docs.Users.remove(user.id);

            interaction.channel.permissionOverwrites.edit(user.id, {
              SEND_MESSAGES: false,
              VIEW_CHANNEL: false,
              READ_MESSAGE_HISTORY: false,
            });

            interaction.reply({
              content: `${user.tag} has been removed from this ticket`,
              ephemeral: true,
            });
            interaction.channel.send(
              `${user} has been removed from this ticket`
            );
            docs.save();
          }
        );
        break;
    }
  }
}
