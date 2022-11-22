import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { parseDuration } from "../utils/parse-duration.js";
import { generateDescription } from "../utils/giveaway.js";
import { giveawayDB } from "../models/giveaway.js";

const subCommands = ["create", "delete", "end", "reroll", "list"];

async function run(client, interaction) {
  const subCommand = interaction.options.getSubcommand();

  if (!subCommands.includes(subCommand)) {
    return;
  }

  if (!interaction.member.permissions.has("ADMINISTRATOR")) {
    return interaction.followUp({
      content: "You must be an administrator to use this command",
    });
  }

  switch (subCommand) {
    case "create":
      const channel = interaction.options.getChannel("channel");
      const duration = interaction.options.getString("duration");
      const winners = interaction.options.getInteger("winners");
      const prize = interaction.options.getString("prize");

      const parsedDuration = parseDuration(duration);

      let endDate = new Date();
      endDate = new Date(endDate.getTime() + parsedDuration * 1000);

      const endEpoch = (endDate.getTime() / 1000).toFixed();

      if (parsedDuration === 0) {
        return interaction.reply({
          content: "That duration is invalid.",
          ephemeral: true,
        });
      }

      if (winners <= 0) {
        return interaction.reply({
          content: "There must be at least 1 winner.",
          ephemeral: true,
        });
      }

      const embed = new MessageEmbed()
        .setTitle(`**${prize}**`)
        .setDescription(
          generateDescription(endEpoch, interaction.user.id, 0, winners)
        )
        .setTimestamp(endDate)
        .setColor("#378cbc");

      const actionRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("giveaway-enter")
          .setStyle("PRIMARY")
          .setLabel("Enter")
          .setEmoji("🎉")
      );

      const message = await channel.send({
        embeds: [embed],
        components: [actionRow],
      });

      await giveawayDB.create({
        GuildID: interaction.guild.id,
        ChannelID: channel.id,
        MessageID: message.id,
        HostID: interaction.user.id,
        EndEpoch: endEpoch,
        Entries: [],
        Prize: prize,
        WinnerAmount: winners,
        Winners: [],
      });
  }

  interaction.reply({ content: "Done!", ephemeral: true });
}

export const command = {
  name: "giveaway",
  description: "Create a giveaway",
  type: "CHAT_INPUT",
  userPermissions: ["ADMINISTRATOR"],
  defaultPermission: false,
  options: [
    {
      name: "create",
      description: "Create a giveaway",
      type: "SUB_COMMAND",
      options: [
        {
          name: "channel",
          description: "Channel where the giveaway will be hosted",
          type: "CHANNEL",
          required: true,
          channelTypes: ["GUILD_TEXT"],
        },
        {
          name: "duration",
          description: "Duration of the giveaway",
          type: "STRING",
          required: true,
        },
        {
          name: "winners",
          description: "Amount of winners",
          type: "INTEGER",
          required: true,
        },
        {
          name: "prize",
          description: "Giveaway prize",
          type: "STRING",
          required: true,
        },
      ],
    },
    {
      name: "delete",
      description: "Delete a giveaway",
      type: "SUB_COMMAND",
      options: [
        {
          name: "giveaway_id",
          description: "Message ID of the giveaway",
          type: "STRING",
          required: true,
        },
      ],
    },
    {
      name: "end",
      description: "End a giveaway",
      type: "SUB_COMMAND",
      options: [
        {
          name: "giveaway_id",
          description: "Message ID of the giveaway",
          type: "STRING",
          required: true,
        },
      ],
    },
    {
      name: "reroll",
      description: "End a giveaway",
      type: "SUB_COMMAND",
      options: [
        {
          name: "giveaway_id",
          description: "Message ID of the giveaway",
          type: "STRING",
          required: true,
        },
      ],
    },
    {
      name: "list",
      description: "List all giveaways",
      type: "SUB_COMMAND",
      options: [
        {
          name: "giveaway_id",
          description: "Message ID of the giveaway",
          type: "STRING",
          required: true,
        },
      ],
    },
  ],
  run: run,
};
