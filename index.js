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
  host: '192.168.1.10',
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
function telnetConnect(){
  console.log("Fluidsynth Telnet: connecting...");
  tconnect.connect(tparams).then(function () {
    console.log("Fluidsynth Telnet: connection success");
  });
}
io.on('connection', function(client) {
    console.log('server connected');
    telnetConnect();

    tconnect.on('error', function (err) {
      console.error("Fluidsynth Telnet: connection failed, retrying in 5 seconds...");
      setTimeout(telnetConnect, 5000);
    });

    client.on('message', function(data) {
        if (isNumeric(data)) {
		      changeinst(data);
        } else if (data == "list") {
          tconnect.send('channels', function(err, ins) {
            io.emit('current', { package: ins });
          });
        } else {
		      //console.log(data);
        }
    });
});
io.on('error', function(error) {
  console.log(error);
});
server.listen(7000);
