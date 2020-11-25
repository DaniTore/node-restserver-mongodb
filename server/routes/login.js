const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Google sign in
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    // entre llaves la condicion email del squema Usuario y BDD, sea = que body.mail
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "[Usuario] o contraseña incorrecto"
                }
            });
        }

        // Si no son iguales
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o [contraseña] incorrecto"
                }
            });
        }

        let token = createToken(usuarioDB);

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});

// Cofiguraciones de Google
let verifyToken = async(unverifyGoogleToken) => {
    const ticket = await client.verifyIdToken({
        idToken: unverifyGoogleToken,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    // console.log(payload.name);
    // console.log(payload.email);
    // console.log(payload.picture);

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verifyToken(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                let token = createToken(usuarioDB);

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });

            }
        } else {

            // Si usuarioDB no existe en la BBDD, lo registramos

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ';)';

            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = createToken(usuarioDB);

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});

module.exports = app;

let createToken = (usuarioDB) => {
    return jwt.sign({
        usuario: usuarioDB
    }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });
}