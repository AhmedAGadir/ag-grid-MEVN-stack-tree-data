const FileSystem = require('./models/filesystem');


function initFileSystemCollection() {

    // first clear filesystem collection
    FileSystem.collection.drop(() => {

        // then populate database
        const data = require('./data.json');

        data.forEach(file => {
            let folder = new FileSystem(file);
            folder.save()
        });

    });

}

module.exports = initFileSystemCollection;
