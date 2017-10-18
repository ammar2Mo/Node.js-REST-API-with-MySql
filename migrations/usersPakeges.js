'use strict'

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('usersPakeges', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false
            },
            pakegeId: {
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
                values: ['active', 'disActive']
            },
            expiry: {
                type: Sequelize.DATE,
                allawNull: false
            },
            date: {
                type: Sequelize.DATE,
                allawNull: false
            }
        })
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('usersPakeges')
    }
}
