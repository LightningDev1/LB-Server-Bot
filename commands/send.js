import { MessageEmbed } from "discord.js";
import { config } from "../settings/config.js";

const subCommands = ["rules", "bugreports", "suggestions"];

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

  const channel = interaction.options.getChannel("channel");

  if (subCommand === "rules") {
    const embed = new MessageEmbed()
      .setTitle("LightningBot Rules")
      .setDescription(
        "These are the rules for the LightningBot Discord server. You can find our terms of service [here](https://lightning-bot.com/terms). Breaking these rules will result in a punishment."
      )
      .setColor("#378cbc");

    for (let i = 0; i < config.RULES.length; i++) {
      embed.addField(`Rule ${i + 1}`, config.RULES[i]);
    }

    channel.send({ embeds: [embed] });
  } else if (subCommand === "bugreports") {
    const embed = new MessageEmbed()
      .setTitle("Bug Reports")
      .setDescription(
        "If you find a bug in LightningBot, you can report it here. Please make sure to provide as much information as possible."
      )
      .setColor("#378cbc");

    channel.send({ embeds: [embed] });
  } else if (subCommand === "suggestions") {
    const embed = new MessageEmbed()
      .setTitle("Suggestions")
      .setDescription(
        "Have an idea you would like to see implemented in LightningBot? Post it here! We will do our best to add all suggestions."
      )
      .setColor("#378cbc");

    channel.send({ embeds: [embed] });
  }

  interaction.reply({ content: "Done!", ephemeral: true });
}

export const command = {
  name: "send",
  description: "Send server information",
  type: "CHAT_INPUT",
  userPermissions: ["ADMINISTRATOR"],
  defaultPermission: false,
  options: [
    {
      name: "rules",
      description: "Send the rules",
      type: "SUB_COMMAND",
      options: [
        {
          name: "channel",
          description: "Channel where the rules will be sent",
          type: "CHANNEL",
          required: true,
          channelTypes: ["GUILD_TEXT"],
        },
      ],
    },
    {
      name: "bugreports",
      description: "Send bug reports message",
      type: "SUB_COMMAND",
      options: [
        {
          name: "channel",
          description: "Channel where the message will be sent",
          type: "CHANNEL",
          required: true,
          channelTypes: ["GUILD_TEXT"],
        },
      ],
    },
    {
      name: "suggestions",
      description: "Send suggestions message",
      type: "SUB_COMMAND",
      options: [
        {
          name: "channel",
          description: "Channel where the message will be sent",
          type: "CHANNEL",
          required: true,
          channelTypes: ["GUILD_TEXT"],
        },
      ],
    },
  ],
  run: run,
};
