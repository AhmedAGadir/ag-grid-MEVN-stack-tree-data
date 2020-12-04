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

    // if (Object.keys(filterModel).length > 0) {
    //     console.log('filtering...')
    //     DndChar
    //         .find({})
    //         .lean()
    //         .then(documents => {
    //             // filterModel: { charClass: { values: [Array], filterType: 'set' } }
    //             //     { 
    //             //         charClass: { 
    //             //             values: ['mage'],
    //             //             filterType: 'set'
    //             //         },
    //             //         [...]
    //             //     }

    //             let result = [];

    //             function filterModelIncludes(value) {
    //                 return filterModel.charClass.values.includes(value);
    //             }

    //             function checkDocuments(docs) {
    //                 docs.forEach(doc => {
    //                     console.log('filterincludsesdoc', doc.charClass, filterModelIncludes(doc.charClass));
    //                     if (filterModelIncludes(doc.charClass)) {
    //                         result.push({ ...doc });
    //                     }
    //                     if (doc.subclasses.length > 0) {
    //                         doc.subclasses.forEach(subDoc => {
    //                             // see if i can do this with query too
    //                             // replaceroot add reference to current 
    //                             subDoc.parent = doc;
    //                         });
    //                         checkDocuments(doc.subclasses);
    //                     }
    //                 });
    //             };

    //             checkDocuments(documents);

    //             console.log('result', result)

    //             let finalResult = [];

    //             result.forEach(doc => {
    //                 while (doc) {
    //                     finalResult.unshift({
    //                         _id: doc._id,
    //                         charClass: doc.charClass,
    //                         isGroup: doc.subclasses.length > 0
    //                     });
    //                     doc = doc.parent;
    //                 }
    //             })


    //             console.log('final result', finalResult);
    //             res.json(finalResult);
    //             return;
    //         })
    // }



    // note mongoose queries are NOT promises: https://mongoosejs.com/docs/queries.html#queries-are-not-promises
    let query;

    // ** grouping  ** //

    const isGrouping = groupKeys.length > 0;

    if (isGrouping) {
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

        query = DndChar.aggregate(aggregationPipeline);

    } else {
        // return root level documents 
        query = DndChar.find({});
    }

    // ** filtering **

    const isFiltering = Object.keys(filterModel).length > 0;

    if (isFiltering) {
        query
            .select({
                charClass: 1,
                subClasses: 1,
                filterModel: filterModel
            })
            .find({
                '$where': function () {
                    let values = this.filterModel.charClass.values;
                    function doesDocContainValue(doc) {
                        if (values.includes(doc.charClass)) {
                            return true;
                        }
                        if (!doc.hasOwnProperty('subclasses')) {
                            return false;
                        }
                        return doc.subclasses.some(doc => doesDocContainValue(doc));
                    }

                    return doesDocContainValue(this);
                }
            })
    }

    // ** sorting ** 

    const isSorting = sortModel.length > 0;

    if (isSorting) {
        const sortQuery = {};
        sortModel.forEach(({ colId, sort }) => {
            sortQuery[colId] = sort;
        });
        query.sort(sortQuery);
    }

    // *** project and execute ***

    query
        .select({
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
        })
        // .lean()
        .exec((err, result) => {
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