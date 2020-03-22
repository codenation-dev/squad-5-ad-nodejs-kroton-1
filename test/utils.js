const userModel = require('../src/models/users')
const md5 = require('md5')

const populateTable = async (model, obj) => {
  if(obj.password) obj.password = md5(obj.password)
  
  const response = await model.create(obj)

  return response
}

const cleanTable = async (table) => {
  const response = await userModel.truncate()

  return response
}

module.exports = {
  populateTable,
  cleanTable
}