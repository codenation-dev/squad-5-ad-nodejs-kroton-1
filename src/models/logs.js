module.exports = (sequelize, Datatypes) =>
    sequelize.define('logs', {
        title:{
            type:Datatypes.STRING,
            allowNull:false
        },
        detail:{
            type:Datatypes.TEXT,
            allowNull:false
        },
        level:{
            type:Datatypes.ENUM('error', 'warning', 'debug'),
            allowNull:false
        },
        events:{
            type:Datatypes.INTEGER,
            allowNull:false
        },
        environment:{
            type:Datatypes.ENUM('prod', 'homolog', 'dev'),
            allowNull:false
        },
        source_address:{
            type:Datatypes.STRING,
            allowNull:false
        },
        archived: {
            type: Datatypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    },
    {
        paranoid:true
    })
