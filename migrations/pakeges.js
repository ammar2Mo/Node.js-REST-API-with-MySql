'use strict'

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('pakeges', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING(50),
                unique: true,
                allowNull: false
            },
            type: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            numOfConsultation: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            cost: {
                type: Sequelize.INTEGER(30),
                allowNull: false
            },
            expiry: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        })
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('pakages')
    }
}
