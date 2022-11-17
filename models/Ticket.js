import mongoose from 'mongoose';

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

export default mongoose.model('ticket', ticketSchema);