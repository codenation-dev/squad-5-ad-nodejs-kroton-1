const express = require('express')
const router = express.Router()
const controller = require('../controllers/notifications')
const triggers = require('./notificationsTriggers')
const alerts = require('./notificationsAlerts')

router.get('/', controller.getAll)

router.get('/:notificationId', controller.getById)

router.post('/', controller.create)

router.patch('/:notificationId', controller.update)

router.delete('/:notificationId', controller.delete)

router.use('/:notificationId/triggers', controller.validateParams, controller.redirectParams, triggers)
router.use('/:notificationId/alerts', controller.validateParams, controller.redirectParams, alerts)

module.exports = router