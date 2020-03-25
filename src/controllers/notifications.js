const model = require('../models/notifications')
const applicationModel = require('../models/applications')
const triggerModel = require('../models/notificationsTriggers')
const alertModel = require('../models/notificationsAlerts')

let Notifications = {}

Notifications.getAll = async (req, res, next) =>{
  const applicationId = req.parentParams.appId
  try {
    let data = await model.findAll({
      where: { applicationId },
      attributes: ['id', 'name', 'detail', 'createdAt', 'updatedAt'],
      include: [
        {
          model: triggerModel,
          as: 'triggers',
          attributes: ['id', 'field', 'condition', 'value'],
        },
        {
          model: alertModel,
          as: 'alerts',
          attributes: ['id', 'type', 'to', 'message'],
        },
      ]
    })

		res.status(200).json({
			total:data.length,
			data
		})
	} catch(e) {
		next(e)
	}
}

Notifications.getById = async (req, res, next) =>{
	try {
    const applicationId = req.parentParams.appId
		const id = req.params.notificationId
    let notification = await getNotificationById(id)

    if (notification) {
      if ((!req.user.admin) && (notification.application.userId !== req.user.id)) {
        return res.status(403).json({ error: `You don't have access to this feature` })
      }

      if (notification.application.id !== applicationId) {
        return res.status(403).json({ error: `The notification id ${id} does not belong to that application` })
      }

      notification = clearApplication(notification)
      res.status(200).json(notification)
    } else {
      res.status(404).json({ error: `The notification id ${id} couldn't be found.` })
    }
	} catch(e) {
		next(e)
	}
}

Notifications.create = async (req, res, next) =>{
	try {
    const applicationId = req.parentParams.appId
    let { name, detail = '' } = req.body
    
    const created = await model.create({ applicationId, name, detail })
    let notification = await getNotificationById(created.id)
    notification = clearApplication(notification)

		res.status(201).json(notification)
	} catch(e) {
		next(e)
	}
}

Notifications.update = async (req, res, next) =>{
	const id = req.params.notificationId
	let notification = await getNotificationById(id)

	if (notification) {
    if ((!req.user.admin) && (notification.application.userId !== req.user.id)) {
      return res.status(403).json({ error: `You don't have access to this feature` })
    }

    if (notification.application.id !== applicationId) {
      return res.status(403).json({ error: `The notification id ${id} does not belong to that application` })
    }

		let { name, detail } = req.body
		
		notification.name = name || notification.name
		notification.detail = detail || notification.detail
    
    try {
      await notification.save()
      notification = clearApplication(notification)
      return res.status(200).json(notification)
    } catch(e) {
      next(e)
    }    
  } else {
    return res.status(404).json({ error: `The notification id ${id} couldn't be found.` })  
  }
}

Notifications.delete = async (req, res, next) =>{
  const id = req.params.notificationId
  const notification = await getNotificationById(id) 

  if (notification) {
    if ((!req.user.admin) && (notification.application.userId !== req.user.id)) {
      return res.status(403).json({ error: `You don't have access to this feature` })
    }

    if (notification.application.id !== applicationId) {
      return res.status(403).json({ error: `The notification id ${id} does not belong to that application` })
    }    

    try {
      await notification.destroy()
      res.status(204).end()
    } catch(e) {
      next(e)
    }      
  } else {
    res.status(404).json({ error: `The notification id ${id} couldn't be found.` })
  }
}

const getNotificationById = async id => {
  const notification = await model.findOne({
    where: { id }, 
    attributes: ['id', 'name', 'detail', 'createdAt', 'updatedAt'],
    include: [
      {
        model: applicationModel,
        as: 'application',
        attributes: ['id', 'name'],
      },
      {
        model: triggerModel,
        as: 'triggers',
        attributes: ['id', 'field', 'condition', 'value'],
      },
      {
        model: alertModel,
        as: 'alerts',
        attributes: ['id', 'type', 'to', 'message'],
      },
    ]
  })
  return notification
}

const clearApplication = (notification) => {
  let output

  if (notification) {
    output = {
      id: notification.id,
      name: notification.name,
      detail: notification.detail,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      triggers: notification.triggers,
      alerts: notification.alerts,
    }
  }

  return output
}

module.exports = Notifications
