const express = require('express');

const { verificaToken, verificaAdminRol } = require('../middlewares/autentication');

let app = express();

let Categoria = require('../models/categoria');


// =================================
// Mostrar todas las CATEGORIAS
// =================================
app.get('/categorias', verificaToken, (req, res) => {

    let categoriaActiva = {
        estado: true
    };

    Categoria.find(categoriaActiva, 'nombre estado descripcion')
        .exec((err, categoriaDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments(categoriaActiva, (err, numeroCategorias) => {

                res.json({
                    ok: true,
                    categoriaDB,
                    numeroCategorias
                });
            });

        });


});

// =================================
// Mostrar una CATEGORIAS por id
// =================================
app.get('/categoria/:id', verificaToken, (req, res) => {
    let idCategoria = req.params.id;

    Categoria.find({ _id: idCategoria })
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoriaDB) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: `La Categoria ID: ${idCategoria} no existe`
                    }
                });
            }

            res.json({
                ok: true,
                categoria: categoriaDB
            });
        });
});

// =================================
// Crear una nueva CATEGORIA
// =================================
app.post('/categorias', verificaToken, (req, res) => {
    let body = req.body;
    let usuario = req.usuario;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: usuario._id
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }


        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Error al crear la categoria"
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

// =================================
// Actualizar una CATEGORIA
// =================================
app.put('/categoria/:id', [verificaToken], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let descripcionCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descripcionCategoria, { new: true, runValidators: true },
        (err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "Error al crear la categoria"
                    }
                });
            }

            res.json({
                ok: true,
                categoria: categoriaDB
            });

        });
});

// =================================
// Mostrar una CATEGORIAS por id
// =================================
app.delete('/categoria/:id', [verificaToken, verificaAdminRol], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndDelete(id, (err, categotiaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categotiaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "el id no existe"
                }
            });
        }

        res.json({
            ok: true,
            categoria: categotiaBorrada
        });
    });


    // Solo un administrador puede borrar la categoria
    // Categoria.findByIdAndRemove()

});


module.exports = app;