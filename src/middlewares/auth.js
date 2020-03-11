const jwt = require('jsonwebtoken')

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
      req.user = decode
      next()
    } catch(err){
      return res.status(401).json({error:'Authentication failure'})
    }    
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