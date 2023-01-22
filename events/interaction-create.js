import { client } from "../index.js";

client.on("interactionCreate", async (interaction) => {
  if (interaction.member == null) {
    const members = interaction.guild.members.cache;

    interaction.member = members.get(interaction.user.id);
  }

  if (interaction.isCommand()) {
    // Slash Command Handling
    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) {
      return await interaction.reply({ content: "An error has occurred" });
    }

    await cmd.run(client, interaction);
  } else {
    // Interaction Handling
    const interactionHandler = client.interactions.get(interaction.customId);
    if (!interactionHandler) return;

    await interaction.deferUpdate();

    await interactionHandler.run(client, interaction);
  }
});
