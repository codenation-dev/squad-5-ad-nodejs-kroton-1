const { Model, DataTypes } = require('sequelize')

class notifications extends Model {
    static init(sequelize) {
        super.init({
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            detail: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'notifications',
            paranoid:true,
        })
    }

    static associate(models) {
        this.belongsTo(models.applications, { foreignKey:'applicationId', as:'application' })

        this.hasMany(models.notificationsTriggers, { foreignKey: 'notificationId', as: 'triggers' })
        this.hasMany(models.notificationsAlerts, { foreignKey: 'notificationId', as:'alerts' })
    }
}

module.exports = notifications
