'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

var secret = "clave-secreta-para-generar-el-token-9999";

exports.authenticated = function(req, res, next) {

    //Comprobar
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: 'La petición no tiene la cabecera de authorization'
        });
    }
    //Limpiar
    var token = req.headers.authorization.replace(/['"]+/g, '');
    try {
        //Decodificar
        var payload = jwt.decode(token, secret);
        //Comprobar vencimiento
        if (payload.exp <= moment.unix()) {
            return res.status(403).send({
                message: 'El token no ha expirado',
                error
            });
        }
    } catch (error) {
        return res.status(403).send({
            message: 'El token no es valido',
        });
    }
    //Adjuntar usuario
    req.user = payload;
    //Pasar la acción
    next();
}