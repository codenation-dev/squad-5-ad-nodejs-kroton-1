const Sequelize = require('sequelize')
const dbConfig = require('../config/index')

const Users = require('../models/users')
const Logs = require('../models/logs')
const Applications = require('../models/applications')
const PasswordReset = require('../models/passwordReset')
const Notifications = require('../models/notifications')
const NotificationTriggers = require('../models/notificationsTriggers')
const NotificationAlerts = require('../models/notificationsAlerts')

const connection = new Sequelize(dbConfig)

Users.init(connection)
Logs.init(connection)
Applications.init(connection)
PasswordReset.init(connection)
Notifications.init(connection)
NotificationTriggers.init(connection)
NotificationAlerts.init(connection)

Users.associate(connection.models)
Applications.associate(connection.models)
Logs.associate(connection.models)
Notifications.associate(connection.models)
NotificationTriggers.associate(connection.models)
NotificationAlerts.associate(connection.models)

module.exports = connection