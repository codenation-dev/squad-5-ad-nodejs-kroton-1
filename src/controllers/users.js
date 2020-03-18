const model = require('../models/users')
const md5 = require('md5')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')

let Users = {}

Users.getAll = async (req, res, next) => {
  try {
    const data = await model.findAll({
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt']
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
  let { name, email, password = '' } = req.body

  if (password === '') {
    return res.status(400).json({ error: 'The password field cannot be empty'})
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'The password field must be at least 8 characters' })
  }

  password = md5(password)
  
  try {
    const user = await model.create({ name, email, password, })
    res.status(201).json(user)
  } catch(e) {
    next(e)
  }
}

Users.update = async (req, res, next) => {
  const id = req.params.userId
  const user = await getUserById(id)

  if (user) {
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

const getUserById = async id => {
  const user = await model.findOne({
    where: { id },
    attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt']
  })

  return user
}

module.exports = Users