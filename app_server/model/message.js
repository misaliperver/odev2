var mongoose = require('mongoose');


var Schema = mongoose.Schema;

//dersKodu: {type: String, required: true, unique: true}
var mesajlarSchema = new Schema({
    sendto: String,
    username: String,
    message: String

}, {collection: 'mesajlar'});

MesajlarModel = mongoose.model('mesajlarModel', mesajlarSchema);

module.exports = MesajlarModel;