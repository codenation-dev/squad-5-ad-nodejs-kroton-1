const model = require('../models/applications')
const userModel = require('../models/users')
const crypto = require('crypto')

let Applications = {}

Applications.getAll = async (req, res, next) =>{
    req.where = {}
    if (!req.user.admin) {
      req.where.userId = req.user.id
    }
  
    try {
        let data = await model.findAll({
            where:req.where,
            attributes: ['id', 'name', 'description', 'token', 'createdAt', 'updatedAt'],
            include: [{
                model: userModel,
                as: 'user',
                attributes: ['id', 'name'],
            }]            
        })

		res.status(200).json({
			total:data.length,
			data
		})
	} catch(e) {
		next(e)
	}
}

Applications.getById = async (req, res, next) =>{
	try {
		const id = req.params.appId
    const data = await Applications.getApplicationById(id)

    if (data) {
      if ((!req.user.admin) && (data.user.id !== req.user.id)) {
        return res.status(403).json({ error: `You don't have access to this feature` })
      }

      res.status(200).json(data)
    } else {
      res.status(404).json({ error: `The application id ${id} couldn't be found.` })
    }
	} catch(e) {
		next(e)
	}
}

Applications.create = async (req, res, next) => {
	try {
    let { name = '', description = '' } = req.body
    let userId

    name = `${name}`

    if (name.length < 10) {
      return res.status(400).json({ error: 'The application name must be at least 10 characters' })
    } 

    if(req.user.admin) {
      userId = req.body.userId || req.user.id
    } else {
      userId = req.user.id
    }
    
		const token = crypto.randomBytes(20).toString('hex')
    
    const created = await model.create({ name, description, token, userId })
    const application = await Applications.getApplicationById(created.id)

		res.status(201).json(application)
	} catch(e) {
		next(e)
	}
}

Applications.update = async (req, res, next) => {
  try{
    const id = req.params.appId
    const application = await Applications.getApplicationById(id)

    if (application) {
      if ((!req.user.admin) && (application.user.id !== req.user.id)) {
        return res.status(403).json({ error: `You don't have access to this feature` })
      } 

      let { name, description } = req.body
      
      application.name = name || application.name
      application.description = description || application.description
      
      
      await application.save()
      return res.status(200).json(application)
        
    } else {
      return res.status(404).json({ error: `The application id ${id} couldn't be found.` })  
    }
  } catch(e) {
    next(e)
  }
}

Applications.delete = async (req, res, next) =>{
  try{
    const id = req.params.appId
    const application = await Applications.getApplicationById(id)

    if (application) {
      if ((!req.user.admin) && (application.user.id !== req.user.id)) {
        return res.status(403).json({ error: `You don't have access to this feature` })
      }

      
      await application.destroy()
      res.status(204).end()     
    } else {
      res.status(404).json({ error: `The application id ${id} couldn't be found.` })
    }
  } catch(e) {
    next(e)
  }
}

Applications.getApplicationById = async function(id) {
  id = parseInt(id)
  const application = await model.findOne({
    where: { id },
    attributes: ['id', 'name', 'description', 'token', 'createdAt', 'updatedAt'],
    include: [{
      model: userModel,
      as: 'user',
      attributes: ['id', 'name'],
    }]
  })

  return application
}

Applications.redirectParams = (req, res, next) => {
  const parentParams = req.parentParams || {}

  parentParams.appId = parseInt(req.params.appId)

  req.parentParams = parentParams
  next() 
}

Applications.validateParams = async (req, res, next) => {
  try {
    const id = req.params.appId
    const application = await Applications.getApplicationById(id)

    if (!application) {
      return res.status(404).json({ error: `The application id ${id} couldn't be found.` })
    }

    if ((!req.user.admin) && (application.user.id !== req.user.id)) {
      return res.status(403).json({ error: `You don't have access to this feature` })
    }

    next()
  } catch(e) {
    next(e)
  }
}

module.exports = Applications