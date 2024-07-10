const express = require('express')
const router = express.Router()
const Category = require('../categories/Category')
const modelArticle = require('./Articles')
const Slugify = require('slugify')
const adminAuth = require('../middlewares/adminauth')

router.get('/admin/articles', adminAuth, (req,res) => {
    modelArticle.findAll({ 
        include: [
            { model: Category }
        ]
     }).then( articles => {
        res.render('admin/articles/', { articles: articles })
    })
})

router.get('/admin/articles/new', adminAuth, (req,res) => {
    Category.findAll({ raw: true }).then( category => {
        res.render('admin/articles/new', { category: category })
    })
})

router.post('/articles/save', adminAuth, (req,res) => {
    var title = req.body.title
    var body = req.body.body
    var category = req.body.category
    if(!isNaN(category)){
        modelArticle.create({
            title: title,
            slug: Slugify(title).toLowerCase(),
            body: body,
            CategoryId: category
        }).then(() => {
            res.redirect('/admin/articles')
        })
    }else{
        res.redirect('/admin/articles')
    }
})

router.post('/articles/delete', adminAuth, (req,res) => {
    var id = req.body.delete
    if( id != undefined){
        if(!isNaN(id)){
           modelArticle.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect('/admin/articles')
            }) 
        }else{
            res.redirect('/admin/articles')
        }
    }else{
        res.redirect('/admin/articles')
    }
})  

router.get('/articles/editar/:id', adminAuth, (req,res) => {
    var id = req.params.id
    if(id != undefined){
        if(!isNaN(id)){
            modelArticle.findOne({
                where: {
                    id: id
                }
            }).then( article => {
                Category.findAll().then( category => {
                    res.render('admin/articles/editar', {
                        article: article,
                        category: category
                    })
                })
            })
        }else{
            res.redirect('/admin/articles')
        }
    }else{
        res.redirect('/admin/articles')
    }
})

router.post('/articles/update/:id', adminAuth, (req,res) => {
    var id = req.params.id
    var title = req.body.title
    var body = req.body.body
    var category = req.body.category
    if(id != undefined){
        if(!isNaN(id)){
            modelArticle.update({ title: title, slug: Slugify(title).toLowerCase(), body: body, CategoryId: category }, {
                where: {
                    id: id
                }
            }).then( () => {
                res.redirect('/admin/articles')
            }).catch( (error) => {
                res.redirect('/admin/articles')
                console.log('deu errado! \n' + error)
            })
        }else{
            res.redirect('/admin/articles')
        }
    }else{
        res.redirect('/admin/articles')
    }
})

router.get('/articles/page/:num', (req,res) => {
    var page = req.params.num
    var offset = 0
    var articlesPerPage = 4

    if(isNaN(page) || page == 1){
        offset = 0
    }else{
        offset = (parseInt(page) - 1) * articlesPerPage
    }

    modelArticle.findAndCountAll({
        limit: articlesPerPage,
        offset: offset,
        order: [
            ['id', 'DESC']
        ]
    }).then( articles => {
        var next
        if(offset + articlesPerPage >= articles.count){
            next = false
        }else{
            next = true
        }
        var result = {
            page: parseInt(page),
            next: next,
            articles: articles
        }
        Category.findAll().then( categories => {
            res.render('admin/articles/page', {
                result: result,
                categories: categories
            })
        })
    })
})

module.exports = router