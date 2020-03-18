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
      return queryInterface.dropTable('applications');
  }
};
