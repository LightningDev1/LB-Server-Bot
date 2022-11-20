import mongoose from "mongoose";

const accountConnectionSchema = new mongoose.Schema({
  DiscordID: String,
  LightningBotID: String,
  Key: String,
});

const accountConnectionDB = mongoose.model(
  "account-connection",
  accountConnectionSchema
);

export { accountConnectionDB };
