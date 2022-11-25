import {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} from "discord.js";
import { ticketDB } from "../models/ticket.js";
import { config } from "../settings/config.js";

async function run(client, interaction) {
  const value = interaction.values[0];
  const ticketID = Math.floor(Math.random() * 90000) + 10000;

  // Create the ticket channel
  const ticketChannel = await interaction.guild.channels.create(
    `${value}-${interaction.user.username}-${ticketID}`,
    {
      type: "GUILD_TEXT",
      parent: config.TICKET.CATEGORY_ID,
      permissionOverwrites: [
        // Allow the ticket user to view the channel
        {
          id: interaction.member.id,
          allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
        },
        // Allow moderators to view the channel
        {
          id: config.MOD_ROLE_ID,
          allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
        },
        // Deny everyone else from seeing the channel
        {
          id: interaction.guild.id,
          deny: ["SEND_MESSAGES", "VIEW_CHANNEL"],
        },
      ],
    }
  );

  // Create the database entry
  await ticketDB.create({
    GuildID: interaction.guild.id,
    MemberID: interaction.member.id,
    TicketID: ticketID,
    ChannelID: ticketChannel.id,
    Closed: false,
    Locked: false,
    Type: value,
    Claimed: false,
  });

  const embed = new MessageEmbed()
    .setTitle(`${value[0].toUpperCase()}${value.substring(1)} Ticket`)
    .setDescription(
      "Please describe your problem as detailed as possible. A staff member will be with you shortly."
    )
    .setColor("#0099ff")
    .setFooter({ text: "🚫 Buttons below are staff only 🚫" });

  const actionButtons = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("ticket-close")
      .setLabel("Close")
      .setStyle("DANGER"),
    new MessageButton()
      .setCustomId("ticket-claim")
      .setLabel("Claim")
      .setStyle("SUCCESS")
  );

  const actionMenu = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId("ticket-action")
      .setPlaceholder("Select a Action")
      .setMaxValues(1)
      .addOptions([
        {
          label: "Lock",
          value: "lock",
        },
        {
          label: "Unlock",
          value: "unlock",
        },
      ])
  );

  await ticketChannel.send({
    embeds: [embed],
    components: [actionButtons, actionMenu],
  });

  await interaction.followUp({
    content: `Ticket has been successfully created <#${ticketChannel.id}>`,
    ephemeral: true,
  });
}

export const interaction = {
  customId: "ticket-create",
  run: run,
};
