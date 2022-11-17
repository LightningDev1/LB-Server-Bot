import { config } from "dotenv";

config();

export default {
  TOKEN: process.env.TOKEN, // bot token
  MONGO_URI: process.env.MONGO_URI, // for the ticket system to work
  GUILD_ID: "838151831086825533", // server id where the slashcommands will register

  STATUS: {
    TEXT: "Tickets", // whatever you want
    TYPE: "WATCHING", // PLAYING, WATCHING, LISTENING
  },

  TICKET: {
    CATEGORY_ID: "1041302484737609808", // where the channel will be created
    TRANSCRIPT_CHANNEL_ID: "1041302526626123796", // where the html transcript will be sended
  },
};
