const usersModel = require('../models')['users']

module.exports = {
  async validate(req, res, next) {
    const token = req.query.token

    if (token !== undefined) {
      const user = await usersModel.findOne({ where: { token } })

      if (user !== null) {
        req.body.userId = req.user.id
        next()
      } else {
        res.status(400).json({ error: `Invalid user token` })
      }
    } else {
      res.status(400).json({ error: `The user token was not sent` })
    }    
  }
}