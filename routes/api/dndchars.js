const express = require('express');
const router = express.Router();
const DndChar = require('../../models/dndchar');
const mongoose = require('mongoose');


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


    const transformDocuments = documents => documents.map(doc => ({
        id: doc._id,
        charClass: doc.charClass,
        group: doc.subclasses.length > 0
    }));


    if (groupKeys.length === 0) {
        DndChar.find({})
            .then(documents => transformDocuments(documents))
            .then(result => res.json(result));

    } else {

        let aggregationPipeline = [];

        groupKeys.forEach(groupKey => {
            aggregationPipeline.push({
                '$match': {
                    '_id': new mongoose.Types.ObjectId(groupKey)
                }
            }, {
                '$unwind': {
                    'path': '$subclasses'
                }
            }, {
                '$replaceRoot': {
                    'newRoot': '$subclasses'
                }
            })
        });

        DndChar.aggregate(aggregationPipeline)
            .then(documents => transformDocuments(documents))
            .then(result => res.json(result));

    }

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