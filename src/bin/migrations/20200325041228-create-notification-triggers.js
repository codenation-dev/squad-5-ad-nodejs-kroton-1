'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('notification_triggers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      notificationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'notifications', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      field: {
        type: Sequelize.STRING,
        allowNull: false,

      },
      condition: {
        type: Sequelize.ENUM('>=', '>', '<=', '<', '!=', '=', 'regex'),
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
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
    return queryInterface.dropTable('notification_triggers')
  }
}
