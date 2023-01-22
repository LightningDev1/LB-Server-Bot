import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import {
  ensureTimeout,
  endGiveaway,
  rerollGiveaway,
} from "../utils/giveaway.js";
import { parseDuration } from "../utils/parse-duration.js";
import { generateDescription } from "../utils/giveaway.js";
import { giveawayDB } from "../models/giveaway.js";
import { isUserStaff } from "../utils/staff.js";

const subCommands = ["create", "delete", "end", "reroll", "list"];

async function run(client, interaction) {
  const subCommand = interaction.options.getSubcommand();

  if (!subCommands.includes(subCommand)) {
    return;
  }

  if (!isUserStaff(interaction.member)) {
    return await interaction.followUp({
      content: "You must be an administrator to use this command",
    });
  }

  if (subCommand === "create") {
    const channel = interaction.options.getChannel("channel");
    const duration = interaction.options.getString("duration");
    const winners = interaction.options.getInteger("winners");
    const prize = interaction.options.getString("prize");

    const parsedDuration = parseDuration(duration);

    if (parsedDuration === 0) {
      return await interaction.reply({
        content: "That duration is invalid.",
        ephemeral: true,
      });
    }

    if (winners <= 0) {
      return await interaction.reply({
        content: "There must be at least 1 winner.",
        ephemeral: true,
      });
    }

    const endDate = new Date(Date.now() + parsedDuration * 1000);

    const endEpoch = Math.floor(endDate.getTime() / 1000);

    const description = generateDescription({
      endEpoch: endEpoch,
      hostID: interaction.user.id,
      entries: 0,
      winners: winners,
    });

    const embed = new MessageEmbed()
      .setTitle(`**${prize}**`)
      .setDescription(description)
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

    const giveaway = await giveawayDB.create({
      GuildID: interaction.guild.id,
      ChannelID: channel.id,
      MessageID: message.id,
      HostID: interaction.user.id,
      EndEpoch: endEpoch,
      Entries: [],
      Prize: prize,
      WinnerAmount: winners,
      Winners: [],
      EndTimeout: -1,
    });

    await ensureTimeout(client, giveaway);
  } else if (subCommand === "delete") {
    const messageId = interaction.options.getString("giveaway_id");

    const giveaway = await giveawayDB.findOne({
      MessageID: messageId,
    });

    if (!giveaway) {
      return await interaction.reply({
        content: "That giveaway does not exist.",
        ephemeral: true,
      });
    }
  } else if (subCommand === "end") {
    const messageId = interaction.options.getString("giveaway_id");
    await endGiveaway(client, messageId);
  } else if (subCommand === "reroll") {
    const messageId = interaction.options.getString("giveaway_id");
    await rerollGiveaway(client, interaction, messageId);
  } else if (subCommand === "list") {
    const giveaways = await giveawayDB.find({
      GuildID: interaction.guild.id,
    });

    if (giveaways.length === 0) {
      return await interaction.reply({
        content: "There are no giveaways in this server.",
        ephemeral: true,
      });
    }

    const embed = new MessageEmbed().setTitle("Giveaways").setColor("#378cbc");

    for (const giveaway of giveaways) {
      const guild = client.guilds.cache.get(giveaway.GuildID);
      const channel = guild.channels.cache.get(giveaway.ChannelID);
      const message = await channel.messages.fetch(giveaway.MessageID);

      const prize = message.embeds[0].title;
      const ended = giveaway.EndEpoch < (Date.now() / 1000).toFixed();
      const endedString = ended ? "Ended" : "Active";

      embed.addField(
        `${prize} (${endedString})`,
        `Winners: ${giveaway.WinnerAmount}`
      );
    }

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }

  if (subCommand !== "list") {
    await interaction.reply({ content: "Done!", ephemeral: true });
  }
}

export const command = {
  name: "giveaway",
  description: "Create a giveaway",
  type: "CHAT_INPUT",
  userPermissions: ["ADMINISTRATOR", "MANAGE_MESSAGES"],
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
    },
  ],
  run: run,
};
