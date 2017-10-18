'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('consultentComplaints', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false
        },
        consultentId: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM,
            values: ['solved', 'pending']
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        timestamp: {
            type: Sequelize.STRING,
            defaultValue: new Date().getTime()
        }
    })
  },
  down: function (queryInterface, Sequelize) {
      return queryInterface.dropTable('consultentComplaints')
  }
}
