const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticket = new Schema({
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

module.exports = mongoose.model('ticket', ticket);