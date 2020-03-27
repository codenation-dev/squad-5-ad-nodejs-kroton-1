const totalvoice = require('totalvoice-node');

const accessToken = '83519b3235f0ed559911824100c0a15f'
const client = new totalvoice(accessToken);

const Phone = {}

Phone.sms = async (phoneNumber, message) => {
    return await client.sms.enviar(phoneNumber, message)    
}

Phone.call = async (phoneNumber, message) => {
    const options = { 
        velocidade: 2, 
        tipo_voz: 'br-Vitoria'
    }
    
    return await client.tts.enviar(phoneNumber, message, options)
}

module.exports = Phone
