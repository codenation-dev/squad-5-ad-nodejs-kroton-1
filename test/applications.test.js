const { NODE_ENV = 'test' } = process.env
const table = `sentinel_log_${NODE_ENV}`
const sequelize = require('../src/models/index')
const crypto = require('crypto')
const userModel= require('../src/models/users')
const logsModel = require('../src/models/logs')
const applicationsModel = require('../src/models/applications')

const { populateTable, cleanTable } = require('./utils')
const request = require('supertest')
const { app } = require('../src/app.js')

let token
let res
let applicationToken = crypto.randomBytes(20).toString('hex')

beforeAll(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
  await sequelize.query('DROP TABLE IF EXISTS logs;')
  await sequelize.query('DROP TABLE IF EXISTS apllications;')
  await sequelize.query('DROP TABLE IF EXISTS users;')
  await sequelize.sync()
})

afterAll(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
  await sequelize.query('DROP TABLE IF EXISTS logs;')
  await sequelize.query('DROP TABLE IF EXISTS apllications;')
  await sequelize.query('DROP TABLE IF EXISTS users;')
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;')
  await sequelize.close()
})

beforeEach(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
  await sequelize.query('TRUNCATE TABLE logs;')
  await sequelize.query('TRUNCATE TABLE applications;')
  await sequelize.query('TRUNCATE TABLE users;')
  await sequelize.sync()

  populateTable(userModel, {
    name:'Rogerio Miguel',
    email:'rogerio@hotmail.com',
    password:'12345678'
  })

  const getToken  = async ()=>{
    return response = await request(app).post('/v1/login').send({
      email:'rogerio@hotmail.com',
      password:'12345678'
    })
  }

  res = await getToken()

  token = res.body.token
})

afterEach(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
  await sequelize.query('TRUNCATE TABLE logs;')
  await sequelize.query('TRUNCATE TABLE applications;')
  await sequelize.query('TRUNCATE TABLE users;')

  populateTable(userModel, {
    name:'Rogerio Miguel',
    email:'rogerio@hotmail.com',
    password:'12345678'
  })

  const getToken  = async ()=>{
    return response = await request(app).post('/v1/login').send({
      email:'rogerio@hotmail.com',
      password:'12345678'
    })
  }

  res = await getToken()

  token = res.body.token
})

describe('The API on /v1/applications Endpoint at GET method should...', () => {
  beforeEach(async () => {
    populateTable(applicationsModel, {
      name:'Central de erros teste',
      description:'Apia para armazenar e vizualizar erros',
      token:applicationToken,
      userId:1
    })
  })

  test(`return 200 as status code and have 'total' and 'data' as properties`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get('/v1/applications').set({
      Authorization:token
    })
  
    expect(res.statusCode).toEqual(200)

    expect(Object.keys(res.body)).toMatchObject([
      'total',
      'data'
    ])
  })
})


describe('The API on /v1/applications/id Endpoint at GET method should...', () => {
    beforeEach(async () => {
        populateTable(applicationsModel, {
          name:'Central de erros teste',
          description:'Apia para armazenar e vizualizar erros',
          token:applicationToken,
          userId:1
        })
      })

  test(`return 200 as status code and have ..........`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get('/v1/applications/1').set({
      Authorization:token
    })
  
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({
      name:'Central de erros teste',
      description:'Apia para armazenar e vizualizar erros',
      token:applicationToken,
      userId:1
    })
  })
})