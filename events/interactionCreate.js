const client = require("../index");
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const db = require('../models/Ticket');
const { createTranscript } = require('discord-html-transcripts')
const config = require("../settings/config.js");

client.on("interactionCreate", async(interaction) => {
    // Slash Command Handling
    if (interaction.isCommand()) {
        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return interaction.reply({ content: "An error has occurred " });

        const args = [];
        for (let option of interaction.options.data) {
          if (option.type === "SUB_COMMAND") {
            if (option.name) args.push(option.name);
            option.options.forEach((x) => {
              if (x.value) args.push(x.value);
            });
          } else if (option.value) args.push(option.value);
        }
        interaction.member = interaction.guild.members.cache.get(interaction.user.id);
        cmd.run(client, interaction, args);
    }

    // Context Menu Handling
    if (interaction.isContextMenu()) {
        await interaction.deferReply({ ephemeral: true });
        const command = client.slashCommands.get(interaction.commandName);
        if (command) command.run(client, interaction);
      }

      if(interaction.isButton()) {
        if (["purchase", "support", "report"].includes(interaction.customId)) {
          await interaction.deferUpdate();
          const ID = Math.floor(Math.random() * 90000) + 10000;
          await interaction.guild.channels.create(`${interaction.customId}-${interaction.user.username}-${ID}`, {
            type: "GUILD_TEXT",
            parent: config.TICKET.CATEGORY_ID,
            permissionOverwrites: [
              {
                id: interaction.member.id,
                allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
              },
              {
                id: interaction.guild.id,
                deny: ["SEND_MESSAGES", "VIEW_CHANNEL"],
              },
            ],
          }).then(async (channel) => {
            await db.create({
              GuildID: interaction.guild.id,
              MemberID: interaction.member.id,
              TicketID: ID,
              ChannelID: channel.id,
              Closed: false,
              Locked: false,
              Type: interaction.customId,
              Claimed: false,
            })
            if(interaction.customId == "purchase") interaction.customId = "Purchase
            if(interaction.customId == "support") interaction.customId = "Support"
            if(interaction.customId == "report") interaction.customId = "Report"
            const embed = new MessageEmbed()
            .setTitle(`${interaction.customId} Ticket`)
            .setDescription("Please describe your problem with most details as possible while a staff member will be with your shortly")
            .setColor("#0099ff")
            .setFooter({ text: "🚫 Buttons below are staff only 🚫" })

            const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
              .setCustomId("close")
              .setLabel("Close")
              .setStyle("DANGER"),
              new MessageButton()
              .setCustomId("claim")
              .setLabel("Claim")
              .setStyle("SUCCESS"),
            );

            const menu = new MessageActionRow()
            .addComponents(
              new MessageSelectMenu()
                .setCustomId('ticket')
                .setPlaceholder('Select a Action')
                .setMaxValues(1)
                .addOptions([
                  {
                    label: 'Lock',
                    value: 'lock',
                  },
                  {
                    label: 'Unlock',
                    value: 'unlock',
                  },
                ]),
            );
            channel.send({ embeds: [embed], components: [row,menu] })
            interaction.followUp({ content: `Ticket has been successfully created <#${channel.id}>`, ephemeral: true });
          })
        } else if (["close", "claim"].includes(interaction.customId)) {
          await interaction.deferUpdate();
          if (!interaction.member.permissions.has("ADMINISTRATOR")) return interaction.followUp({ content: "You must be an administrator to use this button", ephemeral: true });

          db.findOne({ChannelID: interaction.channel.id}, async(err, docs) => {
            if(err) throw err;
            if(!docs) return interaction.followUp({ content: "No data was found related to this ticket, please remove it manually", ephemeral: true});
          switch(interaction.customId) {
            case "close":
              if(docs.Closed == true)
              return interaction.followUp({ content: "This ticket is already closed", ephemeral: true});
              const attachment = await createTranscript(interaction.channel, {
                limit: -1,
                returnBuffer: false,
                fileName: `${interaction.channel.name}.html`,
              });
              await db.updateOne({ChannelID: interaction.channel.id}, {Closed: true});

              const MEMBER = interaction.guild.members.cache.get(docs.MemberID);
              const Message = await interaction.guild.channels.cache.get(config.TICKET.TRANSCRIPT_CHANNEL_ID).send({
                embeds: [
                  new MessageEmbed()
                  .setTitle("Ticket Closed - Transcript")
                  .setDescription(`${interaction.user.tag} has closed a ticket\nTicket User: ${MEMBER.user.tag}\nTicket Type: ${docs.Type}\nTicketID: ${docs.TicketID}`)
                  .setColor("#0099ff")
                ],
                files: [attachment],
              })
              MEMBER.send({
                embeds: [
                  new MessageEmbed()
                  .setTitle("Ticket Closed - Transcript")
                  .setDescription(`${interaction.user.tag} has closed a ticket\nTicket User: ${MEMBER.user.tag}\nTicket Type: ${docs.Type}\nTicketID: ${docs.TicketID}`)
                  .setColor("#0099ff")
                ],
                files: [attachment],
              }).catch(() => {});

              const embed2 = new MessageEmbed()
              .setTitle("Ticket Closed")
              .setDescription(`This ticket is being closed, [here is the transcript](${Message.url})`)
              .setColor("#0099ff")

              interaction.followUp({embeds: [embed2]})

              setTimeout(() => {
                interaction.channel.delete();
                db.deleteOne({ChannelID: interaction.channel.id}, (err) => {
                  if(err) throw err;
                });
              }, 10 * 1000);
              break;
            case "claim":
              if(docs.Claimed == true)
              return interaction.followUp({ content: "This ticket is already claimed", ephemeral: true});
              await db.updateOne({ChannelID: interaction.channel.id}, {Claimed: true});
              const embed = new MessageEmbed()
              .setDescription(`This ticket has been claimed by ${interaction.user}`)
              .setColor("#0099ff")
              interaction.channel.send({embeds: [embed]})
          }
        })
      }
    }
      if(interaction.isSelectMenu()) {
        db.findOne({ChannelID: interaction.channel.id}, async(err, docs) => {
        const value = interaction.values[0];
        await interaction.deferUpdate();
        if(value == "lock") {
          if (!interaction.member.permissions.has("ADMINISTRATOR")) return interaction.followUp({ content: "You must be an administrator to use this option", ephemeral: true });
          if(docs.Locked == true)
              return interaction.followUp({ content: "This ticket is already locked", ephemeral: true});
              await db.updateOne({ChannelID: interaction.channel.id}, {Locked: true});
              const locked = new MessageEmbed()
              .setTitle("Ticket Locked")
              .setDescription("This ticket has been locked")
              .setColor("#0099ff")
              interaction.channel.permissionOverwrites.edit(docs.MemberID, {
                SEND_MESSAGES: false,
              })
              interaction.channel.send({ embeds: [locked] })
        } else if(value == "unlock") {
          if (!interaction.member.permissions.has("ADMINISTRATOR")) return interaction.followUp({ content: "You must be an administrator to use this option", ephemeral: true });
          if(docs.Locked == false)
              return interaction.followUp({ content: "This ticket is already unlocked", ephemeral: true});
              await db.updateOne({ChannelID: interaction.channel.id}, {Locked: false});
              const unlocked = new MessageEmbed()
              .setTitle("Ticket Unlocked")
              .setDescription("This ticket has been unlocked")
              .setColor("#0099ff")
              interaction.channel.permissionOverwrites.edit(docs.MemberID, {
                SEND_MESSAGES: true,
              })
            interaction.channel.send({ embeds: [unlocked] })
          }
    });
  }
})
