const express = require('express')
const router = express.Router()
const controller = require('../controllers/logs')

router.get('/', controller.getAll)

router.get('/:logId', controller.getById)

router.post('/', controller.create)

router.delete('/:logId', controller.delete)

router.post('/:logId/archive', controller.archive)

module.exports = router
