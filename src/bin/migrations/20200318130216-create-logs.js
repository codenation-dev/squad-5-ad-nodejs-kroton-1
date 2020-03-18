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
        created_at:{
          type:Sequelize.DATE,
          allowNull:false
        },
        updated_at:{
          type:Sequelize.DATE,
          allowNull:false
        },
        deleted_at: {
          type:Sequelize.DATE,
          allowNull:true,
        }
    });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('logs');
  }
};
