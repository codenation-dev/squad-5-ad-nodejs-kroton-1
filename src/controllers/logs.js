const logsModel = require('../models/logs')

let Logs = {}

Logs.getAll = async (req, res, next) => {
  try {
    if (!req.user.admin) {
      req.where.userId = req.user.id
    }

    const data = await logsModel.findAll({
        order: req.order,
        attributes: ['id', 'title', 'level', 'events', 'environment', 'source_address', 'archived', 'createdAt'],
        include: {
          association: 'application',
          attributes: ['id', 'name', 'description', 'userId'],
          where:{...req.where, deletedAt:null},
          include:{
            association:'user',
            attributes:['id', 'name'],
            where:{deletedAt:null}
          }
        },
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
        association: 'application',
        attributes: ['id', 'name',  'description', 'userId'],
        include:{
          association: 'user',
          attributes: ['id', 'name'],
          where: { deletedAt: null }
        }        
      }]      
    })
  
    if (result === null) {
      return res.status(400).json({ error: `Log is not found`})
    }

    if ((!req.user.admin) && (result.application.userId !== req.user.id)) {
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
  const created = await logsModel.create(req.body)

  const result = await logsModel.findOne({
    where: { 
      id: created.id 
    },
    attributes: ['id', 'title', 'detail', 'level', 'events', 'environment', 'source_address', 'archived', 'createdAt', 'updatedAt', 'deletedAt'],
    include: [{
      association: 'application',
      attributes: ['id', 'name',  'description', 'userId'],
      include:{
        association: 'user',
        attributes: ['id', 'name'],
        where: { deletedAt: null }
      }        
    }]      
  })

  res.status(201).json(result)
}

Logs.delete = async (req, res, next) => {
  const { logId } = req.params

  const result = await logsModel.findOne({
    where: { id: logId },
    include:{
      association:'application',
      where:{deletedAt:null}
    }
  })

  if (result === null) {
    return res.status(400).json({ error: `Log is not found`})
  }

  if ((!req.user.admin) && (result.application.userId !== req.user.id)) {
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
      where: { id: logId },
      include:{
        association:'application',
        where:{deletedAt:null}
      }
    })
    
    if (result === null) {
      return res.status(400).json({ error: `Log is not found`})
    }
  
    if ((!req.user.admin) && (result.application.userId !== req.user.id)) {
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
