const model = require('../models/notificationsAlerts')
const notificationModel = require('../models/notifications')

let Alerts = {}

Alerts.getAll = async (req, res, next) =>{
  const notificationId = req.parentParams.notificationId
  try {
    let data = await model.findAll({
      where: { notificationId },
      attributes: ['id', 'type', 'to', 'message', 'createdAt', 'updatedAt'],
    })

		res.status(200).json({
			total: data.length,
			data,
		})
	} catch(e) {
		next(e)
	}
}

Alerts.getById = async (req, res, next) =>{
  try {
    const id = req.params.alertId
    let alert = await Alerts.getAlertById(id)
    
    if (alert) {
      const notificationId = req.parentParams.notificationId
      if (alert.notification.id !== notificationId) {
        return res.status(403).json({ error: `The alert id ${id} does not belong to that notification` })
      }

      alert = clearAlert(alert)
      res.status(200).json(alert)
    } else {
      res.status(404).json({ error: `The alert id ${id} couldn't be found.` })
    }
	} catch(e) {
		next(e)
	}
}

Alerts.create = async (req, res, next) =>{
  try {
    const notificationId = req.parentParams.notificationId
    let { type, to, message } = req.body
    
    const created = await model.create({ notificationId, type, to, message })
    let alert = await Alerts.getAlertById(created.id)
    alert = clearAlert(alert)

		res.status(201).json(alert)
	} catch(e) {
		next(e)
	}
}

Alerts.update = async (req, res, next) =>{
  const id = req.params.alertId
  let alert = await Alerts.getAlertById(id)

	if (alert) {
    const notificationId = req.parentParams.notificationId
    if (alert.notification.id !== notificationId) {
      return res.status(403).json({ error: `The alert id ${id} does not belong to that notification` })
    }

		let { type, to, message } = req.body
		
		alert.type = type || alert.type
    alert.to = to || alert.to
    alert.message = message || alert.message
    
    try {
      await alert.save()
      alert = clearAlert(alert)
      return res.status(200).json(alert)
    } catch(e) {
      next(e)
    }    
  } else {
    return res.status(404).json({ error: `The alert id ${id} couldn't be found.` })  
  }
}

Alerts.delete = async (req, res, next) => {
  const id = req.params.alertId
  let alert = await Alerts.getAlertById(id)

  if (alert) {
    const notificationId = req.parentParams.notificationId
    if (alert.notification.id !== notificationId) {
      return res.status(403).json({ error: `The alert id ${id} does not belong to that notification` })
    }

    try {
      await alert.destroy()
      res.status(204).end()
    } catch(e) {
      next(e)
    }      
  } else {
    res.status(404).json({ error: `The alert id ${id} couldn't be found.` })
  }
}

Alerts.getAlertById = async (id) => {
  id = parseInt(id)
  const alert = await model.findOne({
    where: { id }, 
    attributes: ['id', 'type', 'to', 'message', 'createdAt', 'updatedAt'],
    include: [{
      model: notificationModel,
      as: 'notification',
      attributes: ['id', 'name'],
    }]
  })
  return alert
}

const clearAlert = (alert) => {
  let output

  if (alert) {
    output = {
      id: alert.id,
      type: alert.type,
      to: alert.to,
      message: alert.message,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    }
  }

  return output
}

module.exports = Alerts
