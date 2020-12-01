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
        sortModel = []
    } = req.query;

    [startRow, endRow] = [startRow, endRow].map(Number)

    console.log('params', { startRow, endRow, groupKeys, sortModel });

    // note mongoose queries are NOT promises: https://mongoosejs.com/docs/queries.html#queries-are-not-promises
    let query;

    // ** grouping  ** //

    const groupingProjection = {
        'charClass': 1,
        'isGroup': {
            '$cond': {
                'if': {
                    '$gt': [{ '$size': '$subclasses' }, 0]
                },
                'then': true,
                'else': false
            }
        }
    };

    if (groupKeys.length > 0) {

        // return sub-documents for correct group
        const aggregationPipeline = [];

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
            '$project': groupingProjection
        });

        query = DndChar.aggregate(aggregationPipeline);

    } else {
        // return all root level documents 
        query = DndChar.find({}, groupingProjection);
    }

    // ** filtering **

    // query = query.find({ charClass: 'Wizard' })

    // ** sorting ** 

    const sortingApplied = sortModel.length > 0;

    if (sortingApplied) {
        const sortQuery = {};
        sortModel.forEach(({ colId, sort }) => {
            sortQuery[colId] = sort;
        });
        query.sort(sortQuery);
    }

    // ** execute query ** 

    query.exec((err, result) => {
        if (err) {
            console.log('error in query', error);
            // handler error*****
        }
        res.json(result);
    })

});


// @route GET api/dndchars/values/:field
// @desc get all dnd characters
// @access Public
router.get('/values/:field', (req, res) => {

    function getValues(arr, field, values = []) {
        const subArr = [];
        arr.forEach(item => {
            values.push(item[field]);
            subArr.push(...item.subclasses);
        });
        if (subArr.length === 0) {
            return values;
        } else {
            return getValues(subArr, field, values);
        }
    }

    DndChar
        .find({})
        .then(documents => {
            const field = req.params.field;
            const values = getValues(documents, field);
            res.send(values);
        });
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