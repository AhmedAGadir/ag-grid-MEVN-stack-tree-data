const express = require('express');

const app = express();

app.use(express.json());

// access environmental variables
const dotenv = require('dotenv');
dotenv.config();

const db = process.env.MONGODB_URL;

const mongoose = require('mongoose');
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('MongoDB connected database "acme"');

        // populate fileSystem collection
        const initFileSystemCollection = require('./init');
        initFileSystemCollection();
    })
    .catch(err => console.log('MongoDB connection error: ' + err));

// use routes
const fileSystem = require('./routes/api/filesystem');
app.use('/api/filesystem', fileSystem);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Express server started on port ${port}`);
})