const model = require('../models')['users']
const md5 = require('md5')
const crypto = require('crypto')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')

let Users = {}

Users.getAll = async (req, res, next) => {
    const data = await model.findAll()
      res.status(200).json({
        total: data.lenght,
        data    
      })
  }

Users.getById = async (req, res, next) => {
    const id = req.params.userId
    return model.findOne({where:{id}})
      .then(result => {
        if(!result) {
          return res.status(404).json({ error: `The record ${id} couldn't be found.` })  
        }
        return res.status(200).json(result)
      })
      .catch(next)
  }

Users.create = async (req, res, next) => {
    let {name, email, password} = req.body
    if(name.length <= 0 || email.length <= 0 || password.length <= 0) {
        return res.json({error:'Os campos não podem estar em branco'})
    }
    const findUser = await model.findOne({
        where:{email}
    })
    if(findUser) {
        return res.json({error:'E-mail ja cadastrado'})
    }
    if(password.length < 8) {
        return res.json({error:'A senha deve possuir 8 caracteres ou mais'})
    }
    password = md5(password)
    const token = crypto.randomBytes(20).toString('hex')
    
    return (model.create({name, email, password, token}))
      .then(result => res.status(201).json(result))
      .catch(next)
  }

Users.update = async (req, res, next) => {
    const id = req.params.userId
    let data = req.body
    return model.update(data, {where: {id}})
      .then(result => {
        if(!result) {
          return res.status(404).json({ error: `The record ${id} couldn't be found.` })  
        }
        return res.status(200).json({data})
      })
      .catch(next)
  }

Users.delete = async (req, res, next) => {
    return model.destroy({where:{id}})
      .then(result => {
        if(result === 0) {
          return res.status(404).json({ error: `The record ${id} couldn't be found.` })  
        }
        return res.status(200)
      })
      .catch(next)
  }

module.exports = Users