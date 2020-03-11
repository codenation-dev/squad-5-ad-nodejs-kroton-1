const usersModel = require('../models')['users']

module.exports = {
  async validate(req, res, next) {
    const token = req.query.token

    if (token === undefined) {
      return res.status(400).json({ error: `The user token was not sent` })
    }
    
    const user = await usersModel.findOne({ where: { token } })

    if (user === null) {
      return res.status(400).json({ error: `Invalid user token` })
    }
    
    req.body.userId = user.id
    next()
  }
}