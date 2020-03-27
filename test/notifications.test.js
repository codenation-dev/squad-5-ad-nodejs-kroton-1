const nofiticationModel = require('../src/models/notifications')
const triggerModel = require('../src/models/notificationsTriggers')
const alertModel = require('../src/models/notificationsAlerts')
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
 } = require('./utils')

beforeAll(BeforeAll)
afterAll(AfterAll)

let user

const Apps = {
    app1: {
        new: {
            name: 'App 1',
            description: 'Application 1',
        },
    },
    app2: {
        new: {
            name: 'App 1',
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
            name: 'Notificação 2 do App 1',
            detail: 'Notificação 2 do App 1',
        },
    },
    notification3: {
        new: {
            name: 'Notificação 1 do App 2',
            detail: 'Notificação 1 do App 2',
        },
    },
    notification4: {
        new: {
            name: 'Notificação 2 do App 2',
            detail: 'Notificação 2 do App 2',
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
    Notifications.notification2 = await createNotification(Notifications.notification2.new, Apps.app1.data.id)
    Notifications.notification3 = await createNotification(Notifications.notification3.new, Apps.app2.data.id)
    Notifications.notification4 = await createNotification(Notifications.notification4.new, Apps.app2.data.id)
}

describe('The API on /v1/applications/<appId>/notifications Endpoint at GET method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
  })

  afterEach(truncateAllTables)

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

  test(`for admin user on App 1 returns 200 as status code and have 'total' and 'data' as properties`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/${Apps.app1.data.id}/notifications`).set({
      Authorization: user.admin.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(Object.keys(res.body)).toMatchObject([
      'total',
      'data'
    ])
  })

  test(`for admin user on App 2 returns 200 as status code and have 'total' and 'data' as properties`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/${Apps.app2.data.id}/notifications`).set({
      Authorization: user.admin.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(Object.keys(res.body)).toMatchObject([
      'total',
      'data'
    ])
  })

  test(`for admin user on App1 returns the right number of items and an object with all items`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/${Apps.app1.data.id}/notifications`).set({
      Authorization: user.admin.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(typeof res.body.data).toBe('object')
  })

  test(`for admin user on App1 returns the 'data' property with all items from DB`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/${Apps.app1.data.id}/notifications`).set({
      Authorization: user.admin.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({  
        total: 2,
        data:
          [ Notifications.notification1.data, Notifications.notification2.data ]  
      })
  })

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

  test(`for common user on App 2 returns 200 as status code and have 'total' and 'data' as properties`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/${Apps.app2.data.id}/notifications`).set({
      Authorization: user.common.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(Object.keys(res.body)).toMatchObject([
      'total',
      'data'
    ])
  })

  test(`for common user on App2 returns the right number of items and an object with all items`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/${Apps.app2.data.id}/notifications`).set({
      Authorization: user.common.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(typeof res.body.data).toBe('object')
  })  

  test(`for common user on App2 returns the 'data' property with all items from DB`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/${Apps.app2.data.id}/notifications`).set({
      Authorization: user.common.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({  
        total: 2,
        data:
          [ Notifications.notification3.data, Notifications.notification4.data ]  
      })
  })  
})

/*
describe('The API on /v1/applications/<appId>/notifications Endpoint at POST method should...', () => {
    beforeEach(async () => {
        user = createUser()
        await createApps()

    })

    afterEach(truncateAllTables)

    test(`return 200 as status code and have 'total' and 'data' as properties`, async () => {
        
    })
})
*/
