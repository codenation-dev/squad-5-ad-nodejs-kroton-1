const usersModel = require('../models/users')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
require('dotenv').config({path: 'variables.env'})

let Login = {}

Login.login = async (req, res, next) => {
  const { email = '', password = '' } = req.body

  if (email == '') {
    return res.status(400).json({ error: `The email field cannot be empty` })
  }

  if (password == '') {
    return res.status(400).json({ error: `The password field cannot be empty` })
  }

  const user = await usersModel.findOne({ where: { email } })

  if ((user === null) || (user.password !== md5(password))) {
    return res.status(400).json({ error: `Email or password is invalid`})
  }

  const token = jwt.sign({
    name: user.name,
    email: user.email,
    admin: user.admin,
  },
  process.env.JWT_KEY,
  {
    expiresIn: '1h',
  })

  return res.status(200).json({ token })
}

Login.renew = async (req, res, next) => {
  console.log('req', req.method)
  const token = jwt.sign({
    name: req.user.name,
    email: req.user.email,
    admin: req.user.admin,
  },
  process.env.JWT_KEY,
  {
    expiresIn: '1h',
  })

  return res.status(200).json({ token })
}

module.exports = Login
