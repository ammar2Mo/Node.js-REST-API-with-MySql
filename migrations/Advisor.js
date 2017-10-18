'use strict'

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('Advisor', {
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
            experience: {
                type: Sequelize.TEXT
            },
            UniversityDegree: {
                type: Sequelize.TEXT
            }
        })
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('Advisor')
    }
}
