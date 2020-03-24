const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const login = require('./login')
const users = require('./users')
const logs = require('./logs')
const applications = require('./applications')

router.get('/', (req, res) => {
  const protocol = req.protocol
  const host = req.get('host')
  res.json({
    login: `${protocol}://${host}/v1/login`,
    users: `${protocol}://${host}/v1/users`,
    logs: `${protocol}://${host}/v1/logs`,
    applications:`${protocol}://v1/applications`
  })
})

router.use('/login', login)
router.use('/users', auth.validate, auth.isAdmin, users)
router.use('/logs', auth.validate, logs)
router.use('/applications', auth.validate, applications)

module.exports = router 