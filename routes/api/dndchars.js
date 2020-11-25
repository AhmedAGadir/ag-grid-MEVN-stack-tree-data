const express = require('express');
const router = express.Router();
const DndChar = require('../../models/dndchar');


// @route GET api/dndchars
// @desc get all dnd characters
// @access Public
router.get('/', (req, res) => {

    let {
        startRow,
        endRow,
        groupKeys = []
    } = req.query;

    startRow = parseInt(startRow);
    endRow = parseInt(endRow);

    console.log('params', { startRow, endRow, groupKeys });


    // groupkeys []
    // groupkeys ['first', 'second']

    // if groupkeys = ['5fbd..']

    // take length and startIndex into account later

    // if (groupKeys.length === 0) {
    //     // DndChar.find({ $where: "this.subclasses.length > 0" })
    //     DndChar.find({ 'subclasses.0': { $exists: true } }, { charClass: 1, _id: 1 })
    //         .then(result => res.json(result));
    // }

    // the order is also wrong
    // is it wrong to transform the data in the query 

    if (groupKeys.length === 0) {
        DndChar.find({})
            .then(documents => documents.map(doc => ({
                charClass: doc.charClass,
                id: doc._id,
                group: doc.subclasses.length > 0
            })))
            .then(result => res.json(result));
    }





    // let responseData = [];

    // function doSomething(groupKeys ) {
    //     DndChar.find({ _id: groupKey})
    //         .then(char => {

    //         })
    // }







    // if (groupKeys.length == 0) {
    //     DndChar.find(
    //         {},
    //         null,
    //         // { 
    //         //     skip: startRow, 
    //         //     limit: endRow - startRow 
    //         // }
    //     )
    //         .then(documents => res.json(documents))
    //         .catch(err => console.log(err));
    // }

    // startRow = parseInt(startRow);
    // endRow = parseInt(endRow);

    // DndChar
    //     .find({})
    //     .skip(startRow)
    //     .limit(endRow)
    //     .then(dndChars => res.json(dndChars));
});



// @route POST api/dndchars
// @desc create a new dnd character
// @access Public
router.post('/', (req, res) => {
    const { charClass, subclasses } = req.body;

    const newChar = new DndChar({ charClass, subclasses });

    newChar
        .save()
        .then(dndchar => res.json(dndchar));
});



// @route  DELETE api/dndchars
// @desc   Delete a dnd character
// @access Public 
router.delete('/:id', (req, res) => {
    DndChar
        .findById(req.params.id)
        .then(dndchar => {
            dndchar
                .remove()
                .then(() => res.json({ success: true }))
                .catch(err => res.json({ success: false }));
        })
        .catch(err => res.status(404).json({ success: false }));
})


module.exports = router;