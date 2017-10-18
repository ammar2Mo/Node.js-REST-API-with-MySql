'use strict'

module.exports = function (sequelize, DataTypes) {
    var consultent = sequelize.define('consultent', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(50),
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
        password: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        phone: DataTypes.STRING(50),
        birthDate: DataTypes.DATE,
        sex: DataTypes.STRING(50),
        photo: DataTypes.STRING(60)
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
          consultent.hasMany(models.consultation, { foreignKey: 'consultentId' })
          consultent.hasMany(models.usersPakeges, { foreignKey: 'consultentId' })
          consultent.hasMany(models.consultentComplaints, { foreignKey: 'consultentId' })


      }
    }
  })
  return consultent
}
