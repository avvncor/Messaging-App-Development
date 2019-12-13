const router = require('express').Router();
const messageController = require('../controllers/messages');
const { body } = require('express-validator/check')

router.get('/:id', messageController.getMessages);
router.post('/',[body('message').isLength({min:1}).trim()],messageController.postMessage)
router.post('/test',messageController.postTest)
router.get('/test/:id',messageController.getTest)
module.exports = router;