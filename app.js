'use strict'

//requires
var express = require('express');
var bodyParse = require('body-parser');
const { urlencoded } = require('body-parser');
//execute express
var app = express();
//load route files
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
var comment_routes = require('./routes/comment');
//add middleware
app.use(bodyParse.urlencoded({ extended: false }));
app.use(bodyParse.json());
//configuration CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
//rewritable routes
app.use('/api', user_routes);
app.use('/api', topic_routes);
app.use('/api', comment_routes);
//export module
module.exports = app;