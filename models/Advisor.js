'use strict'

module.exports = function (sequelize, DataTypes) {
    var Advisor = sequelize.define('Advisor', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        name: {
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
        password: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        experience: {
            type: DataTypes.TEXT
        },
        universityDegree: {
            type: DataTypes.TEXT
        }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
          // associations can be defined here
          Advisor.hasMany(models.consultation, { foreignKey: 'advisorId' })
      }
    }
  })
    return Advisor
}
