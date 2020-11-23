const mongoose = require('mongoose');

const express = require('express');
const app = express();

// body parser 
app.use(express.json());

const db = "mongodb://localhost:27017/mydatabase1";
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('MongoDB connected database "mydatabase1"');

        // populate dndChar collection
        const initDndCharCollection = require('./init');
        initDndCharCollection();
    })
    .catch(err => console.log('Connection error: ' + err));

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`express server started on port ${port}`);
})