var server = self.location.host;
var socket = io.connect('http://' + server);
var instruments;
$(document).on('vclick', '#instruments li a', function(){
	var ipath = $(this).attr('data-inum');
	var iname = $(this).text();
	var channel = 15;
	console.log(iname + ': ' + ipath);
	socket.emit('changeinst', channel+","+ipath);
	console.log(channel);
	console.log(ipath);
	$('#instruments li a').removeClass('ui-btn-active');
	$(this).addClass('ui-btn-active');
});
socket.on('connect', function(data) {
	$.mobile.loading( 'show', { text: 'pouring fluid', textVisible: true });
	socket.emit('status', 'client connected');
	socket.on('instrumentdump', function(idmp){
		var str = idmp.package;
		var instruments = str.split("\n");
		for (i=0;i < instruments.length; i++) {
			console.log(instruments[i].slice(4));
			var instrumentnumber = instruments[i].slice(4,7);
			var instrumentname = instruments[i].slice(8);
			$('#instruments').append('<li data-icon="audio"><a href="#" data-inum="' + instrumentnumber + '">' + instrumentname + '</a></li>').enhanceWithin();
		}
		$("#instruments").listview("refresh");
		$.mobile.loading( 'hide');
	});
  socket.on('voices', function(voices){
    $("voiceNumber").text(voices);
  });
});
socket.on('reconnecting', function() {
    $.mobile.loading( 'show', { text: 'finding fluid', textVisible: true });
})
function getinstruments(){
	socket.emit('message', 'list');
	socket.on('current', function(icur){
		instruments = icur.package;
		console.log(instruments);
	});
}
