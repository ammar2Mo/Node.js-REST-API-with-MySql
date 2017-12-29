'use strict'

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('dailyWork', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false
            },
            employeeId: {
                type: Sequelize.UUID,
                allowNull: false
            },
            date: {
                type: Sequelize.DATEONLY
            },
            totalHours: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            isHollyDay: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            }
        })
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('dailyWork')
    }
}
