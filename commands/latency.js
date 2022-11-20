import { MessageEmbed } from "discord.js";

async function run(client, interaction) {
  const embed = new MessageEmbed()
    .setTitle("Latency")
    .addField("Discord Latency", `${client.ws.ping}ms`)
    .setColor("GREEN");

  interaction.reply({ embeds: [embed] });
}

export const command = {
  name: "latency",
  description: "Show the bot's latency",
  type: "CHAT_INPUT",
  defaultPermission: true,
  run: run,
};
