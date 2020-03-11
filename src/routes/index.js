const express = require('express')
const router = express.Router()
const users = require('./users')
const logs = require('./logs')

router.get('/', (req, res) => {
  const protocol = req.protocol
  const host = req.get('host')
  res.json({
    users: `${protocol}://${host}/v1/users`,
    logs: `${protocol}://${host}/v1/logs`,
  })
})

router.use('/users', users)
router.use('/logs', logs)

module.exports = router 