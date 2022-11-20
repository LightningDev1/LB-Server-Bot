import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  GuildID: String,
  MemberID: String,
  TicketID: String,
  ChannelID: String,
  Closed: Boolean,
  Locked: Boolean,
  Type: String,
  Claimed: Boolean,
  Users: Array,
});

const ticketDB = mongoose.model("ticket", ticketSchema);

export { ticketDB };
