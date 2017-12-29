'use strict'

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('schedule', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false
            },
            dailyWorkId: {
                type: Sequelize.UUID,
                allowNull: false
            },
            date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            startTime: {
                type: Sequelize.DATE,
                allowNull: true
            },
            endTime: {
                type: Sequelize.DATE,
                allowNull: true
            },
            huorsNum: {
                type: Sequelize.INTEGER,
                allowNull: true
            }
        })
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('schedule')
    }
}
