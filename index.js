const express = require('express')
const app = express() // instância do express
const connection = require('./database/database')
const session = require('express-session')

// Controllers
const categoriesController = require('./categories/CategoriesController')
const articlesController = require('./articles/ArticlesController')
const usersController = require('./user/UserController')

// Models
const modelArticle = require('./articles/Articles')
const modelCategory = require('./categories/Category')
const modelUser = require('./user/User')

// Sessions
app.use(session({
    secret: "dodgecharger",
    cookie: { // Sessões precisam dos cookies para ser gerado um id único e saber se algum usuário tem sessão naquele site
        maxAge: 30000 // valor em milisegundos
    } 
}))

// Configuration of the view engine
app.set('view engine','ejs')

// Configuration of the statics files
app.use(express.static('public'))

// Configuration to work with forms
app.use(express.urlencoded({ extended: false }))

// Configuration to receive data in JSON
app.use(express.json())

// Connection with the database
try{
    connection.authenticate().then(() => { console.log('Connection established') })
}catch(error){
    console.log('Was not possible to the connection database\n'+error)
}

app.use('/', categoriesController)
app.use('/', articlesController)
app.use('/', usersController)

app.get('/', (req,res) => {
    modelArticle.findAll({
        order: [
            ['id','DESC']
        ],
        limit: 4
    }).then( articles => {
        modelCategory.findAll().then( categories => {
            res.render('index', {
                articles: articles,
                categories: categories
            })
        })
    }) 
})

app.get('/:slug', (req,res) => {
    var slug = req.params.slug
    modelArticle.findOne({
        where: {
            slug: slug
        }
    }).then( article => {
        if(article != undefined){
            modelCategory.findAll().then( categories => {
               res.render('article', {
                    article: article,
                    categories: categories
                }) 
            })
        }else{
            res.redirect('/')
        }
    }).catch(() => {
        res.redirect('/')
    })
})

app.get('/category/:slug', (req,res) => {
    var slug = req.params.slug
    modelCategory.findOne({
        where: {
            slug: slug
        },
        include: [
            { model: modelArticle }
        ],
    }).then( category => {
        if(category != undefined){
            modelCategory.findAll().then( categories => {
                res.render('index', {
                    articles: category.Articles,
                    categories: categories
                })
            })
        }else{
            res.redirect('/')
        }
    }).catch( () => {
        res.redirect('/')
    })
})

app.listen(4040, () => { console.log('Running server') })