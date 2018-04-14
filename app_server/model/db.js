var mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

var mongoDB = 'mongodb://localhost/agOdev2';

mongoose.connect(mongoDB, function(err, err){
    if(err){
        console.log('mongoose hatasi: '+ err );
    }
    else{
        console.log('mongoose baglandi: '+ mongoDB);
    }
});