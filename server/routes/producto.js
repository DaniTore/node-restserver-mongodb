const express = require('express');

const { verificaToken } = require('../middlewares/autentication');

let app = express();
let Producto = require('../models/producto');

// ===========================
// Obtener todos los productos
// ===========================
app.get('/productos', verificaToken, (req, res) => {

    let productoDisponible = {
        disponible: true
    };

    let skip = parseInt(req.query.skip) || 0;

    let limit = parseInt(req.query.limit) || 1;

    Producto.find(productoDisponible)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .skip(skip)
        .limit(limit)
        .exec((err, productosDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments(productoDisponible, (err, numeroProductos) => {
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
    let { nombre, precioUni, descripcion, disponible, categoria } = req.body;

    let updateProduct = {
        nombre,
        precioUni,
        descripcion,
        disponible,
        categoria,
        usuario
    };

    Producto.findByIdAndUpdate(idProduct, updateProduct, { new: true, runValidators: true },
        (err, productoDB) => {
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
                        message: "Error al crear la categoria"
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });
    // grabar el usuario 
    // grabar una categoria del listado
});

// ===========================
// Borrar el un producto
// ===========================
app.delete('/producto/:id', verificaToken, (req, res) => {

    let idProduct = req.params.id;

    Producto.findByIdAndUpdate(idProduct, { disponible: false }, { new: true }, (err, deletedProduct) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "el id no existe"
                }
            });
        }

        res.json({
            ok: true,
            deletedProduct
        });
    });
});

module.exports = app;