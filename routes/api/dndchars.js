const express = require('express');
const router = express.Router();


// DndChar Model 
const DndChar = require('../../models/dndchar');

// @route GET api/dndchars
// @desc get all dnd characters
// @access Public
router.get('/', (req, res) => {
    DndChar.find({})
        .then(dndChars => res.json(dndChars));
});

// @route POST api/dndchars
// @desc create a new dnd character
// @access Public
router.post('/', (req, res) => {
    const { name, subclasses } = req.body;

    const newChar = new DndChar({ name, subclasses });

    newChar
        .save()
        .then(dndchar => res.json(dndchar));
});

// // e.g.
// {
//     "name": "Ninja",
//     "subclasses": [
//         {
//             "name": "Kage",
//             "subclasses": [
//                 {"name": "ANBU"},
//                 {"name": "Jounin"},
//                 {"name": "Chunin"},
//                 {"name": "Genin"}
//             ]
//         }
//     ]
// }

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
                .catch(err => res.json({ success: false, error: err }));
        })
        .catch(err => res.status(404).json({ success: false }));
})


module.exports = router;