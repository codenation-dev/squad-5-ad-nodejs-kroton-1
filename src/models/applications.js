const {Model, DataTypes} = require('sequelize')

class applications extends Model {
    static init(sequelize) {
        super.init({
        name: DataTypes.STRING,
        description:DataTypes.TEXT,
        token:DataTypes.STRING(40)
        },
        {
            sequelize,
            paranoid: true
        })
    }

    static associate(models) {
        this.belongsTo(models.users, { foreignKey: 'userId', as: 'user' })
        this.hasMany(models.notifications, { foreignKey: 'applicationId', as: 'notifications' })
    }
}

module.exports = applications