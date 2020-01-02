const router = require('express').Router();
const Controllers = require('../controllers/messages');
const Controllers_2 = require('../controllers/messages copy')
const { body } = require('express-validator/check')

router.get('/message:id', Controllers.getMessages);
router.post('/message',Controllers.postMessage)
router.post('/createContainer', Controllers_2.createContainer)
router.get('/getContainers', Controllers_2.getContainers)
router.post('/createBlob', Controllers.createBlob)
router.get('/downloadBlob', Controllers.downloadBlob)
router.post('/sent', Controllers_2.sendMessage)
router.get('/receive', Controllers.receiveMessage)

//
router.post('/post2', Controllers_2.sendMessage)
router.post('/topic', Controllers_2.sendMessageToTopics)
router.get('/getSubs', Controllers_2.getSubscription)
router.get('/cronJob', Controllers.cronJob)
router.post('/noti', Controllers.notification)








module.exports = router;