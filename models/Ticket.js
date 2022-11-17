import mongoose from 'mongoose';

const ticket = new mongoose.Schema({
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

export default mongoose.model('ticket', ticket);