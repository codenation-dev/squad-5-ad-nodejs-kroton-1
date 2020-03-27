const nofiticationModel = require('../src/models/notifications')
const triggerModel = require('../src/models/notificationsTriggers')
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

const Triggers = {
  trigger1: {
    new: {
      field: 'level',
      condition: '=',
      value: 'error',
    },
  },
  trigger2: {
    new: {
      field: 'events',
      condition: '>',
      value: '10',
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

const createTrigger = async (trigger, notificationId) => {
  const newData = JSON.parse(JSON.stringify(trigger))
  newData.notificationId = notificationId
  const created = await populateTable(triggerModel, newData)
  
  const data = clearUserData(created)
  const keys = getUserDataKeys(created)

  delete data.notificationId

  return {
      new: trigger,
      data,
      keys,
  }
}

const createTriggers = async () => {
  Triggers.trigger1 = await createTrigger(Triggers.trigger1.new, Notifications.notification1.data.id)
  Triggers.trigger2 = await createTrigger(Triggers.trigger2.new, Notifications.notification2.data.id)
}

// Get All
describe('The API on /v1/applications/<appId>/notifications/<notificationId>/triggers Endpoint at GET method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
    await createTriggers()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/1/notifications/1/triggers/1`)

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
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers`).set({
      Authorization: user.admin.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({  
        total: 1,
        data:
          [ Triggers.trigger1.data ]
      })
  })

  // common
  test(`for common user on App2 and Notification 2 returns the 'data' property with all items from DB`, async () => {
    expect.assertions(2)
  
    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers`).set({
      Authorization: user.common.jwt
    })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({  
        total: 1,
        data:
          [ Triggers.trigger2.data ]
      })
  })  
})

// Get One
describe('The API on /v1/applications/<appId>/notifications/<notificationId>/triggers/<triggerId> Endpoint at GET method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
    await createTriggers()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).get(`/v1/applications/1/notifications/1/triggers/1`)

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })  

  test(`with triggerId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)
    
    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id    
    const id = 'abc'
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })
  
  test(`with nonexistent triggerId returns 404 as status code and message 'The trigger id <appId> couldn't be found.`, async () => {
    expect.assertions(2)
    
    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id        
    const id = 999
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The trigger id ${id} couldn't be found.`})
  })

  test(`with nonexistent notificationId returns 404 as status code and message 'The notification id <appId> couldn't be found.`, async () => {
    expect.assertions(2)

    const id = 999
    const res = await request(app).get(`/v1/applications/1/notifications/${id}/triggers/1`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The notification id ${id} couldn't be found.`})
  })

  test(`with notificationId does not belong to that application returns 403 as status code and message 'The notification id <notificationId> does not belong to that application`, async () => {
    expect.assertions(2)

    const id = 2
    const res = await request(app).get(`/v1/applications/1/notifications/${id}/triggers/1`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The notification id ${id} does not belong to that application`})
  })  

  test(`with notificationId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)

    const id = 'abc'
    const res = await request(app).get(`/v1/applications/1/notifications/${id}/triggers/1`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })    

  // Admin
  test(`for admin user on App 1 and Notification 1 get trigger 1 returns 200 as status code and data.`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Triggers.trigger1.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })

  test(`for admin user on App 1 and Notification 1 get trigger 2 returns 403 as status code and message 'The trigger id <triggerId> does not belong to that notification'.`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Triggers.trigger2.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The trigger id ${data.id} does not belong to that notification` })
  })

  test(`for admin user on App 2 and Notification 2 get trigger 1 returns 403 as status code and message 'The trigger id <triggerId> does not belong to that notification'.`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Triggers.trigger1.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The trigger id ${data.id} does not belong to that notification` })
  })

  test(`for admin user on App 2 and Notification 2 get trigger 2 returns 200 as status code and data`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Triggers.trigger2.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })

  // common
  test(`for common user on App 1 and Notification 1 get trigger 1 returns 403 as status code and message 'You don't have access to this feature'.`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Triggers.trigger1.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `You don't have access to this feature` })
  })

  test(`for common user on App 1 and Notification 1 get trigger 2 returns 403 as status code and message 'You don't have access to this feature'.`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Triggers.trigger2.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `You don't have access to this feature` })
  })

  test(`for common user on App 2 and Notification 2 get trigger 1 returns 403 as status code and message 'The trigger id <triggerId> does not belong to that notification'.`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Triggers.trigger1.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The trigger id ${data.id} does not belong to that notification` })
  })

  test(`for common user on App 2 and Notification 2 get trigger 2 returns 200 as status code and data`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Triggers.trigger2.data)    
    const res = await request(app).get(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })
})

// Post
describe('The API on /v1/applications/<appId>/notifications/<notificationId>/triggers Endpoint at POST method should...', () => {
  beforeEach(async () => {
      user = await createUser()
      await createApps()
      await createNotifications()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).post(`/v1/applications/1/notifications/1/triggers`).send(Triggers.trigger1.new)

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
    const res = await request(app).post(`/v1/applications/${appId}/notifications/${notificationId}/triggers`).send(Triggers.trigger1.new).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(201)
    expect(res.body).toMatchObject(Triggers.trigger1.data)
  })

  test(`for admin user on App 2 and Notification 2 returns 201 as status code and new record created.'`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id    
    const res = await request(app).post(`/v1/applications/${appId}/notifications/${notificationId}/triggers`).send(Triggers.trigger2.new).set({
      Authorization: user.admin.jwt
    })

    const data = cloneObject(Triggers.trigger2.data)
    data.id = 1
    expect(res.statusCode).toEqual(201)
    expect(res.body).toMatchObject(data)
  })    

  // common
  test(`for common user on App 1 and Notification 1 returns 403 as status code and message 'You don't have access to this feature'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id    
    const res = await request(app).post(`/v1/applications/${appId}/notifications/${notificationId}/triggers`).send(Triggers.trigger1.new).set({
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
    const res = await request(app).post(`/v1/applications/${appId}/notifications/${notificationId}/triggers`).send(Triggers.trigger2.new).set({
      Authorization: user.common.jwt
    })
    
    const data = cloneObject(Triggers.trigger2.data)
    data.id = 1
    expect(res.statusCode).toEqual(201)
    expect(res.body).toMatchObject(data)
  })    
})

// Patch
describe('The API on /v1/applications/<appId>/notifications/<notificationId>/triggers Endpoint at PATCH method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
    await createTriggers()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).patch(`/v1/applications/1/notifications/1/triggers/1`).send({ value: 'alterado' })

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })

  test(`with triggerId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)
    
    const id = 'abc'
    const res = await request(app).patch(`/v1/applications/1/notifications/1/triggers/${id}`).send({ value: 'alterado' }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })

  test(`with nonexistent triggerId returns 404 as status code and message 'The trigger id <appId> couldn't be found.`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).patch(`/v1/applications/1/notifications/1/triggers/${id}`).send({ value: 'alterado' }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The trigger id ${id} couldn't be found.`})
  })

  // admin
  test(`for admin user on App 1 and Notification 1 updating Trigger 1 returns 200 as status code and updated record.'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Triggers.trigger1.data)
    data.value = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).send({ value: data.value }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })

  test(`for admin user on App 1 and Notification 1 updating Trigger 2 returns 403 as status code and message 'The trigger id <triggerId> does not belong to that notificarion'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Triggers.trigger2.data)
    data.value = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).send({ value: data.value }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The trigger id ${data.id} does not belong to that notification` })
  })

  test(`for admin user on App 2 and Notification 2 updating Trigger 1 returns 403 as status code and message 'The trigger id <triggerId> does not belong to that notificarion'`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Triggers.trigger1.data)
    data.value = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).send({ value: data.value }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The trigger id ${data.id} does not belong to that notification` })
  })      
  
  test(`for admin user on App 2 and Notification 2 updating Trigger 2 returns 200 as status code and updated record.'`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Triggers.trigger2.data)
    data.value = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).send({ value: data.value }).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })    

  // common
  test(`for common user on App 1 and Notification 1 updating Trigger 1 returns 403 as status code and message 'You don't have access to this feature'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Triggers.trigger1.data)
    data.value = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).send({ value: data.value }).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `You don't have access to this feature` })
  })

  test(`for common user on App 2 and Notification 2 updating Trigger 2 returns 200 as status code and updated record.`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id
    const data = cloneObject(Triggers.trigger2.data)
    data.value = 'alterado'
    const res = await request(app).patch(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).send({ value: data.value }).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(data)
  })    
})

