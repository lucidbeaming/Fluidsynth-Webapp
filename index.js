// app.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var telnet = require('telnet-client');
var tconnect = new telnet();
var config = require('./config');

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});

var tparams = {
  host: config.FLUIDSYNTH_HOST,
  port: config.FLUIDSYNTH_PORT,
  shellPrompt: '/ # ',
  timeout: config.FLUIDSYNTH_TIMEOUT,
  // removeEcho: 4
};


function changeinst(channel,inst) {
    var flcmd = 'prog '+channel+' ' + inst;
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
  console.log("Fluidsynth Telnet: connecting to "+tparams.host+":"+tparams.port+"... ");

  tconnect.connect(tparams).then(function () {
    console.log("Fluidsynth Telnet: connection success");
    io.emit('status','connected');
  }).catch(function (error){

    console.error("Fluidsynth Telnet: connection failed, retrying in 5 seconds...");
  });

    // setTimeout(telnetConnect, 5000);

}

function getvoices(client) {
  tconnect.send('voice_count', function (data) {
    var voices = data.split(': ')[1];
    client.emit('voices', voices);
    setTimeout(getvoices, config.STATUS_UPDATE_INTERVAL);
  });
}

io.on('connection', function(client) {
    console.log('server connected');
    telnetConnect();

    tconnect.send('inst 1', function(err, ins) {
        client.emit('instrumentdump', { package: ins });
    });
    client.on('changeinst', function(data) {
      var channel = data.split(',')[0];
      var inst = data.split(',')[1];
        if (isNumeric(channel) && isNumeric(inst)) {
		      changeinst(channel,inst);
        } else if (data == "list") {
          tconnect.send('channels', function(err, ins) {
            io.emit('current', { package: ins });
          });
        } else {
		      console.log(data);
        }
    });
    getvoices(client);

});
io.on('error', function(error) {
  console.log(error);
});
server.listen(7000);
