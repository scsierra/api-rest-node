'use strict'

var express = require('express');
var md_auth = require('../middleware/authenticated');
var multipart = require('connect-multiparty');
var UserController = require('../controllers/user');

var router = express.Router();
var md_upload = multipart({ uploadDir: './uploads/users' });

router.get('/probando', UserController.probando);
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/update', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, md_upload], UserController.uploadAvatar);
router.get('/avatar/:file_name', UserController.getAvatar);
router.get('/user/:id', UserController.getUser);
router.get('/users', UserController.getUsers);

module.exports = router;