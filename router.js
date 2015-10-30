var express = require('express');
var router = new express.Router;
var passport = require('passport');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.flash('info', 'You need to log in first!');
    res.redirect('/auth/login');
}

router.route('/auth/login')
    .get(function (req, res) {
        res.render('auth/login');
    })
    .post(passport.authenticate('local-login', {
        successRedirect:    '/list',
        failureRedirect:    '/auth/login',
        failureFlash:       true,
        badRequestMessage:  'You missed something'
    }));

router.route('/auth/signup')
    .get(function (req, res) {
        res.render('auth/signup');
    })
    .post(passport.authenticate('local-signup', {
        successRedirect:    '/add',
        failureRedirect:    '/auth/signup',
        failureFlash:       true,
        badRequestMessage:  'You missed something'
    }));

router.use('/auth/logout', function (req, res) {
    req.logout();
    res.redirect('/auth/login');
});


router.get('/', function (req, res) {
    res.render('info', {
       title: 'Contacts'
    });
});
router.route('/list')
    .get(ensureAuthenticated, function (req, res) {
        var result;
        if (req.query.query) {
            result = req.app.Models.contact.find({
                 name: { 'contains': req.query.query },
                 user: req.user.id
            });
        } else {
            result = req.app.Models.contact.find({
                user: req.user.id
            });
        }
        
        
        result
            // Ha nem volt hiba fusson le ez
            .then(function (data) {
                res.render('list', {
                    title: 'Contacts',
                    data: data,
                    query: req.query.query,
                    uzenetek: req.flash()
                });
            })
            // Ha volt hiba fusson le ez
            .catch(function () {
                console.log('Error!');
                throw 'error';
            });
        //console.log(req.session.data);
    });



router.route('/list/:id')
    .get(ensureAuthenticated, function (req, res) {
        req.app.Models.contact.find({ id: req.params.id })
        .then(function (data) {
            res.render('list', {
                title: 'Contacts',
                data: data,
                uzenetek: req.flash()
            });  
        })
        .catch(function () {
            console.log('Error');
            throw 'error';
        });
    });
router.route('/add')
    .get(ensureAuthenticated, function (req, res) {
        res.render('add', {
            title: 'Contacts',
            uzenetek: req.flash()
        });
    })
    .post(ensureAuthenticated, function (req, res) {
        req.checkBody('name', 'Something went wrong with the name')
            .notEmpty();
        req.checkBody('phone', 'Something went wrong with the phone number')
            .notEmpty();
        /*req.checkBody('email', 'Something went wrong with the email')
            .notEmpty();*/
        
        if (req.validationErrors()) {
            req.validationErrors().forEach(function (error) {
                req.flash('error', error.msg);
            });
            res.redirect('/add');
        } else {
            req.app.Models.contact.create({
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                provider: req.body.provider,
                user: req.user.id
            })
            .then(function () {
                req.flash('success', 'Contact added successfully');
                res.redirect('/add');
            })
            .catch(function () {
                req.flash('error', 'An error occurred, please try again');
                res.redirect('/add');
            });
        }
        //console.log(req.session.data);
    });
    
router.use('/edit/:id', ensureAuthenticated, function (req, res) {
        req.app.Models.contact.find({ id: req.params.id })
        .then(function (data) {
            var provider = {};
            provider[data[0].provider] = true;
            res.render('edit', {
                title: 'Edit',
                data: data[0],
                provider: provider,
                uzenetek: req.flash()
            });  
        })
        .catch(function () {
            console.log('Error');
            throw 'error';
        });
        
});
    
router.route('/update/:id')
    .get(ensureAuthenticated, function (req, res) {
        res.render('update', {
            title: 'Contacts',
            uzenetek: req.flash()
        });
    })
    .post(ensureAuthenticated, function (req, res) {
        req.checkBody('name', 'Something went wrong with the name')
            .notEmpty();
        req.checkBody('phone', 'Something went wrong with the phone number')
            .notEmpty();
        /*req.checkBody('email', 'Something went wrong with the email')
            .notEmpty();*/
        
        if (req.validationErrors()) {
            req.validationErrors().forEach(function (error) {
                req.flash('error', error.msg);
            });
            res.redirect('/edit/'+req.params.id);
        } else {
            req.app.Models.contact.update({
                user: req.user.id,
                id: req.params.id
            },
            {
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                provider: req.body.provider,
                user: req.user.id
            })
            .then(function () {
                req.flash('success', 'Contact updated successfully');
                res.redirect('/list');
            })
            .catch(function () {
                req.flash('error', 'An error occurred, please try again');
                res.redirect('/add');
            });
        }
    });
    
    
router.use('/delete/:id', ensureAuthenticated, function (req, res) {
        req.app.Models.contact.destroy({ id: req.params.id })
        .then(function () {
            req.flash('success', 'Contact deleted');
            res.redirect('/list');
        })
        .catch(function () {
            req.flash('error', 'Something went wrong');
            res.redirect('/list');
        });
    });


module.exports = router;