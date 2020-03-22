const express = require('express')
const router = express.Router()
const controller = require('../controllers/users')

router.get('/', controller.getAll)

router.get('/:userId', controller.getById)

router.post('/', controller.create)

router.patch('/:userId', controller.update)

router.delete('/:userId', controller.delete)

router.post('/:userId/change-pass', controller.changePass)

router.post('/register', controller.register)

router.post('/reset-pass', controller.resetPass)

router.post('/forgotten-pass', controller.forgottenPass)

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