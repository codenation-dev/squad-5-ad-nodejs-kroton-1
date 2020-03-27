const nofiticationModel = require('../src/models/notifications')
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
    cloneObject,
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
            name: 'Notificação 1 do App 2',
            detail: 'Notificação 1 do App 2',
        },
    },
}

const Alerts = {
  alert1: {
    new: {
      type: 'email',
      to: 'teste@teste.com.br',
      message: 'Testando abc',
    },
  },
  alert2: {
    new: {
      type: 'sms',
      to: '11987654321',
      message: 'Testando 123',
    },
  }
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

const createAlert = async (alert, notificationId) => {
  const newData = JSON.parse(JSON.stringify(alert))
  newData.notificationId = notificationId
  const created = await populateTable(alertModel, newData)
  
  const data = clearUserData(created)
  const keys = getUserDataKeys(created)

  delete data.notificationId

  return {
      new: alert,
      data,
      keys,
  }
}

const createAlerts = async () => {
  Alerts.alert1 = await createAlert(Alerts.alert1.new, Notifications.notification1.data.id)
  Alerts.alert2 = await createAlert(Alerts.alert2.new, Notifications.notification2.data.id)
}

// Get All
describe('The API on /v1/applications/<appId>/notifications/<notificationId>/alerts Endpoint at GET method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
    await createAlerts()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/1/notifications/1/alerts/1`)

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })

  // Admin
  test(`for admin user on App1 and Notification 1 returns the 'data' property with all items from DB`, async () => {
    expect.assertions(2)
  
    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts`).set({
      Authorization: user.admin.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({  
        total: 1,
        data:
          [ Alerts.alert1.data ]
      })
  })

  // common
  test(`for common user on App2 and Notification 2 returns the 'data' property with all items from DB`, async () => {
    expect.assertions(2)
  
    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts`).set({
      Authorization: user.common.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({  
        total: 1,
        data:
          [ Alerts.alert2.data ]
      })
  })  
})

// Get One
describe('The API on /v1/applications/<appId>/notifications/<notificationId>/alerts/<alertId> Endpoint at GET method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
    await createAlerts()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/1/notifications/1/alerts/1`)

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })  

  test(`with alertId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)
    
    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id    
    const id = 'abc'
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })
  
  test(`with nonexistent alertId returns 404 as status code and message 'The alert id <alertId> couldn't be found.`, async () => {
    expect.assertions(2)
    
    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id        
    const id = 999
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The alert id ${id} couldn't be found.`})
  })

  test(`with nonexistent notificationId returns 404 as status code and message 'The notification id <notificationId> couldn't be found.`, async () => {
    expect.assertions(2)

    const id = 999
    const res = await request(app).get(`/v1/applications/1/notifications/${id}/alerts/1`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The notification id ${id} couldn't be found.`})
  })

  test(`with notificationId does not belong to that application returns 403 as status code and message 'The notification id <notificationId> does not belong to that application`, async () => {
    expect.assertions(2)

    const id = 2
    const res = await request(app).get(`/v1/applications/1/notifications/${id}/alerts/1`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The notification id ${id} does not belong to that application`})
  })  

  test(`with notificationId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)

    const id = 'abc'
    const res = await request(app).get(`/v1/applications/1/notifications/${id}/alerts/1`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })    

  // Admin
  test(`for admin user on App 1 and Notification 1 get alert 1 returns 200 as status code and data.`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Alerts.alert1.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })

  test(`for admin user on App 1 and Notification 1 get alert 2 returns 403 as status code and message 'The alert id <alertId> does not belong to that notification'.`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Alerts.alert2.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The alert id ${data.id} does not belong to that notification` })
  })

  test(`for admin user on App 2 and Notification 2 get alert 1 returns 403 as status code and message 'The alert id <alertId> does not belong to that notification'.`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Alerts.alert1.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The alert id ${data.id} does not belong to that notification` })
  })

  test(`for admin user on App 2 and Notification 2 get alert 2 returns 200 as status code and data`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Alerts.alert2.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })

  // common
  test(`for common user on App 1 and Notification 1 get alert 1 returns 403 as status code and message 'You don't have access to this feature'.`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Alerts.alert1.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `You don't have access to this feature` })
  })

  test(`for common user on App 1 and Notification 1 get alert 2 returns 403 as status code and message 'You don't have access to this feature'.`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Alerts.alert2.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `You don't have access to this feature` })
  })

  test(`for common user on App 2 and Notification 2 get alert 1 returns 403 as status code and message 'The alert id <alertId> does not belong to that notification'.`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Alerts.alert1.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The alert id ${data.id} does not belong to that notification` })
  })

  test(`for common user on App 2 and Notification 2 get alert 2 returns 200 as status code and data`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Alerts.alert2.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })
})

// Post
describe('The API on /v1/applications/<appId>/notifications/<notificationId>/alerts Endpoint at POST method should...', () => {
  beforeEach(async () => {
      user = await createUser()
      await createApps()
      await createNotifications()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).post(`/v1/applications/1/notifications/1/alerts`).send(Alerts.alert1.new)

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })      

  // admin
  test(`for admin user on App 1 and Notification 1 returns 201 as status code and new record created.'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id    
    const res = await request(app).post(`/v1/applications/${appId}/notifications/${notificationId}/alerts`).send(Alerts.alert1.new).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(201)
    expect(res.body).toMatchObject(Alerts.alert1.data)
  })

  test(`for admin user on App 2 and Notification 2 returns 201 as status code and new record created.'`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id    
    const res = await request(app).post(`/v1/applications/${appId}/notifications/${notificationId}/alerts`).send(Alerts.alert2.new).set({
      Authorization: user.admin.jwt
    })

    const data = cloneObject(Alerts.alert2.data)
    data.id = 1
    expect(res.statusCode).toEqual(201)
    expect(res.body).toMatchObject(data)
  })    

  // common
  test(`for common user on App 1 and Notification 1 returns 403 as status code and message 'You don't have access to this feature'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id    
    const res = await request(app).post(`/v1/applications/${appId}/notifications/${notificationId}/alerts`).send(Alerts.alert1.new).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
        error: `You don't have access to this feature`
    })
  })

  test(`for common user on App 2 and Notification 2 returns 201 as status code and new record created.'`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id    
    const res = await request(app).post(`/v1/applications/${appId}/notifications/${notificationId}/alerts`).send(Alerts.alert2.new).set({
      Authorization: user.common.jwt
    })
    
    const data = cloneObject(Alerts.alert2.data)
    data.id = 1
    expect(res.statusCode).toEqual(201)
    expect(res.body).toMatchObject(data)
  })    
})

