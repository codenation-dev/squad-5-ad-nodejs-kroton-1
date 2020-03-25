const { NODE_ENV = 'test' } = process.env
const table = `sentinel_log_${NODE_ENV}`
const sequelize = require('../src/models/index')
const crypto = require('crypto')
const userModel= require('../src/models/users')
const logsModel = require('../src/models/logs')
const applicationsModel = require('../src/models/applications')

const { populateTable } = require('./utils')
const request = require('supertest')
const { app } = require('../src/app.js')

let token
let res
let applicationToken = crypto.randomBytes(20).toString('hex')

const getToken  = async user => response = await request(app).post('/v1/login').send(user)


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
  await sequelize.sync()

  populateTable(userModel, {
    name:'Rogerio Miguel',
    email:'rogerio@hotmail.com',
    password:'12345678'
  })

  populateTable(userModel, {
    name:'Samuel Batista',
    email:'samuel@hotmail.com',
    password:'12345678'
  })

  res = await getToken({
    email:'rogerio@hotmail.com',
    password:'12345678'
  })

  res2 = await getToken({
    email:'samuel@hotmail.com',
    password:'12345678'
  })

  token = res.body.token
  token2 = res2.body.token
})

afterEach(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
  await sequelize.query('TRUNCATE TABLE logs;')
  await sequelize.query('TRUNCATE TABLE applications;')
  await sequelize.query('TRUNCATE TABLE users;')
})

describe('The API on /v1/applications Endpoint at GET method should...', () => {
  beforeEach(async () => {
    populateTable(applicationsModel, {
      name:'Central de erros teste',
      description:'Api para armazenar e vizualizar erros',
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

  test(`return the right number of items and an object with all items`, async () => {
    expect.assertions(1)
  
    const res = await request(app).get('/v1/applications').set({
      Authorization:token
    })

    expect(res.body).toMatchObject({
      total:1,
      data:[
        {
          id:1,
          name:'Central de erros teste',
          description:'Api para armazenar e vizualizar erros',
          token:applicationToken,
          user: {
            id:1,
            name:'Rogerio Miguel'
          }
        }
      ]
    })
  })

  test(`return 401 as status code and the 'Authentication failure' error`, async () => {
    expect.assertions(2)

    const res = await request(app).get('/v1/applications')

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
      error:'Authentication failure'
    })
  })

})

describe('The API on /v1/applications/id Endpoint at GET method should...', () => {
  beforeEach(async () => {
      populateTable(applicationsModel, {
        name:'Central de erros teste',
        description:'Api para armazenar e vizualizar erros',
        token:applicationToken,
        userId:1
      })
    })

  test(`return 200 as status code and have have properly attributes`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get('/v1/applications/1').set({
      Authorization:token
    })
  
    expect(res.statusCode).toEqual(200)
    expect(Object.keys(res.body)).toMatchObject([
      'id',
      'name',
      'description',
      'token',
      'createdAt',
      'updatedAt',
      'user'
    ])
  })

  test(`return 200 as status code and the item founded`, async () => {
    expect.assertions(2)

    const res = await request(app).get('/v1/applications/1').set({
      Authorization:token
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({
      id:1,
      name:'Central de erros teste',
      description:'Api para armazenar e vizualizar erros',
      token:applicationToken,
      user: {
        id:1,
        name:'Rogerio Miguel'
      }
    })
  })

  test(`return 401 as status code and the 'Authentication failure' error`, async () => {
    expect.assertions(2)

    const res = await request(app).get('/v1/applications/1')

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
      error:'Authentication failure'
    })
  })

  test(`return 403 as status code and the 'You don't have access to this feature' error`, async () => {
    expect.assertions(2)

    const res = await request(app).get('/v1/applications/1').set({
      Authorization:token2
    })

    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
      error:`You don't have access to this feature`
    })
  })

  test(`return 404 as status code and 'the application id not found' error`, async () => {
    expect.assertions(2)

    const res = await request(app).get('/v1/applications/2').set({
      Authorization:token
    })

    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({
      error:`The application id 2 couldn't be found.`
    })
  })
})

