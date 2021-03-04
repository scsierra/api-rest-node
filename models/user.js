'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    role: String
});

//Eliminar una variable de un json publico sobre el modelo
UserSchema.methods.toJSON = function() {
    var object = this.toObject();
    delete object.password;

    return object;
}

module.exports = mongoose.model('User', UserSchema);