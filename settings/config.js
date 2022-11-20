import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const config = {
  TOKEN: process.env.TOKEN,
  MONGO_URI: process.env.MONGO_URI,
  API_URL: "http://localhost:8000",

  STATUS: {
    TEXT: "Tickets",
    TYPE: "WATCHING",
  },

  GUILD_ID: "838151831086825533",
  WELCOME_CHANNEL_ID: "1043634985304870992",
  VERIFIED_USER_ROLE_ID: "1043896826631290880",

  TICKET: {
    CATEGORY_ID: "1041302484737609808",
    TRANSCRIPT_CHANNEL_ID: "1041302526626123796",
  },
};
