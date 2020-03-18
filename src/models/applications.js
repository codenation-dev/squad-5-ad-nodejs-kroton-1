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
}

module.exports = applications