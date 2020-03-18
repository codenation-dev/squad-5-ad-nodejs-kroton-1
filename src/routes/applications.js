const express = require('express')
const router = express.Router()
const controller = require('../controllers/applications')

router.get('/', controller.getAll)

router.get('/:appId', controller.getById)

router.post('/', controller.create)

router.patch('/:appId', controller.update)

router.delete('/:appId', controller.delete)

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