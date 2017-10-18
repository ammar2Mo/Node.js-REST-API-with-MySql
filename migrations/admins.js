'use strict'

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('admins', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false
            },
            firstName: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            lastName: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(50),
                unique: true,
                allowNull: false,
                validate: {
                    isEmail: true
                }

            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            password: {
                type: Sequelize.STRING(50),
                allowNull: false,
            }

        })
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('admins')
    }
}
