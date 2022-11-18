import { MessageEmbed, MessageActionRow, MessageSelectMenu } from "discord.js";

const subCommands = ["create", "check"];

async function run(client, interaction, args) {
  console.log(args);
  if (!subCommands.includes(args.subCommand)) {
    return;
  }

  if (!interaction.member.permissions.has("ADMINISTRATOR")) {
    return interaction.followUp({
      content: "You must be an administrator to use this command",
    });
  }

  if (args.subCommand == "create") {
  } else if (args.subCommand == "check") {
  }
}

export default {
  name: "key",
  description: "Key Administration",
  type: "CHAT_INPUT",
  userPermissions: ["ADMINISTRATOR"],
  defaultPermission: true,
  options: [
    {
      name: "create",
      description: "Create a new key",
      type: "SUB_COMMAND",
    },
    {
      name: "check",
      description: "Check if a key is valid",
      type: "SUB_COMMAND",
      options: [
        {
          name: "key",
          type: "STRING",
          description: "The key you want to check",
          required: true,
        },
      ],
    },
  ],
  run: run,
};
