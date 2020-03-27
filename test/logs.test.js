const { NODE_ENV = 'test' } = process.env
const table = `sentinel_log_${NODE_ENV}`
const sequelize = require('../src/models/index')
const crypto = require('crypto')
const userModel = require('../src/models/users')
const logsModel = require('../src/models/logs')
const applicationsModel = require('../src/models/applications')

const { populateTable } = require('./utils')
const request = require('supertest')
const { app } = require('../src/app.js')

let token
let res
let applicationToken = crypto.randomBytes(20).toString('hex')
const getToken = async user => response = await request(app).post('/v1/login').send(user)



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
  await sequelize.close()
})

afterEach(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
  await sequelize.query('TRUNCATE TABLE logs;')
  await sequelize.query('TRUNCATE TABLE applications;')
  await sequelize.query('TRUNCATE TABLE users;')
})


/* GET ALL LOGS */

describe('The API on /v1/logs Endpoint at GET method should...', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
    await sequelize.query('TRUNCATE TABLE logs;')
    await sequelize.query('TRUNCATE TABLE applications;')
    await sequelize.query('TRUNCATE TABLE users;')
    await sequelize.sync()

    populateTable(userModel, {
      name: 'Ronielson Macedo',
      email: 'ronielson@gmail.com',
      password: '12345678'
    })

    populateTable(applicationsModel, {
      name: 'Central de erros teste',
      description: 'Apia para armazenar e vizualizar erros',
      token: applicationToken,
      userId: 1
    })

    populateTable(logsModel, {
      title: "Erro de BD",
      detail: "Erro ao tentar conectar no banco de dados",
      level: "error",
      events: 2,
      environment: "prod",
      source_address: "200.135.14.129",
      applicationId: 1
    })

    const getToken = async () => {
      return response = await request(app).post('/v1/login').send({
        email: 'ronielson@gmail.com',
        password: '12345678'
      })
    }

    res = await getToken()

    token = res.body.token
  })


  test(`return 200 as status code and have 'total' and 'data' as properties`, async () => {
    expect.assertions(2)

    const res = await request(app).get('/v1/logs').set({
      Authorization: token
    })

    expect(res.statusCode).toEqual(200)

    expect(Object.keys(res.body)).toMatchObject([
      'total',
      'data'
    ])
  })

  test('return the right number of items and an object with all items', async () => {
    expect.assertions(2)
    const res = await request(app).get('/v1/logs').set({
      Authorization: token
    })
    expect(res.statusCode).toEqual(200)
    expect(typeof res.body.data).toBe('object')

  })

  test(`return the 'data' property with all items from DB`, async () => {

    expect.assertions(1)

    const res = await request(app).get('/v1/logs').set({
      Authorization: token
    })


    expect(res.body).toMatchObject({

      total: 1,
      data:
        [{
          id: 1,
          title: 'Erro de BD',
          level: 'error',
          events: 2,
          environment: 'prod',
          source_address: '200.135.14.129',
          archived: null,
        }]
    })
  })

  test(`test filter =`, async () => {

    expect.assertions(1)

    const res = await request(app).get('/v1/logs?filter=id=1').set({
      Authorization: token
    })


    expect(res.body).toMatchObject({

      total: 1,
      data:
        [{
          id: 1,
          title: 'Erro de BD',
          level: 'error',
          events: 2,
          environment: 'prod',
          source_address: '200.135.14.129',
          archived: null,
        }]
    })
  })  

  test(`test filter in`, async () => {

    expect.assertions(1)

    const res = await request(app).get('/v1/logs?filter=id=1,0,2').set({
      Authorization: token
    })


    expect(res.body).toMatchObject({

      total: 1,
      data:
        [{
          id: 1,
          title: 'Erro de BD',
          level: 'error',
          events: 2,
          environment: 'prod',
          source_address: '200.135.14.129',
          archived: null,
        }]
    })
  })    

  

  test(`test filter >=`, async () => {

    expect.assertions(1)

    const res = await request(app).get('/v1/logs?filter=id>=1').set({
      Authorization: token
    })


    expect(res.body).toMatchObject({

      total: 1,
      data:
        [{
          id: 1,
          title: 'Erro de BD',
          level: 'error',
          events: 2,
          environment: 'prod',
          source_address: '200.135.14.129',
          archived: null,
        }]
    })
  })    

  test(`test filter >`, async () => {

    expect.assertions(1)

    const res = await request(app).get('/v1/logs?filter=id>0').set({
      Authorization: token
    })


    expect(res.body).toMatchObject({

      total: 1,
      data:
        [{
          id: 1,
          title: 'Erro de BD',
          level: 'error',
          events: 2,
          environment: 'prod',
          source_address: '200.135.14.129',
          archived: null,
        }]
    })
  })      

  test(`test filter <=`, async () => {

    expect.assertions(1)

    const res = await request(app).get('/v1/logs?filter=id<=1').set({
      Authorization: token
    })


    expect(res.body).toMatchObject({

      total: 1,
      data:
        [{
          id: 1,
          title: 'Erro de BD',
          level: 'error',
          events: 2,
          environment: 'prod',
          source_address: '200.135.14.129',
          archived: null,
        }]
    })
  })    

  test(`test filter <`, async () => {

    expect.assertions(1)

    const res = await request(app).get('/v1/logs?filter=id<2').set({
      Authorization: token
    })


    expect(res.body).toMatchObject({

      total: 1,
      data:
        [{
          id: 1,
          title: 'Erro de BD',
          level: 'error',
          events: 2,
          environment: 'prod',
          source_address: '200.135.14.129',
          archived: null,
        }]
    })
  })        

  test(`test order`, async () => {

    expect.assertions(1)

    const res = await request(app).get('/v1/logs?order=id').set({
      Authorization: token
    })


    expect(res.body).toMatchObject({

      total: 1,
      data:
        [{
          id: 1,
          title: 'Erro de BD',
          level: 'error',
          events: 2,
          environment: 'prod',
          source_address: '200.135.14.129',
          archived: null,
        }]
    })
  })    

  test(`test environment`, async () => {

    expect.assertions(1)

    const res = await request(app).get('/v1/logs?environment=prod').set({
      Authorization: token
    })


    expect(res.body).toMatchObject({

      total: 1,
      data:
        [{
          id: 1,
          title: 'Erro de BD',
          level: 'error',
          events: 2,
          environment: 'prod',
          source_address: '200.135.14.129',
          archived: null,
        }]
    })
  })      

  test(`test invalid environment`, async () => {

    expect.assertions(1)

    const res = await request(app).get('/v1/logs?environment=prod2').set({
      Authorization: token
    })


    expect(res.body).toMatchObject({ "errors": [
      "Value 'prod2' is invalid for 'environment' parameter, the valid values are [prod,homolog,dev]"
    ]})
  })        

}) /* Fim do describe */


