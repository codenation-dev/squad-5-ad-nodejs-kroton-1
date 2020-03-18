'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('applications', {
        id: {
          type:Sequelize.INTEGER,
          primaryKey:true,
          autoIncrement:true,
          allowNull:false,
          unique:true
        },
        userId:{
          type:Sequelize.INTEGER,
          allowNull:false,
          references:{model:'users', key:'id'},
          onUpdate:'CASCADE',
          onDelete:'CASCADE'
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique:true
        },
        description:{
            type:Sequelize.TEXT,
            allowNull:true
        },
        token: {
            type: Sequelize.STRING(40),
            allowNull: false,
            unique: true,
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
      return queryInterface.dropTable('applications');
  }
};
