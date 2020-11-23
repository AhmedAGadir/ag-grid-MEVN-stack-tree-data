var dndCharacterClasses = [
    {
        "name": "Wizard",
        "subclasses": [
            { "name": "Mage" },
            { "name": "Specialist wizard" }
        ]
    },
    {
        "name": "Priest",
        "subclasses": [
            { "name": "Cleric" },
            { "name": "Druid" },
            { "name": "Priest of specific mythos" }
        ]
    },
    {
        "name": "Warrior",
        "subclasses": [
            { "name": "Fighter" },
            { "name": "Paladin" },
            { "name": "Ranger" }
        ]
    },
    {
        "name": "Rogue",
        "subclasses": [
            { "name": "Thief" },
            { "name": "Bard" }
        ]
    },
    {
        "name": "Rogue",
        "subclasses": [
            {
                "name": "Thief",
                "subclasses": [
                    { "name": "Assassin" }
                ]
            }
        ]
    }
]

const DndChar = require('./models/dndchar');


function initDndCharCollection() {

    // first clear dndChar collection
    DndChar.collection.drop(() => {

        let promiseArr = [];

        // then populate database
        dndCharacterClasses.forEach(characterClass => {

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