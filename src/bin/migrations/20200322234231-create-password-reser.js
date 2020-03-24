'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('password_resets', {
        id: {
          type:Sequelize.INTEGER,
          primaryKey:true,
          autoIncrement:true,
          allowNull:false,
          unique:true
        },
        userId: {
            type:Sequelize.INTEGER,
            allowNull:false,
            references: { model: 'users', key:'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        token: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        completed: {
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
