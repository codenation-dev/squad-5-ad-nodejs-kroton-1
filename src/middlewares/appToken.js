const applicationModel = require('../models/applications')

module.exports = {
  async validate(req, res, next) {
    const token = req.query.token

    if (token === undefined) {
      return res.status(400).json({ error: `The user token was not sent` })
    }
    
    const app = await applicationModel.findOne({ where: { token } })

    if (app === null) {
      return res.status(400).json({ error: `Invalid app token` })
    }
    
    req.body.applicationId = app.id
    next()
  }
}