'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3000;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', { useNewUrlParser: true })
    .then(() => {
        console.log('La conexion ha la base de datos de mongo se ha realizado');

        app.listen(port, () => {
            console.log('El servidor esta corriendo perfectamente')
        });
    })
    .catch(error => console.log(error));