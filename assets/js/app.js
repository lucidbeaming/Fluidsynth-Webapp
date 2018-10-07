var server = self.location.host;
var socket = io.connect('http://' + server);
var instruments;

var channel = 15;
var listFont = 1;

socket.on('connect', getInstruments);

window.onhashchange = getInstruments;

socket.on('reconnecting', function() {
    $.mobile.loading( 'show', { text: 'finding fluid', textVisible: true });
})

function getChannels(){
	socket.emit('getinstruments');
	socket.on('current', function(data){
		instruments = data.channels;
		console.log(instruments);
	});
}

function getInstruments(){
	var params = self.location.hash.slice(1).split('&');
	
	for (var i=0; i < params.length; i++) {
		if (params[i][0] == "c" && params[i][1] == "=" && params[i].length > 2)
			channel = params[i].split("=")[1];
		if (params[i][0] == "f" && params[i][1] == "=" && params[i].length > 2)
			listFont = params[i].split("=")[1];
	}

	$.mobile.loading( 'show', { text: 'pouring fluid', textVisible: true });
	socket.emit('status', 'client connected');

	var fontId = listFont;

	socket.emit('queryFont', fontId);

	socket.on('instrumentdump', function(idmp){

		$('#instruments').html("");
		var str = idmp.package;
		var array = ["coso1", "coso2", "coso3"];
		var instruments = str.split("\n");
		for (i=0;i < instruments.length - 1; i++) {
			console.log(instruments[i].slice(4));
			var instrumentBank = instruments[i].slice(0,3);
			var instrumentnumber = instruments[i].slice(4,7);
			var instrumentname = instruments[i].slice(8);
			$('#instruments').append(
				'<li data-icon="audio"><a href="#" data-inum="' 
				+ instrumentnumber 
				+ '" data-font-id="'
				+ fontId
				+ '" data-inst-bank="'
				+ instrumentBank
				+ '">' 
				+ instrumentname 
				+ '</a></li>').enhanceWithin();
		}
		$("#instruments").listview("refresh");
		$.mobile.loading( 'hide');
	});
}
$(document).on('vclick', '#instruments li a', function(){
	var ipath = $(this).attr('data-inum');
	var fontId = $(this).attr('data-font-id');
	var instBank = $(this).attr('data-inst-bank');
	var iname = $(this).text();
	
	socket.emit('changeinst', 
		{ channel: channel, 
		  instrumentId: ipath, 
		  fontId: fontId, 
		  bankId: instBank 
		});

	console.log(channel);
	console.log(ipath);
	$('#instruments li a').removeClass('ui-btn-active');
	$(this).addClass('ui-btn-active');
});
