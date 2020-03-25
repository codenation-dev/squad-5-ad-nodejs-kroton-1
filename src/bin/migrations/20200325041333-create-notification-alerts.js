'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('notification_alerts', {
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
      type: {
        type: Sequelize.ENUM('email', 'sms', 'phone-call'),
        allowNull: false,
      },
      to: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
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
    return queryInterface.dropTable('notification_alerts')
  }
}
