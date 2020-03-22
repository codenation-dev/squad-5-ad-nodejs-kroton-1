const model = require('../models/users')
const md5 = require('md5')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')

let Users = {}

Users.getAll = async (req, res, next) => {
  try {
    const data = await model.findAll({
      attributes: ['id', 'name', 'email', 'admin', 'createdAt', 'updatedAt']
    })
    
    res.status(200).json({
      total: data.length,
      data    
    })
  } catch(e) {
    next(e)
  }
}

Users.getById = async (req, res, next) => {
  try {
    const id = req.params.userId
    const user = await getUserById(id)
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ error: `The user id ${id} couldn't be found.` })
    }
  } catch(e) {
    next(e)
  }    
}

Users.create = async (req, res, next) => {
  let { name, email, admin = false, password = '' } = req.body

  if (password === '') {
    return res.status(400).json({ error: 'The password field cannot be empty' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'The password field must be at least 8 characters' })
  }

  password = md5(password)
  
  try {
    const user = await model.create({ name, email, admin, password, token })
    res.status(201).json(user)
  } catch(e) {
    next(e)
  }
}

Users.update = async (req, res, next) => {
  const id = req.params.userId
  const user = await getUserById(id)

  if (user) {
    if ((!req.user.admin) && (user.id !== req.user.id)) {
      return res.status(403).json({ error: `You don't have access to this feature` })
    }

    const { password } = req.body

    if (password !== undefined) {
      if (password === '') {
        return res.status(400).json({ error: 'The password field cannot be empty'})
      }
      
      if (password.length < 8) {
        return res.status(400).json({ error: 'The password field must be at least 8 characters' })
      }  
    }

    for (const prop in req.body) {
      if (user[prop]) {
        user[prop] = req.body[prop]
      }
    }
    try {
      await user.save()
      return res.status(200).json(user)
    } catch(e) {
      next(e)
    }    
  } else {
    return res.status(404).json({ error: `The user id ${id} couldn't be found.` })  
  }
}

Users.delete = async (req, res, next) => {
  const id = req.params.userId
  const user = await getUserById(id)

  if (user) {
    if ((!req.user.admin) && (user.id !== req.user.id)) {
      return res.status(403).json({ error: `You don't have access to this feature` })
    }

    try {
      await user.destroy()
      res.status(204).end()
    } catch(e) {
      next(e)
    }      
  } else {
    res.status(404).json({ error: `The user id ${id} couldn't be found.` })
  }
}

Users.register = (req, res, next) => {
  req.body.admin = false
  Users.create(req, res, next)
}

Users.changePass = async (req, res, next) => {
  const id = parseInt(req.params.userId)
  
  if (!req.user.admin && (req.user.id !== id)) {
    return res.status(400).json({ error: 'You cannot change the password for that user' })
  }
  
  const user = await getUserById(id)

  if (user) {
    const { password = '' } = req.body
    
    if (password === '') {
      return res.status(400).json({ error: 'The password field cannot be empty'})
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'The password field must be at least 8 characters' })
    }

    user.password = md5(password)
    
    try {
      await user.save()
      return res.status(204).end()
    } catch(e) {
      next(e)
    }    
  } else {
    return res.status(404).json({ error: `The user id ${id} couldn't be found.` })  
  }
}

Users.resetPass = async (req, res, next) => {
  return res.status(200).json({ msg: 'reset' })
}

Users.forgottenPass = async (req, res, next) => {
  const { email = '' } = req.body
  
  if (email === '') {
    return res.status(400).json({ error: 'The email field cannot be empty' })
  }
  
  const user = await model.findOne({
    where: { email }
  })

  if (!user) {
    return res.status(400).json({ error: 'The email is not registered' })
  }

  return res.status(200).json({ msg: `The reset link was sent to '${email}'` })
}

const getUserById = async id => {
  const user = await model.findOne({
    where: { id },
    attributes: ['id', 'name', 'email', 'admin', 'createdAt', 'updatedAt']
  })

  return user
}

module.exports = Users