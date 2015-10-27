var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Gallery = require('../models/gallery');
var Tag = require('../models/tag');
var Vote = require('../models/vote');
var verify = require('browserid-verify')();

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

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

/* Sort galleries after :id */
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
    if ( req.session.email ) {
        User.findOne({ _id: req.params.id}, function(e, uploader) {
            // Submit to the DB
            var newGallery = new Gallery({ 'uploader' : uploader._id });
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
    }
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
                        'alternative' : req.body.alternative.split(','),
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
                        'alternative' : req.body.alternative.split(','),
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

/*
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

*/

router.get('/tag/contribute/list/:status', function(req, res) {
    Tag.find({'properties.status' : req.params.status.toLowerCase()}, function(err, tag) {
        Tag.populate(tag, { 'path': 'user'}, function(e, tag) {
            res.render('taglist', {
                'tags' : tag,
                title: req.params.status.toLowerCase().capitalizeFirstLetter() + ' Tag List', 
                usermail: req.session.email, 
                csrf: req.session._csrf
            });
        });
    });
});

router.get('/tag/contribute/view/:id', function(req, res) {
    Tag.findOne({ _id: req.params.id}, function(e, tag) {
        Tag.populate(tag, { 'path': 'user'}, function(e, tag) {
            Vote.find({ target: req.params.id}, function(e, vote) {
                User.findOne({ mail: req.session.email}, function(e, user) {
                    if ( tag ) {
                        tagtitle = tag.title.english + ' / ' + tag.title.japanese;
                    }
                    res.render('tagpending', {
                        'tagpending' : tag, 
                        'votes' : vote,
                        'currentuser' : user,
                        title: tagtitle,
                        usermail: req.session.email, 
                        csrf: req.session._csrf
                    });
                });    
            });    
        });  
    });
});

router.get('/user/:id', function(req, res) {
    User.findOne({ _id: req.params.id}, function(e, user) {
        res.render('userprofile', {
            'userprofile' : user,
            usermail: req.session.email,
            csrf: req.session._csrf
        });
    });
});

router.post('/account/settings', function(req, res) {
    User.findOne({ mail: req.session.email }, function(e, user) {
        if (req.session.email == user.mail) {
            if(req.body.name == '') {
                User.update({ mail: req.session.email }, {'name' : 'Anon'}, function(err) {
                    if (err) {
                     console.info(err);
                 }else{
                    res.redirect('/account/settings');
                }
            });
            }else{
                User.update({ mail: req.session.email }, {'name' : req.body.name}, function(err) {
                    if (err) {
                        console.info(err);
                    }else{
                        res.redirect('/account/settings');
                    }
                });
            }
        }
    });
});

router.get('/account/settings', function(req, res) {
    if (req.session.email) {
        User.findOne({ mail : req.session.email }, function(e, user) {
            res.render('usersetting', {
                'user' : user,
                title : 'Account settings',
                usermail: req.session.email,
                csrf: req.session._csrf
            });
        });
    }else{
        res.render('usersetting', {
            title : 'Account settings',
            usermail: req.session.email,
            csrf: req.session._csrf
        });
    } 
});

router.post('/modify/:object/:id/:action/', function(req, res) {
    if ( req.session.email ) {
        if (req.params.action == "published" || req.params.action == "rejected" || req.params.action == "deleted")
        switch (req.params.object) {
            case 'gallery':
            Target = Gallery;
            break;
            case 'tag':
            Target = Tag;
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
                //check if deleter is admin/moderator/owner
                if(String(deleter._id) == String(target.user) && target.properties.status == "pending" && req.params.action != "deleted" || deleter.role == 'moderator'  && req.params.action != "deleted" || deleter.role == 'admin'){
                    Target.update({_id: req.params.id},{ 'properties.status' : req.params.action }, {upsert: true}, function(err) {
                        if (err) {
                         console.info(err);
                     }else{
                        res.send('successeful rejected')
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

router.post('/vote/:id/', function(req, res) {
    if ( req.session.email ) {
        if (req.body.vote == -1 || req.body.vote == 1) {
            User.findOne({ 'mail': req.session.email}, function(e, uploader) {
                Vote.update({'user': uploader._id, 'target': req.params.id}, {'vote' : req.body.vote}, {upsert: true}, function(err) {
                    if (err) {
                     console.info(err);
                 }else{
                    res.send('successeful voted')
                }
            });
            });
        }
    }            
});

module.exports = router;
