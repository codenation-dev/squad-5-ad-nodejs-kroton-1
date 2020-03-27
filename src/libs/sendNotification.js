const Notifications = require('../controllers/notifications')
const Email = require('./email')
const Phone = require('./phone')

const triggered = async (triggers, log) => {
    let output = false
    if (triggers.length > 0) {
        output = true
        triggers.forEach(trigger => {
            const { field, condition, value } = trigger
            const fieldValue = log[field]

            switch (condition) {
                case 'regex':                    
                    output = output && (fieldValue.match(value))
                    break

                case '=':                    
                    output = output && (fieldValue == value)
                    break

                case '!=':                    
                    output = output && (fieldValue != value)
                    break

                case '>=':
                    output = output && (fieldValue >= value)
                    break
                
                case '>': 
                    output = output && (fieldValue == value)
                    break

                case '<=':
                    output = output && (fieldValue <= value)
                    break
                
                case '<': 
                    output = output && (fieldValue < value)
                    break
                
                default:
                    output = false
            }
        })
    }
    return output
}

const sendAlerts = async (alerts, log) => {
    const appName = log.application.name
    alerts.forEach(async alert => {
        const { type, to, message } = alert

        switch (type) {
            case 'email':                
                const details = JSON.stringify(log,null,2).replace(/\n/g, '<br>')
                const subject = `[Registro de LOG] Aplicação ${appName}`
                const body = `<p>Houve um registro de log no Sentinel Log para a aplicaçaõ <strong>${appName}</strong></p> 
                              <h2>Mensagem</h2>
                              <p>"${message}"</p>
                              <br><br> 
                              <h2>Detalhes</h2>
                              <p>${details}</p>`
                await Email.send(to, subject, body)
                break

            case 'sms':
                const sms = `[Sentinel Log - Registro de LOG] Aplicação ${appName}: ${message}`
                Phone.sms(to, sms)
                break

            case 'phone-call':
                const voiceMessage = `Sentinel Log, há um novo log para ${appName}. ${message}`
                Phone.call(to, voiceMessage)
                break
        }
    })
}

const SendNotification = {}

SendNotification.send = async (log) => {
    const { id } = log.application

    const notifications = await Notifications.getAllNotifications(id)

    notifications.forEach(notification => {
        if (triggered(notification.triggers, log)) {
            sendAlerts(notification.alerts, log)
        }
    })    
}

module.exports = SendNotification