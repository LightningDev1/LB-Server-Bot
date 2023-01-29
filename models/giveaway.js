import mongoose from "mongoose";

const giveawaySchema = new mongoose.Schema({
  GuildID: String,
  ChannelID: String,
  MessageID: String,
  HostID: String,
  EndEpoch: Number,
  Entries: Array,
  Prize: String,
  WinnerAmount: Number,
  Winners: Array,
  EndTimeout: Number
});

const giveawayDB = mongoose.model("giveaway", giveawaySchema);

export { giveawayDB };
