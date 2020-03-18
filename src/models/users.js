module.exports = (sequelize, Datatypes) =>
    sequelize.define('users', {
        name: {
            type: Datatypes.STRING,
            allowNull: false,
            validate: {
                length(value) {
                    if ((value.length < 10) || (value.length > 255)) {
                        throw new Error('The name field must be between 10 and 255 characters')
                    }
                }
            }
        },
        email: {
            type: Datatypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: 'The e-mail field is invalid.',
                }
            }
        },
        password: {
            type: Datatypes.STRING(32),
            allowNull: false,
        },
        admin: {
            type: Datatypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        token:{
            type:Datatypes.STRING(40),
            allowNull:false,
            unique:true
        }
    },
    {
        paranoid: true
    })
