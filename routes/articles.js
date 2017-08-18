const express = require('express');
const router = express.Router();

// Bring in Article model
let Article = require('../models/article');
let User = require('../models/user');

// Add a route for adding articles
router.get('/add', ensureAuthenticated, function(req, res) {
    res.render('add_article', {
      title:"Add Article"
    });
});

// Add a route for submitting post
router.post('/add', function(req, res) {
    req.checkBody('title', 'Title is required').notEmpty();
    // req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('add_article', {
            title: "Add Article",
            "errors": errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save(function(err) {
            if(err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
        return;
    }
});

// Update an article
router.post('/edit/:id', function(req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = { "_id": req.params.id };
    Article.update(query, article, function(err) {
        if(err) {
            console.log(err);
            return;
        } else {
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
    return;
});

// Get single article
router.get('/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
      User.findById(article.author, function(err, user) {
        res.render('article', {
          "article": article,
          "author": user.name
        });
      });
    });
});

// Load edit form
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
    Article.findById(req.params.id, function(err, article) {
      if (article.author != req.user._id) {
        req.flash('danger', 'Not authorized');
        res.redirect('/')
      }
      res.render('edit_article', {
        "article": article,
        "title": "Edit Article"
      });
      return;
    });
});

// Delete an article
router.delete('/:id', function(req, res) {
    if (!req.user._id) {
      res.status(500).send();
    }

    let query = { '_id': req.params.id };

    Article.findById(req.params.id, function(err, article) {
      if (article.author != req.user._id) {
        res.status(500).send();
      } else {
        Article.remove(query, function(err) {
            if (err) {
              console.log(err);
            }
            res.send('Success');
        });
      }
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please Log In');
    res.redirect('/users/login');
  }
}

module.exports = router;
