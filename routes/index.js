var express = require('express');
var router = express.Router();
var path = require('path');
var verify = require('browserid-verify')();
var fs = require('fs-extra');
var util = require('util');
var formidable = require('formidable')
var User = require('../models/user');
var Gallery = require('../models/gallery');
var Tag = require('../models/tag');
var Vote = require('../models/vote');


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
           //console.error(err);
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

/// Post files
router.post('/upload', function(req, res) {
    if ( req.session.email ) {
        User.findOne({ mail: req.session.email}, function(e, uploader) {
            var form = new formidable.IncomingForm();
            form.hash = 'md5';
            form.parse(req, function(err, fields, files) {
                //res.end(util.inspect({fields: fields, files: files}));
            });
            form.on('end', function(fields, files) {
                 // Submit to the DB
                var newGallery = new Gallery({ 
                    'user' : uploader._id, 
                    'title' : {
                        'english' : form.openedFiles[0].hash,
                        'japanese' : form.openedFiles[0].hash
                    },
                    'properties' : {
                        'pages' : form.openedFiles.length
                    }
                });
                newGallery.save(function (err, newGallery) {
                    if (err) {
                        // If it failed, return error
                        res.status(500).send('there was a problem :/')
                        console.error(err);
                    }else{
                        res.send('/gallery/contribute/edit/' + newGallery._id);
                        for (var i = form.openedFiles.length - 1; i >= 0; i--) {
                            /* Temporary location of our uploaded file */
                            var temp_path = form.openedFiles[i].path;
                            /* The file name of the uploaded file */
                            var file_name = form.openedFiles[i].name;
                            /* Location where we want to copy the uploaded file */
                            var new_location = path.join(__dirname, '../', 'public/uploads/', String(newGallery._id), '/' );

                            fs.copy(temp_path, new_location + i + '.png', function(err) {  
                                if (err) {
                                    console.error(err);
                                }else{
                                    //create thumbnails
                                }
                            });
                        };
                    }
                });
            return;
            });
        });
    }
});

/* Sort galleries after :id */
router.get('/gallery/sort/:id', function(req, res) {
    Gallery.find(function(e,gallery){
        res.render('gallerylist', {
            'gallerylist' : gallery,
            sortorder : req.params.id,
            usermail: req.session.email, 
            csrf: req.session._csrf
        });
    });
});

router.get('/gallery/contribute/new', function(req, res) {
    res.render('gallerynew', { title: 'Add a new Gallery', usermail: req.session.email, csrf: req.session._csrf });
});

router.get('/gallery/view/:id/:page', function(req, res) {
    Gallery.findOne({ _id: req.params.id}, function(e, gallery) {
        if (gallery) {
            res.send('<img src="/uploads/' + gallery._id + '/' + req.params.page + '.png" alt("Page ' + req.params.page + '")></img>');
        }
    });
});

router.get('/gallery/contribute/view/:id', function(req, res) {
    Gallery.findOne({ _id: req.params.id}, function(e, gallery) {
        Gallery.populate(gallery, { 'path': 'tags.tag' }, function(e, gallery) {
            Gallery.populate(gallery, { 'path': 'user' }, function(e, gallery) {
                Vote.find({ target: req.params.id}, function(e, vote) {
                    User.findOne({ mail: req.session.email}, function(e, user) {
                        if ( gallery ) {
                            gallerytitle = gallery.title.english + ' / ' + gallery.title.japanese;
                        }else{
                            gallerytitle = 'Gallery not found';
                        }
                        res.render('galleryview', {
                            'gallery' : gallery,
                            'votes' : vote,
                            'currentuser' : user,
                            title : gallerytitle,
                            sortorder : req.params.id,
                            usermail: req.session.email, 
                            csrf: req.session._csrf
                        });
                    });
                });
            });
        });
    });    
});


router.get('/gallery/contribute/edit/:id', function(req, res) {
    if ( req.session.email ) {
        Gallery.findOne({ _id: req.params.id}, function(e, gallery) {
            Gallery.populate(gallery, { 'path': 'tags.tag' }, function(e, gallery) {
                if (gallery) {
                    User.findOne({ _id: gallery.user }, function(e, user) {
                        if (user.mail == req.session.email || user.role == 'admin') {
                            if ( gallery ) {
                                gallerytitle = gallery.title.english + ' / ' + gallery.title.japanese;
                            }else{
                                gallerytitle = 'Gallery not found';
                            }
                            res.render('galleryedit', {
                                'gallery' : gallery, 
                                title: gallerytitle,
                                usermail: req.session.email, 
                                csrf: req.session._csrf
                            });
                        }else{
                            res.status(500).send('you do not have permission to edit this');
                        }
                    });
                }else{
                    res.redirect('/');
                }
            });
        });
    }else{
        res.redirect('/');
    }
});



