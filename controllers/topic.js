'use strict'

var validator = require('validator');
const topic = require('../models/topic');
const { populate } = require('../models/topic');
var Topic = require('../models/topic');

var controller = {

    probando: function(req, res) {
        return res.status(200).send({
            message: 'Soy el metodo probando'
        });
    },

    save: function(req, res) {
        //Recoger parametros
        var params = req.body;
        //Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        } catch (error) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }
        if (validate_title && validate_content && validate_lang) {
            //Crear objeto
            var topic = new Topic();
            //Asignar valores
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;
            //Guardar
            topic.save((err, topicStored) => {
                //Devolver respuesta
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en el guardado de datos, verifique los datos'
                    });
                }
                if (!topicStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'Error en los datos, verifiquelos'
                    });
                }
                if (topicStored) {
                    return res.status(200).send({
                        status: 'succes',
                        topicStored
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

    getTopics: function(req, res) {
        //Recoger la pagina actual
        var page = parseInt(req.params.page);
        if (!page || page == null || page == undefined || page == 0) {
            page = 1;
        }
        //Indicar opciones de paginación
        var options = {
            sort: { date: -1 },
            populate: 'user',
            limit: 5,
            page: page
        };
        //Buscar paginado
        Topic.paginate({}, options, (err, topics) => {
            //Devolver respuesta
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la busqueda'
                });
            }
            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'Error en los datos'
                });
            }
            if (topics) {
                return res.status(200).send({
                    status: 'success',
                    topics: topics.docs,
                    totalDocs: topics.totalDocs,
                    totalPages: topics.totalPages
                });
            }
        });
    },

    getTopicsByUser: function(req, res) {
        //Conseguir id usuario
        var userId = req.params.user;
        //Buscar con la condicion del id
        Topic.find({ user: userId }).sort([
            ['date', 'descending']
        ]).exec((err, topics) => {
            //Devolver respuesta
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }
            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas para mostrar'
                });
            }
            if (topics) {
                return res.status(200).send({
                    status: 'success',
                    topics
                });
            }
        });
    },

    getTopic: function(req, res) {
        //Sacar id de req
        var topicId = req.params.id;
        //Buscar id del topic
        Topic.findById(topicId).populate('user').populate('comments.user').exec((err, topic) => {
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
                    message: 'No hay temas para mostrar'
                });
            }
            if (topic) {
                return res.status(200).send({
                    status: 'success',
                    topic
                });
            }
        });
    },

    update: function(req, res) {
        //Sacar id topic
        var topicId = req.params.id;
        //Recoger parametros
        var params = req.body;
        //Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        } catch (error) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }
        if (validate_title && validate_content && validate_lang) {
            //Crear json
            var update = {
                title: params.title,
                content: params.content,
                lang: params.lang,
                code: params.code
            };
            //Buscar y actualizar de topic
            Topic.findOneAndUpdate({ _id: topicId, user: req.user.sub }, update, { new: true }, (err, topic) => {
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
                if (topic) {
                    return res.status(200).send({
                        status: 'success',
                        topic
                    });
                }
            });

        } else {
            return res.status(500).send({
                status: 'error',
                message: 'Error en la comprobacion de los datos'
            });
        }
    },

    delete: function(req, res) {
        //Sacar id topic
        var topicId = req.params.id;
        //Buscar y borrar por id
        Topic.findOneAndDelete({ _id: topicId, user: req.user.sub }, (err, topicRemoved) => {
            //Devolver respuesta
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }
            if (!topicRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontro tema para eliminar'
                });
            }
            if (topicRemoved) {
                return res.status(200).send({
                    status: 'success',
                    topic: topicRemoved
                });
            }
        });
    },

    search: function(req, res) {
        //Sacar string
        var searchString = req.params.search;
        //Buscar con operador or
        Topic.find({
            "$or": [
                { "title": { "$regex": searchString, "$options": "i" } },
                { "content": { "$regex": searchString, "$options": "i" } },
                { "code": { "$regex": searchString, "$options": "i" } },
                { "lang": { "$regex": searchString, "$options": "i" } },
            ]
        }).populate('user').exec((err, topic) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }
            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas disponibles'
                });
            }
            if (topic) {
                return res.status(200).send({
                    status: 'success',
                    topic
                });
            }
        });
        //Devolver el resultado

    }

};

module.exports = controller;