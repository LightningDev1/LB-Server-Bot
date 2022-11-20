import { MessageEmbed } from "discord.js";
import { accountConnectionDB } from "../models/account-connection.js";
import { config } from "../settings/config.js";

async function run(client, interaction) {
  const key = interaction.options.getString("key");

  const response = await client.apiWrapper.CheckKey(key);

  if (!response.success) {
    const embed = new MessageEmbed()
      .setTitle("Error")
      .setDescription(response.json.reason)
      .setColor("RED");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  const keyData = response.json.key;

  // Check if the key has been redeemed
  if (keyData.redeemed_by.id === "") {
    const embed = new MessageEmbed()
      .setTitle("Error")
      .setDescription("That key does not have an account associated with it!")
      .setColor("RED");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Check if the key already has an account connected
  const keyConnection = await accountConnectionDB.findOne({ Key: key });

  if (keyConnection) {
    const embed = new MessageEmbed()
      .setTitle("Error")
      .setDescription("That key is already connected to an account!")
      .setColor("RED");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Check if the user already has an account connected
  const accountConnection = await accountConnectionDB.findOne({
    DiscordID: interaction.user.id,
  });

  if (accountConnection) {
    const embed = new MessageEmbed()
      .setTitle("Error")
      .setDescription("You already have an account connected!")
      .setColor("RED");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  await accountConnectionDB.create({
    DiscordID: interaction.user.id,
    LightningBotID: keyData.redeemed_by.id,
    Key: key,
  });

  // Add the verified role to the user
  const role = interaction.guild.roles.cache.get(config.VERIFIED_USER_ROLE_ID);

  if (!role) {
    const embed = new MessageEmbed()
      .setTitle("Error")
      .setDescription("The verified user role does not exist!")
      .setColor("RED");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  await interaction.member.roles.add(role);

  let embed = new MessageEmbed()
    .setTitle("Success")
    .setDescription(
      `Your Discord account has been linked to the LightningBot account \`${keyData.redeemed_by}\`!`
    )
    .setColor("GREEN");

  interaction.reply({ embeds: [embed], ephemeral: true });
}

export const command = {
  name: "connect",
  description: "Connect your Discord account to your LightningBot account",
  type: "CHAT_INPUT",
  defaultPermission: true,
  options: [
    {
      name: "key",
      type: "STRING",
      description: "The license key connected to your LightningBot account",
      required: true,
    },
  ],
  run: run,
};
