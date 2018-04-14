var express = require('express');
var app = express();
var path = require('path');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var db = require(path.join(__dirname, './app_server/model/db'));
var Mesajlar = require(path.join(__dirname, './app_server/model/message'));

http.listen(port, function () {
  console.log('Port dinlenmeye alındı. %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));
//app.get('/', (req,res) => {res.sender('public/index.html')});
// İlginçtir, express kullanırken public içindeki indexi Anasayfa olarak kabul ediyor.


/*var yeniDers = new Dersler({
    sendto: 'All',
    username: 'Programlamaya Giriş',
    message: "Algoritma kavrami. Akis diyagramlari. Programlama ve programlama dili. Yapisal programlama kavrami. Değişkenler, karar yapıları, döngüler. Dizi (vektör) kavrami. Dizilerde (vektörlerde) arama ve siralama algoritmalari. Çok boyutlu diziler (matrisler). İşaretçiler, Yapı, enum. Dosya (file) kullanimi ve dosyalarla ilgili temel kavramlar. Format kavrami ve girdi-çikti formatlama. Altprogram kavrami. Özyineleme kavrami ve özyinelemeli altprogram örnekleri."
});
yeniDers.save(function(err){
    if(err){
        console.log('mdoel hatası..: '+  err);
    }else{
        console.log('ders eklendi...');
    }
})*/

// Chatroom
var numUsers = 0;
var PeerList = {};

io.on('connection', function (socket) {
  var addedUser = false;
  
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'   
    var mesaj = new Mesajlar({
      sendto: 'All',
      username: socket.username,
      message: data
    });
    mesaj.save(function(err){
        if(err){
            console.log('model hatası..: '+  err);
        }else{
            console.log('mesaj mogoya eklendi...');
        }
    });
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;
    // we store the username in the socket session for this client
    ++numUsers;
    addedUser = true;
    socket.username = username;
      PeerList[username] = socket;
      //console.log(PeerList[username]);
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
    Mesajlar.find(function(err, _mesajlar){
      socket.emit('eskimesajlar', {
        mesajlar: _mesajlar
      });
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {  
        delete PeerList[socket.username];
      --numUsers;
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

});