/* GET BY ID */

describe('The API on /v1/logs/id Endpoint at GET method should...', () => {
  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
    await sequelize.query('TRUNCATE TABLE logs;')
    await sequelize.query('TRUNCATE TABLE applications;')
    await sequelize.query('TRUNCATE TABLE users;')
    await sequelize.sync()

    await populateTable(userModel, {
      name: 'Ronielson Macedo',
      email: 'ronielson@gmail.com',
      password: '12345678'
    })

    await populateTable(userModel, {
      name: 'Ronielson Macedo 2',
      email: 'ronielson2@gmail.com',
      password: '12345678'
    })




    await populateTable(applicationsModel, {
      name: 'Central de erros teste',
      description: 'Apia para armazenar e vizualizar erros',
      token: applicationToken,
      userId: 1
    })

    await populateTable(logsModel, {
      title: "Erro de BD",
      detail: "Erro ao tentar conectar no banco de dados",
      level: "error",
      events: 2,
      environment: "prod",
      source_address: "200.135.14.129",
      applicationId: 1
    })






    const getToken = async () => {
      return response = await request(app).post('/v1/login').send({
        email: 'ronielson@gmail.com',
        password: '12345678'
      })
    }

    const getToken2 = async () => {
      return response = await request(app).post('/v1/login').send({
        email: 'ronielson2@gmail.com',
        password: '12345678'
      })
    }

    res = await getToken()
    res2 = await getToken2()

    token = res.body.token
    token2 = res2.body.token
  })


  test(`return 200 as status code and have 'total' and 'data' as properties`, async () => {
    expect.assertions(2)

    const res = await request(app).get('/v1/logs/1').set({
      Authorization: token
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({
      title: "Erro de BD",
      detail: "Erro ao tentar conectar no banco de dados",
      level: "error",
      events: 2,
      environment: "prod",
      source_address: "200.135.14.129",
      application: {
        id: 1,
        name: "Central de erros teste",
        description: "Apia para armazenar e vizualizar erros",
        userId: 1
      }
    })
  })



  test('return 200 as status code and have properly attributes', async () => {
    expect.assertions(2)
    const res = await request(app).get('/v1/logs/1').set({
      Authorization: token
    })

    expect(res.statusCode).toEqual(200)
    expect(Object.keys(res.body)).toMatchObject([
      "id",
      "title",
      "detail",
      "level",
      "events",
      "environment",
      "source_address",
      "archived",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "application"
    ])

  })


  test('return 400 as status code if log is not found', async () => {
    const id = 'NOTFOUND'
    expect.assertions(2)
    const res = await request(app).get(`/v1/logs/${id}`).set({
      Authorization: token
    })

    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({
      error: `Log is not found`
    })

  })

  /* Fazendo */
  test('return 403 as status code if log is not found', async () => {

    const res = await request(app).get(`/v1/logs/1`).set({
      Authorization: token2
    })

    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
      error: `You don't have access to this feature`
    })

  })

})






/* DESCRIBE ṔOST  LOGS */

