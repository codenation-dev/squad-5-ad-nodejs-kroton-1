'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'applications', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },      
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      detail: {
        type: Sequelize.TEXT,
        allowNull: true
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
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('notifications')
  }
}
