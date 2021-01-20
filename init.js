const FileSystem = require('./models/filesystem');

function initFileSystemCollection() {

    // first clear filesystem collection
    FileSystem.collection.drop(() => {

        // then populate database
        // const data = require('./data.json');

        let data = repeatData(require('./data.json'), 20)

        data.forEach(file => {
            let folder = new FileSystem(file);
            folder.save()
        });

    });

}

function repeatData(data, n) {
    let result = [];
    for (let i = 1; i <= n; i++) {
        let copiedRow = copyRows(i, data);
        result.push(...copiedRow);
    };
    return result;
}


function copyRows(i, data) {
    return data.map(record => {
        let [name, ext] = record.folder.split('.');

        let folder = ext ?
            `${name} ${i}.${ext}` :
            `${name} ${i}`;

        let newRecord = {
            ...record,
            folder,
        };

        if (record.hasOwnProperty('subFolders')) {
            newRecord.subFolders = copyRows(i, record.subFolders)
        }
        return newRecord
    })
}


module.exports = initFileSystemCollection;
