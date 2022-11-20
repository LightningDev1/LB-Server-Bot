import { MessageEmbed } from "discord.js";

import { createWelcomeImage } from "../utils/welcome-image.js";
import { config } from "../settings/config.js";
import { client } from "../index.js";

client.on("guildMemberAdd", async (member) => {
  if (member.guild.id !== config.GUILD_ID) return;
  if (member.user.bot) return;

  const channel = client.channels.cache.get(config.WELCOME_CHANNEL_ID);
  if (!channel) return;

  const attachment = await createWelcomeImage(member);

  const embed = new MessageEmbed()
    .setColor("#378cbc")
    .setImage("attachment://welcome-image.png");

  channel.send({
    content: `Hey <@${member.id}>, welcome to ${member.guild.name}!`,
    embeds: [embed],
    files: [attachment],
  });
});
