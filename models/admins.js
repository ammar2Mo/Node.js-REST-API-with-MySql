'use strict'

module.exports = function (sequelize, DataTypes) {
    var admins = sequelize.define('admins', {
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
      phone: {
          type: DataTypes.INTEGER(30),
          allowNull: true
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
      },
      password: {
          type: DataTypes.STRING(50),
          allowNull: false,
      }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        
      }
    }
  })
    return admins
}
