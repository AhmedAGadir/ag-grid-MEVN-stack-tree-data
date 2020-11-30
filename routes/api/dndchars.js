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

    let transformDocumentsProjection = {
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
    }

    if (groupKeys.length > 0) {

        // return sub-documents for correct group
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
        // return all root level documents 
        query = DndChar.find({}, transformDocumentsProjection);
    }


    // ** filtering **

    // query = query.find({ charClass: 'Wizard' })


    // ** sorting ** 

    let sortingApplied = sortModel.length > 0

    if (sortingApplied) {
        let sortQuery = {};
        sortModel.forEach(({ colId, sort }) => {
            sortQuery[colId] = sort;
        });
        query.sort(sortQuery)
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
    console.log('req.params.field', req.params.field);

    // we could simply request all of the data using DndChar.find({})
    // and then transform the response here
    // but were going to do this using a query as a mongodb learning exercise

    function getValues(field, cb, count = 0) {
        let aggregationPipeline = [];

        aggregationPipeline.push(
            {
                '$group': {
                    _id: null,
                    valuesToConcat: { "$addToSet": `$${field}` },
                    subclasses: { "$addToSet": "$subclasses" }
                },
            },
            {
                "$project": {
                    values: { $concatArrays: [[], "$valuesToConcat"] },
                    subclasses: {
                        $reduce: {
                            input: "$subclasses",
                            initialValue: [],
                            in: { $concatArrays: ["$$value", "$$this"] }
                        }
                    }
                }
            }
        );

        if (count > 0) {

            for (let i = 0; i < count; i++) {
                aggregationPipeline.push(
                    {
                        '$unwind': {
                            'path': '$subclasses'
                        }
                    },
                    {
                        '$project': {
                            _id: 0,
                            values: 1,
                            value: `$subclasses.${field}`,
                            subclasses: '$subclasses.subclasses'
                        }
                    },
                    {
                        "$group": {
                            _id: null,
                            values: { "$first": "$values" },
                            valuesToConcat: { "$addToSet": "$value" },
                            subclasses: { "$addToSet": "$subclasses" }
                        }
                    },
                    {
                        "$project": {
                            values: { $concatArrays: ["$values", "$valuesToConcat"] },
                            subclasses: {
                                $reduce: {
                                    input: "$subclasses",
                                    initialValue: [],
                                    in: { $concatArrays: ["$$value", "$$this"] }
                                }
                            }
                        }
                    }
                )
            }
        }

        DndChar
            .aggregate(aggregationPipeline)
            .then((documents) => {
                let document = documents[0];
                let allValuesRetrieved = document.subclasses.length === 0;

                if (allValuesRetrieved) {
                    cb(document.values);
                } else {
                    count++
                    getValues(field, cb, count);
                }
            })
    }


    let field = req.params.field;

    if (field === 'charclass') {
        field = 'charClass';
    }

    const callback = values => {
        res.send(values);
    }

    getValues(field, callback);
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