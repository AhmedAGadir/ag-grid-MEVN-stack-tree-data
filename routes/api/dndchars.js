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
        groupKeys = [],
        sortModel
    } = req.query;

    startRow = parseInt(startRow);
    endRow = parseInt(endRow);

    console.log('params', { startRow, endRow, groupKeys, sortModel });

    // ** ensure order 
    // account for start and endRows -- .skip() and .limit()




    let query;

    // ** add grouping to query  ** //

    let transformDocumentsProjection = {
        'charClass': 1,
        'group': {
            '$cond': {
                'if': {
                    '$gt': [{ '$size': '$subclasses' }, 0]
                },
                'then': true,
                'else': false
            }
        }
    }

    if (groupKeys.length > 0) {

        // return sub-documents for appropriate group
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

        aggregationPipeline.push({
            '$project': transformDocumentsProjection
        });

        query = DndChar.aggregate(aggregationPipeline);


    } else {

        // return root level documents 
        query = DndChar.find({}, transformDocumentsProjection);

    }


    // ** execute query ** 

    query
        .then(result => res.json(result));

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