const express = require('express');
const router = express.Router();
const FileSystem = require('../../models/filesystem');
const mongoose = require('mongoose');


// @route POST api/filesystem
// @desc retrieve desired rows from ag-Grid's getRows call.
// @access Public
router.post('/', (req, res) => {

    console.log('*****request', req.body.data);

    let {
        startRow,
        endRow,
        groupKeys = [],
        sortModel = [],
        filterModel = {},
        valueCols = []
    } = req.body.data;

    [startRow, endRow] = [startRow, endRow].map(Number);

    console.log('params', { startRow, endRow, groupKeys, sortModel, filterModel, valueCols });

    // note mongoose queries are NOT promises: https://mongoosejs.com/docs/queries.html#queries-are-not-promises
    let query;

    // start building aggregation pipeline for grouping, column aggregations and filtering 

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
                    'path': '$subFolders'
                }
            }, {
                '$replaceRoot': {
                    'newRoot': '$subFolders'
                }
            })
        });

    }

    // ** aggregating **

    const isAggregating = Object.keys(valueCols).length > 0;

    if (isAggregating) {

        aggregationPipeline.push({
            '$addFields': {
                'size': {
                    '$cond': {
                        'if': {
                            '$gt': [
                                {
                                    '$size': '$subFolders'
                                }, 0
                            ]
                        },
                        'then': {
                            '$function': {
                                'body': `
                                    function (subFolders) { 
                                        function getSize(subFolders) { 
                                            let total = 0; 
                                            subFolders.forEach(subFolder => { 
                                                if (subFolder.hasOwnProperty(\'size\')) { 
                                                    total += subFolder.size; 
                                                } else { 
                                                    total += getSize(subFolder.subFolders) 
                                                } 
                                            }); 
                                            return total; 
                                        } 
                                        return getSize(subFolders) 
                                    }
                                `,
                                'args': [
                                    '$subFolders'
                                ],
                                'lang': 'js'
                            }
                        },
                        'else': '$size'
                    }
                }
            }
        }
        )
    }

    // ** filtering **

    const isFiltering = Object.keys(filterModel).length > 0;

    if (isFiltering) {

        let filterValues = filterModel.folder.values;

        aggregationPipeline.push(
            {
                "$addFields": {
                    filterValues: filterValues
                }
            },
            {
                "$match": {
                    $expr: {
                        $function: {
                            body: `
                                function (filterValues, subFolders, folder) {

                                    function doesDocPassFilter(doc) {
                                        return filterValues.includes(doc.folder)
                                    }

                                    function recursivelyScanDoc(doc) {
                                        if (doesDocPassFilter(doc)) {
                                            return true;
                                        }
                                        if (!doc.hasOwnProperty('subFolders')) {
                                            return false;
                                        }
                                        return doc.subFolders.some(doc => recursivelyScanDoc(doc));
                                    }

                                    if (filterValues.length === 0) {
                                        return null
                                    }

                                    let doc = {
                                        folder,
                                        subFolders
                                    }

                                    return recursivelyScanDoc(doc);
                                }
                            `,
                            args: ["$filterValues", "$subFolders", "$folder"],
                            lang: "js"
                        }
                    }
                }
            },
            {
                "$unset": "filterValues"
            }
        )

    }

    aggregationPipeline.push({
        "$project": {
            folder: 1,
            dateModified: 1,
            size: 1,
            'isGroup': {
                '$cond': {
                    'if': {
                        '$gt': [{ '$size': '$subFolders' }, 0]
                    },
                    'then': true,
                    'else': false
                }
            }
        }
    })

    query = FileSystem.aggregate(aggregationPipeline);

    // ** sorting ** 

    const isSorting = sortModel.length > 0;

    if (isSorting) {
        const sortQuery = {};
        sortModel.forEach(({ colId, sort }) => {
            sortQuery[colId] = sort;
        });
        query
            .sort(sortQuery)
            .collation({
                locale: 'en',
                numericOrdering: true
            });
    }

    // *** execute ***

    query
        .skip(startRow)
        .limit(endRow - startRow)
        .exec((err, rows) => {
            if (err) {
                console.log('error in query', err);
                // handler error*****
            }
            let lastRowIndex = getLastRowIndex(startRow, endRow, rows);

            res.json({
                rows,
                lastRowIndex
            });
        })

    function getLastRowIndex(startRow, endRow, rows) {
        let lastRowIndex;
        if (!rows || rows.length == 0) {
            lastRowIndex = null;
        }
        var currentLastRow = startRow + rows.length;
        lastRowIndex = currentLastRow < endRow ? currentLastRow : -1;
        return lastRowIndex;
    }

});


// @route GET api/filesystem/values/:field
// @desc get all field values
// @access Public
router.get('/values/:field', (req, res) => {

    function getValues(docs, field, values = []) {
        const subDocs = [];
        docs.forEach(record => {
            values.push(record[field]);
            subDocs.push(...record.subFolders);
        });
        if (subDocs.length === 0) {
            return values;
        } else {
            return getValues(subDocs, field, values);
        }
    }

    FileSystem
        .find({})
        .exec((err, documents) => {
            if (err) {
                console.log(err);
            }
            const field = req.params.field;
            const values = getValues(documents, field);
            res.send(values);
        });
});


// @route POST api/filesystem
// @desc create a new folder
// @access Public
// router.post('/', (req, res) => {
//     console.log('*****req.body*****', req.body);
//     // const { charClass, subclasses } = req.body;

//     const newFolder = new FileSystem({ ...req.body });

//     newFolder
//         .save()
//         .then(folder => res.json(folder));
// });



// @route  DELETE api/filesystem
// @desc   Delete a folder
// @access Public 
router.delete('/:id', (req, res) => {
    FileSystem
        .findById(req.params.id)
        .then(file => {
            file
                .remove()
                .then(() => res.json({ success: true }))
                .catch(err => res.json({ success: false }));
        })
        .catch(err => res.status(404).json({ success: false }));
})


module.exports = router;