// Delete
describe('The API on /v1/applications/<appId>/notifications/<notificationId>/triggers Endpoint at DELETE method should...', () => {
  beforeEach(async () => {
    user = await createUser()
    await createApps()
    await createNotifications()
    await createTriggers()
  })

  afterEach(truncateAllTables)

  test(`without JWT returns 401 as status code and message 'Authentication failure'`, async () => {
    expect.assertions(2)
  
    const res = await request(app).delete(`/v1/applications/1/notifications/1/triggers/1`)

    expect(res.statusCode).toEqual(401)
    expect(res.body).toMatchObject({
        error: `Authentication failure`
    })
  })

  test(`with triggerId as text 'abc' returns 400 as status code and message 'The request is incorrect`, async () => {
    expect.assertions(2)
    
    const id = 'abc'
    const res = await request(app).delete(`/v1/applications/1/notifications/1/triggers/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(400)
    expect(res.body).toMatchObject({ error: `The request is incorrect`})
  })

  test(`with nonexistent triggerId returns 404 as status code and message 'The trigger id <appId> couldn't be found.`, async () => {
    expect.assertions(2)
    
    const id = 999
    const res = await request(app).delete(`/v1/applications/1/notifications/1/triggers/${id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: `The trigger id ${id} couldn't be found.`})
  })

  // admin
  test(`for admin user on App 1 and Notification 1 deleting Trigger 1 returns 204 as status code.'`, async () => {
    expect.assertions(1)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Triggers.trigger1.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(204)
  })

  test(`for admin user on App 1 and Notification 1 deleting notification 2 returns 403 as status code and message 'The trigger id <triggerId> does not belong to that notification'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Triggers.trigger2.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The trigger id ${data.id} does not belong to that notification` })
  })

  test(`for admin user on App 2 and Notification 2 deleting Trigger 1 returns 403 as status code and message 'The trigger id <triggerId> does not belong to that notification'`, async () => {
    expect.assertions(2)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Triggers.trigger1.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({ error: `The trigger id ${data.id} does not belong to that notification` })
  })      

  test(`for admin user on App 2 and Notification 2 deleting Trigger 2 returns 204 as status code.'`, async () => {
    expect.assertions(1)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Triggers.trigger2.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.admin.jwt
    })
    
    expect(res.statusCode).toEqual(204)
  })    

  // common
  test(`for common user on App 1 and Notification 1 deleting Trigger 1 returns 403 as status code and message 'You don't have access to this feature'`, async () => {
    expect.assertions(2)

    const appId = Apps.app1.data.id
    const notificationId = Notifications.notification1.data.id            
    const data = cloneObject(Triggers.trigger1.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(403)
    expect(res.body).toMatchObject({
        error: `You don't have access to this feature`
    })
  })

  test(`for common user on App 2 and Notification 2 deleting Trigger 2 returns 204 as status code.`, async () => {
    expect.assertions(1)

    const appId = Apps.app2.data.id
    const notificationId = Notifications.notification2.data.id            
    const data = cloneObject(Triggers.trigger2.data)
    const res = await request(app).delete(`/v1/applications/${appId}/notifications/${notificationId}/triggers/${data.id}`).set({
      Authorization: user.common.jwt
    })
    
    expect(res.statusCode).toEqual(204)
  })    
})