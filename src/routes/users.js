const express = require('express')
const router = express.Router()
const controller = require('../controllers/users')

router.get('/', controller.getAll)

router.get('/:userId', controller.getById)

router.post('/', controller.create)

router.patch('/:userId', controller.update)

router.delete('/:userId', controller.delete)

router.post('/:userId/change-pass', controller.changePass)

router.post('/register', controller.register)

router.post('/reset-pass', controller.resetPass)

router.post('/forgotten-pass', controller.forgottenPass)

module.exports = router