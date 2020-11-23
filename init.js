const DndChar = require('./models/dndchar');

function initDndCharCollection() {

    // first clear dndChar collection
    DndChar.collection.drop(() => {

        // then populate database
        const data = require('./data.json');
        data.forEach(characterClass => {
            let char = new DndChar(characterClass);
            char.save()
        });

    });

}


module.exports = initDndCharCollection;
