const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');

// Bring in User model
const User = require('../models/user');

// Register Form
router.get('/register', function(req, res) {
    res.render('register');
});

router.post('/register', function(req, res) {
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;

    req.checkBody('name', 'Name is require.').notEmpty();
    req.checkBody('email', 'Email is not valid.').isEmail();
    req.checkBody('email', 'Email is require.').notEmpty();
    req.checkBody('username', 'Username is require.').notEmpty();
    req.checkBody('password', 'Password is require.').notEmpty();
    req.checkBody('password2', 'Password does not match.').equals(req.body.password);

    let errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                if (err) {
                    console.log(err);
                } else  {
                    newUser.password = hash;
                    newUser.save(function(err) {
                        if (err) {
                            console.log(err);
                            return;
                        } else {
                            req.flash('success', 'You are now registered!');
                            res.redirect('/users/login');
                        }
                    });
                }
            });
        });
    }
});

// Login Process
router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/login', function(req, res) {
  res.render('login');
});

// Logout Process
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', "You're logged out");
  res.redirect('/users/login');
});

module.exports = router;
