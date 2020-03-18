const logsModel = require('../models')['logs']
const applicationModel = require('../models')['applications']
const userModel = require('../models')['users']

let Logs = {}

Logs.getAll = async (req, res, next) => {
  try {
    if (!req.user.admin) {
      req.where.userId = req.user.id
    }

    const data = await logsModel.findAll({
        where: req.where,
        order: req.order,
        attributes: ['id', 'title', 'level', 'events', 'environment', 'source_address', 'archived', 'createdAt'],
        include: [{
          model: applicationModel,
          attributes: ['id', 'name', 'description'],
          include:[{
            model:userModel,
            attributes:['id', 'name']
          }]
        }]
    })

    res.status(200).json({
      total: data.length,
      data
    })
  } catch(e) {
    res.status(400).json({ error: e.parent.sqlMessage })
  }
}

Logs.getById = async (req, res, next) => {
  const { logId } = req.params
  try {
    const result = await logsModel.findOne({
      where: { 
        id: logId 
      },
      attributes: ['id', 'title', 'detail', 'level', 'events', 'environment', 'source_address', 'archived', 'createdAt', 'updatedAt', 'deletedAt'],
      include: [{
        model: applicationModel,
        attributes: ['id', 'name',  'description']
      }]      
    })
  
    if (result === null) {
      res.status(400).json({ error: `Log is not found`})
    }

    if ((!req.user.admin) && (result.userId !== req.user.id)) {
      return res.status(403).json({ error: `You don't have access to this feature` })
    }

    res.status(200).json(result)
  } catch(e) {
    res.status(400).json({ error: e.parent.sqlMessage })
  }
}

Logs.create = async (req, res, next) => {
  if (req.body.source_address === undefined) {
    req.body.source_address = req.ip
  }
  const result = await logsModel.create(req.body)  
  res.status(201).json({ result })
}

Logs.delete = async (req, res, next) => {
  const { logId } = req.params

  const result = await logsModel.findOne({
    where: { id: logId }
  })

  if (result === null) {
    res.status(400).json({ error: `Log is not found`})
  }

  if ((!req.user.admin) && (result.userId !== req.user.id)) {
    return res.status(403).json({ error: `You don't have access to this feature` })
  }  

  await result.destroy()

  res.status(204).json({ result })
}

Logs.archive = async (req, res, next) => {
  const { logId } = req.params
  const { archived } = req.body

  if (archived !== undefined) {
    const result = await logsModel.findOne({
      where: { id: logId }
    })
    
    if (result === null) {
      res.status(400).json({ error: `Log is not found`})
    }
  
    if ((!req.user.admin) && (result.userId !== req.user.id)) {
      return res.status(403).json({ error: `You don't have access to this feature` })
    }

    result.archived = archived
    await result.save()
    
    res.status(204).json({})
  } else {
      res.status(400).json({
          error: `The 'archive' field was not sent`
      })
  }
}

module.exports = Logs
