const express = require('express');

const app = express();

app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./categoria.js'));
app.use(require('./producto.js'));
app.use(require('./upload.js'));
app.use(require('./imagenes.js'));

module.exports = app;