'use strict'

var express = require('express');
var md_auth = require('../middleware/authenticated');
var TopicController = require('../controllers/topic');

var router = express.Router();

router.get('/topic/probando', TopicController.probando);
router.post('/topic', md_auth.authenticated, TopicController.save);
router.get('/topic/:id', TopicController.getTopic);
router.put('/topic/:id', md_auth.authenticated, TopicController.update);
router.delete('/topic/:id', md_auth.authenticated, TopicController.delete);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/topics/user/:user', TopicController.getTopicsByUser);
router.get('/search/:search', TopicController.search);

module.exports = router;