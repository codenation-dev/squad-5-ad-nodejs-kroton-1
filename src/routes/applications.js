const express = require('express')
const router = express.Router()
const controller = require('../controllers/applications')
const notifications = require('./notifications')

router.get('/', controller.getAll)

router.get('/:appId', controller.getById)

router.post('/', controller.create)

router.patch('/:appId', controller.update)

router.delete('/:appId', controller.delete)

router.use('/:appId/notifications', controller.validateParams, controller.redirectParams, notifications)

module.exports = router