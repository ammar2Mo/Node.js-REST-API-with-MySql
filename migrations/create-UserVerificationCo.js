'use strict'

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('UserVerificationCo', {
            userId: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false
            },
            code: {
                type: Sequelize.STRING(4),
                primaryKey: true,
                allowNull: false
            },
            sentTo: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            sentAt: {
                type: Sequelize.STRING(30),
                allowNull: false
            }
        })
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('UserVerificationCo')
    }
}
