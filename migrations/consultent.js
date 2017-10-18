'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.createTable('consultent', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        email: {
            type: Sequelize.STRING(50),
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true
            }

        },
        password: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        type: {
            type: Sequelize.STRING(50),
            allowNull: false,
        }
    })
  },
  down: function (queryInterface, Sequelize) {
      return queryInterface.dropTable('consultent')
  }
}
