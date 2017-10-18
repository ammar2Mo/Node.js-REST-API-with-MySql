'use strict'

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('consultation', {
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
            advisorId: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false
            },
            pakegeId: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM,
                defaultValue: 'pending',
                values: ['solved', 'pending','active']
            },
            timestamp: {
                type: Sequelize.STRING,
                defaultValue: new Date().getTime()
            }
        })
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('consultation')
    }
}
