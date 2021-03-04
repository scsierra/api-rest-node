'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {

    add: function(req, res) {
        //Recoger id
        var topicId = req.params.topicId;
        //Buscar id 
        Topic.findById(topicId).exec((err, topic) => {
            //Devolver respuesta
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }
            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontro tema para actualizar'
                });
            }
            //Comprobar objeto y validar
            if (req.body.content) {
                try {
                    var validate_content = !validator.isEmpty(req.body.content);
                } catch (error) {
                    return res.status(200).send({
                        status: 'error',
                        message: 'Falta comentario'
                    });
                }
            }
            if (validate_content) {
                var comment = {
                    user: req.user.sub,
                    content: req.body.content
                };
                //Hacer push
                topic.comments.push(comment);
                //Devolver respuesta
                topic.save((err, topic) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al guardar'
                        });
                    }
                    Topic.findById(topic._id).populate('user').populate('comments.user').exec((err, topic) => {
                        if (topic) {
                            return res.status(200).send({
                                status: 'success',
                                topic
                            });
                        }
                    });
                });
            } else {
                return res.status(200).send({
                    status: 'error',
                    message: 'Falta comprobacion de datos'
                });
            }
        });
    },

    update: function(req, res) {
        //Conseguir id 
        var commentId = req.params.commentId;
        //Recoger datos
        var params = req.body;
        //Validar
        try {
            var validate_content = !validator.isEmpty(params.content);
        } catch (error) {
            return res.status(200).send({
                status: 'error',
                message: 'Falta comentario'
            });
        }
        if (validate_content) {
            //Buscar y actualizar
            Topic.findOneAndUpdate({ "comments._id": commentId }, {
                "$set": {
                    "comments.$.content": params.content
                }
            }, { new: true }, (err, topicUpdate) => {
                //Devolver respuesta
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }
                if (!topicUpdate) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se encontro tema para actualizar'
                    });
                }
                if (topicUpdate) {
                    return res.status(200).send({
                        status: 'success',
                        topicUpdate
                    });
                }
            });
        }
    },

    delete: function(req, res) {
        //Sacar id
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;
        //Buscar topic
        Topic.findById(topicId, (err, topic) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }
            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el tema'
                });
            }
            //Seleccionar comment
            var comment = topic.comments.id(commentId);
            //Borrar comment
            if (comment) {
                comment.remove();
                //Guardar topic
                topic.save((err, topic) => {
                    //Devolver respuesta
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error en el guardado'
                        });
                    }
                    Topic.findById(topic._id).populate('user').populate('comments.user').exec((err, topic) => {

                        if (topic) {
                            return res.status(200).send({
                                status: 'success',
                                topic
                            });
                        }
                    });
                });
            } else {

            }
        });
    }

};

module.exports = controller;