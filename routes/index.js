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

router.get('/gallery/contribute', function(req, res) {
    res.render('gallerycontribute', { title: 'Add New Galleries' });
});

/* POST to Add Gallery Service */
router.post('/gallery/contribute', function(req, res) {

    // Submit to the DB
    var newGallery = new Gallery({ "english" : req.body.english,
        "japanese" : req.body.japanese,
        "alternative" : req.body.alternative,
        "artist" : req.body.artist,
        "circle" : req.body.circle,
        "parody" : req.body.parody,
        "scanlator" : req.body.scanlator,
        "convention" : req.body.convention,
        "category" : req.body.category,
        "compilation" : req.body.compilation,
        "description" : req.body.description,
        "uploader" : req.body.uploader});
	newGallery.save(function (err, newGallery) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("newest");
        }
    });
});

module.exports = router;
