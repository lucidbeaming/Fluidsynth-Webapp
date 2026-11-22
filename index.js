// app.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const { Telnet } = require('telnet-client');
var config = require('./config');

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});

// FluidSynth's server shell (fluidsynth -s) has no prompt and doesn't do
// telnet negotiation, so treat it as a plain TCP line protocol.
var tparams = {
  host: config.FLUIDSYNTH_HOST,
  port: config.FLUIDSYNTH_PORT,
  negotiationMandatory: false,
  timeout: config.FLUIDSYNTH_TIMEOUT,
  // Responses have no end marker: send() collects output for this long
  sendTimeout: config.FLUIDSYNTH_RESPONSE_WAIT
};

var fluid = null;
var connected = false;
var connectRetry = null;

// For commands that print nothing (select). send() and write() would wait
// for output and reject with "response not received", so write to the socket.
function command(cmd) {
  var socket = fluid && fluid.getSocket();
  if (!connected || !socket) {
    console.error("Fluidsynth: not connected, dropped: " + cmd);
    return;
  }
  console.log("fluidsynth: ", cmd);
  socket.write(cmd + '\n');
}

// For commands that print a listing (inst, channels). Failures are logged
// and answered with an empty listing instead of rejecting.
function query(cmd, done) {
  if (!connected) {
    return done('');
  }
  fluid.send(cmd).then(done, function(err) {
    console.error('Fluidsynth: "' + cmd + '" failed: ' + err.message);
    done('');
  });
}

function changeinst(channel,inst,fontId, bank) {
    command('select '+channel+' '+ fontId + ' ' + bank + ' ' + inst);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function scheduleReconnect() {
  connected = false;
  clearTimeout(connectRetry);
  connectRetry = setTimeout(telnetConnect, config.FLUIDSYNTH_RETRY);
}

// One connection for the whole server, opened at startup and reopened if it
// drops (previously every browser connection opened another one).
function telnetConnect(){
  clearTimeout(connectRetry);
  console.log("Fluidsynth Telnet: connecting to "+tparams.host+":"+tparams.port+"... ");

  fluid = new Telnet();
  fluid.on('error', function (err) {
    console.error("Fluidsynth Telnet: " + err.message);
  });
  fluid.on('close', function () {
    if (connected) {
      console.error("Fluidsynth Telnet: connection closed, retrying in "+ (config.FLUIDSYNTH_RETRY / 1000) +" seconds...");
      scheduleReconnect();
    }
  });

  fluid.connect(tparams).then(function () {
    connected = true;
    console.log("Fluidsynth Telnet: connection success");
    io.emit('status','connected');
  }, function () {
    console.error("Fluidsynth Telnet: connection failed, retrying in "+ (config.FLUIDSYNTH_RETRY / 1000) +" seconds...");
    scheduleReconnect();
  });
}

function dumpInstruments(font,client){
  query('inst '+font, function(ins) {
    client.emit('instrumentdump', { package: ins });
  });
}

io.on('connection', function(client) {
    console.log('server connected');

    client.on('queryFont',function(font){

      if (isNumeric(font)){
        dumpInstruments(font,client);
      }

    });

    client.on('changeinst', function(data) {
      
      var channel = data.channel;
      var inst = data.instrumentId;
      var fontId = data.fontId;
      var bankId = data.bankId;

      if ( isNumeric(channel) && isNumeric(inst) ) {

        changeinst(channel,inst,fontId,bankId);
      } 
    });
    client.on('getinstruments', function(){
        query('channels', function(ins) {
	  var raw_list = ins.split("\n");
	  var channel_list = [];
	  for (var i=0; i < raw_list.length - 1; i++){
	    channel_list[i] = raw_list[i].split(", ")[1].trim();
	  }
          io.emit('current', { channels: channel_list });
        });
    });

});
io.on('error', function(error) {
  console.log(error);
});

telnetConnect();
server.listen(7000);
