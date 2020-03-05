const {NODE_ENV = 'dev'} = process.env

require('dotenv').config({path: 'variables.env'})

module.exports = {
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: `sentinel_log_${NODE_ENV}`
    },
    env: NODE_ENV
}

