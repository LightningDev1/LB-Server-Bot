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
