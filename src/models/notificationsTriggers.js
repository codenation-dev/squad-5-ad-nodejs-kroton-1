const { Model, DataTypes } = require('sequelize')

class notificationsTriggers extends Model {
    static init(sequelize) {
        super.init({
            field: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            condition: {
                type: DataTypes.ENUM('>=', '>', '<=', '<', '!=', '=', 'regex'),
                allowNull: false,
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'notification_triggers',
            paranoid:true,
        })
    }

    static associate(models) {
        this.belongsTo(models.notifications, { foreignKey:'notificationId', as:'notification' })
    }
}

module.exports = notificationsTriggers
