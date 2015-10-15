var Gallery = require('../models/gallery');
var User = require('../models/user');
var express = require('express');
var router = express.Router();


//gallery
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

//user
router.route('/user')
  .get(function(req, res) {
    User.find(function(err, user) {
      if (err) {
        return res.send(err);
      }

      res.json(user);
    });
  })
  .post(function(req, res) {
    var user = new User(req.body);

    user.save(function(err) {
      if (err) {
        return res.send(err);
      }

      res.send({ message: 'User Added' });
    });
  });
router.route('/user/:id').put(function(req,res){
  User.findOne({ _id: req.params.id }, function(err, user) {
    if (err) {
      return res.send(err);
    }

    for (prop in req.body) {
      user[prop] = req.body[prop];
    }

    // save the movie
    user.save(function(err) {
      if (err) {
        return res.send(err);
      }

      res.json({ message: 'User updated!' });
    });
  });
});  
router.route('/user/:id').get(function(req, res) {
  User.findOne({ _id: req.params.id}, function(err, user) {
    if (err) {
      return res.send(err);
    }

    res.json(user);
  });
});
router.route('/user/:id').delete(function(req, res) {
  User.remove({
    _id: req.params.id
  }, function(err, user) {
    if (err) {
      return res.send(err);
    }

    res.json({ message: 'User successfully deleted' });
  });
});

module.exports = router;

