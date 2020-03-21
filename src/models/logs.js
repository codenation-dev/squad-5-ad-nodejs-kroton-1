const {Model, DataTypes} = require('sequelize')

class logs extends Model {
    static init(sequelize) {
        super.init({
            title:DataTypes.STRING,
            detail:DataTypes.TEXT,
            level:DataTypes.ENUM('error', 'warning', 'debug'),
            events:{
                type:DataTypes.INTEGER,
                allowNull:false,
                validate: {
                    isInt: true,
                }
            },
            environment:DataTypes.ENUM('prod', 'homolog', 'dev'),
            source_address:DataTypes.STRING,
            archived:DataTypes.BOOLEAN
        },
        {
            sequelize,
            paranoid:true
        })
    }

    static associate(models) {
        this.belongsTo(models.applications, {foreignKey:'applicationId', as:'application'})
    }
}

module.exports = logs


    