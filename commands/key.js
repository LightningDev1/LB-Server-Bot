import { MessageEmbed, MessageActionRow, MessageSelectMenu } from "discord.js";

const subCommands = ["create", "check"];

async function run(client, interaction) {
  const subCommand = interaction.options.getSubcommand();

  if (!subCommands.includes(subCommand)) {
    return;
  }

  if (!interaction.member.permissions.has("ADMINISTRATOR")) {
    return interaction.reply({
      content: "You must be an administrator to use this command",
    });
  }

  if (subCommand == "create") {
    const ephemeral = interaction.options.get("method").value === "ephemeral";

    const response = await client.apiWrapper.CreateKey(
      interaction.user.username
    );

    if (response.success) {
      const embed = new MessageEmbed()
        .setTitle("Key Created")
        .setDescription(
          `Your key is: \`${response.json.key}\`. Please keep this key safe.`
        )
        .setColor("GREEN");

      return interaction.reply({ embeds: [embed], ephemeral });
    } else {
      const embed = new MessageEmbed()
        .setTitle("Error")
        .setDescription(response.json.reason)
        .setColor("RED");

      return interaction.reply({ embeds: [embed], ephemeral });
    }
  } else if (subCommand == "check") {
    const ephemeral = interaction.options.get("method").value === "ephemeral";
    const key = interaction.options.getString("key");

    const response = await client.apiWrapper.CheckKey(key);

    if (response.success) {
      const keyData = response.json.key;

      const embed = new MessageEmbed()
        .setTitle("Key Information")
        .setDescription("Key is valid!")
        .addField("Key", keyData.key)
        .addField("Created By", keyData.created_by)
        .addField("Created At", keyData.created_at.toString())
        .addField("Create Reason", keyData.create_reason)
        .addField("Redeemed By", keyData.redeemed_by)
        .setColor("GREEN");

      return interaction.reply({ embeds: [embed], ephemeral });
    } else {
      const embed = new MessageEmbed()
        .setTitle("Error")
        .setDescription(response.json.reason)
        .setColor("RED");

      return interaction.reply({ embeds: [embed], ephemeral });
    }
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
      options: [
        {
          name: "method",
          type: "STRING",
          description: "Send the key in public or private",
          required: true,
          choices: [
            {
              name: "Public",
              value: "public",
            },
            {
              name: "Ephemeral",
              value: "ephemeral",
            },
          ],
        },
      ],
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
        {
          name: "method",
          type: "STRING",
          description: "Send the key in public or private",
          required: true,
          choices: [
            {
              name: "Public",
              value: "public",
            },
            {
              name: "Ephemeral",
              value: "ephemeral",
            },
          ],
        },
      ],
    },
  ],
  run: run,
};
