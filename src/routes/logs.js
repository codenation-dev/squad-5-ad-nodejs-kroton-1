const express = require('express')
const router = express.Router()
const controller = require('../controllers/logs')
const userToken = require('../middlewares/userToken')
const queryParams = require('../middlewares/queryParam')

router.get('/', queryParams.validate, controller.getAll)

router.get('/:logId', controller.getById)

router.post('/', userToken.validate, controller.create)

router.delete('/:logId', controller.delete)

router.post('/:logId/archive', controller.archive)

module.exports = router
