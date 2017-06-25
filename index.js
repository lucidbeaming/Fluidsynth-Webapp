// app.js
var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var telnet = require('telnet-client');
var tconnect = new telnet();

app.use(express.static(__dirname + '/node_modules'));  
app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

var tparams = {
  host: '127.0.0.1',
  port: 9800,
  shellPrompt: '/ # ',
  timeout: 1500,
  // removeEcho: 4 
};


function changeinst(inst) {
    var flcmd = 'prog 0 ' + inst;
    console.log("fluidsynth: ", flcmd);
    tconnect.send(flcmd, function(err, response) {
       // console.log(response);  
    });
}

function currentinstruments() {
      var current;
      tconnect.send('channels', function(err, chans) {
            current=chans;
      });
      console.log(current);
      io.emit('message', { cord: current })
} 

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

io.on('connection', function(client) {
    console.log('server connected');
    tconnect.connect(tparams);
    tconnect.send('inst 1', function(err, ins) {
            client.emit('instrumentdump', { package: ins });
        });
    client.on('message', function(data) {
        if (isNumeric(data)) {
		      changeinst(data);  
        } else if (data == "list") {
          tconnect.send('channels', function(err, ins) {
            io.emit('current', { package: ins });
          });  
        } else {
		      console.log(data);
        }
    });
});

server.listen(7000);
