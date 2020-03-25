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

router.use((err, req, res, next) => {
    let error = (err.parent || {}).sqlMessage
    if (err.errors) {
      error = ''
      for (const i in err.errors) {
        if (error !== '') error += ', '
        error += err.errors[i].message + ''
      }
    }
    res.status(400).json({ error })    
})

module.exports = router