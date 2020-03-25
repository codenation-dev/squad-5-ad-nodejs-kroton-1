const {Model, DataTypes} = require('sequelize')

class users extends Model {
    static init(sequelize) {
        super.init({
            name: {
                type: DataTypes.STRING,
                validate: {
                    length(value) {
                        if ((value.length < 10) || (value.length > 255)) {
                            throw new Error('The name field must be between 10 and 255 characters')
                        }
                    }
                }
            },
            email: {
                type: DataTypes.STRING,
                validate: {
                    isEmail: {
                        msg: 'The e-mail field is invalid.',
                    }
                }
            },
            password:DataTypes.STRING(32),
            admin:DataTypes.BOOLEAN
        },
        {
            sequelize,
            paranoid: true
        })
    }

    static associate(models) {
        this.hasMany(models.applications, { foreignKey: 'userId', as: 'applications' })
        this.hasMany(models.passwordReset, { foreignKey: 'userId', as:'passwordResets' })
    }
}

module.exports = users