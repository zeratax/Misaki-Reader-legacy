var mongoose = require('mongoose');
var dbName = 'misaki';
var connectionString = 'mongodb://localhost:27017/' + dbName;

mongoose.connect(connectionString);
