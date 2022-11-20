import { config } from "dotenv";

config();

export default {
  TOKEN: process.env.TOKEN,
  MONGO_URI: process.env.MONGO_URI,
  API_URL: "http://localhost:8000",
  GUILD_ID: "838151831086825533",

  STATUS: {
    TEXT: "Tickets",
    TYPE: "WATCHING",
  },

  TICKET: {
    CATEGORY_ID: "1041302484737609808",
    TRANSCRIPT_CHANNEL_ID: "1041302526626123796",
  },

  WELCOME_CHANNEL_ID: "1043634985304870992",
};
