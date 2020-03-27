const sequelize = require('../src/models/index')
const userModel = require('../src/models/users')
const request = require('supertest')
const { app } = require('../src/app.js')
const md5 = require('md5')

const populateTable = async (model, obj) => {
  let data = JSON.parse(JSON.stringify(obj))
  if (data.password) data.password = md5(data.password)
  
  const created = await model.create(data)

  const response = await model.findOne({where: { id: created.id }})

  return response
}

const dropAllTables = async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
  
  await sequelize.query('DROP TABLE IF EXISTS logs;')
  await sequelize.query('DROP TABLE IF EXISTS apllications;')
  await sequelize.query('DROP TABLE IF EXISTS users;')

  await sequelize.query('DROP TABLE IF EXISTS notifications;')
  await sequelize.query('DROP TABLE IF EXISTS notification_triggers;')
  await sequelize.query('DROP TABLE IF EXISTS notification_alerts;')
  await sequelize.query('DROP TABLE IF EXISTS password_resets;')

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;')
}

const truncate = async (table) => {
  await sequelize.query(`IF '${table}' IN (SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = (SELECT DATABASE() FROM DUAL)) THEN TRUNCATE TABLE ${table}; END IF;`)
}

const truncateAllTables = async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
  
  await truncate('logs')
  await truncate('applications')
  await truncate('users')

  await truncate('notifications')
  await truncate('notification_triggers')
  await truncate('notification_alertssers')
  await truncate('password_resets')
}

const BeforeAll = async () => {
  await dropAllTables()
  await sequelize.sync()
}

const AfterAll = async () => {
  await dropAllTables()
  await sequelize.close()
}

const adminUser = {
  name: 'Usuário Admin',
  email: 'admin@sentinellog.com.br',
  password: '12345678',
  admin: true,
}

const commonUser = {
  name: 'Usuário Comum',
  email: 'usuario@sentinellog.com.br',
  password: '12345678',
  admin: false,
}

const cloneObject = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

const getUserDataKeys = (data) => {
  data = cloneObject(data)
  
  if (data.deletedAt !== undefined) delete data.deletedAt
  if (data.password  !== undefined) delete data.password
  
  return Object.keys(data)  
}

const clearUserData = (data) => {
  data = cloneObject(data)
  
  if (data.createdAt !== undefined) delete data.createdAt
  if (data.updatedAt !== undefined) delete data.updatedAt
  if (data.deletedAt !== undefined) delete data.deletedAt
  if (data.password  !== undefined) delete data.password
  
  return data
}

const getJwt = async (user) => {
  const { email, password } = user

  const res = await request(app).post('/v1/login').send({ email, password })
  return res.body.token
}

const createUser = async () => {
  let adminUserData = await populateTable(userModel, adminUser)
  const adminUserDataKeys = getUserDataKeys(adminUserData)
  adminUserData = clearUserData(adminUserData)
  const adminJwt = await getJwt(adminUser)

  let commonUserData = await populateTable(userModel, commonUser)
  const commonUserDataKeys = getUserDataKeys(commonUserData)
  commonUserData = clearUserData(commonUserData)
  const commonJwt = await getJwt(commonUser)

  return {
    admin: {
      data: adminUserData,
      keys: adminUserDataKeys,
      jwt: adminJwt,
    },
    common: {
      data: commonUserData,
      keys: commonUserDataKeys,
      jwt: commonJwt,
    }
  }
}

module.exports = { 
  populateTable,
  truncateAllTables,
  BeforeAll,
  AfterAll,
  createUser,
  getUserDataKeys,
  clearUserData,
  cloneObject,
}
