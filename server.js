/*******************************************/
/* Set up static file server */
/* Include the static file webserverlibrary*/
var static = require('node-static');

/* Include the http server library */
var http = require('http');

/* Assume we are runing on Heroku */
var port = process.env.PORT;
var directory = __dirname + '/public';

/* If we aren't on heroku, then we need to readjust the port ad directory
 * infromation and we know that because port won't be set */
if(typeof port == 'undefined' || !port){
	directory = './public';
	port = 8080;
}

/* set up a static web-server that will deliver files from the filesystem */
var file = new static.Server(directory);

/* construct an http server that gots the files from the file server */
var app = http.createServer(
	function(request,response){
		request.addListener('end',
			function(){
				file.serve(request,response);
				}	
			).resume();
		}
    ).listen(port);

console.log('The server is running'); 

/******************************************/
/*         Set up the web socket          */

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
	function log(){
		var array = ['*** Sever log Message: '];
		for(var i = 0; i < arguments.length; i++){
			array.push(arguments[i]);
			console.log(arguments[i]);
		}
		socket.emit('log',array);
		socket.broadcast.emit('log',array);
	}
	log('A website connected to the server');
	
	socket.on('disconnect',function(socket){
		log('A website disconnected from the server');
	});
});