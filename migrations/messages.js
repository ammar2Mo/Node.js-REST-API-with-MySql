'use strict'

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('messages', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false
            },
            fromId: {
                type: Sequelize.UUID,
                allowNull: false
            },
            toId: {
                type: Sequelize.UUID,
                allowNull: true
            },
            consultationId: {
                type: Sequelize.UUID,
                //primaryKey: true,
                allowNull: true
            },
            body: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            attachments: {
                type: Sequelize.STRING,
                allowNull: true
            },
            timestamp: {
                type: Sequelize.INTEGER(15),
                defaultValue: new Date().getTime()
            }
        })
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('messages')
    }
}
