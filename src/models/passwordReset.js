const { Model, DataTypes } = require('sequelize')

class passwordReset extends Model {
    static init(sequelize) {
        super.init({
            token: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            completed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            tableName: 'password_resets',
            paranoid:true,
        })
    }

    static associate(models) {
        this.belongsTo(models.users, { foreignKey:'userId', as:'user' })
    }
}

module.exports = passwordReset
    