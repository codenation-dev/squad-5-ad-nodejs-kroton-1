const nofiticationModel = require('../src/models/notifications')
const request = require('supertest')
const { app } = require('../src/app.js')

const { 
    BeforeAll, 
    AfterAll, 
    createUser, 
    truncateAllTables, 
    populateTable,
    getUserDataKeys,
    clearUserData,
    cloneObject,
 } = require('./utils')

beforeAll(BeforeAll)
afterAll(AfterAll)

let user

const Apps = {
    app1: {
        new: {
            name: 'Application number 1',
            description: 'Application 1',
        },
    },
    app2: {
        new: {
            name: 'Application number 2',
            description: 'Application 1',            
        }
    }
}

const Notifications = {
    notification1: {
        new: {
            name: 'Notificação 1 do App 1',
            detail: 'Notificação 1 do App 1',
        },
    },
    notification2: {
        new: {
            name: 'Notificação 1 do App 2',
            detail: 'Notificação 1 do App 2',
        },
    },
}

const createApps = async () => {
    let res
    
    res = await request(app).post('/v1/applications')
        .send(Apps.app1.new)
        .set({
            Authorization: user.admin.jwt
        })

    Apps.app1.data = clearUserData(res.body)
    Apps.app1.keys = getUserDataKeys(res.body)

    res = await request(app).post('/v1/applications')
        .send(Apps.app2.new)
        .set({
            Authorization: user.common.jwt
        })

    Apps.app2.data = clearUserData(res.body)
    Apps.app2.keys = getUserDataKeys(res.body)    
}

const createNotification = async (notification, appId) => {
    const newData = JSON.parse(JSON.stringify(notification))
    newData.applicationId = appId
    const created = await populateTable(nofiticationModel, newData)
    
    const data = clearUserData(created)
    const keys = getUserDataKeys(created)

    delete data.applicationId

    return {
        new: notification,
        data,
        keys,
    }
}

const createNotifications = async () => {
    Notifications.notification1 = await createNotification(Notifications.notification1.new, Apps.app1.data.id)
    Notifications.notification2 = await createNotification(Notifications.notification2.new, Apps.app2.data.id)
}

