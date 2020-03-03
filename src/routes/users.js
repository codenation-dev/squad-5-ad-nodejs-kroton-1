const express = require('express')
const router = express.Router()
const controller = require('../controllers/users')

router.get('/', controller.getAll)

router.get('/:userId', controller.getById)

router.post('/', controller.create)

<<<<<<< HEAD
router.pach('/:userId', controller.findOne)
=======
router.patch('/:userId', controller.getById)
>>>>>>> 29f8e7248bf0afd63c3e04503faa60cf526804a4

router.patch('/:userId/changePass', controller.update)

router.patch('/:userId/forgottenPass', controller.update)

router.delete('/:userId', controller.delete)

<<<<<<< HEAD
module.exports = router 
=======
module.exports = router
>>>>>>> 29f8e7248bf0afd63c3e04503faa60cf526804a4
