import Canvas from "canvas";
import { MessageAttachment } from "discord.js";

Canvas.registerFont("./assets/Montserrat.ttf", {
  family: "Montserrat",
  weight: "400",
});

const yOffset = 0;
const xOffset = 300;

async function createWelcomeImage(member) {
  const canvas = Canvas.createCanvas(1920, 1080);
  const ctx = canvas.getContext("2d");

  // Load the background
  const background = await Canvas.loadImage("./assets/WelcomeBackground.png");
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#f2f2f2";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Text color
  ctx.fillStyle = "#f2f2f2";

  //////// Write the username ////////
  if (member.user.username.length >= 14) {
    ctx.font = "bold 100px Montserrat";
  } else {
    ctx.font = "bold 140px Montserrat";
  }
  ctx.fillText(
    member.user.username,
    555 + xOffset,
    canvas.height / 2 - 40 + yOffset
  );

  //////// Write the discriminator ////////
  ctx.font = "bold 50px Montserrat";
  ctx.fillText(
    `#${member.user.discriminator}`,
    565 + xOffset,
    canvas.height / 2 + 40 + yOffset
  );

  //////// Write the member count ////////
  ctx.font = "bold 60px Montserrat";
  ctx.fillText(
    `Member #${member.guild.memberCount}`,
    565 + xOffset,
    canvas.height / 2 + 170 + yOffset
  );

  //////// Draw the avatar ////////
  // Load the avatar
  const avatar = await Canvas.loadImage(
    member.user.displayAvatarURL({ format: "png" })
  );
  // Position the avatar
  ctx.beginPath();
  ctx.arc(
    250 + xOffset,
    canvas.height / 2 + yOffset,
    250,
    0,
    Math.PI * 2,
    true
  );
  ctx.closePath();
  ctx.clip();
  // Draw the avatar
  ctx.drawImage(avatar, xOffset, canvas.height / 2 - 250 + yOffset, 500, 500);

  // Return the canvas as an attachment
  return new MessageAttachment(canvas.toBuffer(), "welcome-image.png");
}

export { createWelcomeImage };
