import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const config = {
  TOKEN: process.env.TOKEN,
  MONGO_URI: process.env.MONGO_URI,
  API_URL: "https://api.lightning-bot.com",

  STATUS: {
    TEXT: "Tickets",
    TYPE: "WATCHING",
  },

  GUILD_ID: "838151831086825533",
  WELCOME_CHANNEL_ID: "1043634985304870992",
  VERIFIED_USER_ROLE_ID: "768835534440759297",

  TICKET: {
    CATEGORY_ID: "1041302484737609808",
    TRANSCRIPT_CHANNEL_ID: "1041302526626123796",
  },

  RULES: [
    "No Spamming",
    "No NSFW Content",
    "No Racism, Homophobia, etc.",
    "Do not DM staff, open a ticket or send a message in the support channel instead",
    "Advertising in any way or form is prohibited without permission",
    "Do not abuse or exploit any bots",
    "Do not beg for keys, roles, staff, etc.",
    "Do not send any harmful content (e.g. token loggers, IP loggers, malware)",
    "Listen to staff and follow their instructions",
  ],
};
