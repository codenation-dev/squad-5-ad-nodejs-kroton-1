const express = require('express')
const router = express.Router()
const users = require('./users')
const logs = require('./logs')

router.get('/', (req, res) => {
  res.json({
    users: 'http://localhost:8080/v1/users',
    logs: 'http://localhost:8080/v1/logs'
  })
})

router.use('/users', users)
router.use('/logs', logs)

<<<<<<< HEAD
module.exports = router 
=======
module.exports = router
>>>>>>> 29f8e7248bf0afd63c3e04503faa60cf526804a4
