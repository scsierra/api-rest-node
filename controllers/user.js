'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');
var User = require('../models/user');
const user = require('../models/user');

var controller = {

    probando: function(req, res) {
        return res.status(200).send({
            message: "Soy el metodo probando"
        });
    },

    save: function(req, res) {
        //Recoger parametros
        var params = req.body;
        //Validar datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: "Faltan datos"
            });
        }
        //console.log(validate_email, validate_name, validate_surname, validate_password);
        if (validate_name && validate_surname && validate_email && validate_password) {
            //Crear objeto
            var user = new User();
            //Asignar valores
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;
            //Comprobar existencia
            User.findOne({ email: user.email }, (err, issetUser) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: "Error en la comprobación del usuario"
                    });
                }
                if (!issetUser) {
                    //Cifrado de contraseña
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;

                        user.save((err, userStored) => {
                            if (err) {
                                return res.status(500).send({
                                    status: 'error',
                                    message: "Error al guardar el usuario"
                                });
                            }
                            if (!userStored) {
                                return res.status(500).send({
                                    status: 'error',
                                    message: "No se guardo el usuario"
                                });
                            }
                            if (userStored) {
                                return res.status(200).send({
                                    status: 'success',
                                    user: userStored
                                });
                            }
                        });
                    });
                } else {
                    return res.status(200).send({
                        status: 'error',
                        message: "El usuario esta registrado"
                    });
                }
            });

        } else {
            return res.status(200).send({
                status: 'success',
                message: "Validación de datos incorrecta, verifiquelos",
                params
            });
        }
    },

    login: function(req, res) {
        //Recoger parametros
        var params = req.body;
        //Validar parametros
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: "Faltan datos"
            });
        }
        if (validate_email && validate_password) {
            //Buscar 
            User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al intentar identificarse'
                    });
                }
                if (!user) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se encontro el usuario, verifiquelos'
                    });
                }
                if (user) {
                    //Comprobar campos
                    bcrypt.compare(params.password, user.password, (err, check) => {
                        if (check) {
                            //Generar token
                            if (params.getToken) {
                                return res.status(200).send({
                                    token: jwt.createToken(user)
                                });
                            }
                            //Eliminar campos
                            user.password = undefined;
                            //Devolver respuesta
                            return res.status(200).send({
                                status: 'success',
                                user
                            });
                        } else {
                            return res.status(404).send({
                                status: 'error',
                                message: 'Error en las credenciales, verifique'
                            });
                        }
                    });
                }
            });
        } else {
            return res.status(500).send({
                status: 'error',
                message: 'Error en los datos, verifiquelos'
            });
        }
    },

    update: function(req, res) {
        //Recoger datos
        var params = req.body;
        //Validar datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos'
            });
        }
        //Eliminar propiedades innecesarias
        delete params.password;

        //Comprobar si el email es unico
        if (req.user.email != params.email) {
            User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al intentar identificarse'
                    });
                }
                if (user && user.email == params.email) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El correo electronico no puede ser modificado'
                    });
                } else {
                    //Buscar y actualizar
                    var userId = req.user.sub;

                    User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdate) => {
                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar el usuario'
                            });
                        }
                        if (!userUpdate) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'No se ha actualizado el usuario'
                            });
                        }
                        if (userUpdate) {
                            return res.status(200).send({
                                status: 'success',
                                userUpdate
                            });
                        }
                    });
                }
            });
        } else {
            //Buscar y actualizar
            var userId = req.user.sub;

            User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdate) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar el usuario'
                    });
                }
                if (!userUpdate) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se ha actualizado el usuario'
                    });
                }
                if (userUpdate) {
                    return res.status(200).send({
                        status: 'success',
                        userUpdate
                    });
                }
            });
        }
    },

    uploadAvatar: function(req, res) {
        //Recoger el fichero
        var file_name = 'Avatar no subido';
        if (req.files) {
            //Conseguir nombre y extension del fichero
            var file_path = req.files.file0.path;
            var file_split = file_path.split('\\');
            file_name = file_split[2];
            //Comprobar extension
            var ext_split = file_name.split('\.');
            var file_ext = ext_split[1];
            if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif' && file_ext != 'PNG' && file_ext != 'JPG' && file_ext != 'JPEG' && file_ext != 'GIF') {
                fs.unlink(file_path, (err) => {
                    if (err) {
                        return res.status(404).send({
                            status: 'error',
                            message: 'No se encuentra el archivo, error en la extension'
                        });
                    } else {
                        return res.status(200).send({
                            status: 'error',
                            message: 'La extension del archivo no es valida',
                            file_ext
                        });
                    }
                });
            } else {
                //Sacar el id del usuario
                var userId = req.user.sub;
                //Buscar y actualizar
                User.findByIdAndUpdate({ _id: userId }, { image: file_name }, { new: true }, (err, userUpdate) => {
                    //Devolver respuesta
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al subir la imagen'
                        });
                    }
                    if (userUpdate) {
                        return res.status(200).send({
                            status: 'success',
                            user: userUpdate,
                        });
                    }
                })

            }
        } else {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }
    },

    getAvatar: function(req, res) {
        var file_name = req.params.file_name;
        var path_file = './uploads/users/' + file_name;

        fs.exists(path_file, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe'
                });
            }
        });
    },

    getUser: function(req, res) {
        var userId = req.params.id;

        User.findById(userId).exec((err, user) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la busqueda'
                });
            }
            if (!user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el usuario'
                });
            }
            return res.status(200).send({
                status: 'success',
                user
            });
        });
    },

    getUsers: function(req, res) {
        User.find().exec((err, users) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la busqueda'
                });
            }
            if (!users) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                });
            }
            return res.status(200).send({
                status: 'success',
                users
            });
        });
    }

};

module.exports = controller;