describe('The API on /v1/applications Endpoint at POST method should...', () => {

  test(`return 201 as status code and the properties`, async () => {
    expect.assertions(2)
  
    const res = await request(app).post('/v1/applications')
    .send({
      name:'Central de erros teste',
      description:'Api para armazenar e vizualizar erros'
    })
    .set({
      Authorization:token
    })
  
    expect(res.statusCode).toEqual(201)

    expect(Object.keys(res.body)).toMatchObject([
      'id',
      'name',
      'description',
      'token',
      'createdAt',
      'updatedAt',
      'user',
    ])
  })
  
  test(`return 201 as status code and the recorded application`, async () => {
    expect.assertions(2)
  
    const res = await request(app).post('/v1/applications')
    .send({
      name:'Central de erros teste',
      description:'Api para armazenar e vizualizar erros'
    })
    .set({
      Authorization:token
    })
  
    expect(res.statusCode).toEqual(201)

    expect(res.body).toMatchObject({
      id:1,
      name:'Central de erros teste',
      description:'Api para armazenar e vizualizar erros',
      user: {
        id:1,
        name:'Rogerio Miguel'
      }
    })
  })

  test(`return 401 as status code and the 'Authentication failure' error`, async () => {
    expect.assertions(2)

    const res = await request(app).post('/v1/applications')

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
      error:'Authentication failure'
    })
  })
})

describe('The API on /v1/applications/id Endpoint at PATCH method should...', () => {
  beforeEach(async () => {
    populateTable(applicationsModel, {
      name:'Central de erros teste',
      description:'Apia para armazenar e vizualizar erros',
      token:applicationToken,
      userId:1
    })
  })

  test(`return 200 as status code and the properties`, async () => {
    expect.assertions(2)
  
    const res = await request(app).patch('/v1/applications/1')
    .send({
      name:'Central de erros teste',
      description:'Api para armazenar e vizualizar erros'
    })
    .set({
      Authorization:token
    })
  
    expect(res.statusCode).toEqual(200)

    expect(Object.keys(res.body)).toMatchObject([
      'id',
      'name',
      'description',
      'token',
      'createdAt',
      'updatedAt',
      'user'
    ])
  })

  test(`return 200 as status code and the updated application`, async () => {
    expect.assertions(2)
  
    const res = await request(app).patch('/v1/applications/1')
    .send({
      name:'Central de erros',
      description:'Api para armazenar erros'
    })
    .set({
      Authorization:token
    })
  
    expect(res.statusCode).toEqual(200)

    expect(res.body).toMatchObject({
      id:1,
      name:'Central de erros',
      description:'Api para armazenar erros',
      token:applicationToken,
      user: {
        id:1,
        name:'Rogerio Miguel'
      }
    })
  })

  test(`return 401 as status code and the 'Authentication failure' error`, async () => {
    expect.assertions(2)

    const res = await request(app).patch('/v1/applications/1')

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
      error:'Authentication failure'
    })
  })

  test(`return 403 as status code and the 'You don't have access to this feature' error`, async () => {
    expect.assertions(2)

    const res = await request(app).patch('/v1/applications/1').set({
      Authorization:token2
    })

    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
      error:`You don't have access to this feature`
    })
  })

  test(`return 404 as status code and 'the application id not found' error`, async () => {
    expect.assertions(2)

    const res = await request(app).patch('/v1/applications/2').set({
      Authorization:token
    })

    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({
      error:`The application id 2 couldn't be found.`
    })
  })
})

describe('The API on /v1/applications/id Endpoint at DELETE method should...', () => {
  beforeEach(async () => {
    populateTable(applicationsModel, {
      name:'Central de erros teste',
      description:'Apia para armazenar e vizualizar erros',
      token:applicationToken,
      userId:1
    })
  })

  test(`return 204 as status code`, async () => {
    expect.assertions(1)
  
    const res = await request(app).delete('/v1/applications/1')
    .set({
      Authorization:token
    })
  
    expect(res.statusCode).toEqual(204)
  })

  test(`return 401 as status code and the 'Authentication failure' error`, async () => {
    expect.assertions(2)

    const res = await request(app).delete('/v1/applications/1')

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
      error:'Authentication failure'
    })
  })

  test(`return 403 as status code and the 'You don't have access to this feature' error`, async () => {
    expect.assertions(2)

    const res = await request(app).delete('/v1/applications/1').set({
      Authorization:token2
    })

    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
      error:`You don't have access to this feature`
    })
  })

  test(`return 404 as status code and 'the application id not found' error`, async () => {
    expect.assertions(2)

    const res = await request(app).delete('/v1/applications/2').set({
      Authorization:token
    })

    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({
      error:`The application id 2 couldn't be found.`
    })
  })
})