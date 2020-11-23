const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRol } = require('../middlewares/autentication');

const app = express();

// conseguir datos
app.get('/usuario', verificaToken, (req, res) => {

        let usuarioActivo = {
            estado: true
        }

        let desde = req.query.desde || 0;
        desde = Number(desde);

        let limite = req.query.limite || 5;
        limite = Number(limite);

        // entre {} se pone la condiccion de busqueda
        // dentro del find ' ' se dice los parámetros que quieres que devuelva
        Usuario.find(usuarioActivo, 'nombre email estado')
            .skip(desde)
            .limit(limite)
            //ejecutalo
            .exec((err, usuarios) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                Usuario.countDocuments(usuarioActivo, (err, numeroUsuarios) => {

                    res.json({
                        ok: true,
                        usuarios,
                        numeroUsuarios
                    })
                });

            })
    }

);

// crear datos
app.post('/usuario', [verificaToken, verificaAdminRol], (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        rol: body.rol
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

// Actualizar datos
app.put('/usuario/:id', [verificaToken, verificaAdminRol], (req, res) => {
    let id = req.params.id;

    // selecciona los valores dentro del body que se van a poder actualizar
    let body = _.pick(req.body, ['nombre', 'email', 'password', 'img', 'rol', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })


});

// delete
app.delete('/usuario/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let borradoLogico = {
        estado: false,
        deleteAt: Date.now()
    }

    // Usuario.findByIdAndRemove(id, borradoLogico, { new: true }, (err, usuarioBorrado) => {


    Usuario.findByIdAndUpdate(id, borradoLogico, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario no encontrado"
                }
            })
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
});

module.exports = app;