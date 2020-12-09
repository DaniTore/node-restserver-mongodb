const express = require('express');

const { verificaToken } = require('../middlewares/autentication');
const producto = require('../models/producto');

let app = express();
let Producto = require('../models/producto');

// ===========================
// Obtener todos los productos
// ===========================
app.get('/productos', verificaToken, (req, res) => {

    let skip = parseInt(req.query.skip) || 0;

    Producto.find({ disponible: true })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .skip(skip)
        .limit(5)
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments({ disponible: true }, (err, numeroProductos) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    productosDB,
                    numeroProductos

                });
            });
        });

});

// ===========================
// Obtener un producto por id
// ===========================
app.get('/producto/:id', verificaToken, (req, res) => {
    let idProduct = req.params.id;

    console.log(idProduct.length);

    Producto.find({ _id: idProduct })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: true,
                    err: {
                        message: `La id ${idProduct} no existe`
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB

            });
        });

});

// ===========================
// Buscar producto por termino
// ===========================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i'); // 'i' insensible a mayusculas y minusculas

    producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        });
});


// ===========================
// Crear un nuevo producto
// ===========================
app.post('/producto', verificaToken, (req, res) => {
    let { nombre, precioUni, descripcion, categoria } = req.body;
    let usuario = req.usuario;

    let newProduct = new Producto({
        nombre,
        precioUni,
        descripcion,
        categoria,
        usuario
    });

    newProduct.save((err, newProductDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!newProductDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Error al crear el producto"
                }
            });
        }

        res.json({
            ok: true,
            newProducto: newProductDB
        });

    });

});

// ===========================
// Actualizar el un producto
// ===========================
app.put('/producto/:id', verificaToken, (req, res) => {
    let idProduct = req.params.id;
    let usuario = req.usuario;
    let body = req.body;

    Producto.findById(idProduct, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El Id no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;
        productoDB.usuario = usuario;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });
        });
    });
});

// ===========================
// Borrar el un producto
// ===========================
app.delete('/producto/:id', verificaToken, (req, res) => {

    let idProduct = req.params.id;

    Producto.findById(idProduct, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        productoDB.disponible = true;

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto Borrado logico'
            });

        });

    });


});

module.exports = app;