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
        sortModel = [],
        filterModel = {}
    } = req.query;

    [startRow, endRow] = [startRow, endRow].map(Number)

    console.log('params', { startRow, endRow, groupKeys, sortModel, filterModel });

    // note mongoose queries are NOT promises: https://mongoosejs.com/docs/queries.html#queries-are-not-promises
    let query;

    // start building aggregation pipeline for grouping and filtering 

    const aggregationPipeline = [];

    // ** grouping  ** //

    const isGrouping = groupKeys.length > 0;

    if (isGrouping) {
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

    }

    // ** filtering **

    const isFiltering = Object.keys(filterModel).length > 0;

    if (isFiltering) {

        // aggregationPipeline.push(
        //     {
        //         "$match": {
        //             "$function": function () {
        //                 return this.charClass === 'Wizard'
        //             }
        //         }
        //     }
        // )
        // query
        //     .select({
        //         charClass: 1,
        //         subClasses: 1,
        //         filterModel: filterModel

        //     })
        //     .then(docs => res.json(docs))
        // return;
        // .find({
        //     '$where': function () {
        //         return this.filterModel.charClass.values[0] === 'Bard';
        //         let values = this.filterModel.charClass.values;
        //         function doesDocContainValue(doc) {
        //             if (values.includes(doc.charClass)) {
        //                 return true;
        //             }
        //             if (!doc.hasOwnProperty('subclasses')) {
        //                 return false;
        //             }
        //             return doc.subclasses.some(doc => doesDocContainValue(doc));
        //         }

        //         return doesDocContainValue(this);
        //     }
        // })
        // .find({
        //     '$or': [
        //         { charClass: 'Warrior' },
        //         { "subclasses.charClass": "Thief" }
        //     ]
        // })
        // .aggregate([
        //     {
        //         "$project": {
        //             test: 'foo'
        //         }
        //     }
        // ])
    }

    aggregationPipeline.push({
        "$project": {
            charClass: 1,
            foo: 1,
            'isGroup': {
                '$cond': {
                    'if': {
                        '$gt': [{ '$size': '$subclasses' }, 0]
                    },
                    'then': true,
                    'else': false
                }
            }
        }
    })

    query = DndChar.aggregate(aggregationPipeline);

    // ** sorting ** 

    const isSorting = sortModel.length > 0;

    if (isSorting) {
        const sortQuery = {};
        sortModel.forEach(({ colId, sort }) => {
            sortQuery[colId] = sort;
        });
        query.sort(sortQuery);
    }

    // *** execute ***

    query
        .exec((err, result) => {
            if (err) {
                console.log('error in query', err);
                // handler error*****
            }
            res.json(result);
        })

});


// @route GET api/dndchars/values/:field
// @desc get all dnd characters
// @access Public
router.get('/values/:field', (req, res) => {

    function getValues(docs, field, values = []) {
        const subDocs = [];
        docs.forEach(record => {
            values.push(record[field]);
            subDocs.push(...record.subclasses);
        });
        if (subDocs.length === 0) {
            return values;
        } else {
            return getValues(subDocs, field, values);
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