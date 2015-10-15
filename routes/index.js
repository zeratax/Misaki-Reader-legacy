var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Gallery = require('../models/gallery');
var Tag = require('../models/tag');
var verify = require('browserid-verify')();

router.auth = function (audience) {

  return function(req, resp){
    console.info('verifying with persona');

    var assertion = req.body.assertion;

    verify(assertion, audience, function(err, email, data) {
      if (err) {
        // return JSON with a 500 saying something went wrong
        console.warn('request to verifier failed : ' + err);
        return resp.send(500, { status : 'failure', reason : '' + err });
      }

      // got a result, check if it was okay or not
      if ( email ) {
        console.info('browserid auth successful, setting req.session.email');
        req.session.email = email;
        var newUser = new User({ "mail" : email });
        newUser.save(function (err, newUser) {
            if (err) {
           console.info(err);
        }
        });
        return resp.redirect('/');
      }

      // request worked, but verfication didn't, return JSON
      console.error(data.reason);
      resp.send(403, data)
    });
  };
};

router.logout = function (req, resp) {
  req.session.destroy();
  resp.redirect('/');
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'misaki.moe', user: req.session.email, csrf: req.session._csrf});
});

router.get('/gallery/newest', function(req, res) {
    Gallery.find(function(e,docs){
        res.render('gallerylist', {
            "gallerylist" : docs
        });
    });
});

router.get('/gallery/contribute/new', function(req, res) {
    res.render('gallerynew', { title: 'Add a new Galleries' });
});


router.route('/gallery/edit/:id').get(function(req, res) {
    Gallery.findOne({ _id: req.params.id}, function(e, docs) {
        res.render('galleryedit', {
            "galleryedit" : docs
        });
    });
});

/* POST to Add Gallery Service */
router.post('/gallery/contribute/new', function(req, res) {

    // Submit to the DB
    var newGallery = new Gallery({ "uploader" : user });
	newGallery.save(function (err, newGallery) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect('contribute/' + newGallery._id);
        }
    });
});

router.get('/tag/contribute/new', function(req, res) {
    res.render('tagnew', { title: 'Add a new Tag', user: req.session.email, csrf: req.session._csrf});
});

/* POST to Add Tag Service */
router.post('/tag/contribute/new', function(req, res) {

    // Submit to the DB
    var newTag = new Tag({ "uploader" : user });
    newTag.save(function (err, newTag) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect('tag/' + newTag._id);
        }
    });
});

module.exports = router;