// Get All
describe('The API on /v1/applications/<appId>/notifications Endpoint at GET method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/1/notifications`)

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })

  test(`with appId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)
    
    const id = 'abc'
    const res = await request(app).get(`/v1/applications/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })

  // Admin
  test(`for admin user with invalid appId returns 404 as status code and message 'The application id <appId> couldn't be found.'`, async () => {
    expect.assertions(2)
  
    const id = 999
    const res = await request(app).get(`/v1/applications/${id}/notifications`).set({
      Authorization: user.admin.jwt
    })

    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({
        error: `The application id ${id} couldn't be found.`
    })
  })

  test(`for admin user on App1 returns the 'data' property with all items from DB`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/${Apps.app1.data.id}/notifications`).set({
      Authorization: user.admin.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({  
        total: 1,
        data:
          [ Notifications.notification1.data ]
      })
  })

  test(`for admin user on App2 returns the 'data' property with all items from DB`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/${Apps.app2.data.id}/notifications`).set({
      Authorization: user.admin.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({  
        total: 1,
        data:
          [ Notifications.notification2.data ]
      })
  })

  // common
  test(`for common user with invalid appId returns 404 as status code and message 'The application id <appId> couldn't be found.'`, async () => {
    expect.assertions(2)
  
    const id = 999
    const res = await request(app).get(`/v1/applications/${id}/notifications`).set({
      Authorization: user.common.jwt
    })

    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({
        error: `The application id ${id} couldn't be found.`
    })
  })

  test(`for common user on App 1 returns 403 as status code and message 'You don't have access to this feature'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/${Apps.app1.data.id}/notifications`).set({
      Authorization: user.common.jwt
    })

    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
        error: `You don't have access to this feature`
    })
  })

  test(`for common user on App2 returns the 'data' property with all items from DB`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/${Apps.app2.data.id}/notifications`).set({
      Authorization: user.common.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({  
        total: 1,
        data:
          [ Notifications.notification2.data ]
      })
  })  
})

// Get One
describe('The API on /v1/applications/<appId>/notifications/<notificationId> Endpoint at GET method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/1/notifications/1`)

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })  

  test(`with appId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)
    
    const id = 'abc'
    const res = await request(app).get(`/v1/applications/${id}/notifications/1`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })

  test(`with notificationId as text 'abc' returns 400 as status code and message 'The request is incorrect'`, async () => {
    expect.assertions(2)
    
    const id = 'abc'
    const res = await request(app).get(`/v1/applications/1/notifications/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })

  // admin
  test(`for admin user with invalid appId returns 404 as status code and message 'The application id <appId> couldn't be found.`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).get(`/v1/applications/${id}/notifications/1`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The application id ${id} couldn't be found.`})
  })

  test(`for admin user with invalid notificationId returns 404 as status code and message 'The notification id <notificationId> couldn't be found.'`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).get(`/v1/applications/1/notifications/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The notification id ${id} couldn't be found.`})
  })

  test(`for admin user on App 1 get notification 1 returns 200 as status code and updated record.`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification1.data)    
    const res = await request(app).get(`/v1/applications/${Apps.app1.data.id}/notifications/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })

  test(`for admin user on App 1 get notification 2 returns 403 as status code and message 'The notification id <notificationId> does not belong to that application'.`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification2.data)    
    const res = await request(app).get(`/v1/applications/${Apps.app1.data.id}/notifications/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The notification id ${data.id} does not belong to that application` })
  })  

  test(`for admin user on App 2 get notification 1 returns 403 as status code and message 'The notification id <notificationId> does not belong to that application'.`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification1.data)    
    const res = await request(app).get(`/v1/applications/${Apps.app2.data.id}/notifications/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The notification id ${data.id} does not belong to that application` })
  })

  test(`for admin user on App 2 get notification 2 returns 200 as status code and updated record.`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification2.data)    
    const res = await request(app).get(`/v1/applications/${Apps.app2.data.id}/notifications/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })

  // common
  test(`for common user with invalid appId returns 404 as status code and message 'The application id <appId> couldn't be found.`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).get(`/v1/applications/${id}/notifications/1`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The application id ${id} couldn't be found.`})
  })

  test(`for common user with invalid notificationId returns 404 as status code and message 'The notification id <notificationId> couldn't be found.'`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).get(`/v1/applications/2/notifications/${id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The notification id ${id} couldn't be found.`})
  })

  test(`for common user on App 1 get notification 1 403 as status code and message 'You don't have access to this feature'.`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification1.data)    
    const res = await request(app).get(`/v1/applications/${Apps.app1.data.id}/notifications/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `You don't have access to this feature` })
  })

  test(`for common user on App 1 get notification 2 403 as status code and message 'You don't have access to this feature'.`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification2.data)    
    const res = await request(app).get(`/v1/applications/${Apps.app1.data.id}/notifications/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `You don't have access to this feature` })
  })  

  test(`for common user on App 2 get notification 1 returns 403 as status code and message 'The notification id <notificationId> does not belong to that application'.`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification1.data)    
    const res = await request(app).get(`/v1/applications/${Apps.app2.data.id}/notifications/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The notification id ${data.id} does not belong to that application` })
  })

  test(`for common user on App 2 get notification 2 returns 200 as status code and updated record.`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification2.data)    
    const res = await request(app).get(`/v1/applications/${Apps.app2.data.id}/notifications/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })
})

// Post
describe('The API on /v1/applications/<appId>/notifications Endpoint at POST method should...', () => {
    beforeEach(async () => {
        user = await createUser()
        await createApps()
    })

    afterEach(truncateAllTables)

    test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
      expect.assertions(2)
    
      const res = await request(app).post(`/v1/applications/1/notifications`).send(Notifications.notification1.new)
  
      expect(res.statusCode).toEqual(401)
      expect(res.body).toMatchObject({
          error: `Authentication failure`
      })
    })      

    test(`with appId as text 'abc' returns 400 as status code and message 'The request is incorrect'`, async () => {
      expect.assertions(2)
      
      const id = 'abc'
      const res = await request(app).post(`/v1/applications/${id}/notifications`).send(Notifications.notification1.new).set({
        Authorization: user.admin.jwt
      })
      
      expect(res.statusCode).toEqual(400)
      expect(res.body).toMatchObject({ error: `The request is incorrect`})
    })

    // admin
    test(`for admin user with invalid appId returns 404 as status code and message 'The application id <appId> couldn't be found.'`, async () => {
      expect.assertions(2)
      
      const id = 999
      const res = await request(app).post(`/v1/applications/${id}/notifications`).send(Notifications.notification1.new).set({
        Authorization: user.admin.jwt
      })
      
      expect(res.statusCode).toEqual(404)
      expect(res.body).toMatchObject({ error: `The application id ${id} couldn't be found.`})
    })

    test(`for admin user on App 1 returns 201 as status code and new record created.'`, async () => {
      expect.assertions(2)

      const res = await request(app).post(`/v1/applications/${Apps.app1.data.id}/notifications`).send(Notifications.notification1.new).set({
        Authorization: user.admin.jwt
      })
      
      expect(res.statusCode).toEqual(201)
      expect(res.body).toMatchObject(Notifications.notification1.data)
    })

    test(`for admin user on App 2 returns 201 as status code and new record created.'`, async () => {
      expect.assertions(2)

      const res = await request(app).post(`/v1/applications/${Apps.app2.data.id}/notifications`).send(Notifications.notification2.new).set({
        Authorization: user.admin.jwt
      })

      const data = cloneObject(Notifications.notification2.data)
      data.id = 1      
      expect(res.statusCode).toEqual(201)
      expect(res.body).toMatchObject(data)
    })    

    // common
    test(`for common user with invalid appId returns 404 as status code and message 'The application id <appId> couldn't be found.'`, async () => {
      expect.assertions(2)
      
      const id = 999
      const res = await request(app).post(`/v1/applications/${id}/notifications`).send(Notifications.notification2.new).set({
        Authorization: user.common.jwt
      })
      
      expect(res.statusCode).toEqual(404)
      expect(res.body).toMatchObject({ error: `The application id ${id} couldn't be found.`})
    })

    test(`for common user on App 1 returns 403 as status code and message 'You don't have access to this feature'`, async () => {
      expect.assertions(2)

      const res = await request(app).post(`/v1/applications/${Apps.app1.data.id}/notifications`).send(Notifications.notification1.new).set({
        Authorization: user.common.jwt
      })
      
      expect(res.statusCode).toEqual(403)
      expect(res.body).toMatchObject({
          error: `You don't have access to this feature`
      })
    })

    test(`for common user on App 2 returns 201 as status code and new record created.'`, async () => {
      expect.assertions(2)

      const res = await request(app).post(`/v1/applications/${Apps.app2.data.id}/notifications`).send(Notifications.notification2.new).set({
        Authorization: user.common.jwt
      })
      
      const data = cloneObject(Notifications.notification2.data)
      data.id = 1
      expect(res.statusCode).toEqual(201)      
      expect(res.body).toMatchObject(data)
    })    
})

