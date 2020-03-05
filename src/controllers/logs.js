const logsModel = require('../models')['logs']
const usersModel = require('../models')['users']
const queryParams = require('./queryParams')

let Logs = {}

Logs.getAll = async (req, res, next) => {
  const params = queryParams(req.query)

  if (params.error) {
    res.status(400).json({ errors: params.errors })
  }

  try {
    const data = await logsModel.findAll({
        where: params.where,
        order: params.order,
        attributes: ['id', 'title', 'level', 'events', 'environment', 'source_address', 'archived', 'createdAt'],
        include: [{
          model: usersModel,
          attributes: ['id', 'name']
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
          model: usersModel,
          attributes: ['id', 'name']
        }]      
      })
    
      if (result === null) {
        res.status(400).json({ error: `Log is not found`})
      }

      res.status(200).json(result)
    } catch(e) {
      res.status(400).json({ error: e.parent.sqlMessage })
    }
}

Logs.create = async (req, res, next) => {
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

  result.destroy()

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
    
      console.log(archived)

      result.archived = archived
      result.save()
      
      res.status(204).json({})
    } else {
        res.status(400).json({
            error: `The 'archive' field was not sent`
        })
    }
}

module.exports = Logs
