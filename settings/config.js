import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const DEBUG = process.env.DEBUG === "true";

const sharedConfig = {
  TOKEN: process.env.TOKEN,
  MONGO_URI: process.env.MONGO_URI,
  API_URL: "https://api.lightning-bot.com",

  ACTIVITIES: [
    {
      name: "LightningBot",
      type: "PLAYING",
    },
    {
      name: "lightning-bot.com",
      type: "WATCHING",
    },
    {
      name: "Tickets",
      type: "WATCHING",
    },
    {
      name: "Giveaways",
      type: "WATCHING",
    },
  ],

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

  UPTIME_ALERTS: {
    SOURCE_CHANNEL_ID: "1046353251597025290",
    TARGET_CHANNEL_ID: "1172841391223742515",
  }
};

const debugConfig = {
  ...sharedConfig,

  GUILD_ID: "838151831086825533",
  WELCOME_CHANNEL_ID: "1043634985304870992",
  VERIFIED_USER_ROLE_ID: "768835534440759297",
  STAFF_ROLE_ID: "1045654962908168203",
  MOD_ROLE_ID: "1045654962908168203",
  MEMBER_ROLE_ID: "768835534440759297",

  TICKET: {
    CATEGORY_ID: "1041302484737609808",
    TRANSCRIPT_CHANNEL_ID: "1041302526626123796",
  },
};

const releaseConfig = {
  ...sharedConfig,

  GUILD_ID: "768559129052577842",
  WELCOME_CHANNEL_ID: "790214961267474452",
  VERIFIED_USER_ROLE_ID: "768835534440759297",
  STAFF_ROLE_ID: "768559129052577851",
  MOD_ROLE_ID: "1043889585215766649",
  MEMBER_ROLE_ID: "772343074990587904",

  TICKET: {
    CATEGORY_ID: "899395535591583854",
    TRANSCRIPT_CHANNEL_ID: "1045653703266410496",
  },
};

export const config = DEBUG ? debugConfig : releaseConfig;
