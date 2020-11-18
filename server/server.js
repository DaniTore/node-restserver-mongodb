require('./config/config')

const express = require('express');

const bodyParser = require('body-parser');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// conseguir datos
app.get('/usuario', function(req, res) {
    res.json('get usuario');
});

// crear datos
app.post('/usuario', function(req, res) {
    let body = req.body;
    if (req.body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: "El nombre es necesario"
        })
    } else {

        res.json({ persona: body });
    }
});

// Actualizar datos
app.put('/usuario/:id', function(req, res) {
    let id = req.params.id
    res.json({
        id
    });
});

// delete
app.delete('/usuario', function(req, res) {
    res.json('delete usuario');
});


app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto: ', process.env.PORT);
})