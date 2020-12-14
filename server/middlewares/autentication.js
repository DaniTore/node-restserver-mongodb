/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');

//=========================
// Verifica Token
//=========================

let verificaToken = (req, res, next) => {

    // Pilla el token del header
    let token = req.get('token');

    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        // idica que usuario hace la petición, se puede usar en la petición.
        req.usuario = decoded.usuario;

        next();

    });

};

//=========================
// Verifica Admin
//=========================

let verificaAdminRol = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.rol === 'ADMIN_ROL') {
        next();

    } else {
        return res.status(403).json({
            ok: false,
            err: {
                message: 'Rol no valido'
            }
        });
    }

};

//=========================
// Verifica Token Img
//=========================
let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        // idica que usuario hace la petición, se puede usar en la petición.
        req.usuario = decoded.usuario;

        next();

    });
};


module.exports = {
    verificaToken,
    verificaAdminRol,
    verificaTokenImg
};