// Patch
describe('The API on /v1/applications/<appId>/notifications/<notificationId> Endpoint at PATCH method should...', () => {
  beforeEach(async () => {
      user = await createUser()
      await createApps()
      await createNotifications()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).patch(`/v1/applications/1/notifications/1`).send({ detail: 'alterado' })

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })

  test(`with appId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)
    
    const id = 'abc'
    const res = await request(app).patch(`/v1/applications/${id}/notifications/1`).send({ detail: 'alterado' }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })

  test(`with notificationId as text 'abc' returns 400 as status code and message 'The request is incorrect'`, async () => {
    expect.assertions(2)
    
    const id = 'abc'
    const res = await request(app).patch(`/v1/applications/1/notifications/${id}`).send({ detail: 'alterado' }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })

  // admin
  test(`for admin user with invalid appId returns 404 as status code and message 'The application id <appId> couldn't be found.'`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).patch(`/v1/applications/${id}/notifications/1`).send({ detail: 'alterado' }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The application id ${id} couldn't be found.`})
  })

  test(`for admin user with invalid notificationId returns 404 as status code and message 'The notification id <notificationId> couldn't be found.'`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).patch(`/v1/applications/1/notifications/${id}`).send({ detail: 'alterado' }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The notification id ${id} couldn't be found.`})
  })

  test(`for admin user on App 1 updating notification 1 returns 200 as status code and updated record.'`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification1.data)
    data.detail = 'alterado'
    const res = await request(app).patch(`/v1/applications/${Apps.app1.data.id}/notifications/${data.id}`).send({ detail: data.detail }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })

  test(`for admin user on App 1 updating notification 2 returns 403 as status code and message 'The notification id <notificationId> does not belong to that application'`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification2.data)
    data.detail = 'alterado'
    const res = await request(app).patch(`/v1/applications/${Apps.app1.data.id}/notifications/${data.id}`).send({ detail: data.detail }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The notification id ${data.id} does not belong to that application` })
  })

  test(`for admin user on App 2 updating notification 1 returns 403 as status code and message 'The notification id <notificationId> does not belong to that application'`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification1.data)
    data.detail = 'alterado'
    const res = await request(app).patch(`/v1/applications/${Apps.app2.data.id}/notifications/${data.id}`).send({ detail: data.detail }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The notification id ${data.id} does not belong to that application` })
  })      
  
  test(`for admin user on App 2 updating notification 2 returns 200 as status code and updated record.'`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification2.data)
    data.detail = 'alterado'
    const res = await request(app).patch(`/v1/applications/${Apps.app2.data.id}/notifications/${data.id}`).send({ detail: data.detail }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })    

  // common
  test(`for common user with invalid appId returns 404 as status code and message 'The application id <appId> couldn't be found.'`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).patch(`/v1/applications/${id}/notifications/1`).send({ detail: 'alterado' }).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The application id ${id} couldn't be found.`})
  })

  test(`for common user with invalid notificationId returns 404 as status code and message 'The notification id <notificationId> couldn't be found.'`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).patch(`/v1/applications/2/notifications/${id}`).send({ detail: 'alterado' }).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The notification id ${id} couldn't be found.`})
  })

  test(`for common user on App 1 updating notification 1 returns 403 as status code and message 'You don't have access to this feature'`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification1.data)
    data.detail = 'alterado'
    const res = await request(app).patch(`/v1/applications/${Apps.app1.data.id}/notifications/${data.id}`).send({ detail: data.detail }).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
        error: `You don't have access to this feature`
    })
  })

  test(`for common user on App 2 updating notification 1 returns 200 as status code and updated record.`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification2.data)
    data.detail = 'alterado'    
    const res = await request(app).patch(`/v1/applications/${Apps.app2.data.id}/notifications/${data.id}`).send({ detail: data.detail }).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })    
})

