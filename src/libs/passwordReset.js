const passwordResetModel = require('../models/passwordReset')
const crypto = require('crypto')
const Email = require('./email')


const sendMail = async (email, token) => {
    const body = `<p>Você solicitou a redefinição da sua senha de acesso ao Sentinel Log</p>
    <p>O seu token para troca de senha é</p> 
    <h3><strong>${token}</strong></h3>`
    
    return await Email.send(email, 'Redefinição de senha', body)
}

let PasswordReset = {}

PasswordReset.register = async user => {
    const token = crypto.randomBytes(40).toString('hex')
    const userId = user.id
    const reset = await passwordResetModel.create({ userId, token })    

    await sendMail(user.email, reset.token)
}

PasswordReset.getUser = async token => {
    let userId = null
    
    const reset = await passwordResetModel.findOne({ where: { token } })
    if (reset && !reset.completed) {
        userId = reset.userId
    }
    
    return userId
}

PasswordReset.setCompleted = async token => {
    const reset = await passwordResetModel.findOne({ where: { token } })
    reset.completed = true
    reset.save()
}

module.exports = PasswordReset
