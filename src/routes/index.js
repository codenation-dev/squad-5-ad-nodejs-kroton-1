const express = require('express')
const router = express.Router()
const users = require('./users')
const logs = require('./logs')
const applications = require('./applications')

router.get('/', (req, res) => {
  res.json({
    users: 'http://localhost:8080/v1/users',
    logs: 'http://localhost:8080/v1/logs',
    applications:'http://localhost:8080/v1/applications'
  })
})

router.use('/users', users)
router.use('/logs', logs)
router.use('/applications', applications)

module.exports = router 