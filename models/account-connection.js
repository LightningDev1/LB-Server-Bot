import mongoose from "mongoose";

const accountConnectionSchema = new mongoose.Schema({
  DiscordID: String,
  LightningBotID: String,
  Key: String,
});

export default mongoose.model("accountConnection", accountConnectionSchema);
