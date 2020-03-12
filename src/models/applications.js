module.exports = (sequelize, Datatypes) =>
    sequelize.define('applications', {
        name: {
            type: Datatypes.STRING,
            allowNull: false,
            unique:true
        },
        description:{
            type:Datatypes.TEXT,
            allowNull:true
        },
        token: {
            type: Datatypes.STRING(40),
            allowNull: false,
            unique: true,
        }
    },
    {
        paranoid: true
    })