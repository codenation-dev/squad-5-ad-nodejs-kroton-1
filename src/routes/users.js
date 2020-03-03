const express = require('express')
const router = express.Router()
const controller = require('../controllers/users')

router.get('/', controller.getAll)

router.get('/:userId', controller.getById)

router.post('/', controller.create)

router.post('/:userId', controller.getById)

router.patch('/:userId/changePass', controller.update)

router.patch('/:userId/forgottenPass', controller.update)

router.delete('/:userId', controller.delete)

module.exports = router