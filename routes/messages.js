const router = require('express').Router();
const Controllers = require('../controllers/messages');
const Controllers_2 = require('../controllers/blueSecures')
const { body } = require('express-validator/check')

router.get('/message:id', Controllers.getMessages);
router.post('/message',Controllers.postMessage)
router.post('/createBlob', Controllers.createBlob)
router.get('/downloadBlob', Controllers.downloadBlob)
router.get('/receive', Controllers.receiveMessage)
router.get('/cronJob', Controllers.cronJob)
router.post('/noti', Controllers.notification)
router.post('/queue', Controllers.Queue)

router.post('/cosmos', Controllers.cosmos)

// blueSecures

router.post('/sendmessage', Controllers_2.sendmessage)
router.post('/queueOptimization', Controllers_2.queueOptimization)
router.post('/cosmosDbOptimization', Controllers_2.cosmosDbOptimization)

module.exports = router;