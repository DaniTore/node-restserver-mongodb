require('./config/config')

const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Routas
app.use(require('./routes/usuario'));


// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useUnifiedTopology', true);

const mongooseConfig = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}

mongoose.connect(process.env.URLDB, mongooseConfig,
    (err, res) => {
        if (err) throw err;
        console.log('--> Base de datos ONLINE');
    })

app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto: ', process.env.PORT);
})