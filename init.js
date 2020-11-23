
const DndChar = require('./models/dndchar');


function initDndCharCollection() {

    // first clear dndChar collection
    DndChar.collection.drop(() => {

        let promiseArr = [];

        // then populate database
        const data = require('./data.json');

        data.forEach(characterClass => {

            let char = new DndChar(characterClass);

            promiseArr.push(char.save())

        });

        Promise.all(promiseArr)
            .then((result) => {
                console.log('"dndchar" collection initialized');
            })

    });

}

module.exports = initDndCharCollection;