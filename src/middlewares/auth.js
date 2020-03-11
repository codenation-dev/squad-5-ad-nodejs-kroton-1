const jwt = require('jsonwebtoken')
const User = require('../models')['users']

module.exports = {
  async validate(req, res, next) {
    // Para a rota de registro de log a validação do JWT é ignorada
    const url = getUrl(req)
    if ((url === '/v1/logs') && (req.method === 'POST')) {
      next()
      return
    }

    try {
      const token = req.headers.authorization
      const decode = jwt.verify(token, process.env.JWT_KEY)

      user = await User.findOne({ where: { email: decode.email } })

      req.user = user

      next()
    } catch(err){
      return res.status(401).json({error:'Authentication failure'})
    }    
  },

  async isAdmin(req, res, next) {
    if (!req.user.admin) {
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