const { Model, DataTypes } = require('sequelize')

class notificationsAlerts extends Model {
    static init(sequelize) {
        super.init({
            type: {
                type: DataTypes.ENUM('email', 'sms', 'phone-call'),
                allowNull: false,
            },
            to: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'notification_alerts',
            paranoid:true,
        })
    }

    static associate(models) {
        this.belongsTo(models.notifications, { foreignKey:'notificationId', as:'notification' })
    }
}

module.exports = notificationsAlerts
