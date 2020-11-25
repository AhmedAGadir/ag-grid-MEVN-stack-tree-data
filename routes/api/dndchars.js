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



    // groupKeys = []
    // return all root level documents

    // groupKeys = ['foo']
    // returns the sub-document subclasses array 
    // for the root element with id=foo

    // groupKeys = ['foo', 'bar']
    // returns the subclasses arr with id=bar 
    // for the array item in the subclass with='foo'

    // etc


    // find document with first id1
    // subclasses.id1 - find document with id2

    // [
    // { $match : { _id: _id1 } },
    // { $unwind : '$subclasses' },
    //  
    //
    //
    //
    //


    if (groupKeys.length === 0) {
        DndChar.find({})
            .then(documents => documents.map(doc => ({
                id: doc._id,
                charClass: doc.charClass,
                group: doc.subclasses.length > 0
            })))
            .then(result => res.json(result));
    }

    if (groupKeys.length === 1) {
        DndChar.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(groupKeys[0]) } },
            { $unwind: { path: "$subclasses" } }
        ])
            .then(documents => documents.map(doc => ({
                id: doc.subclasses._id,
                charClass: doc.subclasses.charClass,
                group: doc.subclasses.subclasses.length > 0
            })))
            .then(result => res.json(result));
    }

    if (groupKeys.length === 2) {
        DndChar.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(groupKeys[0]) } },
            { $unwind: { path: "$subclasses" } },
            { $match: { "subclasses._id": mongoose.Types.ObjectId(groupKeys[1]) } },
            { $unwind: { path: "$subclasses.subclasses" } },
        ])
            .then(documents => documents.map(doc => ({
                id: doc.subclasses.subclasses._id,
                charClass: doc.subclasses.subclasses.charClass,
                group: doc.subclasses.subclasses.subclasses.length > 0
            })))
            .then(result => res.json(result));
    }






    //
    //
    //
    //
    //
    //
    //
    // ]



    // if (groupKeys.length === 0) {
    //     DndChar.find({})
    //         .then(documents => documents.map(doc => ({
    //             charClass: doc.charClass,
    //             id: doc._id,
    //             group: doc.subclasses.length > 0
    //         })))
    //         .then(result => res.json(result));
    // }

    // if (groupKeys.length === 1) {
    //     DndChar.find({
    //         _id: groupKeys[0]
    //     })
    //         .select({
    //             subclasses: 1
    //         })
    //         .then(documents => documents[0].subclasses.map(doc => ({
    //             charClass: doc.charClass,
    //             id: doc._id,
    //             group: doc.subclasses.length > 0,
    //         })))
    //         .then(result => res.json(result));
    // }

    // if (groupKeys.length == 2) {
    //     DndChar.find({
    //         _id: groupKeys[0],
    //         'subclasses._id': groupKeys[1]
    //     })
    //         // .then(documents => documents[0].subclasses[0].subclasses.map(doc => ({
    //         //     charClass: doc.charClass,
    //         //     id: doc._id,
    //         //     group: doc.subclasses.length > 0,
    //         // })))
    //         .then(result => res.json(result));
    // }

    // if (groupKeys.length == 3) {
    //     DndChar.find({
    //         _id: groupKeys[0],
    //         'subclasses._id': groupKeys[1],
    //         // 'subclasses._id._id': groupKeys[2],
    //     })
    //         .then(documents => {

    //         })
    //         // .then(documents => documents[0].subclasses[0].subclasses.map(doc => ({
    //         //     charClass: doc.charClass,
    //         //     id: doc._id,
    //         //     group: doc.subclasses.length > 0,
    //         // })))
    //         .then(result => res.json(result));
    // }






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