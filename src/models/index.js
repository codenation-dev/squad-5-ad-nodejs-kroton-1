const Sequelize = require('sequelize')
const path = require('path')

const config = require('../config')

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  {
    ...config.db,
    dialect: 'mysql'
  }
)

const Logs = sequelize.import(
  path.join(__dirname, 'logs.js')
)

const Users = sequelize.import(
  path.join(__dirname, 'users.js')
)

const Applications = sequelize.import(
  path.join(__dirname, 'applications.js')
)


Users.hasMany(Applications)
Applications.belongsTo(Users)
Applications.hasMany(Logs)
Logs.belongsTo(Applications)

const db = {}

db[Users.name] = Users
db[Logs.name] = Logs
db[Applications.name] = Applications

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db