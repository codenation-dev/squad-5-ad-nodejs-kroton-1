const express = require('express')
const router = express.Router()
const controller = require('../controllers/users')

router.get('/', controller.getAll)

router.get('/:userId', controller.getById)

router.post('/', controller.create)

//router.post('/login', authentication.findOne)

router.patch('/:userId', controller.update)

//router.patch('/:userId/changePass', controller.update)

//router.patch('/:userId/forgottenPass', controller.update)

router.delete('/:userId', controller.delete)

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