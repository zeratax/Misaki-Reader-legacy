var Gallery = require('../models/gallery');
var express = require('express');
var router = express.Router();

router.route('/gallery')
  .get(function(req, res) {
    Gallery.find(function(err, gallery) {
      if (err) {
        return res.send(err);
      }

      res.json(gallery);
    });
  })
  .post(function(req, res) {
    var gallery = new Gallery(req.body);

    gallery.save(function(err) {
      if (err) {
        return res.send(err);
      }

      res.send({ message: 'Gallery Added' });
    });
  });
router.route('/gallery/:id').put(function(req,res){
  Gallery.findOne({ _id: req.params.id }, function(err, gallery) {
    if (err) {
      return res.send(err);
    }

    for (prop in req.body) {
      gallery[prop] = req.body[prop];
    }

    // save the movie
    gallery.save(function(err) {
      if (err) {
        return res.send(err);
      }

      res.json({ message: 'Gallery updated!' });
    });
  });
});  
router.route('/gallery/:id').get(function(req, res) {
  Gallery.findOne({ _id: req.params.id}, function(err, gallery) {
    if (err) {
      return res.send(err);
    }

    res.json(gallery);
  });
});
router.route('/gallery/:id').delete(function(req, res) {
  Gallery.remove({
    _id: req.params.id
  }, function(err, gallery) {
    if (err) {
      return res.send(err);
    }

    res.json({ message: 'Gallery successfully deleted' });
  });
});
router.route('/uploader/:uploaderId').get(function(req, res) {
  Gallery.find({ uploader: req.params.uploaderId }, function(err, gallery) {
    if (err) {
      return res.send(err);
    }

    res.json(gallery);
  });
});

module.exports = router;