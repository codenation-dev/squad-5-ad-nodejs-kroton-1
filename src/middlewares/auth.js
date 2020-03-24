const jwt = require('jsonwebtoken')
const User = require('../models/users')

module.exports = {
  async validate(req, res, next) {
    if (await skipJwtValidation(req)) {
      next()
      return
    }

    try {
      const token = req.headers.authorization
      const decode = jwt.verify(token, process.env.JWT_KEY)

      user = await User.findOne({ where: { email: decode.email } })

      req.user = user

      if(!user) return res.status(401).json({error:'Authentication failure'})

      next()
    } catch(err){
      return res.status(401).json({error:'Authentication failure'})
    }    
  },

  async isAdmin(req, res, next) {
    const skip = await skipAdminValidation(req)
    if (!skip && !req.user.admin) {
      return res.status(403).json({ error: `You don't have access to this feature` })
    }

    next()
  }
}

function getUrl(req) {
  let url = req.originalUrl
  url = url.split('?')[0]
  
  if (url.endsWith('/')) {
    url = url.slice(0,-1)
  }

  return url
}

async function fillParams(routeList, url) {
  url = url.split('/')
  const output = []
  routeList.map(route => {
    const chuncks = route.url.split('/')

    for (let i = 0; i < chuncks.length; i++) {
      if (chuncks[i] === '<param>') {
        chuncks[i] = url[i]
      }
    }

    output.push({
      url: chuncks.join('/'),
      methods: route.methods,
    })

    return route
  })
  
  return output
}

async function findRoute(routeList, url, method) {
  let found = false

  const routes = await fillParams(routeList, url)
  
  routes.forEach(route => {
    if (!found) {
      const urlOk = route.url === url
      const methodOk = route.methods.includes(method)

      found = urlOk && methodOk      
    }
  })

  return found
}

const ignoreJwt = [
  {
    url: '/v1/logs',
    methods: ['POST'],
  },
  {
    url: '/v1/users/register',
    methods: ['POST'],
  },
  {
    url: '/v1/users/forgotten-pass',
    methods: ['POST'],
  },
  {
    url: '/v1/users/reset-pass',
    methods: ['POST'],
  },
]

async function skipJwtValidation(req) {
  const url = getUrl(req)
  return await findRoute(ignoreJwt, url, req.method)
}

const ignoreAdmin = [
  { 
    url: '/v1/users/register', 
    methods: ['POST'], 
  },
  { 
    url: '/v1/users/forgotten-pass', 
    methods: ['POST'], 
  },
  { 
    url: '/v1/users/reset-pass', 
    methods: ['POST'],
  },
  { 
    url: '/v1/users/<param>/change-pass', 
    methods: ['POST'], 
  },
  { 
    url: '/v1/users/<param>', 
    methods: ['GET', 'PATCH', 'DELETE'], 
  },
]

async function skipAdminValidation(req) {
  const url = getUrl(req)
  return await findRoute(ignoreAdmin, url, req.method)
}
