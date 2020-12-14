/* eslint-disable no-undef */
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/uploads/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    console.log('tipo', tipo);
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningun archivo'
                }
            });
    }

    // Validad tipo

    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos validos son:   ' + tiposValidos.join(', ')
            }
        });
    }

    let archivo = req.files.archivo;
    let nombreYExtension = archivo.name.split('.');
    let extensionArchivo = nombreYExtension[nombreYExtension.length - 1];

    console.log(extensionArchivo);

    // Extesiones permitidas
    let extensionesValidad = ['png', 'jpg', 'gif', 'jpeg'];

    // si la extensión no es valida devuelve un error
    if (extensionesValidad.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: true,
            extension: extensionArchivo,
            err: {
                message: 'Las extensiones validas son ' + extensionesValidad.join(', ')
            }
        });
    }

    // Cambiar el nombre del archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {

        console.log(`uploads/${tipo}/${nombreArchivo}`);
        if (err)
            return res.status(500)
                .json({
                    ok: false,
                    err
                });

        if (tipo === 'usuarios') {
            guardarImagenUsuario(id, res, nombreArchivo);
        }

        if (tipo === 'productos') {
            guardarImagenProducto(id, res, nombreArchivo);
        }

    });
});


function guardarImagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {

            borrarArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {

            borrarArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            if (err) throw err;

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });

        });

    });

}

function guardarImagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: true,
                err
            });
        }

        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: true,
                err: {
                    message: 'Producto no existe'
                }
            });

        }

        // Si el producto existe borra la img almacenada
        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            if (err) throw err;

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });

    });
}

module.exports = app;

function borrarArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    //si existe exite una imagen previa guardada la borra.
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}