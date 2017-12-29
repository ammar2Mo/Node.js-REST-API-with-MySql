'use strict'

module.exports = function (sequelize, DataTypes) {
    var employee = sequelize.define('employee', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true
            }

        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    }, {
            freezeTableName: true,
            classMethods: {
                associate: function (models) {
                    // associations can be defined here
                    employee.hasMany(models.dailyWork, { foreignKey: 'employeeId' })
                }
            }
        })
    return employee
}
