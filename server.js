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

        // populate dndChar collection
        const initDndCharCollection = require('./init');
        initDndCharCollection();
    })
    .catch(err => console.log('MongoDB connection error: ' + err));

// use routes
const dndchars = require('./routes/api/dndchars');
app.use('/api/dndchars', dndchars);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Express server started on port ${port}`);
})