module.exports = (sequelize, Datatypes) =>
    sequelize.define('users', {
        name:{
            type:Datatypes.STRING,
            allowNull:false
        },
        email:{
            type:Datatypes.STRING,
            allowNull:false
        },
        password:{
            type:Datatypes.STRING(32),
            allowNull:false
        },
        token:{
            type:Datatypes.STRING(40),
            allowNull:false,
            unique:true
        }
    })