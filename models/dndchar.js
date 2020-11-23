const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DndCharSchema = new Schema();

// recursive references must be added like this
DndCharSchema.add({
    charClass: String,
    subclasses: [DndCharSchema]
});

// will create a "dndChar" collection in our db
module.exports = DndChar = mongoose.model('dndChar', DndCharSchema);

