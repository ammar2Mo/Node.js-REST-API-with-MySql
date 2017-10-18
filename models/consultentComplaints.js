'use strict'

module.exports = function (sequelize, DataTypes) {
    var consultentComplaints = sequelize.define('consultentComplaints', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        consultentId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM,
            defaultValue: 'pending',
            values: ['solved', 'pending']
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.INTEGER(15),
            defaultValue: new Date().getTime()
        }
  }, {
    
    classMethods: {
      associate: function (models) {
        // associations can be defined here
          consultentComplaints.belongsTo(models.consultent, { foreignKey: 'consultentId' })
         // consultentComplaints.hasMany(models.messages, { foreignKey: 'consultentComplaintsId' })


      }
    }
  })
    return consultentComplaints
}
