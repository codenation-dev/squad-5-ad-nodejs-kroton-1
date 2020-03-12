const model = require('../models')['applications']
const crypto = require('crypto')

let Applications = {}

Applications.getAll = async (req, res, next) =>{
	try {
		let data = await model.findAll()

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
		const data = await getApplicationById(id)

    if (data) {
      res.status(200).json(data)
    } else {
      res.status(404).json({ error: `The application id ${id} couldn't be found.` })
    }
	} catch(e) {
		next(e)
	}
}

Applications.create = async (req, res, next) =>{
	try {
		let { name, description = '' } = req.body
		const token = crypto.randomBytes(20).toString('hex')

		const result = await model.create({ name, description, token })

		res.status(201).json(result)
	} catch(e) {
		next(e)
	}
}

Applications.update = async (req, res, next) =>{
	const id = req.params.appId
	const application = await getApplicationById(id)

	if (application) {
		let { name, description } = req.body
		
		application.name = name || application.name
		application.description = description || application.description
    
    try {
      await application.save()
      return res.status(200).json(application)
    } catch(e) {
      next(e)
    }    
  } else {
    return res.status(404).json({ error: `The application id ${id} couldn't be found.` })  
  }
}

Applications.delete = async (req, res, next) =>{
  const id = req.params.appId
	const application = await getApplicationById(id)

  if (application) {
    try {
      await application.destroy()
      res.status(204).end()
    } catch(e) {
      next(e)
    }      
  } else {
    res.status(404).json({ error: `The application id ${id} couldn't be found.` })
  }
}

const getApplicationById = async id =>{
  const application = await model.findOne({
    where: { id },
    attributes: ['id', 'name', 'description', 'token', 'createdAt', 'updatedAt', 'userId']
  })

  return application
}

module.exports = Applications