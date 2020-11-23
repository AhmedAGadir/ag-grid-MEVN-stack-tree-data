const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NarutoCharSchema = new Schema({
    name: String,
    rank: String
});

// will create a "narutochar" collection in our db
module.exports = NarutoChar = mongoose.model('narutochar', NarutoCharSchema);