describe('The API on /v1/logs Endpoint at POST method should...', () => {
  beforeEach(async () => {

    await populateTable(userModel, {
      name: 'Ronielson Macedo',
      email: 'ronielson@gmail.com',
      password: '12345678'
    })

    await populateTable(applicationsModel, {
      name: 'Central de erros teste',
      description: 'Apia para armazenar e vizualizar erros',
      token: applicationToken,
      userId: 1
    })



    const getToken = async () => {
      return response = await request(app).post('/v1/login').send({
        email: 'ronielson@gmail.com',
        password: '12345678'
      })
    }

    res = await getToken()

    token = res.body.token
  })


  

  test('return 201 as status code and the new record created properties', async () => {
    expect.assertions(2)
    const res = await request(app).post(`/v1/logs?token=${applicationToken}`).send({
      "title": "Erro de BD",
      "detail": "Erro ao tentar conectar no banco de dados",
      "level": "error",
      "events": 2,
      "environment": "prod",
      "source_address": "200.135.14.129",
      "applicationId": 1

    })

    expect(res.statusCode).toEqual(201)
    expect(Object.keys(res.body)).toMatchObject([
      "id",
      "title",
      "detail",
      "level",
      "events",
      "environment",
      "source_address",
      "archived",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "application"
    ])
  })



  test('return 201 as status code and the new record created properties', async () => {
    expect.assertions(2)
    const res = await request(app).post(`/v1/logs?token=${applicationToken}`).send({
      "title": "Erro de BD",
      "detail": "Erro ao tentar conectar no banco de dados",
      "level": "error",
      "events": 2,
      "environment": "prod",
      "source_address": "200.135.14.129",
      "applicationId": 1

    })


    expect(res.statusCode).toEqual(201)
    expect(res.body).toMatchObject({


      "id": 1,
      "title": 'Erro de BD',
      "detail": 'Erro ao tentar conectar no banco de dados',
      "level": 'error',
      "events": 2,
      "environment": 'prod',
      "source_address": '200.135.14.129',
      "archived": null,
      "deletedAt": null,
      "application":
      {
        "id": 1,
        "name": 'Central de erros teste',
        "description": 'Apia para armazenar e vizualizar erros',
        "userId": 1,
        "user": { "id": 1, "name": 'Ronielson Macedo' }
      }





    })
  })


})

/* DESCRIBE DELETE  LOGS */

describe('The API on /v1/logs Endpoint at POST method should...', () => {
  beforeEach(async () => {
    await populateTable(userModel, {
      name: 'Ronielson Macedo',
      email: 'ronielson@gmail.com',
      password: '12345678'
    })

    await populateTable(applicationsModel, {
      name: 'Central de erros teste',
      description: 'Apia para armazenar e vizualizar erros',
      token: applicationToken,
      userId: 1
    })

    await populateTable(logsModel, {
      title: "Erro de BD",
      detail: "Erro ao tentar conectar no banco de dados",
      level: "error",
      events: 2,
      environment: "prod",
      source_address: "200.135.14.129",
      applicationId: 1
    })


    const getToken = async () => {
      return response = await request(app).post('/v1/login').send({
        email: 'ronielson@gmail.com',
        password: '12345678'
      })
    }

    res = await getToken()

    token = res.body.token
  })


 


  test('return 204 as status code and the new record created properties', async () => {
    expect.assertions(2)
    const res = await request(app).delete(`/v1/logs/1`).set({
      Authorization: token
    })

    expect(res.statusCode).toEqual(204)
    expect(res.body).toMatchObject({})
  })

  test('return 400 as status code if log couldn t be found', async () => {
    expect.assertions(2)
    const id = 'NOTFOUND'
    const res = await request(app).delete(`/v1/logs/${id}`)
      .set({ Authorization: token })


    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({
      error: `Log is not found`
    })
  })
})



/* DESCRIBE POST  LOGS archive*/


describe('The API on /v1/logs Endpoint at POST method should...', () => {
  beforeEach(async () => {
    await populateTable(userModel, {
      name: 'Ronielson Macedo',
      email: 'ronielson@gmail.com',
      password: '12345678'
    })

    await populateTable(applicationsModel, {
      name: 'Central de erros teste',
      description: 'Apia para armazenar e vizualizar erros',
      token: applicationToken,
      userId: 1
    })

    await populateTable(logsModel, {
      title: "Erro de BD",
      detail: "Erro ao tentar conectar no banco de dados",
      level: "error",
      events: 2,
      environment: "prod",
      source_address: "200.135.14.129",
      applicationId: 1
    })


    const getToken = async () => {
      return response = await request(app).post('/v1/login').send({
        email: 'ronielson@gmail.com',
        password: '12345678'
      })
    }

    res = await getToken()

    token = res.body.token
  })

 

  test('return 204 as status code and the new record is archived', async () => {
    expect.assertions(2)
    const res = await request(app).post(`/v1/logs/1/archive`).send({
      "archived": true
    }).set({ Authorization: token })



    expect(res.statusCode).toEqual(204)
    expect(res.body).toMatchObject({})
  })
})













