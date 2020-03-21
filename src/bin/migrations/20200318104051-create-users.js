'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('users', {
        id: {
          type:Sequelize.INTEGER,
          primaryKey:true,
          autoIncrement:true,
          allowNull:false,
          unique:true
        },
        name:{
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING(32),
          allowNull: false,
        },
        admin: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt:{
          type:Sequelize.DATE,
          allowNull:false
        },
        updatedAt:{
          type:Sequelize.DATE,
          allowNull:false
        },
        deletedAt: {
          type:Sequelize.DATE,
          allowNull:true,
        }
      });
},

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('users');
  }
};