router.post('/gallery/contribute/edit/:id', function(req, res) {
    if ( req.session.email ) {
        Gallery.findOne({ _id: req.params.id}, function(e, gallery) {
            if (gallery) {
                if(gallery.properties.status != 'deleted' && gallery.properties.status != 'published' && gallery.properties.status != 'rejected' || user.role == admin)
                    User.findOne({ _id: gallery.user }, function(e, user) {
                        if (user.mail == req.session.email || user.role == admin) {
                            var english = req.body.english;
                            var japanese = req.body.japanese;
                            var alternative = req.body.alternative.split(',');
                            var tags = req.body.tags.split(',');
                            if(english != '' && japanese !='' & tags != ''){
                                Gallery.update({
                                    _id : req.params.id
                                }, {                            
                                    'title' : {
                                        'english': english,
                                        'japanese': japanese,
                                        'alternative' : alternative
                                    },
                                    'properties.status' : 'pending',
                                    '$unset': { 'tags' : '' }
                                }, {upsert: true}, function(err) {
                                    if (err) {
                                       res.status(500).send('there was a problem');
                                       console.error(err);
                                   }else{
                                        for (var i = tags.length - 1; i >= 0; i--) {
                                            for (var j = tags.length - 1; j >= 0; j--) {
                                                if (j!=i && tags[i] == tags[j]) {
                                                    tags.splice(i, i+1);
                                                }
                                            }
                                            console.info(tags[i])
                                            Tag.findOne({ $or: [ { 'title.english' : tags[i] }, { 'title.japanese' : tags[i] } ] }, function(e, tag) {
                                                if (tag) {
                                                    Gallery.update({
                                                    _id : req.params.id
                                                    }, {
                                                        '$addToSet': { 
                                                            'tags' : {
                                                                'tag' : tag,
                                                                'user' : user._id
                                                            }
                                                        }
                                                    }, function(err) {
                                                        if (err) {
                                                           console.error(err);
                                                       }
                                                    }); 
                                                }
                                            });
                                        };
                                        
                                        res.redirect('/gallery/contribute/view/' + gallery._id);
                                    }
                                });
                            }else{
                                res.status(500).send('required fields need to be answered')
                            }
                        }else{
                            res.status(500).send('you do not have permission to edit this');
                        }
                    });

            }else{
                res.redirect('/gallery/contribute/list/pending');
            }
        });
    }else{
        res.redirect('/gallery/contribute/list/pending');
    }
});




router.get('/tag/contribute/new', function(req, res) {
    res.render('tagnew', { title: 'Add a new Tag', usermail: req.session.email, csrf: req.session._csrf });
});

/* POST to Add Tag Service */
router.post('/tag/contribute/new', function(req, res) {
    if ( req.session.email ) {
        User.findOne({ mail: req.session.email}, function(e, uploader) {
            // Submit to the DB
            var related =""; //do some nice validating with that
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
            newTag.save(function (err, newTag) {
                if (err) {
                    // If it failed, return error
                    console.error(err);
                    res.status(500).send('There was a problem adding the information to the database.');
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

router.get('/tag/contribute/list/:status', function(req, res) {
    Tag.find({'properties.status' : req.params.status.toLowerCase()}, function(err, tag) {
        Tag.populate(tag, { 'path': 'user'}, function(e, tag) {
            res.render('contributelist', {
                'objects' : tag,
                'objectname' : 'tag',
                title: req.params.status.toLowerCase().capitalizeFirstLetter() + ' Tag List', 
                usermail: req.session.email, 
                csrf: req.session._csrf
            });
        });
    });
});

router.get('/gallery/contribute/list/:status', function(req, res) {
    Gallery.find({'properties.status' : req.params.status.toLowerCase()}, function(err, gallery) {
        Gallery.populate(gallery, { 'path': 'user'}, function(e, gallery) {
            res.render('contributelist', {
                'objects' : gallery,
                'objectname' : 'gallery',
                title: req.params.status.toLowerCase().capitalizeFirstLetter() + ' Gallery List', 
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
                    }else{
                        tagtitle = 'Tag not found';
                    }
                    res.render('tagview', {
                        'tag' : tag, 
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
                       console.error(err);
                   }else{
                    res.redirect('/account/settings');
                }
            });
            }else{
                User.update({ mail: req.session.email }, {'name' : req.body.name}, function(err) {
                    if (err) {
                        console.error(err);
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
    var currentdate = new Date().toISOString()
    var Target;
    if ( req.session.email ) {
        if (req.params.action == "published" || req.params.action == "rejected" || req.params.action == "deleted" || req.params.action == "edit") {
            switch (req.params.object) {
                case 'gallery':
                Target = Gallery;
                break;
                case 'tag':
                Target = Tag;
                break;
                case 'edit':
                Target = Edit;
                break;
                default: 
                res.status(404).send('404');
                next();
            }
            User.findOne({ mail: req.session.email }, function(e, deleter) {
                Target.findOne({ _id: req.params.id }, function(e, target) {
                    if (target && deleter ) {
                        //check if deleter is admin/moderator/owner
                        if(String(deleter._id) == String(target.user) && target.properties.status == "pending" && req.params.action != "deleted" && req.params.action != "published" && req.params.action != "edit" || deleter.role == 'moderator'  && req.params.action != "deleted" || deleter.role == 'admin'){
                            Target.update({_id: req.params.id},{ 'properties.status' : req.params.action, 'published' : currentdate }, {upsert: true}, function(err) {
                                if (err) {
                                    res.status(500).send('that did not work :/')
                                    console.error(err);
                                }else{
                                    res.send('successes')
                                }
                            });
                        }else{
                            res.status(500).send('insufficient permission');
                        }
                }
            });
            });  
        }  
    }else{
        res.status(500).send('You need to sign in to delete');
    }    
});

router.post('/vote/:id/', function(req, res) {
    if ( req.session.email ) {
        if (req.body.vote == -1 || req.body.vote == 1) {
            User.findOne({ 'mail': req.session.email}, function(e, uploader) {
                Vote.update({'user': uploader._id, 'target': req.params.id}, {'vote' : req.body.vote}, {upsert: true}, function(err) {
                    if (err) {
                       res.status(500).send('there was a problem');
                       console.error(err);
                   }else{
                    res.send('successefully voted')
                }
            });
            });
        }
    }            
});

module.exports = router;



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