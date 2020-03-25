const { NODE_ENV = 'test' } = process.env
const table = `sentinel_log_${NODE_ENV}`
const sequelize = require('../src/models/index')
const userModel = require('../src/models/users')

const { populateTable, cleanTable } = require('./utils')
const request = require('supertest')
const { app } = require('../src/app.js')

let token

beforeAll(async () => {

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
  await sequelize.query('DROP TABLE IF EXISTS logs;')
  await sequelize.query('DROP TABLE IF EXISTS apllications;')
  await sequelize.query('DROP TABLE IF EXISTS users;')
  await sequelize.sync()

})

afterAll(async () => {
  await sequelize.query('DROP TABLE IF EXISTS logs;')
  await sequelize.query('DROP TABLE IF EXISTS apllications;')
  await sequelize.query('DROP TABLE IF EXISTS users;')
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;')
  await sequelize.close()
})



/* Describe users */

describe('The API on /v1/users/ Endpoint at GET method should...', () => {
  beforeEach(async () => {
    populateTable(userModel, {
      name: 'Rogerio Miguel',
      email: 'rogerio@hotmail.com',
      password: '12345678'
    })


    const getToken = async () => {
      return response = await request(app).post('/v1/login').send({
        email: 'rogerio@hotmail.com',
        password: '12345678'
      })
    }

    const res = await getToken()

    token = res.body.token

  })

  afterEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
    await sequelize.query('TRUNCATE TABLE logs;')
    await sequelize.query('TRUNCATE TABLE applications;')
    await sequelize.query('TRUNCATE TABLE users;')
  })



  test(`return 200 as status code and have 'total' and 'data' as properties`, async () => {
    expect.assertions(2)

    const res = await request(app).get('/v1/users').set({
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
    const res = await request(app).get('/v1/users').set({
      Authorization: token
    })
    expect(res.statusCode).toEqual(200)
    expect(typeof res.body.data).toBe('object')

  })


  test(`return the 'data' property with all items from DB`, async () => {

    expect.assertions(1)

    const res = await request(app).get('/v1/users').set({
      Authorization: token
    })

    expect(res.body).toMatchObject({

      total: 1,
      data:
        [{
          id: 1,
          name: 'Rogerio Miguel',
          email: 'rogerio@hotmail.com'
        }]

    })
  })
})


/* Describe users/userID */

describe('The API on /v1/users/:userID Endpoint at GET method should...', () => {
  beforeEach(async () => {
    populateTable(userModel, {
      name: 'Rogerio Miguel',
      email: 'rogerio@hotmail.com',
      password: '12345678'
    })


    const getToken = async () => {
      return response = await request(app).post('/v1/login').send({
        email: 'rogerio@hotmail.com',
        password: '12345678'
      })
    }

    const res = await getToken()

    token = res.body.token

  })

  afterEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
    await sequelize.query('TRUNCATE TABLE logs;')
    await sequelize.query('TRUNCATE TABLE applications;')
    await sequelize.query('TRUNCATE TABLE users;')
  })

  test('return 200 as status code and have properly attributes', async () => {
    expect.assertions(2)
    const res = await request(app).get('/v1/users/1').set({
      Authorization: token
    })

    expect(res.statusCode).toEqual(200)
    expect(Object.keys(res.body)).toMatchObject([
      "id",
      "name",
      "email",
      "createdAt",
      "updatedAt"
    ])

  })

  test('return 200 as status code and the item founded', async () => {
    expect.assertions(2)
    const res = await request(app).get('/v1/users/1').set({
      Authorization: token
    })
    expect(res.statusCode).toEqual(200)

    expect(res.body).toMatchObject({
      id: 1,
      name: 'Rogerio Miguel',
      email: 'rogerio@hotmail.com'
    })
  })

  test('return 404 if item not be found', async () => {
    expect.assertions(2)
    const id = 'NOTFOUND'
    const res = await request(app).get(`/v1/users/${id}`).set({
      Authorization: token
    })


    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({
      error: `The user id ${id} couldn't be found.`
    })

  })
})

/* Describe POST users */

describe('The API on /v1/users Endpoint at POST method should...', () => {
  beforeEach(async () => {
  })

  afterEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
    await sequelize.query('TRUNCATE TABLE logs;')
    await sequelize.query('TRUNCATE TABLE applications;')
    await sequelize.query('TRUNCATE TABLE users;')
  })

  test('return 201 as status code and the new record created properties', async () => {
    expect.assertions(2)
    const res = await request(app).post('/v1/users').send({
      "name": "Ronielson Macedo",
      "email": "ronimacedo2@teste.com",
      "password": "12345678"

    })

    expect(res.statusCode).toEqual(201)
    expect(Object.keys(res.body)).toMatchObject([
      "id",
      "name",
      "email",
      "password",
      "updatedAt",
      "createdAt"
    ])
  })

  test('return 201 as status code and the new record created ', async () => {
    expect.assertions(2)
    const res = await request(app).post('/v1/users').send({
      "name": "Ronielson Macedo",
      "email": "ronimacedo2@teste.com",
      "password": "12345678"
    })

    expect(res.statusCode).toEqual(201)
    expect(res.body).toMatchObject({
      "name": "Ronielson Macedo",
      "email": "ronimacedo2@teste.com",
    })
  })

  test('return 400 as status code if the password is empty', async () => {
    expect.assertions(2)
    const res = await request(app).post('/v1/users').send({
      "name": "Ronielson Macedo",
      "email": "ronimacedo2@teste.com",
      "password": ""
    })

    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({
      error: 'The password field cannot be empty'
    })
  })


  test('return 400 as status code if the password is less than 8 characters', async () => {
    expect.assertions(2)
    const res = await request(app).post('/v1/users').send({
      "name": "Ronielson Macedo",
      "email": "ronimacedo2@teste.com",
      "password": "123"
    })

    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({
      error: 'The password field must be at least 8 characters'
    })
  })

})


