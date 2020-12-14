const express = require('express');
const router = express.Router();
const FileSystem = require('../../models/filesystem');
const mongoose = require('mongoose');


// @route GET api/filesystem
// @desc get all files
// @access Public
router.get('/', (req, res) => {

    let {
        startRow,
        endRow,
        groupKeys = [],
        sortModel = [],
        filterModel = {},
        valueCols = []
    } = req.query;

    [startRow, endRow] = [startRow, endRow].map(Number);

    console.log('params', { startRow, endRow, groupKeys, sortModel, filterModel });

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

    }

    // ** filtering **

    const isFiltering = Object.keys(filterModel).length > 0;

    if (isFiltering) {

        aggregationPipeline.push(
            {
                "$addFields": {
                    filterModel: filterModel
                }
            },
            {
                "$match": {
                    $expr: {
                        $function: {
                            // Object.entries ? 
                            body: `
                                function (filterModel, subFolders, ...filteredValues) {

                                    function doesDocPassFilter(doc) {
                                        const filterModelKeys = Object.keys(filterModel);
                                        return filterModelKeys.every(key => filterModel[key].values.includes(doc[key]));
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

                                    let doc = {
                                        subFolders
                                    }

                                    const filterModelKeys = Object.keys(filterModel);
                                    filterModelKeys.forEach((key, ind) => doc[key] = filteredValues[ind]);

                                    return recursivelyScanDoc(doc);
                                }
                            `,
                            args: ["$filterModel", "$subFolders", ...Object.keys(filterModel).map(key => `$${key}`)],
                            lang: "js"
                        }
                    }
                }
            },
            {
                "$unset": "filterModel"
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


// @route GET api/filesystem/values/:field
// @desc get all files
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
router.post('/', (req, res) => {
    console.log('*****req.body*****', req.body);
    // const { charClass, subclasses } = req.body;

    const newFolder = new FileSystem({ ...req.body });

    newFolder
        .save()
        .then(folder => res.json(folder));
});



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