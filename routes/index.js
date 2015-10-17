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
        //usermail = email;
        var newUser = new User({ 'mail' : email });
        newUser.save(function (err, newUser) {
            if (err) {
           //console.info(err);
       }
   });
        backURL=req.header('Referer') || '/';
        return resp.redirect(backURL);
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
  res.render('index', { title: 'misaki.moe', usermail: req.session.email, csrf: req.session._csrf });
});

router.get('/gallery/sort/:id', function(req, res) {
    Gallery.find(function(e,docs){
        res.render('gallerylist', {
            'gallerylist' : docs,
            sortorder : req.params.id,
            usermail: req.session.email, 
            csrf: req.session._csrf
        });
    });
});

router.get('/gallery/contribute/new', function(req, res) {
    res.render('gallerynew', { title: 'Add a new Galleries', usermail: req.session.email, csrf: req.session._csrf });
});

/* POST to Add Gallery Service */
router.post('/gallery/contribute/new', function(req, res) {

    // Submit to the DB
    var newGallery = new Gallery({ 'uploader' : user });
    newGallery.save(function (err, newGallery) {
        if (err) {
            // If it failed, return error
            res.send('There was a problem adding the information to the database.');
        }
        else {
            // And forward to success page
            res.redirect('/view/' + newGallery._id);
        }
    });
});

router.route('/gallery/edit/:id').get(function(req, res) {
    Gallery.findOne({ _id: req.params.id}, function(e, docs) {
        res.render('galleryedit', {
            'galleryedit' : docs, 
            usermail: req.session.email, 
            csrf: req.session._csrf
        });
    });
});


router.get('/tag/contribute/new', function(req, res) {
    res.render('tagnew', { title: 'Add a new Tag', usermail: req.session.email, csrf: req.session._csrf });
});

/* POST to Add Tag Service */
router.post('/tag/contribute/new', function(req, res) {
    if ( req.session.email ) {
        User.findOne({ mail: req.session.email}, function(e, uploader) {


            // Submit to the DB
            if ( req.body.related ) {
                var newTag = new Tag({ 
                    'title' : {
                        'english' : req.body.english,
                        'japanese' : req.body.japanese,
                        'alternative' : req.body.alternative,
                    },
                    'properties' : {
                        'type' : req.body.type,
                        'related' : req.body.related,
                        'description' : req.body.description
                    },
                    'note' : req.body.note,
                    'user' : uploader._id
                });
            } else {
                var newTag = new Tag({
                    'title' : {
                        'english' : req.body.english,
                        'japanese' : req.body.japanese,
                        'alternative' : req.body.alternative,
                    },
                    'properties' : {
                        'type' : req.body.type,
                        'description' : req.body.description
                    },
                    'note' : req.body.note,
                    'user' : uploader._id
                });
            }
            newTag.save(function (err, newTag) {
                if (err) {
                    // If it failed, return error
                    console.info(err);
                    res.send('There was a problem adding the information to the database.');
                }
                else {
                    // And forward to success page
                    res.redirect('/tag/contribute/view/' + newTag._id);
                }
            });
        });
} else {
    res.send('You need to sign in to contribute');
}
});

router.post('/:object/delete/:id/', function(req, res) {
    if ( req.session.email ) {
        switch (req.params.object) {
            case 'gallery':
                Target = Gallery;
                break;
            case 'tag':
                Target = Tag;
                console.info('tag selected')
                break;
            case 'user':
                Target = User;
                break;
            case 'edit':
                Target = Edit;
                break;
            default: 
                res.send('404');
        }
        User.findOne({ mail: req.session.email }, function(e, deleter) {
            Target.findOne({ _id: req.params.id }, function(e, target) {
                console.info(deleter.name + ' wants to delete '+ target.title.english)
                if(String(deleter._id) == String(target.user) && target.properties.status == "pending" || deleter.role == 'admin'){
                    Target.remove({
                        _id: req.params.id
                    }, function(err, target) {
                        if (err) {
                            return res.send(err);
                        }else{
                            res.redirect('/tag/contribute/list/');
                        }
                    });
                }else{
                    res.send('insufficient permission');
                }
            });
        });    
    }else{
        res.send('You need to sign in to delete');
    }    
});

router.post('/tag/contribute/rate/:id/', function(req, res) {
    if ( req.session.email ) {
        if (req.body.vote == 0 || req.body.vote == -1 || req.body.vote == 1) {
            User.findOne({ mail: req.session.email}, function(e, uploader) {
                Tag.findOne({ 'properties.rating.user' : uploader._id}, function(e, tag) {
                    if ( tag ){
                        query = { '_id' : req.params.id, 'properties.rating.user' : uploader._id }
                        data = { 'properties.rating.$': { 'user' : uploader._id, 'vote' : req.body.vote } };
                    } else {
                        query = { '_id' : req.params.id }
                        data = { '$addToSet': { 'properties.rating': { '$each': [{ 'user' : uploader._id, 'vote' : req.body.vote }] } } };
                    }
                    Tag.update(
                        query,
                        data,
                        function(err, tag) {
                            if (err) {
                                console.info(err, tag);
                            }
                        }
                    );
                });
            });
        }
    }
});



router.get('/tag/contribute/list', function(req, res) {
    Tag.find(function(err, tag) {
        Tag.populate(tag, { 'path': 'user'}, function(e, tag) {
            res.render('tagpendinglist', {
                'tagpendinglist' : tag,
                title: 'Pending Tag List', 
                usermail: req.session.email, 
                csrf: req.session._csrf
            });
        });
    });
});

router.route('/tag/contribute/view/:id').get(function(req, res) {
    Tag.findOne({ _id: req.params.id}, function(e, tag) {
        Tag.populate(tag, { 'path': 'user'}, function(e, tag) {
        if ( tag ) {
            tagtitle = tag.title.english + ' / ' + tag.title.japanese;
        }
        res.render('tagpending', {
            'tagpending' : tag, 
            title: tagtitle,
            usermail: req.session.email, 
            csrf: req.session._csrf
        });
    });  
    });
});

router.route('/user/:id').get(function(req, res) {
    User.findOne({ mail: req.params.id}, function(e, docs) {
        res.render('userprofile', {
            'userprofile' : docs,
            usermail: req.session.email,
            csrf: req.session._csrf
        });
    });
});

module.exports = router;
