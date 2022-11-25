import { client } from "../index.js";

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    // Slash Command Handling
    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return await interaction.reply({ content: "An error has occurred" });

    interaction.member = interaction.guild.members.cache.get(
      interaction.user.id
    );

    await cmd.run(client, interaction);
  } else {
    // Interaction Handling
    const interactionHandler = client.interactions.get(interaction.customId);
    if (!interactionHandler) return;

    await interaction.deferUpdate();
    await interactionHandler.run(client, interaction);
  }
});
