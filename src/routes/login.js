const express = require('express')
const router = express.Router()
const controller = require('../controllers/login')
const auth = require('../middlewares/auth')

router.post('/', controller.login)
router.post('/renew', auth.validate, controller.renew)

module.exports = router
