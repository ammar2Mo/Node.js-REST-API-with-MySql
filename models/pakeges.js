'use strict'

module.exports = function (sequelize, DataTypes) {
    var pakeges = sequelize.define('pakeges', {
      id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false
      },
      name: {
          type: DataTypes.STRING(50),
          unique: true,
          allowNull: false
      },
      type: {
          type: DataTypes.STRING(50),
          allowNull: false
      },
      cost: {
          type: DataTypes.INTEGER(30),
          allowNull: false
      },
      numOfConsultation: {
          type: DataTypes.INTEGER,
          allowNull: true
      },
      expiry: {
          type: DataTypes.INTEGER(15),
          defaultValue: 999999999999,
          allowNull: false
      }
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here // userPakeges
          pakeges.hasMany(models.consultation, { foreignKey: 'pakegeId' })
          pakeges.hasMany(models.usersPakeges, { foreignKey: 'pakegeId' })


      }
    }
  })
    return pakeges
}
