const express = require('express')
const router = express.Router()
const controller = require('../controllers/logs')
const appToken = require('../middlewares/appToken')
const queryParams = require('../middlewares/queryParam')

router.get('/', queryParams.validate, controller.getAll)

router.get('/:logId', controller.getById)

router.post('/', appToken.validate, controller.create)

router.delete('/:logId', controller.delete)

router.post('/:logId/archive', controller.archive)

module.exports = router
