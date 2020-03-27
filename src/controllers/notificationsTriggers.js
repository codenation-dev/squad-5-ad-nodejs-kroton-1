const model = require('../models/notificationsTriggers')
const notificationModel = require('../models/notifications')

let Triggers = {}

Triggers.getAll = async (req, res, next) =>{
  const notificationId = req.parentParams.notificationId
  try {
    let data = await model.findAll({
      where: { notificationId },
      attributes: ['id', 'field', 'condition', 'value', 'createdAt', 'updatedAt'],
    })

		res.status(200).json({
			total: data.length,
			data,
		})
	} catch(e) {
		next(e)
	}
}

Triggers.getById = async (req, res, next) =>{
  try {
    const id = req.params.triggerId
    let trigger = await Triggers.getTriggerById(id)
    
    if (trigger) {
      const notificationId = req.parentParams.notificationId
      if (trigger.notification.id !== notificationId) {
        return res.status(403).json({ error: `The trigger id ${id} does not belong to that notification` })
      }

      trigger = clearTrigger(trigger)
      res.status(200).json(trigger)
    } else {
      res.status(404).json({ error: `The trigger id ${id} couldn't be found.` })
    }
	} catch(e) {
		next(e)
	}
}

Triggers.create = async (req, res, next) =>{
  try {
    const notificationId = req.parentParams.notificationId
    let { field, condition, value } = req.body
    
    const created = await model.create({ notificationId, field, condition, value })
    let trigger = await Triggers.getTriggerById(created.id)
    trigger = clearTrigger(trigger)

		res.status(201).json(trigger)
	} catch(e) {
		next(e)
	}
}

Triggers.update = async (req, res, next) =>{
  try {
    const id = req.params.triggerId
    let trigger = await Triggers.getTriggerById(id)

    if (trigger) {
      const notificationId = req.parentParams.notificationId
      if (trigger.notification.id !== notificationId) {
        return res.status(403).json({ error: `The trigger id ${id} does not belong to that notification` })
      }

      let { field, condition, value } = req.body
      
      trigger.field = field || trigger.field
      trigger.condition = condition || trigger.condition
      trigger.value = value || trigger.value
      
      await trigger.save()
      trigger = clearTrigger(trigger)
      return res.status(200).json(trigger)
    } else {
      return res.status(404).json({ error: `The trigger id ${id} couldn't be found.` })  
    }
  } catch(e) {
    next(e)
  }
}

Triggers.delete = async (req, res, next) => {
  try {
    const id = req.params.triggerId
    let trigger = await Triggers.getTriggerById(id)

    if (trigger) {
      const notificationId = req.parentParams.notificationId
      if (trigger.notification.id !== notificationId) {
        return res.status(403).json({ error: `The trigger id ${id} does not belong to that notification` })
      }

      await trigger.destroy()
      res.status(204).end()
    } else {
      res.status(404).json({ error: `The trigger id ${id} couldn't be found.` })
    }
  } catch(e) {
    next(e)
  }
}

Triggers.getTriggerById = async (id) => {
  id = parseInt(id)
  const trigger = await model.findOne({
    where: { id }, 
    attributes: ['id', 'field', 'condition', 'value', 'createdAt', 'updatedAt'],
    include: [{
      model: notificationModel,
      as: 'notification',
      attributes: ['id', 'name'],
    }]
  })
  return trigger
}

const clearTrigger = (trigger) => {
  let output

  if (trigger) {
    output = {
      id: trigger.id,
      field: trigger.field,
      condition: trigger.condition,
      value: trigger.value,
      createdAt: trigger.createdAt,
      updatedAt: trigger.updatedAt,
    }
  }

  return output
}

module.exports = Triggers