/* Describe PATCH users */

describe('The API on /v1/users/:userID Endpoint at PATCH method should...', () => {
  beforeEach(async () => {
    populateTable(userModel, {
      name: 'Ronielson Macedo',
      email: 'ronielson@gmail.com',
      password: '12345678'
    })

    populateTable(userModel, {
      name: 'Ronielson Macedo 3 ',
      email: 'ronielson3@gmail.com',
      password: '12345678'
    })


    const getToken = async () => {
      return response = await request(app).post('/v1/login').send({
        email: 'ronielson@gmail.com',
        password: '12345678'
      })
    }

    const res = await getToken()

    token = res.body.token

  })

  afterEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
    await sequelize.query('TRUNCATE TABLE logs;')
    await sequelize.query('TRUNCATE TABLE applications;')
    await sequelize.query('TRUNCATE TABLE users;')
  })

  test('return 201 as status code and the new record created', async () => {
    expect.assertions(2)
    const res = await request(app).patch('/v1/users/1').send({
      "name": "Ronielson Xavier",
      "email": "ronielson2@teste.com",
    }).set({ Authorization: token })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({
      "name": "Ronielson Xavier",
      "email": "ronielson2@teste.com"
    })
  })

  test('return 201 as status code and the new record created', async () => {
    expect.assertions(2)
    const res = await request(app).patch('/v1/users/1').send({
      "name": "Ronielson Xavier",
      "email": "ronielson2@teste.com",
    }).set({ Authorization: token })

    expect(res.statusCode).toEqual(200)
    expect(Object.keys(res.body)).toMatchObject([
      "id",
      "name",
      "email",
      "createdAt",
      "updatedAt"

    ])
  })


  test('return 403 as status code if users don t have access to feature', async () => {
    expect.assertions(2)
    const res = await request(app).patch('/v1/users/2').send({
      "name": "Ronielson Macedo",
      "email": "ronimacedo2@teste.com"
    }).set({Authorization: token})

    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
      error: `You don't have access to this feature`
    })
  })


  test('return 404 as status code if user couldn t be found', async () => {
    expect.assertions(2)
    const id = 'NOTFOUND'
    const res = await request(app).patch(`/v1/users/${id}`).send({
      "name": "Ronielson Macedo",
      "email": "ronimacedo2@teste.com"
    }).set({ Authorization: token })

    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({
      error: `The user id ${id} couldn't be found.`
    })
  })

})


/* Describe DELETE users */

describe('The API on /v1/users/userID Endpoint at DELETE method should...', () => {
  beforeEach(async () => {
    populateTable(userModel, {
      name: 'Ronielson Macedo',
      email: 'ronielson@gmail.com',
      password: '12345678'
    })

    populateTable(userModel, {
      name: 'Ronielson Macedo 3 ',
      email: 'ronielson3@gmail.com',
      password: '12345678'
    })



    const getToken = async () => {
      return response = await request(app).post('/v1/login').send({
        email: 'ronielson@gmail.com',
        password: '12345678'
      })
    }

    const res = await getToken()

    token = res.body.token

  })

  afterEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;')
    await sequelize.query('TRUNCATE TABLE logs;')
    await sequelize.query('TRUNCATE TABLE applications;')
    await sequelize.query('TRUNCATE TABLE users;')
  })

  test('return 204 as status code if the user to be destroy', async () => {
    expect.assertions(2)
    const res = await request(app).delete('/v1/users/1')
                                  .set({ Authorization: token })

    expect(res.statusCode).toEqual(204)
    expect(res.body).toMatchObject({})
  })

  test('return 404 as status code if user couldn t be found', async () => {
    expect.assertions(2)
    const id = 'NOTFOUND'
    const res = await request(app).delete(`/v1/users/${id}`)
                                  .set({ Authorization: token })

    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({
      error: `The user id ${id} couldn't be found.`
    })
  })


  test('return 403 as status code if users don t have access to feature', async () => {
    expect.assertions(2)
    const res = await request(app).delete('/v1/users/2')
                                  .set({Authorization: token})

    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
      error: `You don't have access to this feature`
    })
  })

})