// Patch
describe('The API on /v1/applications/<appId>/notifications/<notificationId>/alerts Endpoint at PATCH method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
    await createAlerts()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).patch(`/v1/applications/1/notifications/1/alerts/1`).send({ message: 'alterado' })

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })

  test(`with alertId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)
    
    const id = 'abc'
    const res = await request(app).patch(`/v1/applications/1/notifications/1/alerts/${id}`).send({ message: 'alterado' }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })

  test(`with nonexistent alertId returns 404 as status code and message 'The alert id <alertId> couldn't be found.`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).patch(`/v1/applications/1/notifications/1/alerts/${id}`).send({ message: 'alterado' }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The alert id ${id} couldn't be found.`})
  })

  // admin
  test(`for admin user on App 1 and Notification 1 updating alert 1 returns 200 as status code and updated record.'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Alerts.alert1.data)
    data.message = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).send({ message: data.message }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })

  test(`for admin user on App 1 and Notification 1 updating alert 2 returns 403 as status code and message 'The alert id <alertId> does not belong to that notificarion'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Alerts.alert2.data)
    data.message = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).send({ message: data.message }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The alert id ${data.id} does not belong to that notification` })
  })

  test(`for admin user on App 2 and Notification 2 updating alert 1 returns 403 as status code and message 'The alert id <alertId> does not belong to that notificarion'`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Alerts.alert1.data)
    data.message = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).send({ message: data.message }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The alert id ${data.id} does not belong to that notification` })
  })      
  
  test(`for admin user on App 2 and Notification 2 updating alert 2 returns 200 as status code and updated record.'`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Alerts.alert2.data)
    data.message = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).send({ message: data.message }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })    

  // common
  test(`for common user on App 1 and Notification 1 updating alert 1 returns 403 as status code and message 'You don't have access to this feature'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Alerts.alert1.data)
    data.message = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).send({ message: data.message }).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `You don't have access to this feature` })
  })

  test(`for common user on App 2 and Notification 2 updating alert 2 returns 200 as status code and updated record.`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id
    const data = cloneObject(Alerts.alert2.data)
    data.message = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).send({ message: data.message }).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })    
})

// Delete
describe('The API on /v1/applications/<appId>/notifications/<notificationId>/alerts Endpoint at DELETE method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
    await createAlerts()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).delete(`/v1/applications/1/notifications/1/alerts/1`)

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })

  test(`with triggerId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)
    
    const id = 'abc'
    const res = await request(app).delete(`/v1/applications/1/notifications/1/alerts/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })

  test(`with nonexistent alertId returns 404 as status code and message 'The alert id <alertId> couldn't be found.`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).delete(`/v1/applications/1/notifications/1/alerts/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The alert id ${id} couldn't be found.`})
  })

  // admin
  test(`for admin user on App 1 and Notification 1 deleting alert 1 returns 204 as status code.'`, async () => {
    expect.assertions(1)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Alerts.alert1.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(204)
  })

  test(`for admin user on App 1 and Notification 1 deleting alert 2 returns 403 as status code and message 'The alert id <alertId> does not belong to that notification'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Alerts.alert2.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The alert id ${data.id} does not belong to that notification` })
  })

  test(`for admin user on App 2 and Notification 2 deleting alert 1 returns 403 as status code and message 'The alert id <alertId> does not belong to that notification'`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Alerts.alert1.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The alert id ${data.id} does not belong to that notification` })
  })      

  test(`for admin user on App 2 and Notification 2 deleting alert 2 returns 204 as status code.'`, async () => {
    expect.assertions(1)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Alerts.alert2.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(204)
  })    

  // common
  test(`for common user on App 1 and Notification 1 deleting alert 1 returns 403 as status code and message 'You don't have access to this feature'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Alerts.alert1.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
        error: `You don't have access to this feature`
    })
  })

  test(`for common user on App 2 and Notification 2 deleting alert 2 returns 204 as status code.`, async () => {
    expect.assertions(1)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Alerts.alert2.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/alerts/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(204)
  })    
})