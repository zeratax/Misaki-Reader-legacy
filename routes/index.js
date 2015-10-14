var express = require('express');
var router = express.Router();
var Gallery = require('../models/gallery');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'misaki.moe' });
});

router.get('/gallery/newest', function(req, res) {
    Gallery.find(function(e,docs){
        res.render('gallerylist', {
            "gallerylist" : docs
        });
    });
});

router.get('/gallery/contribute/new', function(req, res) {
    res.render('gallerynew', { title: 'Add New Galleries' });
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
    var newGallery = new Gallery({ "uploader" : "Anon" });
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

module.exports = router;
