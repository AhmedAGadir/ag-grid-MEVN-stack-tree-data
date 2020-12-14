const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSystemSchema = new Schema();

// recursive references must be added like this
FileSystemSchema.add({
    folder: String,
    dateModified: Date,
    size: Number,
    subFolders: [FileSystemSchema]
});

// will create a "filesystem" collection in our db
module.exports = FileSystem = mongoose.model('filesystem', FileSystemSchema);