// Delete
describe('The API on /v1/applications/<appId>/notifications/<notificationId> Endpoint at DELETE method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).delete(`/v1/applications/1/notifications/1`)

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })

  test(`with appId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)
    
    const id = 'abc'
    const res = await request(app).delete(`/v1/applications/${id}/notifications/1`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })

  test(`with notificationId as text 'abc' returns 400 as status code and message 'The request is incorrect'`, async () => {
    expect.assertions(2)
    
    const id = 'abc'
    const res = await request(app).delete(`/v1/applications/1/notifications/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })

  // admin
  test(`for admin user with invalid appId returns 404 as status code and message 'The application id <appId> couldn't be found.'`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).delete(`/v1/applications/${id}/notifications/1`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The application id ${id} couldn't be found.`})
  })

  test(`for admin user with invalid notificationId returns 404 as status code and message 'The notification id <notificationId> couldn't be found.'`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).delete(`/v1/applications/1/notifications/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The notification id ${id} couldn't be found.`})
  })

  test(`for admin user on App 1 deleting notification 1 returns 204 as status code.'`, async () => {
    expect.assertions(1)

    const data = cloneObject(Notifications.notification1.data)
    const res = await request(app).delete(`/v1/applications/${Apps.app1.data.id}/notifications/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(204)
  })

  test(`for admin user on App 1 deleting notification 2 returns 403 as status code and message 'The notification id <notificationId> does not belong to that application'`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification2.data)
    const res = await request(app).delete(`/v1/applications/${Apps.app1.data.id}/notifications/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The notification id ${data.id} does not belong to that application` })
  })

  test(`for admin user on App 2 deleting notification 1 returns 403 as status code and message 'The notification id <notificationId> does not belong to that application'`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification1.data)
    const res = await request(app).delete(`/v1/applications/${Apps.app2.data.id}/notifications/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The notification id ${data.id} does not belong to that application` })
  })      

  test(`for admin user on App 2 deleting notification 2 returns 204 as status code.'`, async () => {
    expect.assertions(1)

    const data = cloneObject(Notifications.notification2.data)
    const res = await request(app).delete(`/v1/applications/${Apps.app2.data.id}/notifications/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(204)
  })    

  // common
  test(`for common user with invalid appId returns 404 as status code and message 'The application id <appId> couldn't be found.'`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).delete(`/v1/applications/${id}/notifications/1`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The application id ${id} couldn't be found.`})
  })

  test(`for common user with invalid notificationId returns 404 as status code and message 'The notification id <notificationId> couldn't be found.'`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).delete(`/v1/applications/2/notifications/${id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The notification id ${id} couldn't be found.`})
  })

  test(`for common user on App 1 deleting notification 1 returns 403 as status code and message 'You don't have access to this feature'`, async () => {
    expect.assertions(2)

    const data = cloneObject(Notifications.notification1.data)
    const res = await request(app).delete(`/v1/applications/${Apps.app1.data.id}/notifications/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
        error: `You don't have access to this feature`
    })
  })

  test(`for common user on App 2 deleting notification 1 returns 204 as status code.`, async () => {
    expect.assertions(1)

    const data = cloneObject(Notifications.notification2.data)
    const res = await request(app).delete(`/v1/applications/${Apps.app2.data.id}/notifications/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(204)
  })    
})