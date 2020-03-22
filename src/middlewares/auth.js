const jwt = require('jsonwebtoken')
const User = require('../models/users')

module.exports = {
  async validate(req, res, next) {
    if (skipJwtValidation(req)) {
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
    const skip = skipAdminValidation(req)
    if (!skip && !req.user.admin) {
      return res.status(403).json({ error: `You don't have access to this feature` })
    }

    next()
  }
}

const ignoreJwt = [
  '/v1/logs',
  '/v1/users/register',
  '/v1/users/forgotten-pass',
  '/v1/users/reset-pass',
]

function skipJwtValidation(req) {
  const url = getUrl(req)
  return ignoreJwt.includes(url) && (req.method === 'POST')
}

const ignoreAdmin = [
  '/v1/users/register',
  '/v1/users/forgotten-pass',
  '/v1/users/reset-pass',
  '/v1/users/<param>/change-pass',
]

function skipAdminValidation(req) {
  const url = getUrl(req)
  const urlChunks = url.split('/')
  
  const routeList = ignoreAdmin.map(item => {
    const itemChuncks = item.split('/')

    for (let i = 0; i < itemChuncks.length; i++) {
      if (itemChuncks[i] === '<param>') {
        itemChuncks[i] = urlChunks[i]
      }
    }

    return itemChuncks.join('/')
  })
  
  return routeList.includes(url) && (req.method === 'POST')
}

function getUrl(req) {
  let url = req.originalUrl
  url = url.split('?')[0]
  
  if (url.endsWith('/')) {
    url = url.slice(0,-1)
  }

  return url
}