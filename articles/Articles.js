const Sequelize = require('sequelize')
const connection = require('../database/database')
const Category = require('../categories/Category')

const Articles = connection.define('Articles',{
    title:{
        type: Sequelize.STRING,
        allowNull: false
    },
    slug:{
        type: Sequelize.STRING,
        allowNull: false
    },
    body:{
        type: Sequelize.TEXT,
        allowNull: false
    }
})

Category.hasMany(Articles) // UMA categoria tem muitos artigos
Articles.belongsTo(Category) // UM artigo pertence a uma categoria

Articles.sync({force:false})

module.exports = Articles