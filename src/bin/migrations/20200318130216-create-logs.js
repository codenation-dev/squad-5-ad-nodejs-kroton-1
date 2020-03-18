'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('logs', {
        id: {
          type:Sequelize.INTEGER,
          primaryKey:true,
          autoIncrement:true,
          allowNull:false,
          unique:true
        },
        applicationId:{
          type:Sequelize.INTEGER,
          allowNull:false,
          references:{model:'applications', key:'id'},
          onUpdate:'CASCADE',
          onDelete:'CASCADE'
        },
        title:{
            type:Sequelize.STRING,
            allowNull:false
        },
        detail:{
            type:Sequelize.TEXT,
            allowNull:false
        },
        level:{
            type:Sequelize.ENUM('error', 'warning', 'debug'),
            allowNull:false
        },
        events:{
            type:Sequelize.INTEGER,
            allowNull:false,
        },
        environment:{
            type:Sequelize.ENUM('prod', 'homolog', 'dev'),
            allowNull:false
        },
        source_address:{
            type:Sequelize.STRING,
            allowNull:false
        },
        archived: {
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
      return queryInterface.dropTable('logs');
  }
};
